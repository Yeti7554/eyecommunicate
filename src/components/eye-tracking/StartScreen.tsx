import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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

      {/* Memorial Plaque */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 1.4 }}
        className="absolute bottom-5 sm:bottom-7 left-0 right-0 flex justify-center px-4"
      >
        {/* Outer raised frame */}
        <div
          className="p-[3px]"
          style={{
            background: 'linear-gradient(145deg, #8a8a8a, #3a3a3a 40%, #6e6e6e 60%, #2a2a2a)',
            boxShadow: '0 6px 32px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {/* Inner recessed rim */}
          <div
            className="p-[2px]"
            style={{
              background: 'linear-gradient(145deg, #1a1a1a, #4a4a4a 50%, #1e1e1e)',
            }}
          >
            {/* Plaque face */}
            <div
              className="relative flex flex-col items-center gap-2.5 px-8 sm:px-12 py-4 sm:py-5"
              style={{
                background: 'linear-gradient(160deg, #5c5c5c 0%, #3e3e3e 30%, #484848 55%, #353535 80%, #505050 100%)',
                boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {/* Corner ornaments */}
              {[
                'top-1.5 left-1.5',
                'top-1.5 right-1.5',
                'bottom-1.5 left-1.5',
                'bottom-1.5 right-1.5',
              ].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-2.5 h-2.5`}
                  style={{
                    borderTop: i < 2 ? '1px solid rgba(255,255,255,0.35)' : 'none',
                    borderBottom: i >= 2 ? '1px solid rgba(100,100,100,0.5)' : 'none',
                    borderLeft: i % 2 === 0 ? '1px solid rgba(255,255,255,0.35)' : 'none',
                    borderRight: i % 2 === 1 ? '1px solid rgba(100,100,100,0.5)' : 'none',
                  }}
                />
              ))}

              {/* Top ornament */}
              <div className="flex items-center gap-2">
                <span style={{ color: 'rgba(210,200,180,0.5)', fontSize: '10px' }}>✦</span>
                <div className="w-8 sm:w-14 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(210,200,180,0.35))' }} />
                <span style={{ color: 'rgba(210,200,180,0.5)', fontSize: '10px' }}>✦</span>
              </div>

              {/* In Memoriam */}
              <div className="flex items-center gap-3">
                <div className="w-4 h-px" style={{ background: 'rgba(200,190,170,0.25)' }} />
                <span
                  className="text-[9px] sm:text-[10px] tracking-[0.35em] uppercase font-sans"
                  style={{ color: 'rgba(200,185,160,0.6)', textShadow: '0 1px 0 rgba(0,0,0,0.5)' }}
                >
                  In Memoriam
                </span>
                <div className="w-4 h-px" style={{ background: 'rgba(200,190,170,0.25)' }} />
              </div>

              {/* Name — engraved look */}
              <p
                className="text-base sm:text-lg tracking-[0.2em] font-serif"
                style={{
                  fontFamily: 'Georgia, serif',
                  color: 'rgba(230,220,200,0.9)',
                  textShadow: '0 1px 0 rgba(0,0,0,0.6), 0 -1px 0 rgba(255,255,255,0.08)',
                  letterSpacing: '0.18em',
                }}
              >
                Ibrahim Ejaz
              </p>

              {/* Dates */}
              <div className="flex items-center gap-3">
                <div className="w-5 h-px" style={{ background: 'rgba(200,190,170,0.25)' }} />
                <p
                  className="text-[10px] sm:text-xs tracking-[0.25em] font-sans"
                  style={{ color: 'rgba(180,170,150,0.55)', textShadow: '0 1px 0 rgba(0,0,0,0.5)' }}
                >
                  1969 &nbsp;—&nbsp; 2026
                </p>
                <div className="w-5 h-px" style={{ background: 'rgba(200,190,170,0.25)' }} />
              </div>

              {/* Bottom ornament */}
              <div className="flex items-center gap-2">
                <span style={{ color: 'rgba(210,200,180,0.5)', fontSize: '10px' }}>✦</span>
                <div className="w-8 sm:w-14 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(210,200,180,0.35))' }} />
                <span style={{ color: 'rgba(210,200,180,0.5)', fontSize: '10px' }}>✦</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
