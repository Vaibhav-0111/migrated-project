import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Droplets, Gift, Building2, Lock, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageTransition, staggerContainer, staggerItem } from '@/components/animations/PageTransition';
import { InteractiveCard, InteractiveButton, FloatingElement, PulseElement } from '@/components/animations/InteractiveElements';

const games = [
  {
    id: 'shape-fill-playground',
    number: 1,
    title: 'Shape Fill Playground',
    subtitle: 'Easy',
    description: 'Pour liquid into shapes and discover volume',
    icon: Droplets,
    concept: 'Understanding volume as "space inside"',
    gradient: 'from-cyan-200 to-blue-300',
    unlocked: true,
  },
  {
    id: 'wrap-gift-studio',
    number: 2,
    title: 'Wrap the Gift Studio',
    subtitle: 'Medium',
    description: 'Cover all faces with wrapping paper',
    icon: Gift,
    concept: 'Surface area as "covering the outside"',
    gradient: 'from-pink-200 to-rose-300',
    unlocked: false,
  },
  {
    id: 'build-balance-city',
    number: 3,
    title: 'Build & Balance City',
    subtitle: 'Advanced',
    description: 'Design buildings with optimal space and material',
    icon: Building2,
    concept: 'Comparing volume vs surface area in real life',
    gradient: 'from-amber-200 to-orange-300',
    unlocked: false,
  },
];

export default function VolumeChapter() {
  const navigate = useNavigate();
  const [completedGames, setCompletedGames] = useState<string[]>([]);

  useEffect(() => {
    const completed = localStorage.getItem('completedGames');
    if (completed) {
      setCompletedGames(JSON.parse(completed));
    }
  }, []);

  const isUnlocked = (gameIndex: number) => {
    // All games are now unlocked
    return true;
  };

  const isCompleted = (gameId: string) => completedGames.includes(gameId);

  const handleGameClick = (game: typeof games[0], index: number) => {
    if (!isUnlocked(index)) return;
    navigate(`/game/${game.id}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header with micro-interaction */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between mb-8"
          >
            <InteractiveButton
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </InteractiveButton>
          </motion.div>

          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="text-center mb-12"
          >
            <FloatingElement amplitude={5} duration={4}>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">
                Volume & Surface Area
              </h1>
            </FloatingElement>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground"
            >
              Shapes • Space • Wrapping • Building
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground/70 mt-2"
            >
              Learn through 3D animation and play — no formulas, just discovery
            </motion.p>
          </motion.div>

          {/* Games Path with staggered animations */}
          <div className="relative">
            {/* Animated connection line */}
            <motion.div 
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400/30 via-pink-400/20 to-amber-400/10 -translate-x-1/2 rounded-full origin-top" 
            />

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              {games.map((game, index) => {
                const Icon = game.icon;
                const unlocked = isUnlocked(index);
                const completed = isCompleted(game.id);

                return (
                  <motion.div
                    key={game.id}
                    variants={staggerItem}
                    className={`relative ${index % 2 === 0 ? 'pr-8 md:pr-0 md:mr-auto md:w-[48%]' : 'pl-8 md:pl-0 md:ml-auto md:w-[48%]'}`}
                  >
                    {/* Animated node on line */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.15, type: 'spring', damping: 10 }}
                      className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 z-10 
                        ${completed ? 'bg-success border-success' : unlocked ? 'bg-primary border-primary' : 'bg-muted border-border'}
                        ${index % 2 === 0 ? 'right-0 md:right-auto md:left-[calc(100%+1rem)]' : 'left-0 md:left-auto md:right-[calc(100%+1rem)]'}
                      `}
                      style={{ transform: 'translateY(-50%) translateX(-50%)' }}
                    >
                      {completed && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.7 + index * 0.15, type: 'spring' }}
                        >
                          <CheckCircle2 className="w-full h-full text-success-foreground" />
                        </motion.div>
                      )}
                      {!completed && !unlocked && (
                        <Lock className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                      {unlocked && !completed && (
                        <PulseElement scale={1.3} duration={1.5}>
                          <div className="w-full h-full" />
                        </PulseElement>
                      )}
                    </motion.div>

                    <InteractiveCard
                      onClick={() => handleGameClick(game, index)}
                      disabled={!unlocked}
                      delay={0.2 + index * 0.15}
                      className={`
                        overflow-hidden border-2 rounded-lg
                        ${unlocked ? '' : 'opacity-60'}
                        ${completed ? 'border-success/50' : 'border-border'}
                      `}
                    >
                      <Card className="border-0 shadow-none">
                        {/* Animated gradient bar */}
                        <motion.div 
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.4 + index * 0.15, duration: 0.5 }}
                          className={`h-2 bg-gradient-to-r ${game.gradient} origin-left`} 
                        />
                        
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Animated Icon */}
                            <motion.div 
                              whileHover={unlocked ? { rotate: [0, -10, 10, 0], scale: 1.1 } : undefined}
                              transition={{ duration: 0.4 }}
                              className={`
                                p-4 rounded-2xl bg-gradient-to-br ${game.gradient}
                                ${!unlocked && 'grayscale'}
                              `}
                            >
                              <Icon className="w-8 h-8 text-foreground/80" />
                            </motion.div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <motion.span 
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + index * 0.15 }}
                                  className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                  Game {game.number} • {game.subtitle}
                                </motion.span>
                                {completed && (
                                  <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.15 }}
                                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/20 text-success-foreground"
                                  >
                                    ✓ Complete
                                  </motion.span>
                                )}
                              </div>
                              
                              <h3 className="text-xl font-bold mb-1">{game.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {game.description}
                              </p>
                              <p className="text-xs text-muted-foreground/70 italic">
                                {game.concept}
                              </p>
                            </div>
                          </div>

                          {/* Animated action hint */}
                          {unlocked && !completed && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
                              className="mt-4 text-center"
                            >
                              <span className="text-sm text-primary font-medium">
                                Tap to start learning →
                              </span>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </InteractiveCard>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
