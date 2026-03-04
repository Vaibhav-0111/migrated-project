import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trophy, Star, Target, Flame, Clock, Zap, BookOpen,
  CheckCircle2, Award, TrendingUp, Percent, Box, Dice5, Sparkles,
  Calendar, BarChart3, Medal, Crown, Shield,
} from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStats } from '@/hooks/useUserStats';
import { useRewards } from '@/hooks/useRewards';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';

// Chapter config
const chapterConfig = [
  { id: 'trigonometry', title: 'Trigonometry', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10', games: [
    { id: 'angle-shadow-garden', title: 'Shadow Garden', route: '/game/angle-shadow-garden' },
    { id: 'mountain-rope-rescue', title: 'Mountain Rescue', route: '/game/mountain-rope-rescue' },
    { id: 'wave-balance-lab', title: 'Wave Lab', route: '/game/wave-balance-lab' },
  ]},
  { id: 'algebra', title: 'Algebra', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10', games: [
    { id: 'balance-garden', title: 'Balance Garden', route: '/game/balance-garden' },
    { id: 'equation-factory', title: 'Equation Factory', route: '/game/equation-factory' },
    { id: 'pattern-portal', title: 'Pattern Portal', route: '/game/pattern-portal' },
  ]},
  { id: 'volume', title: 'Volume & Surface', icon: Box, color: 'text-violet-500', bg: 'bg-violet-500/10', games: [
    { id: 'shape-fill-playground', title: 'Shape Fill', route: '/game/shape-fill-playground' },
    { id: 'wrap-gift-studio', title: 'Wrap Gift', route: '/game/wrap-gift-studio' },
    { id: 'build-balance-city', title: 'Build City', route: '/game/build-balance-city' },
  ]},
  { id: 'probability', title: 'Probability', icon: Dice5, color: 'text-pink-500', bg: 'bg-pink-500/10', games: [
    { id: 'chance-garden', title: 'Chance Garden', route: '/game/chance-garden' },
    { id: 'spinner-dice-lab', title: 'Spinner & Dice', route: '/game/spinner-dice-lab' },
    { id: 'prediction-park', title: 'Prediction Park', route: '/game/prediction-park' },
  ]},
  { id: 'fractions', title: 'Fractions & %', icon: Percent, color: 'text-cyan-500', bg: 'bg-cyan-500/10', games: [
    { id: 'share-slice-cafe', title: 'Share & Slice', route: '/game/share-slice-cafe' },
    { id: 'liquid-measure-lab', title: 'Liquid Lab', route: '/game/liquid-measure-lab' },
    { id: 'growing-money-garden', title: 'Money Garden', route: '/game/growing-money-garden' },
  ]},
];

