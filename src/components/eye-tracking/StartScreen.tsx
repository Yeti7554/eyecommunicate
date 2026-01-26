import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="fixed inset-0 bg-[#1C1C1C] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 sm:gap-8 md:gap-12 max-w-4xl text-center px-4 w-full"
      >
        {/* Main Title - Large, Bold, Accent Color - Mobile Responsive */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight"
          style={{
            fontFamily: 'Georgia, serif',
            color: 'hsl(142, 76%, 45%)',
            textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
          }}
        >
          EyeCommunicate
        </motion.h1>
        
        {/* Sub-heading - Elegant Serif - Mobile Responsive */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 font-serif italic max-w-2xl leading-relaxed px-2"
        >
          An assistive communication tool for users with limited motor control.
        </motion.p>
        
        {/* Body Paragraph - Clean Sans-serif - Mobile Responsive */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-sm sm:text-base md:text-lg text-white/70 max-w-xl leading-relaxed font-sans px-2"
        >
          Communicate YES or NO answers using only your eye gaze. Look at the YES or NO zone, hold your gaze for 2 seconds, and the app will speak your selection aloud.
        </motion.p>
        
        {/* Call-to-Action Button - Minimal White with Border - Mobile Responsive */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          onClick={onStart}
          className="mt-4 sm:mt-6 md:mt-8 px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 bg-white text-black border-2 border-black rounded-full font-semibold text-xs sm:text-sm tracking-wider uppercase hover:bg-white/95 transition-all duration-200 flex items-center gap-2 sm:gap-3"
        >
          <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          Start Eye Tracking
        </motion.button>
        
        {/* Featured/Info Section - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8 sm:mt-12 md:mt-16 flex flex-col items-center gap-4 sm:gap-5 md:gap-6"
        >
          <p className="text-white/50 text-xs sm:text-sm font-serif italic" style={{ fontFamily: 'Georgia, serif' }}>
            Designed for accessibility
          </p>
          <div className="text-white/60 text-xs sm:text-sm font-sans">
            Desktop only
          </div>
          
          {/* Version Number */}
          <p className="text-white/40 text-xs font-sans mt-1 sm:mt-2">
            Version 0.1
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
