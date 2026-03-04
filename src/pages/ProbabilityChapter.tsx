import { motion } from 'framer-motion';
import { ArrowLeft, Dice1, Target, TrendingUp, Lock, Star, Check } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useNavigate } from 'react-router-dom';
import { CalmWorld } from '@/components/3d/CalmWorld';

const games = [
  {
    id: 'chance-garden',
    title: 'Chance Garden',
    concept: 'Probability as likelihood',
    description: 'Learn that some things happen more often than others',
    difficulty: 'easy',
    icon: Dice1,
    color: 'from-pink-400 to-rose-500',
    route: '/game/chance-garden',
  },
  {
    id: 'spinner-dice-lab',
    title: 'Spinner & Dice Lab',
    concept: 'Comparing outcomes & fairness',
    description: 'Explore spinners and dice to understand fair chances',
    difficulty: 'medium',
    icon: Target,
    color: 'from-cyan-400 to-blue-500',
    route: '/game/spinner-dice-lab',
  },
  {
    id: 'prediction-park',
    title: 'Prediction Park',
    concept: 'Experimental probability & patterns',
    description: 'Run experiments and predict outcomes from patterns',
    difficulty: 'hard',
    icon: TrendingUp,
    color: 'from-amber-400 to-orange-500',
    route: '/game/prediction-park',
  },
];

export default function ProbabilityChapter() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CalmWorld />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/50 bg-card/80 backdrop-blur-sm"
        >
          <div className="container mx-auto flex items-center gap-4 px-4 py-4">
            <EnhancedButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </EnhancedButton>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Probability</h1>
              <p className="text-sm text-muted-foreground">Chance • Patterns • Predictions</p>
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Chapter Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 mb-4 shadow-lg">
              <Dice1 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-high-contrast">Learn Probability</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Discover chances and patterns through beautiful animations and gentle play
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-400 via-cyan-400 to-amber-400 -translate-x-1/2 rounded-full opacity-30" />

            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`relative flex items-center gap-8 mb-12 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(game.route)}
                  className="flex-1 cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-card/90 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl p-6">
                    {/* Gradient Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${game.color}`} />
                    
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className={`p-4 rounded-xl bg-gradient-to-br ${game.color} shadow-md`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <game.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            game.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            game.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {game.difficulty}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-high-contrast mb-1">{game.title}</h3>
                        <p className="text-sm text-primary font-medium mb-1">{game.concept}</p>
                        <p className="text-sm text-muted-foreground">{game.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Timeline Node */}
                <motion.div 
                  className={`absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br ${game.color} border-4 border-background shadow-lg z-10`}
                  whileHover={{ scale: 1.3 }}
                  animate={{ 
                    boxShadow: ['0 0 0 0 rgba(var(--primary), 0.4)', '0 0 0 10px rgba(var(--primary), 0)', '0 0 0 0 rgba(var(--primary), 0)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Empty space for alignment */}
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-muted-foreground mb-4">
              Complete all games to master Probability! 🎲
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
