import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                            window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#1C1C1C] flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 sm:gap-8 md:gap-12 max-w-2xl text-center px-4 w-full"
      >
        {/* Elegant Loading Title - Mobile Responsive */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight"
          style={{
            fontFamily: 'Georgia, serif',
            color: 'hsl(142, 76%, 45%)',
          }}
        >
          Initializing Eye Tracking
        </motion.h1>
        
        {/* Subtitle - Mobile Responsive */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl text-white/70 font-sans max-w-md leading-relaxed px-2"
        >
          Please allow camera access when prompted
        </motion.p>
        
        {/* Mobile Rotation Message */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-4 sm:mt-6 p-4 sm:p-5 bg-white/10 border border-hsl(142, 76%, 45%)/30 rounded-lg max-w-md"
            style={{
              borderColor: 'hsla(142, 76%, 45%, 0.3)',
            }}
          >
            <p className="text-white/90 font-sans text-sm sm:text-base font-semibold mb-2">
              📱 Mobile Device Detected
            </p>
            <p className="text-white/70 font-sans text-xs sm:text-sm leading-relaxed">
              Please turn on rotation lock and rotate your device 90 degrees to landscape mode for the best experience.
            </p>
          </motion.div>
        )}
        
        {/* Elegant Loading Animation - Mobile Responsive */}
        <motion.div
          className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 md:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
              style={{
                backgroundColor: 'hsl(142, 76%, 45%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
        
        {/* Subtle decorative line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100px' }}
          transition={{ duration: 1, delay: 0.8 }}
          className="h-px mt-4 sm:mt-6 md:mt-8"
          style={{
            background: 'linear-gradient(to right, transparent, hsl(142, 76%, 45%), transparent)',
          }}
        />
      </motion.div>
    </div>
  );
}
