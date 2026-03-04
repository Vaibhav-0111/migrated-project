import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cake, Beaker, Sprout, Lock, Star, CheckCircle2 } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';

const games = [
  {
    id: 'share-slice-cafe',
    title: 'Share & Slice Café',
    description: 'Learn fractions by sharing food fairly',
    icon: Cake,
    difficulty: 'Easy',
    color: 'from-amber-400 to-orange-500',
    route: '/game/share-slice-cafe',
    concepts: ['Equal parts', 'Fair sharing', 'Whole & parts'],
  },
  {
    id: 'liquid-measure-lab',
    title: 'Liquid Measure Lab',
    description: 'Connect fractions, decimals & percentages',
    icon: Beaker,
    difficulty: 'Medium',
    color: 'from-cyan-400 to-blue-500',
    route: '/game/liquid-measure-lab',
    concepts: ['Fractions', 'Decimals', 'Percentages'],
  },
  {
    id: 'growing-money-garden',
    title: 'Growing Money Garden',
    description: 'Watch interest grow your savings',
    icon: Sprout,
    difficulty: 'Advanced',
    color: 'from-emerald-400 to-green-500',
    route: '/game/growing-money-garden',
    concepts: ['Percentage change', 'Simple interest', 'Growth patterns'],
  },
];

export default function FractionsChapter() {
  const navigate = useNavigate();
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 border-b border-border/50 bg-card/80 backdrop-blur-sm"
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
            <h1 className="text-2xl font-bold text-foreground">
              Fractions & Percentages
            </h1>
            <p className="text-sm text-muted-foreground">
              Parts • Decimals • Growth
            </p>
          </div>
        </div>
      </motion.header>

      {/* Chapter Introduction */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 text-amber-700 dark:text-amber-300">
            <Cake className="h-5 w-5" />
            <span className="text-sm font-medium">Visual Learning Journey</span>
          </div>
          <h2 className="mt-4 text-xl text-muted-foreground">
            Discover fractions through sharing, measure with liquids, and grow money in your garden
          </h2>
        </motion.div>

        {/* Animated Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-amber-400 via-cyan-400 to-emerald-400 opacity-30" />

          {/* Games */}
          <div className="space-y-12">
            {games.map((game, index) => {
              const Icon = game.icon;
              const isHovered = hoveredGame === game.id;

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  {/* Timeline Node */}
                  <motion.div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full p-3 bg-gradient-to-br ${game.color} shadow-lg`}
                    animate={{ scale: isHovered ? 1.2 : 1 }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>

                  {/* Game Card */}
                  <Card
                    className={`w-[45%] cursor-pointer transition-all duration-300 ${
                      isHovered ? 'shadow-xl scale-105' : 'shadow-md'
                    }`}
                    onClick={() => navigate(game.route)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${game.color} text-white`}>
                            {game.difficulty}
                          </span>
                          <h3 className="mt-2 text-xl font-bold text-foreground">
                            {game.title}
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((star) => (
                            <Star
                              key={star}
                              className="h-4 w-4 text-muted-foreground/30"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {game.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {game.concepts.map((concept) => (
                          <span
                            key={concept}
                            className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chapter Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Card className="inline-block">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>0/3 Games Completed</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span>0/9 Stars Earned</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
