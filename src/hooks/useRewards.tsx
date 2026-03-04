import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Badge {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
  unlocked: boolean;
}

// Define all available badges
export const BADGES: Omit<Badge, 'earnedAt' | 'unlocked'>[] = [
  // Game completion badges
  { id: 'first_game', type: 'game', title: 'First Steps', description: 'Complete your first game', icon: '🎮' },
  { id: 'five_games', type: 'game', title: 'Game Explorer', description: 'Complete 5 games', icon: '🎯' },
  { id: 'ten_games', type: 'game', title: 'Game Master', description: 'Complete 10 games', icon: '🏆' },
  
  // Star badges
  { id: 'first_star', type: 'star', title: 'Rising Star', description: 'Earn your first star', icon: '⭐' },
  { id: 'ten_stars', type: 'star', title: 'Star Collector', description: 'Earn 10 stars', icon: '🌟' },
  { id: 'fifty_stars', type: 'star', title: 'Superstar', description: 'Earn 50 stars', icon: '✨' },
  
  // Accuracy badges
  { id: 'perfect_game', type: 'accuracy', title: 'Perfectionist', description: 'Get 100% in any game', icon: '💯' },
  { id: 'high_accuracy', type: 'accuracy', title: 'Sharpshooter', description: 'Maintain 80%+ accuracy', icon: '🎯' },
  
  // Chapter badges
  { id: 'trig_chapter', type: 'chapter', title: 'Trig Explorer', description: 'Complete all Trigonometry games', icon: '📐' },
  { id: 'algebra_chapter', type: 'chapter', title: 'Algebra Ace', description: 'Complete all Algebra games', icon: '🔢' },
  { id: 'volume_chapter', type: 'chapter', title: 'Volume Victor', description: 'Complete all Volume games', icon: '📦' },
  { id: 'probability_chapter', type: 'chapter', title: 'Probability Pro', description: 'Complete all Probability games', icon: '🎲' },
  { id: 'fractions_chapter', type: 'chapter', title: 'Fraction Friend', description: 'Complete all Fractions games', icon: '🍕' },
  
  // Streak badges
  { id: 'three_day_streak', type: 'streak', title: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥' },
  { id: 'seven_day_streak', type: 'streak', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '💪' },
  
  // Special badges
  { id: 'early_bird', type: 'special', title: 'Early Learner', description: 'Complete onboarding', icon: '🐣' },
  { id: 'all_chapters', type: 'special', title: 'Math Champion', description: 'Complete all chapters', icon: '👑' },
];

export const useRewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    if (!user) {
      setBadges(BADGES.map(b => ({ ...b, unlocked: false })));
      setLoading(false);
      return;
    }

    try {
      const { data: rewards, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const earnedBadgeIds = new Set(rewards?.map(r => r.reward_type) || []);
      
      const allBadges = BADGES.map(badge => ({
        ...badge,
        unlocked: earnedBadgeIds.has(badge.id),
        earnedAt: rewards?.find(r => r.reward_type === badge.id)?.earned_at || undefined,
      }));

      setBadges(allBadges);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const awardBadge = useCallback(async (badgeId: string) => {
    if (!user) return;

    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) return;

    // Check if already earned locally
    const existing = badges.find(b => b.id === badgeId && b.unlocked);
    if (existing) return;

    try {
      // Call server-side edge function for validated badge awarding
      const { data, error } = await supabase.functions.invoke('award-badge', {
        body: { badgeId },
      });

      if (error) throw error;

      if (data?.alreadyEarned) return;

      // Show celebration toast
      toast({
        title: `🎉 Badge Unlocked!`,
        description: `${badge.icon} ${badge.title} - ${badge.description}`,
      });

      // Refresh badges
      await fetchBadges();
    } catch (error) {
      console.error('Failed to award badge:', error);
    }
  }, [user, badges, toast, fetchBadges]);

  const checkAndAwardBadges = useCallback(async (stats: {
    completedGames: number;
    totalStars: number;
    accuracy: number;
    streak: number;
    chapterProgress: Record<string, { completed: number; total: number }>;
  }) => {
    // Game completion badges
    if (stats.completedGames >= 1) await awardBadge('first_game');
    if (stats.completedGames >= 5) await awardBadge('five_games');
    if (stats.completedGames >= 10) await awardBadge('ten_games');

    // Star badges
    if (stats.totalStars >= 1) await awardBadge('first_star');
    if (stats.totalStars >= 10) await awardBadge('ten_stars');
    if (stats.totalStars >= 50) await awardBadge('fifty_stars');

    // Accuracy badges
    if (stats.accuracy >= 100) await awardBadge('perfect_game');
    if (stats.accuracy >= 80) await awardBadge('high_accuracy');

    // Streak badges
    if (stats.streak >= 3) await awardBadge('three_day_streak');
    if (stats.streak >= 7) await awardBadge('seven_day_streak');

    // Chapter badges
    const chapters = stats.chapterProgress || {};
    if (chapters['Trigonometry']?.completed >= chapters['Trigonometry']?.total) await awardBadge('trig_chapter');
    if (chapters['Algebra']?.completed >= chapters['Algebra']?.total) await awardBadge('algebra_chapter');
    if (chapters['Volume & Surface Area']?.completed >= chapters['Volume & Surface Area']?.total) await awardBadge('volume_chapter');
    if (chapters['Probability']?.completed >= chapters['Probability']?.total) await awardBadge('probability_chapter');
    if (chapters['Fractions/Decimals/Percentages/Interest']?.completed >= chapters['Fractions/Decimals/Percentages/Interest']?.total) await awardBadge('fractions_chapter');

    // All chapters badge
    const allChaptersComplete = Object.values(chapters).every(c => c.completed >= c.total);
    if (allChaptersComplete && Object.keys(chapters).length >= 5) await awardBadge('all_chapters');
  }, [awardBadge]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading,
    awardBadge,
    checkAndAwardBadges,
    fetchBadges,
    unlockedCount: badges.filter(b => b.unlocked).length,
    totalCount: badges.length,
  };
};
