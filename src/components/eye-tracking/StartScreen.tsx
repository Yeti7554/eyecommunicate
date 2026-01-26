import { motion } from 'framer-motion';
import { Maximize2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface StartScreenProps {
  onStart: () => void;
  user: User | null;
}

export function StartScreen({ onStart, user }: StartScreenProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  return (
    <div className="fixed inset-0 bg-[#1C1C1C] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen">
      {/* Sign Out Button - Top Right */}
      {user && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={handleSignOut}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 px-4 py-2 text-white/50 hover:text-white/80 transition-colors text-xs sm:text-sm font-sans flex items-center gap-2 border border-white/20 hover:border-white/40 rounded-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      )}
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
        
        {/* How to Use Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-4 sm:mt-5"
        >
          <Link
            to="/how-to-use"
            className="text-white/40 hover:text-white/70 transition-colors text-xs sm:text-sm font-sans underline decoration-white/20 hover:decoration-white/50"
          >
            How to Use
          </Link>
        </motion.div>
        
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
            Desktop and mobile supported
          </div>
          
          {/* Version Number - Clickable */}
          <Link
            to="/changelog"
            className="text-white/40 hover:text-white/70 transition-colors text-xs font-sans mt-1 sm:mt-2 underline decoration-white/20 hover:decoration-white/50"
          >
            Version 0.2
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
