import { motion } from 'framer-motion';
import { Eye, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 max-w-2xl text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Eye className="w-32 h-32 text-primary" />
        </motion.div>
        
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            EyeYesNo
          </h1>
          <p className="text-xl text-muted-foreground">
            Answer YES or NO using only your eyes
          </p>
        </div>
        
        <div className="flex flex-col items-start gap-3 text-left bg-card p-6 rounded-xl border border-border">
          <h2 className="text-lg font-semibold text-foreground">How it works:</h2>
          <ul className="text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Look at the <span className="text-primary font-semibold">YES</span> side (left) or <span className="text-secondary font-semibold">NO</span> side (right)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Hold your gaze for about 1 second</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>The app will speak your selection aloud</span>
            </li>
          </ul>
        </div>
        
        <Button
          onClick={onStart}
          size="lg"
          className="text-xl px-8 py-6 gap-3"
        >
          <Maximize2 className="w-6 h-6" />
          Start Fullscreen
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Best used on MacBook Air in Chrome or Safari
        </p>
      </motion.div>
    </div>
  );
}
