<p align="center">
<img src="./assets/splash/splash-icon-light.png" alt="Koeyomi logo" width="200" />
</p>
<h1 align="center">Koeyomi</h1>

[![Expo SDK](https://img.shields.io/badge/Expo-55-000020?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)


KoeYomi is a mobile manga reader built with **Expo + React Native** focused on a smooth reading experience, offline chapter downloads, and local persistence with SQLite.
Current app configuration version: **1.1.2** (`app.json`).

## Features
-  Search manga titles through a backend connected to MangaDex.
-  Open manga details with title, status, author, genres, and synopsis.
-  Switch chapter language between available translations (`en`, `es-la` in current UI logic).
-  Save and remove favorites locally.
-  Download chapters for offline reading.
-  Persist reading progress per chapter.
-  Track reading history with timestamps.
-  Configure reader and data preferences (language, mode, direction, paging, quality, data saver) with local persistence.
-  Manage downloaded manga/chapter files from in-app storage management screens.
-  Reader gestures: single-tap UI toggle, pinch-to-zoom, pan, and double-tap zoom.


## Media

| Home Screen | Manga Details Screen | Search Screen |
| :---: | :---: | :---: |
|<img width=400 alt="Home Screen" src="https://github.com/user-attachments/assets/b8769b89-8ea9-47db-94e9-894a33ba22d8" />|<img width=400 alt="Manga Details Screen" src="https://github.com/user-attachments/assets/33315e03-5132-46df-9fca-cdbd89897016" />|<img width=400 alt="Search Screen before searching" src="https://github.com/user-attachments/assets/547ea2a5-76b5-47c4-89fc-28a0417884e6" />|
| *Screen to show your favorites* | *Details of the selected manga* | *Search layout* |

| Records Screen | Settings Screen | About Screen |
| :---: | :---: | :---: |
|<img width=400 alt="History Screen with records" src="https://github.com/user-attachments/assets/f76ea7fe-4ff5-49b4-ba2a-fa3ab852dd85" />|<img width=400 alt="Settings Screen index" src="https://github.com/user-attachments/assets/1348fa3e-b2da-4184-b02d-55b2318623b8" />|<img width=400 alt="Image" src="https://github.com/user-attachments/assets/7303b619-a4a6-4f5c-ab97-e08d2f983903" />|
| *Your read history in the app* | *Change settings of the app* | *App information* |

## Tech Stack
-  React 19
-  React Native 0.83
-  Expo SDK 55
-  `@expo/ui` (Jetpack Compose components for updated Android UI controls)
-  Expo Router (file-based routing)
-  Expo SQLite
-  AsyncStorage (settings persistence)
-  React Native Reanimated + Gesture Handler
-  Expo Image
-  Expo UI
-  Expo Web Browser
-  Typed `fetcher` service for API communication

## Architecture
### App bootstrap
The app is initialized in `src/app/_layout.tsx`:
- Prevents/hides splash screen at startup.
- Initializes SQLite schema through `SQLiteProvider`.
- Loads persisted app preferences through `SettingsProvider`.
- Creates tab navigation using `expo-router` `Tabs`.

### Navigation
Navigation is file-based with `expo-router`:
- Root tabs in `src/app/_layout.tsx`
- Home stack group in `src/app/(home)/_layout.tsx`
- Settings stack group in `src/app/(settings)/_layout.tsx`
- Detail and reader screens are nested under `(home)`

### Data flow
1. Screens request data through `src/services/fetcher.ts`.
2. Data is cached/persisted in SQLite (`mangas`, `chapters`, etc.).
3. UI reads local data first, then fetches updates when needed.
4. Reader updates history and progress while reading.

## Project Structure
```text
koeyomi/
├─ assets/
│  ├─ icons/
│  │  ├─ android-adaptive-icon-color.png
│  │  ├─ android-adaptive-icon.png
│  │  ├─ browser.png
│  │  ├─ check.png
│  │  └─ raw.png
│  └─ splash/
├─ src/
│  ├─ app/
│  │  ├─ (home)/
│  │  │  ├─ _layout.tsx
│  │  │  ├─ index.tsx
│  │  │  ├─ manga/
│  │  │  │  └─ [mangaId].tsx
│  │  │  └─ reader.tsx
│  │  ├─ (settings)/
│  │  │  ├─ _layout.tsx
│  │  │  ├─ index.tsx
│  │  │  ├─ preferences.tsx
│  │  │  ├─ about.tsx
│  │  │  └─ (storageManager)/
│  │  │     ├─ _layout.tsx
│  │  │     ├─ index.tsx
│  │  │     └─ manga/
│  │  │        └─ [mangaId].tsx
│  │  ├─ _layout.tsx
│  │  ├─ history.tsx
│  │  ├─ search.tsx
│  ├─ components/
│  │  ├─ home/
│  │  ├─ manga/
│  │  └─ ui/
│  ├─ context/
│  │  └─ appContext.tsx
│  ├─ services/
│  │  ├─ fetcher.ts
│  │  ├─ getTitle.ts
│  │  └─ mangaFunctions.ts
│  ├─ types/
│  │  ├─ chapters.ts
│  │  ├─ favorites.ts
│  │  ├─ mangas.ts
│  │  ├─ records.ts
│  │  └─ searchs.ts
│  ├─ constants.ts
│  └─ theme.ts
├─ app.json
├─ eas.json
├─ package.json
└─ tsconfig.json
```

## Getting Started
### Prerequisites
- Node.js (recommended LTS, `>=20`)
- npm
- Android Studio + emulator/device (recommended primary target)
- EAS CLI (optional, for cloud builds)

### Installation
```bash
npm install
```

### Run in development
```bash
npx expo start
```

## ⚙️ Environment Variables
Create `.env` or `.env.local` in the project root:

```env
EXPO_PUBLIC_KOEYOMI_BACKEND=https://your-backend-domain.com
EXPO_PUBLIC_MANGADEX_UPLOADS=https://uploads.mangadex.org
EXPO_PUBLIC_MYANIMELIST_BASE_URL=https://myanimelist.net
```

Notes:
- `EXPO_PUBLIC_KOEYOMI_BACKEND` is required for search/manga/chapter endpoints.
- `EXPO_PUBLIC_MANGADEX_UPLOADS` is used to load chapter images.
- `EXPO_PUBLIC_MYANIMELIST_BASE_URL` is used for external manga links.

## App Routes
- `/(home)` → Home (library)
- `/(home)/manga/[mangaId]` → Manga details
- `/(home)/reader?id=<chapterId>&format=<format>&title=<title>&subtitle=<subtitle>` → Reader
- `/search` → Search screen
- `/history` → Reading history
- `/(settings)` → Settings home
- `/(settings)/preferences` → Reader/data preferences
- `/(settings)/about` → App info and acknowledgements
- `/(settings)/(storageManager)` → Downloaded manga list
- `/(settings)/(storageManager)/manga/[mangaId]` → Downloaded chapter manager

## Available Scripts
```bash
npx expo start    # Start Expo dev server
npx expo run:android  # Run Android native project
```

## Local Database Schema
Initialized in `src/app/_layout.tsx`.

- `users`: local user identity.
- `mangas`: manga metadata and cover URL.
- `chapters`: chapter metadata, download status, local path, last page read.
- `favorites`: user ↔ manga relation.
- `downloads`: user ↔ chapter download records.
- `records`: user ↔ chapter reading history.

Indexes are created for common lookup and relation columns.

## Backend Contract
The app expects these backend routes:

- `GET /mangadex/search?title=<query>`
- `GET /mangadex/manga/:id`
- `GET /mangadex/manga/:id/feed?language=<lang>`
- `GET /mangadex/chapter/:id`

Expected payload behavior (high-level):
- Manga entities include `attributes`, `relationships`, and `coverImageUrl`.
- Chapter image payload includes `chapter.hash` and `chapter.dataSaver`.

## Known Limitations
-  Some UI feedback uses `ToastAndroid`, so Android is currently the primary supported platform.
-  Parts of the updated UI use `@expo/ui` Jetpack Compose components, so Android behavior is the most validated path.
-  No dedicated lint/test scripts are defined in `package.json` yet.

## Troubleshooting
- **Environment variables not loading**
  - Restart Expo with cache clear:
  ```bash
  npx expo start -c
  ```
- **Backend request errors**
  - Verify `EXPO_PUBLIC_KOEYOMI_BACKEND` and endpoint availability.
- **Images not rendering in reader**
  - Validate `EXPO_PUBLIC_MANGADEX_UPLOADS` and chapter hash/data payload.
- **Android run/build issues**
  - Confirm Android SDK setup and device detection (`adb devices`).

## Quality & Testing
Current state:
- No test runner configured.
- No lint/typecheck scripts configured.

Suggested additions:
- `npm run typecheck` with `tsc --noEmit`
- `npm run lint` with ESLint for React Native + TypeScript
- Unit tests for `fetcher` and data transformation logic

## Contributing
1. Fork the repository.
2. Create a feature branch.
3. Keep changes focused and documented.
4. Add/update tests when behavior changes.
5. Open a Pull Request with a clear summary.

### Commit Convention
Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Internal code improvements
- `docs:` Documentation updates
- `test:` Test changes
- `chore:` Tooling/maintenance

### Development Guidelines

- Follow the existing code style and conventions
- Test on both Android emulator and physical device
- Update documentation for new features
- Add TypeScript types for new code
- Keep PRs focused on a single feature/fix
- Write clear commit messages

### Code Review Process

1. All PRs require at least one approval
3. No merge conflicts
4. Code follows project conventions

## License
This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for full details.

## Acknowledgements
- [MangaDex](https://mangadex.org/) data/image flow is powered through MangaDex-compatible backend routes.
- [Expo](https://expo.dev/) - For the excellent React Native framework
- `react-native-zoom-reanimated` inspiration/derived portions are credited in `LICENSE`.

## Support

-  **Issues**: [GitHub Issues](../../issues)
-  **Discussions**: [GitHub Discussions](../../discussions)
-  **Email**: stivenpilca@gmail.com

---

<div align="center">
  Made with ❤️ by the Koeyomi creator
</div>