// Heatmap component (LeetCode-style activity grid)
const ActivityHeatmap = ({ sessions }: { sessions: any[] }) => {
  const today = new Date();
  const weeks = 12;
  const days: { date: string; count: number }[] = [];

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = sessions.filter(s => s.created_at?.startsWith(dateStr)).length;
    days.push({ date: dateStr, count });
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted/50';
    if (count === 1) return 'bg-primary/30';
    if (count === 2) return 'bg-primary/50';
    if (count <= 4) return 'bg-primary/70';
    return 'bg-primary';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="flex gap-1">
      <div className="flex flex-col gap-1 mr-1 text-[10px] text-muted-foreground">
        {dayLabels.map((l, i) => <span key={i} className="h-3 leading-3">{l}</span>)}
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: weeks }).map((_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, dayIdx) => {
              const idx = weekIdx * 7 + dayIdx;
              const day = days[idx];
              if (!day) return <div key={dayIdx} className="w-3 h-3" />;
              return (
                <motion.div
                  key={dayIdx}
                  className={`w-3 h-3 rounded-[2px] ${getColor(day.count)} cursor-pointer`}
                  title={`${day.date}: ${day.count} sessions`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.003 }}
                  whileHover={{ scale: 1.5 }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Game completion row
const GameRow = ({ game, progress, navigate }: { game: any; progress: any; navigate: any }) => {
  const difficulties = ['easy', 'medium', 'hard'];

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer group"
      onClick={() => navigate(game.route)}
      whileHover={{ x: 4 }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {game.title}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {difficulties.map((diff) => {
          const p = progress?.[diff];
          const completed = p?.completed_at;
          const stars = p?.stars_earned || 0;
          return (
            <div
              key={diff}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                completed
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
              title={`${diff}: ${completed ? `${stars}★` : 'Not done'}`}
            >
              {completed ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{stars}★</span>
                </>
              ) : (
                <span className="capitalize">{diff[0].toUpperCase()}</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, chapterStats } = useUserStats();
  const { badges, unlockedCount, totalCount } = useRewards();
  const [gameProgress, setGameProgress] = useState<Record<string, any>>({});
  const [sessions, setSessions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    try {
      const [progressRes, sessionsRes, profileRes] = await Promise.all([
        supabase.from('game_progress').select('*, games(chapter, game_title, game_number)').order('created_at'),
        supabase.from('sessions').select('id, created_at, duration_seconds, tasks_completed, tasks_correct, subject').order('created_at', { ascending: false }).limit(500),
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
      ]);

      // Group progress by game_id + difficulty
      const progressMap: Record<string, any> = {};
      (progressRes.data || []).forEach((p: any) => {
        if (!progressMap[p.game_id]) progressMap[p.game_id] = {};
        progressMap[p.game_id][p.difficulty] = p;
      });
      setGameProgress(progressMap);
      setSessions(sessionsRes.data || []);
      setProfile(profileRes.data);
    } catch (e) {
      console.error('Failed to load leaderboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || stats.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const totalGames = 15;
  const level = Math.floor(stats.totalStars / 10) + 1;
  const levelProgress = (stats.totalStars % 10) * 10;

  // Calculate rank title
  const getRank = (level: number) => {
    if (level >= 20) return { title: 'Grandmaster', icon: Crown, color: 'text-yellow-500' };
    if (level >= 15) return { title: 'Master', icon: Medal, color: 'text-amber-500' };
    if (level >= 10) return { title: 'Expert', icon: Shield, color: 'text-violet-500' };
    if (level >= 5) return { title: 'Intermediate', icon: TrendingUp, color: 'text-emerald-500' };
    return { title: 'Beginner', icon: Star, color: 'text-blue-500' };
  };

  const rank = getRank(level);
  const RankIcon = rank.icon;

  // Streak info
  const totalSessions = sessions.length;
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);
  const unlockedBadges = badges.filter(b => b.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-20"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <EnhancedButton variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </EnhancedButton>
            <div>
              <h1 className="text-lg font-bold">Progress Dashboard</h1>
              <p className="text-xs text-muted-foreground">Your learning journey</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <RankIcon className={`w-3.5 h-3.5 ${rank.color}`} />
            {rank.title}
          </Badge>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        {/* Profile & Level Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Avatar & Level */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {(profile?.name || 'S')[0].toUpperCase()}
                      </span>
                    </div>
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white shadow"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {level}
                    </motion.div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profile?.name || 'Student'}</h2>
                    <p className="text-sm text-muted-foreground">Grade {profile?.grade || '?'} • Level {level}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <RankIcon className={`w-4 h-4 ${rank.color}`} />
                      <span className={`text-sm font-medium ${rank.color}`}>{rank.title}</span>
                    </div>
                  </div>
                </div>

                {/* Level progress */}
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Level {level}</span>
                    <span className="text-muted-foreground">Level {level + 1}</span>
                  </div>
                  <Progress value={levelProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {10 - (stats.totalStars % 10)} more stars to next level
                  </p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <motion.div className="text-2xl font-bold text-primary" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {stats.totalStars}
                    </motion.div>
                    <span className="text-xs text-muted-foreground">Stars</span>
                  </div>
                  <div className="text-center">
                    <motion.div className="text-2xl font-bold text-orange-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                      {stats.streak}
                    </motion.div>
                    <span className="text-xs text-muted-foreground">Streak</span>
                  </div>
                  <div className="text-center">
                    <motion.div className="text-2xl font-bold text-emerald-500" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                      {stats.accuracy}%
                    </motion.div>
                    <span className="text-xs text-muted-foreground">Accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Activity Heatmap (LeetCode-style) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Activity</h3>
                </div>
                <span className="text-xs text-muted-foreground">{totalSessions} sessions • {totalMinutes} min total</span>
              </div>
              <div className="overflow-x-auto">
                <ActivityHeatmap sessions={sessions} />
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground justify-end">
                <span>Less</span>
                <div className="flex gap-[3px]">
                  {['bg-muted/50', 'bg-primary/30', 'bg-primary/50', 'bg-primary/70', 'bg-primary'].map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs: Chapters / Badges / Stats */}
        <Tabs defaultValue="chapters">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chapters" className="gap-1">
              <BarChart3 className="w-4 h-4" /> Games
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1">
              <Trophy className="w-4 h-4" /> Badges
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1">
              <TrendingUp className="w-4 h-4" /> Stats
            </TabsTrigger>
          </TabsList>

          {/* Chapters Tab */}
          <TabsContent value="chapters" className="space-y-4 mt-4">
            {chapterConfig.map((chapter, chIdx) => {
              const cs = chapterStats?.[chapter.id];
              const completed = cs?.completedGames || 0;
              const total = 3;
              const stars = cs?.totalStars || 0;
              const ChapterIcon = chapter.icon;

              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: chIdx * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${chapter.bg}`}>
                            <ChapterIcon className={`w-5 h-5 ${chapter.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{chapter.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {completed}/{total} games • {stars} stars
                            </p>
                          </div>
                        </div>
                        <Progress value={(completed / total) * 100} className="w-20 h-2" />
                      </div>

                      <div className="space-y-1 border-t border-border/50 pt-2">
                        {chapter.games.map((game) => (
                          <GameRow
                            key={game.id}
                            game={game}
                            progress={gameProgress[game.id]}
                            navigate={navigate}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="mt-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">{unlockedCount} / {totalCount} Unlocked</span>
                  </div>
                  <Progress value={(unlockedCount / totalCount) * 100} className="w-32 h-2" />
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {badges.map((badge, i) => (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.03, type: 'spring' }}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center ${
                        badge.unlocked ? 'bg-primary/10' : 'bg-muted/30 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-xs font-medium leading-tight">{badge.title}</span>
                      {badge.unlocked && (
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Star, label: 'Total Stars', value: stats.totalStars, color: 'text-yellow-500' },
                { icon: CheckCircle2, label: 'Games Done', value: stats.completedLevels, color: 'text-emerald-500' },
                { icon: Target, label: 'Accuracy', value: `${stats.accuracy}%`, color: 'text-blue-500' },
                { icon: Flame, label: 'Best Streak', value: `${stats.streak}d`, color: 'text-orange-500' },
                { icon: Clock, label: 'Today', value: `${stats.minutesToday}m`, color: 'text-indigo-500' },
                { icon: Sparkles, label: 'Tokens', value: stats.tokensEarned, color: 'text-purple-500' },
                { icon: BarChart3, label: 'Sessions', value: totalSessions, color: 'text-pink-500' },
                { icon: Zap, label: 'Level', value: level, color: 'text-amber-500' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Completion Summary */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Completion Summary
                </h3>
                <div className="space-y-3">
                  {chapterConfig.map((ch) => {
                    const cs = chapterStats?.[ch.id];
                    const pct = ((cs?.completedGames || 0) / 3) * 100;
                    return (
                      <div key={ch.id} className="flex items-center gap-3">
                        <span className="text-sm w-32 truncate">{ch.title}</span>
                        <Progress value={pct} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(pct)}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
