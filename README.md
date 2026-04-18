# 📚 KoeYomi
KoeYomi is a mobile manga reader built with **Expo + React Native** focused on a smooth reading experience, offline chapter downloads, and local persistence with SQLite.

## 🧭 Table of Contents
- [✨ Features](#-features)
- [🧱 Tech Stack](#-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [🗂️ Project Structure](#️-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🛣️ App Routes](#️-app-routes)
- [📜 Available Scripts](#-available-scripts)
- [🗄️ Local Database Schema](#️-local-database-schema)
- [🌐 Backend Contract](#-backend-contract)
- [📦 Build & Release (EAS)](#-build--release-eas)
- [⚠️ Known Limitations](#️-known-limitations)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [🧪 Quality & Testing](#-quality--testing)
- [🤝 Contributing](#-contributing)
- [🪪 License](#-license)
- [🙏 Acknowledgements](#-acknowledgements)

## ✨ Features
- 🔎 Search manga titles through a backend connected to MangaDex.
- 📖 Open manga details with title, status, author, genres, and synopsis.
- 🌍 Switch chapter language between available translations (`en`, `es-la` in current UI logic).
- ❤️ Save and remove favorites locally.
- 📥 Download chapters for offline reading.
- 🧠 Persist reading progress per chapter (`last_page_read`).
- 🕘 Track reading history with timestamps.
- 🔍 Reader gestures: single-tap UI toggle, pinch-to-zoom, pan, and double-tap zoom.
- 🎞️ Two reading modes:
  - `Normal`: horizontal, right-to-left navigation.
  - `Long Strip`: vertical scrolling.

## 🧱 Tech Stack
- ⚛️ React 19
- 📱 React Native 0.83
- 🚀 Expo SDK 55
- 🧭 Expo Router (file-based routing)
- 🗃️ Expo SQLite
- 🎬 React Native Reanimated + Gesture Handler
- 🖼️ Expo Image
- 🛜 Typed `fetcher` service for API communication

## 🏗️ Architecture
### App bootstrap
The app is initialized in `src/app/_layout.tsx`:
- Prevents/hides splash screen at startup.
- Initializes SQLite schema through `SQLiteProvider`.
- Creates tab navigation using `expo-router` `Tabs`.

### Navigation
Navigation is file-based with `expo-router`:
- Root tabs in `src/app/_layout.tsx`
- Home stack group in `src/app/(home)/_layout.tsx`
- Detail and reader screens are nested under `(home)`

### Data flow
1. Screens request data through `src/services/fetcher.ts`.
2. Data is cached/persisted in SQLite (`mangas`, `chapters`, etc.).
3. UI reads local data first, then fetches updates when needed.
4. Reader updates history and progress while reading.

## 🗂️ Project Structure
```text
koeyomi/
├─ assets/
│  ├─ icons/
│  └─ splash/
├─ src/
│  ├─ app/
│  │  ├─ (home)/
│  │  │  ├─ _layout.tsx
│  │  │  ├─ index.tsx
│  │  │  ├─ manga.tsx
│  │  │  └─ reader.tsx
│  │  ├─ _layout.tsx
│  │  ├─ history.tsx
│  │  ├─ search.tsx
│  │  └─ settings.tsx
│  ├─ components/
│  │  ├─ Accordion/
│  │  ├─ Carousel/
│  │  ├─ ChapterItem/
│  │  ├─ Flags/
│  │  ├─ Header/
│  │  ├─ HeaderBackButton/
│  │  ├─ Toast/
│  │  └─ Zoom/
│  ├─ services/
│  │  └─ fetcher.ts
│  ├─ types/
│  │  └─ Chapter.ts
│  ├─ Constants.ts
│  └─ Theme.ts
├─ app.json
├─ eas.json
├─ package.json
└─ tsconfig.json
```

## 🚀 Getting Started
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
npm run start
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

## 🛣️ App Routes
- `/(home)` → Home (library)
- `/(home)/manga?id=<mangaId>` → Manga details
- `/(home)/reader?id=<chapterId>&format=<format>&title=<title>&subtitle=<subtitle>` → Reader
- `/search` → Search screen
- `/history` → Reading history
- `/settings` → Settings (currently placeholder)

## 📜 Available Scripts
```bash
npm run start    # Start Expo dev server
npm run android  # Run Android native project
npm run ios      # Run iOS native project
npm run web      # Run web build in dev mode
```

## 🗄️ Local Database Schema
Initialized in `src/app/_layout.tsx`.

- `users`: local user identity.
- `mangas`: manga metadata and cover URL.
- `chapters`: chapter metadata, download status, local path, last page read.
- `favorites`: user ↔ manga relation.
- `downloads`: user ↔ chapter download records.
- `records`: user ↔ chapter reading history.

Indexes are created for common lookup and relation columns.

## 🌐 Backend Contract
The app expects these backend routes:

- `GET /mangadex/search?title=<query>`
- `GET /mangadex/manga/:id`
- `GET /mangadex/manga/:id/feed?language=<lang>`
- `GET /mangadex/chapter/:id`

Expected payload behavior (high-level):
- Manga entities include `attributes`, `relationships`, and `coverImageUrl`.
- Chapter image payload includes `chapter.hash` and `chapter.dataSaver`.

## 📦 Build & Release (EAS)
The project defines `development`, `preview`, and `production` profiles in `eas.json`.

```bash
npx eas login
npx eas build --platform android --profile development
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

## ⚠️ Known Limitations
- 📱 Some UI feedback uses `ToastAndroid`, so Android is currently the primary supported platform.
- 👤 User identity handling is partially hardcoded in some queries and should be normalized.
- ⚙️ `SettingsScreen` is currently a placeholder.
- 🧪 No dedicated lint/test scripts are defined in `package.json` yet.

## 🛠️ Troubleshooting
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

## 🧪 Quality & Testing
Current state:
- No test runner configured.
- No lint/typecheck scripts configured.

Suggested additions:
- `npm run typecheck` with `tsc --noEmit`
- `npm run lint` with ESLint for React Native + TypeScript
- Unit tests for `fetcher` and data transformation logic

## 🤝 Contributing
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
- Run `npm run lint` before committing
- Test on both Android emulator and physical device
- Update documentation for new features
- Add TypeScript types for new code
- Keep PRs focused on a single feature/fix
- Write clear commit messages

### Code Review Process

1. All PRs require at least one approval
2. CI checks must pass
3. No merge conflicts
4. Code follows project conventions

## 🪪 License
This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for full details.

## 🙏 Acknowledgements
- [MangaDex](https://mangadex.org/) data/image flow is powered through MangaDex-compatible backend routes.
- [Expo](https://expo.dev/) - For the excellent React Native framework
- `react-native-zoom-reanimated` inspiration/derived portions are credited in `LICENSE`.

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)
- 📧 **Email**: stivenpilca@gmail.com

---

<div align="center">
  Made with ❤️ by the Koeyomi creator
</div>
