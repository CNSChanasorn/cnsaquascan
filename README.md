# AquaScan

## Overview

AquaScan is a React Native Expo application for capturing, analyzing, and managing water quality or sample data in a streamlined mobile workflow. The app focuses on collecting field data, syncing it to the cloud, and presenting results in a clear, organized way. It solves the problem of fragmented data collection by providing a single mobile app for capture, review, and history tracking.

Main features:

- User authentication and profiles
- Collection workflows for new samples
- Analysis and results screens
- History tracking for past collections
- Cloud sync with Firebase services

## Installation

1. Clone the repository

   ```bash
   git clone <your-repo-url>
   cd cnsaquascan
   ```

2. Install dependencies

   ```bash
   npm install
   ```

## Dependencies

- Node.js (LTS recommended)
- npm
- Expo (no global install required when using `npx`)

## Running the App

1. Start the Expo dev server

   ```bash
   npx expo start
   ```

2. Start the Expo dev server for Expo Go

   ```bash
   npx expo start --go
   ```

When to use Expo Go:

- Use Expo Go for quick development and testing without a custom dev build.
- Install Expo Go from the App Store or Google Play.
- After running the command, scan the QR code with your device to open the app.

If you use a custom dev build, run the standard `npx expo start` and open the app from the development build on your device.

## Environment Setup

Create a `.env` file in the project root with the following variables:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

What each variable is used for:

- `EXPO_PUBLIC_FIREBASE_API_KEY`: Authenticates requests to your Firebase project.
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase Auth domain for web-based flows.
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`: Identifies your Firebase project.
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`: Cloud Storage bucket name for uploads.
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID.
- `EXPO_PUBLIC_FIREBASE_APP_ID`: Firebase app identifier.

## Android Setup

You must add a `google-services.json` file for Android builds.

- Download the file from the Firebase Console for the same project used in the `.env` file.
- Place the file in the location expected by your setup:
  - Expo managed workflow: project root
  - Bare or prebuild workflow: `android/app`
- Ensure the Firebase project matches the values in the `.env` file to avoid runtime configuration errors.
