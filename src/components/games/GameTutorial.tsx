import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, SkipForward } from 'lucide-react';

interface GameTutorialProps {
  title: string;
  topic: string;
  explanation: string;
  onComplete: () => void;
}

export function GameTutorial({ title, topic, explanation, onComplete }: GameTutorialProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Type out the text character by character
  useEffect(() => {
    if (!hasStarted) return;
    
    let index = 0;
    const typeSpeed = 30; // ms per character
    
    const typeInterval = setInterval(() => {
      if (index < explanation.length) {
        setDisplayedText(explanation.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, typeSpeed);

    return () => clearInterval(typeInterval);
  }, [explanation, hasStarted]);

  // Play voice narration using free browser Speech Synthesis API
  const playNarration = useCallback(() => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const shortText = `Welcome to ${title}. Let's learn about ${topic}.`;
      const utterance = new SpeechSynthesisUtterance(shortText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Try to pick a good English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) 
        || voices.find(v => v.lang.startsWith('en-US'))
        || voices.find(v => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error playing narration:', error);
      setIsSpeaking(false);
    }
  }, [title, topic, audioEnabled]);

  const handleStart = useCallback(() => {
    setHasStarted(true);
    playNarration();
  }, [playNarration]);

  const handleSkip = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    onComplete();
  }, [onComplete]);

  const toggleAudio = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
    setAudioEnabled(!audioEnabled);
  }, [isSpeaking, audioEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-2xl mx-4 p-8 bg-card rounded-3xl shadow-2xl border border-border/50"
      >
        {/* Topic badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
        >
          {topic}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-6"
        >
          {title}
        </motion.h2>

        {!hasStarted ? (
          /* Start screen */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <Play className="w-10 h-10 text-primary" />
            </motion.div>
            <p className="text-muted-foreground mb-6">
              Ready to learn about {topic.toLowerCase()}?
            </p>
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Start Tutorial
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Explanation text with typing effect */}
            <div className="min-h-[150px] mb-6">
              <p className="text-lg text-foreground/90 leading-relaxed">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="inline-block w-0.5 h-5 ml-1 bg-primary align-middle"
                  />
                )}
              </p>
            </div>

            {/* Audio indicator */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 mb-4 text-sm text-primary"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Volume2 className="w-4 h-4" />
                  </motion.div>
                  <span>Speaking...</span>
                  {/* Audio wave visualization */}
                  <div className="flex items-center gap-0.5 ml-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['4px', '16px', '4px'] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        className="w-1 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAudio}
                className="gap-2"
              >
                {audioEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    Audio On
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    Audio Off
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkip} className="gap-2">
                  <SkipForward className="w-4 h-4" />
                  Skip
                </Button>
                {!isTyping && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button onClick={onComplete} className="gap-2">
                      Start Game
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
