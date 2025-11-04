# Laara

> A React Native mobile app for organizing and tracking language learning materials and progress.

[![Expo](https://img.shields.io/badge/Expo-54.x-000020?style=flat&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

## Overview

Laara is a mobile application designed to help language learners keep their study materials organized and track their learning progress. The app provides an intuitive interface for managing resources, logging study sessions, and monitoring improvement over time.

## Features

- **Material Library**: Organize language learning resources (books, apps, courses, etc.)
- **Session Logging**: Track study sessions with time and notes
- **Progress Reports**: Visualize learning progress over time
- **Multi-language Support**: Built with language selection during onboarding
- **Offline-first**: Local SQLite database for fast, offline-capable storage
- **Custom Theming**: Consistent design system with customizable colors and typography
- **Haptic Feedback**: Enhanced user experience with tactile responses

## Technology Stack

**Frontend & Framework**
- React Native 0.81
- Expo SDK 54
- TypeScript 5.9
- Expo Router (file-based routing)

**UI & Navigation**
- React Navigation (Bottom Tabs)
- Gorhom Bottom Sheet
- React Native Reanimated
- React Native Gesture Handler
- Expo Symbols & Vector Icons

**Data & State**
- Expo SQLite (local database)
- Custom database migrations
- SQL queries for material and session management

**Utilities**
- date-fns (date formatting)
- Expo Haptics
- Expo Linking

## Project Structure

```
laara-app/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Bottom tab screens
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── library.tsx      # Material library
│   │   ├── reports.tsx      # Progress reports
│   │   └── settings.tsx     # App settings
│   ├── add-material/        # Add material flow
│   ├── log-session/         # Log session flow
│   ├── onboarding/          # First-time user experience
│   ├── language-selection.tsx
│   └── index.tsx            # Welcome screen
├── src/
│   ├── components/          # Reusable UI components
│   ├── database/            # SQLite database logic
│   │   ├── database.js      # DB initialization
│   │   ├── queries.js       # SQL queries
│   │   ├── migrations.js    # DB migrations
│   │   └── languageData.js  # Language options
│   ├── theme/               # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── styles.ts
│   ├── types/               # TypeScript types
│   └── utils/               # Helper functions
└── assets/                  # Images, fonts, etc.
```

## Running Locally

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app (for physical device testing)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   ```bash
   # iOS (Mac only)
   npm run ios

   # Android
   npm run android

   # Web (experimental)
   npm run web
   ```

4. **Using Expo Go:**
   - Scan the QR code with your device
   - Opens in Expo Go app for live testing

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Database

The app uses SQLite for local storage with:
- Automatic migrations on app start
- Structured queries for CRUD operations
- Offline-first architecture

### Theming

Consistent design system located in `src/theme/`:
- Global colors, typography, spacing constants
- Reusable style definitions
- Easy customization

## Build for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## License

Private project
