# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Platform-specific development
npx expo start --ios
npx expo start --android
npx expo start --web

# Linting
npx expo lint

# Type checking
npx tsc --noEmit

# Reset project
npm run reset-project
```

## Architecture Overview

**Somnio** is a meditation and sleep app built with React Native and Expo. The app provides audio content for sleep, relaxation, and focus with offline download capabilities and multi-language support.

### Core Architecture Components

**Audio System (`contexts/AudioContext.tsx` + `services/AudioAssetManager.ts`)**
- Global audio state management using React Context
- Singleton AudioAssetManager handles file downloads and local storage using expo-file-system
- Automatic background downloading: streams while downloading for offline use
- Sleep timer integration with audio pause functionality
- Background audio playback support (configured in app.json with UIBackgroundModes)

**Content Management (`services/contentService.ts` + `assets/data/content.json`)**
- Centralized content configuration in JSON format
- Content organized by categories: sleep, relax, focus
- Each item has id, title, duration, audioUrl, thumbnail, and color theming
- Multi-language content support via API endpoints

**Theme System (`contexts/ThemeContext.tsx` + `services/colorSettingsService.ts`)**
- Global theme management through ThemeContext
- Preset themes defined in colorSettingsService
- Dynamic gradient backgrounds and UI element theming
- Persistent theme storage in AsyncStorage

**Internationalization (`utils/i18n.ts`)**
- Multi-language support for UI (English, Spanish, Chinese, Japanese)
- Separate audio language selection for content filtering
- Translation system using key-based lookups
- Language persistence in AsyncStorage

### Onboarding Flow

```
app/(boarding)/
├── index.tsx             # Welcome screen
├── breathing-intro.tsx   # Breathing exercise introduction
├── language-settings.tsx # Language selection (UI + Audio)
├── color-settings.tsx    # Theme selection
├── premium-purchase.tsx  # Premium upgrade option
└── ready.tsx            # Final onboarding screen
```

**Key Onboarding Features:**
- Carousel components for language and theme selection
- Animated transitions using react-native-reanimated
- Settings saved to AsyncStorage with keys matching profile.tsx
- GestureHandlerRootView required in _layout.tsx for gestures

### Settings Storage Keys

```javascript
// Language settings (profile.tsx compatible)
'ui_language'        // Selected UI language code
'audio_languages'    // JSON array of audio language codes

// Theme settings (via ThemeContext)
'color_settings'     // Color theme configuration

// Service-specific keys (for backward compatibility)
'language_settings'  // Legacy language settings object
```

### File-Based Routing Structure

```
app/
├── (boarding)/       # Onboarding flow screens
├── (tabs)/          # Main tab navigation
│   ├── index.tsx    # Home screen
│   ├── sleep.tsx    # Sleep content
│   ├── relax.tsx    # Relaxation content  
│   ├── focus.tsx    # Focus content
│   └── profile.tsx  # User profile & settings
├── _layout.tsx      # Root layout with providers
└── [feature].tsx    # Standalone feature screens
```

### Audio Download Flow

- `getAudioPathWithAutoDownload()`: Returns local path if downloaded, otherwise streams while downloading in background
- `downloadAudio()`: Explicit download for offline use
- Download state persisted in AsyncStorage with file tracking
- UI shows download status: ↓ (not downloaded), ⏳ (downloading), ✅ (downloaded)

### Sleep Timer Implementation

- `useSleepTimer.ts`: Global timer state with subscriber pattern
- Timer countdown independent of audio context to prevent interference
- Automatic audio pause when timer expires (via `pauseAudio()` not `stopAndUnloadAudio()`)
- Timer state displayed in both PlayerModal and MiniPlayer

### Background Audio Configuration

iOS background audio requires:
- `app.json`: `"UIBackgroundModes": ["audio"]`
- `expo-av` audio mode: `staysActiveInBackground: true, playsInSilentModeIOS: true`

### Content Data Structure

Each audio item requires:
```typescript
{
  id: string,           // Unique identifier for downloads
  title: string,
  duration: string,     // Display duration (e.g., "30 min")
  audioUrl: string,     // Remote audio file URL
  color: string,        // Hex color for gradients
  icon: string,         // MaterialIcons name
  thumbnail?: string,   // Optional image URL
  description?: string
}
```

### Critical Dependencies

- `expo-av`: Audio playback (expo-audio is deprecated in SDK 54)
- `react-native-gesture-handler`: Required for swipe gestures and sliders
- `react-native-reanimated`: Animation library for UI transitions
- `expo-file-system`: Local file management for offline audio
- `@react-native-async-storage/async-storage`: Persistent storage

### Development Notes

- Audio files are cached in `${FileSystem.documentDirectory}audio/`
- Download metadata stored in AsyncStorage under key 'downloaded_audio_assets'
- Background downloads use `FileSystem.createDownloadResumable()` with progress callbacks
- All audio URLs in content.json currently point to the same test file for development
- Environment variables in .env.development control API endpoints and feature flags