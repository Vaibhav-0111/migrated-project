import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  Brain,
  Clock,
  Flame,
  Settings,
  Target,
  Trophy,
  BookOpen,
  TrendingUp,
  Box,
  Dice5,
  Percent,
  Star,
  CheckCircle2,
  Sparkles,
  User,
  Award,
  Zap,
} from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { CalmWorld } from '@/components/3d/CalmWorld';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStats } from '@/hooks/useUserStats';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';

import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useRewards } from '@/hooks/useRewards';
import { BadgeDisplay } from '@/components/BadgeDisplay';

// Animated stat card with gentle pulsing for ADHD focus
const StatCard = ({ icon, label, value, loading }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
    <div className="rounded-xl bg-secondary p-3">
      {icon}
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <p className="text-xl font-bold">{value}</p>
      )}
    </div>
  </div>
);

// Chapter card with progress tracking
interface ChapterCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  route: string;
  completedGames: number;
  totalGames: number;
  starsEarned: number;
  delay: number;
}

const ChapterCard = ({ 
  title, subtitle, icon, gradient, borderColor, route, 
  completedGames, totalGames, starsEarned, delay 
}: ChapterCardProps) => {
  const navigate = useNavigate();
  const progress = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
    >
      <Card 
        className={`card-interactive border-2 ${borderColor} transition-all duration-300 cursor-pointer overflow-hidden group`}
        onClick={() => navigate(route)}
      >
        {/* Progress bar at top */}
        <div className="h-1 bg-muted/50">
          <motion.div 
            className={`h-full ${gradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8 }}
          />
        </div>
        
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`p-3 rounded-xl ${gradient} shadow-md`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {icon}
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-high-contrast">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {subtitle}
                </p>
              </div>
            </div>
            
            {/* Stars indicator */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((star) => (
                <motion.div
                  key={star}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: delay + 0.1 * star }}
                >
                  <Star 
                    className={`h-4 w-4 ${
                      star <= Math.ceil(starsEarned / 3) 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Progress info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{completedGames}/{totalGames} games</span>
            </div>
            <div className="flex items-center gap-1 text-warning">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{starsEarned} stars</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Profile section with ADHD-friendly design
const ProfileSection = ({ user, stats }: { user: any, stats: any }) => {
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4"
    >
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg">
          <User className="w-7 h-7 text-primary-foreground" />
        </div>
        {/* Level badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-warning flex items-center justify-center text-xs font-bold text-warning-foreground shadow-md">
          {Math.floor(stats.totalStars / 10) + 1}
        </div>
      </motion.div>
      
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {profile?.name || 'Student'}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Grade {profile?.grade || '?'}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-xs text-warning dark:text-warning">
            <Zap className="h-3 w-3 inline mr-0.5" />
            Level {Math.floor(stats.totalStars / 10) + 1}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Motivational message component
const MotivationalMessage = () => {
  const messages = [
    { emoji: "🌟", text: "You're doing amazing!" },
    { emoji: "🚀", text: "Keep up the great work!" },
    { emoji: "💪", text: "Every step counts!" },
    { emoji: "🎯", text: "Focus and conquer!" },
    { emoji: "✨", text: "You've got this!" },
  ];
  
  const [message] = useState(() => messages[Math.floor(Math.random() * messages.length)]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
    >
      <span>{message.emoji}</span>
      {message.text}
    </motion.div>
  );
};

// Compact badge display for dashboard
const BadgeDisplayCompact = () => {
  const { badges, unlockedCount, totalCount } = useRewards();
  const navigate = useNavigate();
  const unlockedBadges = badges.filter(b => b.unlocked);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {unlockedBadges.length > 0 ? (
          unlockedBadges.slice(0, 6).map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero text-2xl shadow-md cursor-pointer"
              title={`${badge.title}: ${badge.description}`}
              whileHover={{ scale: 1.1, y: -2 }}
            >
              {badge.icon}
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Complete games to earn badges!</p>
        )}
        {unlockedBadges.length > 6 && (
          <motion.div 
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-sm font-medium text-muted-foreground cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/achievements')}
          >
            +{unlockedBadges.length - 6}
          </motion.div>
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{unlockedCount} of {totalCount} badges unlocked</span>
        <Progress value={(unlockedCount / totalCount) * 100} className="w-24 h-2" />
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useAppStore();
  const { stats, chapterStats } = useUserStats();
  const { checkAndAwardBadges, awardBadge } = useRewards();

  // Award "early bird" badge for completing onboarding
  useEffect(() => {
    if (user && settings.isOnboarded) {
      awardBadge('early_bird');
    }
  }, [user, settings.isOnboarded, awardBadge]);

  // Check and award badges based on current stats
  useEffect(() => {
    if (!user || stats.loading) return;
    
    const chapterProgress: Record<string, { completed: number; total: number }> = {};
    if (chapterStats) {
      const chapterMap: Record<string, string> = {
        trigonometry: 'Trigonometry',
        algebra: 'Algebra',
        volume: 'Volume & Surface Area',
        probability: 'Probability',
        fractions: 'Fractions/Decimals/Percentages/Interest',
      };
      Object.entries(chapterStats).forEach(([key, val]: [string, any]) => {
        const name = chapterMap[key];
        if (name) {
          chapterProgress[name] = { completed: val.completedGames || 0, total: 3 };
        }
      });
    }

    checkAndAwardBadges({
      completedGames: stats.completedLevels,
      totalStars: stats.totalStars,
      accuracy: stats.accuracy,
      streak: stats.streak,
      chapterProgress,
    });
  }, [user, stats, chapterStats, checkAndAwardBadges]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!settings.isOnboarded) {
      navigate('/onboarding');
    }
  }, [user, settings.isOnboarded, navigate]);

  if (!user || !settings.isOnboarded) {
    return null;
  }

  if (stats.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Chapter data with progress
  const chapters = [
    {
      id: 'trigonometry',
      title: 'Trigonometry',
      subtitle: 'Angles • Triangles • Waves',
      icon: <BookOpen className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
      borderColor: 'hover:border-orange-400/50',
      route: '/chapters',
      completedGames: chapterStats?.trigonometry?.completedGames || 0,
      totalGames: 3,
      starsEarned: chapterStats?.trigonometry?.totalStars || 0,
    },
    {
      id: 'algebra',
      title: 'Algebra',
      subtitle: 'Expressions • Equations • Patterns',
      icon: <Target className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-emerald-400 to-green-500',
      borderColor: 'hover:border-emerald-400/50',
      route: '/algebra',
      completedGames: chapterStats?.algebra?.completedGames || 0,
      totalGames: 3,
      starsEarned: chapterStats?.algebra?.totalStars || 0,
    },
    {
      id: 'volume',
      title: 'Volume & Surface',
      subtitle: '3D Shapes • Fill • Wrap',
      icon: <Box className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-violet-400 to-purple-500',
      borderColor: 'hover:border-violet-400/50',
      route: '/volume',
      completedGames: chapterStats?.volume?.completedGames || 0,
      totalGames: 3,
      starsEarned: chapterStats?.volume?.totalStars || 0,
    },
    {
      id: 'probability',
      title: 'Probability',
      subtitle: 'Chance • Patterns • Predictions',
      icon: <Dice5 className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-pink-400 to-rose-500',
      borderColor: 'hover:border-pink-400/50',
      route: '/probability',
      completedGames: chapterStats?.probability?.completedGames || 0,
      totalGames: 3,
      starsEarned: chapterStats?.probability?.totalStars || 0,
    },
    {
      id: 'fractions',
      title: 'Fractions & %',
      subtitle: 'Parts • Decimals • Interest',
      icon: <Percent className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-cyan-400 to-blue-500',
      borderColor: 'hover:border-cyan-400/50',
      route: '/fractions',
      completedGames: chapterStats?.fractions?.completedGames || 0,
      totalGames: 3,
      starsEarned: chapterStats?.fractions?.totalStars || 0,
    },
  ];

  const totalCompleted = chapters.reduce((sum, ch) => sum + ch.completedGames, 0);
  const totalGames = chapters.reduce((sum, ch) => sum + ch.totalGames, 0);
  const totalStars = chapters.reduce((sum, ch) => sum + ch.starsEarned, 0);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CalmWorld />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-20"
        >
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <ProfileSection user={user} stats={stats} />

            <div className="flex items-center gap-2">
              {/* Quick stats in header */}
              <motion.div 
                className="hidden md:flex items-center gap-4 mr-4 px-4 py-2 rounded-xl bg-secondary/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">{stats.streak} days</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{totalStars} stars</span>
                </div>
              </motion.div>

              <EnhancedButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/leaderboard')}
                aria-label="Progress Dashboard"
              >
                <TrendingUp className="h-5 w-5" />
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </EnhancedButton>
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
          {/* Greeting with motivational message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h2 className="mb-1 text-2xl font-bold text-foreground md:text-3xl">
                Ready to learn? 🎯
              </h2>
              <p className="text-muted-foreground">
                Pick a chapter and start your journey
              </p>
            </div>
            <MotivationalMessage />
          </motion.div>

          {/* Overall Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Overall Progress</span>
                    </div>
                    <Progress value={(totalCompleted / totalGames) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {totalCompleted} of {totalGames} games completed
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 md:gap-6">
                    <div className="text-center">
                      <motion.span 
                        className="block text-2xl font-bold text-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.3 }}
                      >
                        {totalCompleted}
                      </motion.span>
                      <span className="text-xs text-muted-foreground">Completed</span>
                    </div>
                    <div className="text-center">
                      <motion.span 
                        className="block text-2xl font-bold text-yellow-500"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.4 }}
                      >
                        {totalStars}
                      </motion.span>
                      <span className="text-xs text-muted-foreground">Stars</span>
                    </div>
                    <div className="text-center">
                      <motion.span 
                        className="block text-2xl font-bold text-orange-500"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.5 }}
                      >
                        {stats.streak}
                      </motion.span>
                      <span className="text-xs text-muted-foreground">Day Streak</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Stats - Compact for mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            <StatCard
              icon={<Flame className="w-5 h-5 text-orange-500" />}
              label="Streak"
              value={`${stats.streak} days`}
              loading={stats.loading}
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-blue-500" />}
              label="Today"
              value={`${stats.minutesToday} min`}
              loading={stats.loading}
            />
            <StatCard
              icon={<Target className="w-5 h-5 text-green-500" />}
              label="Accuracy"
              value={`${stats.accuracy}%`}
              loading={stats.loading}
            />
            <StatCard
              icon={<Sparkles className="w-5 h-5 text-purple-500" />}
              label="Tokens"
              value={stats.tokensEarned}
              loading={stats.loading}
            />
          </motion.div>

          {/* Chapters Grid */}
          <div>
            <motion.h2 
              className="text-xl font-semibold mb-4 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <BookOpen className="w-5 h-5 text-primary" />
              Chapters
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter, index) => (
                <ChapterCard
                  key={chapter.id}
                  {...chapter}
                  delay={0.3 + index * 0.1}
                />
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold">Your Badges</h3>
                  </div>
                  <EnhancedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/achievements')}
                  >
                    View All
                  </EnhancedButton>
                </div>
                <BadgeDisplayCompact />
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
