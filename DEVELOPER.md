# EyeCommunicate - Developer Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Application Flow](#application-flow)
3. [Core Components](#core-components)
4. [Hooks & State Management](#hooks--state-management)
5. [Eye Tracking Pipeline](#eye-tracking-pipeline)
6. [Coordinate System](#coordinate-system)
7. [Dwell Selection System](#dwell-selection-system)
8. [Mobile vs Desktop](#mobile-vs-desktop)
9. [Configuration & Constants](#configuration--constants)
10. [API Reference](#api-reference)
11. [Development Guide](#development-guide)

---

## Architecture Overview

EyeCommunicate is a React + TypeScript application built with Vite. It uses WebGazer.js for eye tracking and implements a dwell-time selection system for YES/NO communication.

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Eye Tracking**: WebGazer.js (uses TensorFlow.js under the hood)
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **State Management**: React Hooks (useState, useEffect, useRef, useCallback)

### Project Structure
```
src/
├── App.tsx                    # Root component with routing
├── main.tsx                   # Application entry point
├── pages/
│   ├── Index.tsx              # Main page (StartScreen → EyeTrackingInterface)
│   └── NotFound.tsx           # 404 page
├── components/
│   ├── eye-tracking/
│   │   ├── StartScreen.tsx           # Welcome/homepage
│   │   ├── LoadingScreen.tsx          # Camera initialization
│   │   ├── ErrorScreen.tsx            # Error handling
│   │   ├── EyeTrackingInterface.tsx   # Desktop tracking UI
│   │   ├── MobileEyeTrackingInterface.tsx  # Mobile tracking UI
│   │   ├── SelectionZone.tsx          # YES/NO zone components
│   │   └── NeutralZone.tsx            # Center neutral zone
│   └── ui/                    # shadcn/ui components
├── hooks/
│   ├── useWebGazer.ts         # Core eye tracking logic
│   ├── useDwellSelection.ts   # Dwell timing & selection
│   ├── useFullscreen.ts       # Fullscreen API wrapper
│   └── use-mobile.tsx         # Mobile detection
└── lib/
    └── utils.ts               # Utility functions
```

---

## Application Flow

### 1. Initial Load
```
User opens app
  ↓
App.tsx renders Index page
  ↓
Index.tsx shows StartScreen
  ↓
User clicks "Start Fullscreen"
  ↓
Index.tsx enters fullscreen mode
  ↓
Index.tsx renders EyeTrackingInterface
```

### 2. Eye Tracking Initialization
```
EyeTrackingInterface mounts
  ↓
useWebGazer hook initializes
  ↓
WebGazer.js loads dynamically
  ↓
Camera permission requested
  ↓
WebGazer.begin() starts tracking
  ↓
Gaze listener receives coordinates
  ↓
Coordinates processed & state updated
```

### 3. Selection Flow
```
Gaze detected in YES/NO zone
  ↓
useDwellSelection starts timer
  ↓
User maintains gaze for 2 seconds
  ↓
Selection triggered
  ↓
Voice feedback: "YES" or "NO"
  ↓
Visual feedback shown
  ↓
Cooldown period (200ms)
  ↓
Ready for next selection
```

---

## Core Components

### `App.tsx`
Root component that sets up:
- React Query provider
- Router configuration
- UI providers (Tooltip, Toast, Sonner)

**Routes:**
- `/` → `Index` component
- `*` → `NotFound` component

### `Index.tsx`
Main page component that manages the flow between:
- `StartScreen` (initial state)
- `EyeTrackingInterface` (after user clicks start)

**State:**
- `hasStarted`: Boolean to track if user has clicked start

**Key Functions:**
- `handleStart()`: Enters fullscreen and switches to tracking interface

### `StartScreen.tsx`
Welcome/homepage component displayed before tracking begins.

**Props:**
- `onStart: () => void` - Callback when user clicks start button

**Features:**
- Animated eye icon
- Instructions for use
- Version number display (V0.1)
- Fullscreen button

### `EyeTrackingInterface.tsx`
Main desktop tracking interface.

**State:**
- `selectionsPaused`: Boolean to pause/resume selections
- `isMobileMode`: Boolean for mobile detection

**Hooks Used:**
- `useWebGazer()` - Eye tracking
- `useDwellSelection()` - Selection timing

**Features:**
- Debug panel with controls
- Gaze position indicator (red marker)
- YES/NO/Neutral zones
- Sensitivity slider
- Mirror toggle
- Voice toggle
- Mobile mode detection

**Layout:**
- Left: NO zone
- Center: Neutral zone (0.5% width)
- Right: YES zone

### `MobileEyeTrackingInterface.tsx`
Mobile-optimized tracking interface.

**Differences from Desktop:**
- Portrait mode: NO (top), YES (bottom)
- Landscape mode: NO (left), YES (right)
- Touch fallback for iOS
- Different layout and controls

**State:**
- `selectionsPaused`: Pause/resume selections
- `voiceEnabled`: Toggle voice feedback
- `isLandscapeLeft`: Orientation detection
- `isIOS`: iOS device detection

---

## Hooks & State Management

### `useWebGazer()`

Core hook for eye tracking functionality.

**Returns:**
```typescript
{
  gazeState: 'LOOKING_AT_YES' | 'LOOKING_AT_NO' | 'LOOKING_AT_NEITHER',
  isInitialized: boolean,
  isLoading: boolean,
  error: string | null,
  gazePosition: { x: number, y: number, confidence?: number } | null,
  eyePositions: { left: { x: number, y: number } | null, right: { x: number, y: number } | null }
}
```

**Internal State:**
- `gazeState`: Current zone (YES/NO/NEUTRAL)
- `isInitialized`: WebGazer initialization status
- `isLoading`: Loading state during initialization
- `error`: Error message if initialization fails
- `gazePosition`: Current gaze coordinates
- `eyePositions`: Left/right eye positions (currently null)

**Key Functions:**
- `calculateSmoothedGaze()`: Smooths gaze coordinates using moving average
- `determineGazeState()`: Determines which zone the gaze is in based on X coordinate

**Configuration:**
- `SMOOTHING_WINDOW = 1`: No smoothing (maximum sensitivity)
- `NEUTRAL_ZONE_WIDTH = 0.005`: 0.5% neutral zone
- `MIN_CONFIDENCE = 0.01`: Minimum confidence threshold

**Exported Functions:**
- `getCoordinateFlipping()`: Get current coordinate flip state
- `setCoordinateFlipping(x: boolean, y: boolean)`: Toggle coordinate flipping

**WebGazer Configuration:**
- Regression: `ridge` (desktop) / `weightedRidge` (iOS)
- Tracker: `TFFacemesh` (desktop) / `clmtrackr` (iOS)
- Video preview: Hidden
- Prediction points: Hidden
- Face overlay: Hidden

### `useDwellSelection()`

Manages dwell timing and selection logic.

**Parameters:**
- `gazeState: GazeState` - Current gaze zone
- `selectionsPaused: boolean = false` - Pause selections
- `voiceEnabled: boolean = true` - Enable voice feedback

**Returns:**
```typescript
{
  selectionState: 'idle' | 'dwelling' | 'selected' | 'cooldown',
  selectedOption: 'YES' | 'NO' | null,
  dwellProgress: number, // 0 to 1
  currentZone: 'YES' | 'NO' | 'NEUTRAL',
  resetSelection: () => void
}
```

**State Machine:**
```
idle → dwelling → selected → cooldown → idle
  ↑                                    ↓
  └────────────────────────────────────┘
```

**Configuration:**
- `DWELL_TIME_MS = 2000`: 2-second dwell time (adjustable)
- `COOLDOWN_MS = 200`: 200ms cooldown between selections

**Exported Functions:**
- `getDwellTime()`: Get current dwell time
- `setDwellTime(time: number)`: Set dwell time (200ms - 5000ms)

**Key Functions:**
- `speak()`: Text-to-speech for selections
- `handleSelection()`: Triggers selection and voice feedback
- `updateCurrentZone()`: Tracks current zone
- `updateDwellProgress()`: Updates progress bar using requestAnimationFrame

---

## Eye Tracking Pipeline

### 1. WebGazer Initialization

```typescript
// Dynamic import of WebGazer
const webgazer = await import('webgazer');
webgazerRef.current = webgazer.default;

// Configuration
webgazerRef.current
  .setRegression('ridge')
  .showVideoPreview(false)
  .showPredictionPoints(false)
  .setTracker('TFFacemesh');

// Start tracking
await webgazerRef.current.begin();
```

### 2. Gaze Listener

WebGazer calls the gaze listener with coordinate data:

```typescript
webgazerRef.current.setGazeListener((data: any, clock: any) => {
  // Extract coordinates
  const gazeX = data.x;
  const gazeY = data.y;
  const confidence = data.confidence;
  
  // Convert to screen coordinates
  // Apply coordinate flipping if needed
  // Filter low confidence
  // Update state
});
```

### 3. Coordinate Processing

**Coordinate Formats:**
- Normalized (0-1): Converted to pixels
- Pixel coordinates: Used directly

**Coordinate Conversion:**
```typescript
if (gazeX > 10 || gazeY > 10) {
  // Pixel coordinates
  screenX = Math.max(0, Math.min(viewportWidth, gazeX));
  screenY = Math.max(0, Math.min(viewportHeight, gazeY));
} else {
  // Normalized coordinates
  screenX = gazeX * viewportWidth;
  screenY = gazeY * viewportHeight;
}
```

### 4. Zone Detection

```typescript
const neutralStart = screenWidth * (0.5 - NEUTRAL_ZONE_WIDTH / 2);
const neutralEnd = screenWidth * (0.5 + NEUTRAL_ZONE_WIDTH / 2);

if (x < neutralStart) {
  return 'LOOKING_AT_NO';  // Left side
} else if (x > neutralEnd) {
  return 'LOOKING_AT_YES'; // Right side
} else {
  return 'LOOKING_AT_NEITHER'; // Center
}
```

---

## Coordinate System

### Screen Layout (Desktop)
```
┌─────────────────────────────────────────┐
│                                         │
│  NO Zone    │  Neutral  │   YES Zone   │
│  (Left)     │  (Center) │   (Right)    │
│             │  0.5%     │              │
│             │           │              │
└─────────────────────────────────────────┘
```

### Coordinate Flipping

WebGazer coordinates may be mirrored due to camera orientation. The app provides runtime coordinate flipping:

```typescript
// Toggle X-axis flipping (mirror)
setCoordinateFlipping(true, false);

// Applied during coordinate conversion
if (flipXCoordinates) {
  screenX = viewportWidth - screenX;
}
```

### Viewport Dimensions

Uses `document.documentElement.clientWidth/Height` for accurate viewport size:
```typescript
const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
```

---

## Dwell Selection System

### Selection States

1. **idle**: No active selection, waiting for gaze
2. **dwelling**: Gaze detected in zone, timer counting
3. **selected**: Selection confirmed, showing feedback
4. **cooldown**: Brief pause before next selection

### Dwell Timer

Uses `requestAnimationFrame` for smooth progress updates:

```typescript
const updateDwellProgress = () => {
  if (selectionState === 'dwelling' && dwellStartTimeRef.current) {
    const elapsed = Date.now() - dwellStartTimeRef.current;
    const progress = Math.min(elapsed / DWELL_TIME_MS, 1);
    setDwellProgress(progress);
    
    if (progress >= 1) {
      handleSelection(option);
    }
  }
  
  animationFrameRef.current = requestAnimationFrame(updateDwellProgress);
};
```

### Voice Feedback

Uses Web Speech API:

```typescript
const utterance = new SpeechSynthesisUtterance('YES');
utterance.volume = 1.0;
utterance.rate = 0.8;  // Slow, clear speech
utterance.pitch = 0.9;
window.speechSynthesis.speak(utterance);
```

### Re-arm Mechanism

After selection, user must look away (to neutral) before next selection can start. This prevents accidental repeated selections.

---

## Mobile vs Desktop

### Detection Logic

```typescript
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isSmallScreen = window.innerWidth < 1024;
const isMobile = isMobileDevice || (isSmallScreen && window.innerHeight > window.innerWidth);
```

### Mobile Layouts

**Portrait Mode:**
- NO zone: Top
- YES zone: Bottom
- Neutral zone: Center (vertical)
- Debug panel: Left side

**Landscape Mode:**
- NO zone: Left
- YES zone: Right
- Neutral zone: Center (horizontal)
- Debug panel: Bottom

### iOS Considerations

- Uses `clmtrackr` tracker instead of `TFFacemesh`
- Uses `weightedRidge` regression
- Provides touch-based fallback interface
- Shows iOS-specific warnings

---

## Configuration & Constants

### `useWebGazer.ts`

```typescript
const SMOOTHING_WINDOW = 1;        // No smoothing
const NEUTRAL_ZONE_WIDTH = 0.005;  // 0.5% neutral zone
const MIN_CONFIDENCE = 0.01;        // Minimum confidence
```

### `useDwellSelection.ts`

```typescript
let DWELL_TIME_MS = 2000;  // 2 seconds (adjustable)
const COOLDOWN_MS = 200;   // 200ms cooldown
```

### `EyeTrackingInterface.tsx`

```typescript
const NEUTRAL_ZONE_WIDTH_PERCENT = 0.5;  // 0.5% of screen width
```

---

## API Reference

### `useWebGazer()`

**Returns:**
- `gazeState`: Current gaze zone
- `isInitialized`: Initialization status
- `isLoading`: Loading state
- `error`: Error message
- `gazePosition`: Current coordinates
- `eyePositions`: Eye positions (currently null)

**Exported Functions:**
- `getCoordinateFlipping()`: Get flip state
- `setCoordinateFlipping(x, y)`: Set flip state

### `useDwellSelection(gazeState, selectionsPaused, voiceEnabled)`

**Returns:**
- `selectionState`: Current selection state
- `selectedOption`: Selected option (YES/NO/null)
- `dwellProgress`: Progress (0-1)
- `currentZone`: Current zone
- `resetSelection()`: Reset selection state

**Exported Functions:**
- `getDwellTime()`: Get dwell time
- `setDwellTime(time)`: Set dwell time (200-5000ms)

### `useFullscreen()`

**Returns:**
- `enterFullscreen()`: Enter fullscreen mode
- `exitFullscreen()`: Exit fullscreen mode
- `isFullscreen`: Fullscreen state

---

## Development Guide

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Files to Modify

**Eye Tracking Sensitivity:**
- `src/hooks/useWebGazer.ts`: `NEUTRAL_ZONE_WIDTH`, `MIN_CONFIDENCE`
- `src/hooks/useDwellSelection.ts`: `DWELL_TIME_MS`

**UI Layout:**
- `src/components/eye-tracking/EyeTrackingInterface.tsx`: Desktop layout
- `src/components/eye-tracking/MobileEyeTrackingInterface.tsx`: Mobile layout

**Zone Sizes:**
- `src/components/eye-tracking/EyeTrackingInterface.tsx`: `NEUTRAL_ZONE_WIDTH_PERCENT`

### Debugging

**Console Logs:**
- Gaze coordinates: `Final: Screen coords (x, y)`
- Zone detection: `Gaze state changed: LOOKING_AT_YES`
- Selection: `🎯 SELECTION TRIGGERED: YES`
- Voice: `🎤 Attempting to speak: "YES"`

**Debug Panel:**
- Shows current gaze coordinates
- Shows current zone
- Shows selection state
- Provides controls for sensitivity, mirror toggle, voice toggle

**Keyboard Shortcuts:**
- `M` or `m`: Toggle mirror (coordinate flipping)

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

### Common Issues

**Camera Not Working:**
- Check browser permissions
- Ensure HTTPS (required for camera access)
- Check `ErrorScreen` component for error messages

**Coordinates Flipped:**
- Use mirror toggle in debug panel
- Or press `M` key

**Not Sensitive Enough:**
- Adjust `DWELL_TIME_MS` (lower = more sensitive)
- Adjust `NEUTRAL_ZONE_WIDTH` (lower = more sensitive)
- Adjust `MIN_CONFIDENCE` (lower = more sensitive)

**Top-Left Bias:**
- WebGazer may default to (0,0) when eyes not detected
- Check console logs for coordinate values
- Ensure good lighting and camera positioning

---

## Version History

- **V0.1**: Initial release
  - Basic eye tracking
  - YES/NO selection
  - Voice feedback
  - Desktop and mobile support
  - Adjustable sensitivity

---

## Contributing

When contributing:
1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Add console logs for debugging
4. Test on both desktop and mobile
5. Update this documentation if adding features

---

## License

[Add your license here]

---

**Last Updated**: January 2026
