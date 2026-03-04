import { motion } from 'framer-motion';
import { Badge as BadgeType } from '@/hooks/useRewards';
import { Lock } from 'lucide-react';

interface BadgeDisplayProps {
  badges: BadgeType[];
  compact?: boolean;
}

export const BadgeDisplay = ({ badges, compact = false }: BadgeDisplayProps) => {
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {unlockedBadges.slice(0, 5).map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-xl shadow-md"
            title={`${badge.title}: ${badge.description}`}
          >
            {badge.icon}
          </motion.div>
        ))}
        {unlockedBadges.length > 5 && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            +{unlockedBadges.length - 5}
          </div>
        )}
        {unlockedBadges.length === 0 && (
          <p className="text-sm text-muted-foreground">Complete games to earn badges!</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-foreground">Earned Badges</h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {unlockedBadges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="group relative flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-4 shadow-sm transition-shadow hover:shadow-lg"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-3xl"
                >
                  {badge.icon}
                </motion.div>
                <span className="text-center text-xs font-medium text-foreground">
                  {badge.title}
                </span>
                
                {/* Tooltip */}
                <div className="absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-popover px-3 py-2 text-center text-xs shadow-lg group-hover:block">
                  <p className="font-medium">{badge.title}</p>
                  <p className="text-muted-foreground">{badge.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-muted-foreground">
          Badges to Unlock ({lockedBadges.length})
        </h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {lockedBadges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="group relative flex flex-col items-center gap-2 rounded-xl bg-muted/50 p-4 opacity-60"
            >
              <div className="relative text-3xl grayscale">
                {badge.icon}
                <Lock className="absolute -right-1 -top-1 h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-center text-xs text-muted-foreground">
                {badge.title}
              </span>
              
              {/* Tooltip */}
              <div className="absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-popover px-3 py-2 text-center text-xs shadow-lg group-hover:block">
                <p className="font-medium">{badge.title}</p>
                <p className="text-muted-foreground">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
