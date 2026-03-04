import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, Target, Award } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { useRewards } from '@/hooks/useRewards';
import { useUserStats } from '@/hooks/useUserStats';
import { Progress } from '@/components/ui/progress';

export default function Achievements() {
  const navigate = useNavigate();
  const { badges, unlockedCount, totalCount, loading } = useRewards();
  const { stats } = useUserStats();

  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <EnhancedButton
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </EnhancedButton>

        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero shadow-lg"
          >
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
            <p className="text-muted-foreground">
              Collect badges by completing games and chapters
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Progress</h2>
            <span className="text-2xl font-bold text-primary">
              {unlockedCount}/{totalCount}
            </span>
          </div>
          <Progress value={progressPercent} className="mb-4 h-3" />
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center"
            >
              <Star className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stats.totalStars}</p>
              <p className="text-sm text-muted-foreground">Stars Earned</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 p-4 text-center"
            >
              <Target className="mx-auto mb-2 h-6 w-6 text-accent" />
              <p className="text-2xl font-bold text-foreground">{stats.completedLevels}</p>
              <p className="text-sm text-muted-foreground">Games Completed</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 p-4 text-center"
            >
              <Award className="mx-auto mb-2 h-6 w-6 text-secondary-foreground" />
              <p className="text-2xl font-bold text-foreground">{stats.accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 p-4 text-center"
            >
              <span className="mx-auto mb-2 block text-2xl">🔥</span>
              <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
              />
            </div>
          ) : (
            <BadgeDisplay badges={badges} />
          )}
        </Card>
      </motion.div>
    </div>
  );
}
