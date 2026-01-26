import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Smartphone, RotateCw } from 'lucide-react';

export default function HowToUse() {
  return (
    <div 
      className="fixed inset-0 w-full h-full bg-[#1C1C1C] text-white overflow-y-auto"
      style={{ overflowY: 'auto' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 pb-20 sm:pb-24">
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
            How to Use
          </h1>
          <p className="text-white/60 text-sm sm:text-base md:text-lg">
            Learn how to use EyeCommunicate on desktop and mobile devices
          </p>
        </motion.div>

        {/* Desktop Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Monitor className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'hsl(142, 76%, 45%)' }} />
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: 'Georgia, serif',
                color: 'hsl(142, 76%, 45%)',
              }}
            >
              Desktop Instructions
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white/90 font-sans">
                1. Allow Camera Access
              </h3>
              <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
                When you click "Start Eye Tracking", your browser will ask for camera permission. 
                Click "Allow" to enable eye tracking. Make sure you're in a well-lit area and your face is visible to the camera.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white/90 font-sans">
                2. Look at YES or NO
              </h3>
              <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
                The screen is divided into two zones: <span className="text-green-400 font-semibold">YES</span> (right/green) and <span className="text-red-400 font-semibold">NO</span> (left/red). 
                Simply look at the zone that represents your answer.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white/90 font-sans">
                3. Hold Your Gaze
              </h3>
              <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
                Keep looking at your chosen zone for 2 seconds. You'll see a progress ring fill up as you hold your gaze. 
                Once complete, the app will speak your selection aloud.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white/90 font-sans">
                4. Adjust Settings (Optional)
              </h3>
              <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
                Use the debug panel to adjust sensitivity, mirror the camera view, pause selections, or toggle voice feedback.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mobile Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'hsl(142, 76%, 45%)' }} />
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: 'Georgia, serif',
                color: 'hsl(142, 76%, 45%)',
              }}
            >
              Mobile Instructions
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 mt-1 flex-shrink-0" style={{ color: 'hsl(142, 76%, 45%)' }} />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white/90 font-sans">
                    Rotate to Landscape
                  </h3>
                  <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
                    Turn on rotation lock and rotate your device 90 degrees to landscape mode for the best experience. 
                    The app works best in landscape orientation on mobile devices.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white/90 font-sans">
                1. Allow Camera Access
              </h3>
              <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
                When you start eye tracking, your browser will request camera permission. 
                Grant access and ensure your face is well-lit and visible to the front-facing camera.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white/90 font-sans">
                2. Use the Zones
              </h3>
              <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
                In landscape mode, <span className="text-green-400 font-semibold">YES</span> is on the right (green) and <span className="text-red-400 font-semibold">NO</span> is on the left (red). 
                In portrait mode, <span className="text-green-400 font-semibold">YES</span> is at the bottom and <span className="text-red-400 font-semibold">NO</span> is at the top.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white/90 font-sans">
                3. Hold Your Gaze
              </h3>
              <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
                Look at your chosen zone and maintain your gaze for 2 seconds. 
                A progress ring will appear, and once complete, your selection will be spoken aloud.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white/90 font-sans">
                4. Mobile Controls
              </h3>
              <p className="text-white/70 text-sm sm:text-base font-sans leading-relaxed">
                Use the mobile debug panel to adjust settings, toggle voice, pause selections, or adjust sensitivity. 
                The panel location changes based on your device orientation.
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-green-400 font-sans">
                💡 Recalibration Tip
              </h3>
              <p className="text-green-200/80 text-sm sm:text-base font-sans leading-relaxed">
                If eye tracking seems inaccurate, try tapping the <span className="text-green-400 font-semibold">YES</span> and <span className="text-red-400 font-semibold">NO</span> zones repeatedly in a cycle. 
                This helps recalibrate the eye tracking system and improve accuracy.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-yellow-400 font-sans">
                ⚠️ iOS Chrome Note
              </h3>
              <p className="text-yellow-200/80 text-sm sm:text-base font-sans leading-relaxed">
                Eye tracking on iOS Chrome may have limited functionality due to browser restrictions. 
                For the best experience on iOS, consider using Safari or another supported browser.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-white/10 pt-8 sm:pt-12"
        >
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-6"
            style={{
              fontFamily: 'Georgia, serif',
              color: 'hsl(142, 76%, 45%)',
            }}
          >
            Tips for Best Results
          </h2>
          <ul className="space-y-3 sm:space-y-4 text-white/70 text-sm sm:text-base font-sans list-disc list-inside">
            <li>Ensure good lighting so your face is clearly visible</li>
            <li>Position yourself at a comfortable distance from the camera (about 2-3 feet)</li>
            <li>Keep your head relatively still while looking at the zones</li>
            <li>If tracking seems off, try adjusting the mirror toggle in the debug panel</li>
            <li>You can adjust the dwell time (sensitivity) to make selections faster or slower</li>
            <li>Use the pause button if you need to take a break</li>
          </ul>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 sm:mt-16 pt-8 border-t border-white/10"
        >
          <p className="text-white/40 text-xs sm:text-sm font-sans text-center">
            Need help? Check the changelog for updates and improvements.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
