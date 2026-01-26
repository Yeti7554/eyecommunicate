import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Changelog() {
  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{
              fontFamily: 'Georgia, serif',
              color: 'hsl(142, 76%, 45%)',
            }}
          >
            Changelog
          </h1>
          <p className="text-white/60 text-sm sm:text-base md:text-lg">
            Track the evolution of EyeCommunicate
          </p>
        </motion.div>

        {/* Changelog Entries */}
        <div className="space-y-8 sm:space-y-12">
          {/* Version 0.2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border-l-4 pl-6 sm:pl-8 py-4 sm:py-6"
            style={{
              borderColor: 'hsl(142, 76%, 45%)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold"
                style={{
                  fontFamily: 'Georgia, serif',
                  color: 'hsl(142, 76%, 45%)',
                }}
              >
                Version 0.2
              </h2>
              <span className="text-white/40 text-xs sm:text-sm font-sans">
                Current
              </span>
            </div>
            <p className="text-white/50 text-xs sm:text-sm mb-4 sm:mb-6 font-sans">
              Latest release with mobile improvements and enhanced user experience
            </p>
            <ul className="space-y-2 sm:space-y-3 text-white/80 text-sm sm:text-base font-sans list-disc list-inside">
              <li>Mobile-responsive homepage and loading screen</li>
              <li>Mobile rotation instructions on loading screen</li>
              <li>Improved mobile eye tracking interface for iOS Chrome</li>
              <li>Enhanced debug logging and error handling</li>
              <li>Fixed React Hooks violations and infinite render loops</li>
              <li>Better mobile device detection and orientation handling</li>
              <li>Improved gaze marker visibility on mobile devices</li>
            </ul>
          </motion.div>

          {/* Version 0.1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-l-4 pl-6 sm:pl-8 py-4 sm:py-6 border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/70"
                style={{
                  fontFamily: 'Georgia, serif',
                }}
              >
                Version 0.1
              </h2>
              <span className="text-white/30 text-xs sm:text-sm font-sans">
                Initial Release
              </span>
            </div>
            <p className="text-white/50 text-xs sm:text-sm mb-4 sm:mb-6 font-sans">
              The first release of EyeCommunicate
            </p>
            <ul className="space-y-2 sm:space-y-3 text-white/60 text-sm sm:text-base font-sans list-disc list-inside">
              <li>Core eye tracking functionality using WebGazer.js</li>
              <li>YES/NO selection zones with dwell time detection</li>
              <li>Voice feedback for selections using speech synthesis</li>
              <li>Desktop eye tracking interface</li>
              <li>Basic mobile mode support</li>
              <li>Debug panel with sensitivity and mirror controls</li>
              <li>Elegant dark theme design</li>
              <li>Fullscreen support</li>
              <li>Error and loading screens</li>
              <li>Developer documentation</li>
            </ul>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16 pt-8 border-t border-white/10"
        >
          <p className="text-white/40 text-xs sm:text-sm font-sans text-center">
            EyeCommunicate - An assistive communication tool
          </p>
        </motion.div>
      </div>
    </div>
  );
}
