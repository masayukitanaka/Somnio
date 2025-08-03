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
```

## Architecture Overview

**Somnio** is a meditation and sleep app built with React Native and Expo. The app provides audio content for sleep, relaxation, and focus with offline download capabilities.

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

**Audio Download Flow**
- `getAudioPathWithAutoDownload()`: Returns local path if downloaded, otherwise streams while downloading in background
- `downloadAudio()`: Explicit download for offline use
- Download state persisted in AsyncStorage with file tracking
- UI shows download status: ↓ (not downloaded), ⏳ (downloading), ✅ (downloaded)

### Key UI Components

**PlayerModal** - Full-screen audio player with:
- Progress bar with seek functionality
- Volume controls and sleep timer
- Background blur effects and gradient theming

**MiniPlayer** - Persistent bottom player showing:
- Current track info and playback controls
- Sleep timer countdown when active
- Clickable to reopen full player

**Content Cards** - Main content display with:
- Background images and color gradients
- Integrated download buttons (left corner)
- Real-time download status indication

### File-Based Routing Structure

```
app/
├── (tabs)/           # Main tab navigation
│   ├── index.tsx     # Home screen
│   ├── sleep.tsx     # Sleep content
│   ├── relax.tsx     # Relaxation content
│   ├── focus.tsx     # Focus content
│   └── profile.tsx   # User profile
├── _layout.tsx       # Root layout with AudioProvider
└── [standalone].tsx  # Additional screens
```

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

### Development Notes

- Use `expo-av` for audio playback (expo-audio is deprecated in SDK 54)
- All audio URLs in content.json currently point to the same test file for development
- Audio files are cached in `${FileSystem.documentDirectory}audio/`
- Download metadata stored in AsyncStorage under key 'downloaded_audio_assets'
- Background downloads use `FileSystem.createDownloadResumable()` with progress callbacks