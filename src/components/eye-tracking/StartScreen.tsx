import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="fixed inset-0 bg-[#1C1C1C] flex flex-col items-center justify-center p-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center gap-12 max-w-4xl text-center px-4"
      >
        {/* Main Title - Large, Bold, Accent Color */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight"
          style={{
            fontFamily: 'Georgia, serif',
            color: 'hsl(142, 76%, 45%)',
            textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
          }}
        >
          EyeCommunicate
        </motion.h1>
        
        {/* Sub-heading - Elegant Serif */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-2xl md:text-3xl text-white/90 font-serif italic max-w-2xl leading-relaxed"
        >
          An assistive communication tool for users with limited motor control.
        </motion.p>
        
        {/* Body Paragraph - Clean Sans-serif */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base md:text-lg text-white/70 max-w-xl leading-relaxed font-sans"
        >
          Communicate YES or NO answers using only your eye gaze. Look at the YES or NO zone, hold your gaze for 2 seconds, and the app will speak your selection aloud.
        </motion.p>
        
        {/* Call-to-Action Button - Minimal White with Border */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          onClick={onStart}
          className="mt-8 px-12 py-4 bg-white text-black border-2 border-black rounded-full font-semibold text-sm tracking-wider uppercase hover:bg-white/95 transition-all duration-200 flex items-center gap-3"
        >
          <Maximize2 className="w-5 h-5" />
          Start Eye Tracking
        </motion.button>
        
        {/* Featured/Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 flex flex-col items-center gap-6"
        >
          <p className="text-white/50 text-sm font-serif italic" style={{ fontFamily: 'Georgia, serif' }}>
            Designed for accessibility
          </p>
          <div className="text-white/60 text-sm font-sans">
            Desktop only
          </div>
          
          {/* Version Number */}
          <p className="text-white/40 text-xs font-sans mt-2">
            Version 0.1
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
