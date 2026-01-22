# EyeCommunicate 👁️💬

**Communicate YES or NO using only your eyes** - An assistive communication tool for users with limited motor control.

## 🎯 What is EyeCommunicate?

EyeCommunicate is a web-based assistive communication device that allows users to communicate YES or NO answers using only their eye gaze. It's designed for people with severe motor impairments who cannot use traditional communication methods.

### Key Features
- 🎯 **Eye Gaze Detection**: Uses WebGazer.js for real-time pupil tracking
- 📱 **Cross-Platform**: Works on desktop, tablet, and mobile devices
- 🎚️ **Adjustable Sensitivity**: Customize dwell time and response sensitivity
- 🔊 **Voice Feedback**: Optional audio confirmation of selections
- ⏸️ **Pause Controls**: Ability to pause selections for setup or breaks
- 🔄 **Mirror Toggle**: Fix camera orientation issues
- 📐 **Responsive Design**: Adapts to different screen orientations

## 📖 The Story Behind EyeCommunicate

This project was born out of necessity and love. My father-in-law suffered a severe stroke followed by glioblastoma (brain cancer). The stroke left him with locked-in syndrome - he could think, feel, and understand everything, but could only communicate by blinking his eyes.

Traditional communication aids were frustrating for him because they required more motor control than he had. He could only reliably move his eyes, so I created EyeCommunicate specifically for him.

The app uses computer vision to track his eye gaze and converts it into YES/NO answers. When he looks at the YES zone for 2 seconds, the app speaks "YES" and provides visual feedback. The same for NO.

Today, EyeCommunicate gives him a voice again. It's not just technology - it's his lifeline to communicate with his family, express his thoughts, and participate in conversations.

## 🛠️ How It Works (Technical Overview)

### Eye Tracking Pipeline
1. **Camera Access**: Requests permission to use device camera
2. **Face Detection**: Uses TensorFlow.js and MediaPipe for facial landmark detection
3. **Pupil Tracking**: Tracks eye positions and gaze direction
4. **Zone Detection**: Determines if gaze is in YES, NO, or neutral zones
5. **Dwell Timing**: Measures how long gaze stays in a zone
6. **Selection Trigger**: Activates when dwell time exceeds threshold
7. **Feedback**: Provides audio and visual confirmation

### Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Camera Feed   │ -> │   WebGazer.js    │ -> │  Zone Detection │
│                 │    │  Eye Tracking    │    │                 │
│  Real-time      │    │  Pupil Position  │    │  YES/NO/Neutral │
│  Video Stream   │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Dwell Timer    │ -> │   Selection      │ -> │   Voice/Audio   │
│                 │    │   Confirmation    │    │   Feedback      │
│  2-second       │    │   Visual Cue      │    │                 │
│  Countdown      │    │                  │    │  "YES" / "NO"   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technologies Used
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Eye Tracking**: WebGazer.js + TensorFlow.js
- **Build Tool**: Vite
- **Deployment**: Lovable.dev platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with camera support
- Webcam or front-facing camera

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd eyecommunicate

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Grant Camera Permission**: Click "Allow" when prompted for camera access
2. **Calibration**: Look around to help WebGazer calibrate to your eyes
3. **Communication**: Look at YES or NO zones for 2 seconds to make selections
4. **Adjust Settings**: Use the debug panel to customize sensitivity and controls

## 🎛️ Configuration Options

### Sensitivity Controls
- **Dwell Time**: 200ms to 5000ms (default: 2000ms)
- **Neutral Zone**: Adjustable dead zone between YES/NO areas
- **Confidence Threshold**: Minimum eye tracking confidence

### Accessibility Features
- **Voice Toggle**: Enable/disable audio feedback
- **Mirror Toggle**: Fix camera orientation issues
- **Pause/Resume**: Temporarily disable selections

### Mobile Optimizations
- **Orientation Detection**: Adapts to portrait/landscape modes
- **Touch Fallback**: iOS users get touch-based controls
- **Responsive Layout**: Works on phones, tablets, and desktops

## 🧪 Development

### Project Structure
```
src/
├── components/
│   ├── eye-tracking/
│   │   ├── EyeTrackingInterface.tsx      # Main interface
│   │   ├── MobileEyeTrackingInterface.tsx # Mobile version
│   │   ├── StartScreen.tsx               # Welcome screen
│   │   ├── ErrorScreen.tsx               # Error handling
│   │   └── SelectionZone.tsx             # YES/NO zones
├── hooks/
│   ├── useWebGazer.ts                    # Eye tracking logic
│   └── useDwellSelection.ts              # Selection timing
└── lib/                                 # Utilities
```

### Key Components

#### useWebGazer Hook
Handles camera access, WebGazer initialization, and coordinate processing.

#### useDwellSelection Hook
Manages selection timing, voice feedback, and dwell state.

#### EyeTrackingInterface
Main component that renders the appropriate interface based on device type.

### Customization

#### Adding New Zones
```typescript
// In useDwellSelection.ts
const zones = {
  YES: { x: 0.25, y: 0.5 },    // Left side
  NO: { x: 0.75, y: 0.5 },     // Right side
  MAYBE: { x: 0.5, y: 0.25 }   // Top center
};
```

#### Voice Customization
```typescript
// Different voices for different responses
const voices = {
  YES: { pitch: 1.2, rate: 1.1 },
  NO: { pitch: 0.9, rate: 0.9 },
  MAYBE: { pitch: 1.0, rate: 1.0 }
};
```

## 📱 Mobile Considerations

### iOS Limitations
WebGazer has limited functionality on iOS Safari due to stricter privacy controls and WebGL limitations. The app automatically detects iOS and provides:
- Warning messages about limitations
- Alternative touch-based controls
- Optimized tracker selection

### Android & Desktop
Full WebGazer functionality with advanced eye tracking features.

## 🤝 Contributing

This project was created with love for my father-in-law. If you'd like to contribute:

1. **Bug Reports**: Open issues for any problems you encounter
2. **Feature Requests**: Suggest improvements for accessibility
3. **Code Contributions**: Help improve the eye tracking algorithms
4. **Translations**: Add support for additional languages

## 📄 License

This project is open source and available under the MIT License. Feel free to use it, modify it, and share it with others who need it.

## 🙏 Acknowledgments

- **WebGazer.js**: The amazing eye tracking library that makes this possible
- **TensorFlow.js**: Machine learning framework powering the facial recognition
- **My father-in-law**: Whose strength and spirit inspired this project
- **The assistive technology community**: For their ongoing work to help people communicate

---

**EyeCommunicate** - Giving a voice to those who need it most. 👁️💙
