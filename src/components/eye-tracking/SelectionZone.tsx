import { motion } from 'framer-motion';

interface SelectionZoneProps {
  type: 'YES' | 'NO';
  isActive: boolean;
  dwellProgress: number;
  isSelected: boolean;
}

export function SelectionZone({ type, isActive, dwellProgress, isSelected }: SelectionZoneProps) {
  const isYes = type === 'YES';
  
  const baseClass = isYes ? 'yes-zone' : 'no-zone';
  const activeClass = isYes ? 'yes-zone-active' : 'no-zone-active';
  
  return (
    <motion.div
      className={`
        relative flex-1 flex items-center justify-center
        transition-all duration-200 ease-out
        ${isActive || isSelected ? activeClass : baseClass}
      `}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        scale: isSelected ? 1.02 : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Dwell progress ring */}
      {isActive && dwellProgress > 0 && dwellProgress < 1 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${dwellProgress * 283} 283`}
              transform="rotate(-90 50 50)"
              initial={{ strokeDasharray: '0 283' }}
              animate={{ strokeDasharray: `${dwellProgress * 283} 283` }}
              transition={{ duration: 0.05 }}
            />
          </svg>
        </div>
      )}
      
      {/* Selection confirmation */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.span
            className="text-6xl md:text-7xl lg:text-8xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isYes ? '✓' : '✗'}
          </motion.span>
        </motion.div>
      )}
      
      {/* Main text */}
      <motion.span
        className={`
          selection-text text-white
          text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem]
          select-none
          ${isSelected ? 'opacity-60' : 'opacity-100'}
        `}
        animate={{
          scale: isActive ? 1.05 : 1,
          textShadow: isActive 
            ? '0 0 40px rgba(255,255,255,0.5)' 
            : '0 0 0px rgba(255,255,255,0)',
        }}
        transition={{ duration: 0.2 }}
      >
        {type}
      </motion.span>
    </motion.div>
  );
}
