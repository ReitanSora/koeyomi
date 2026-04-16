# 📚 KoeYomi
KoeYomi is a mobile manga reader built with **Expo + React Native** that focuses on smooth reading, offline chapter downloads, and local persistence with SQLite.

## 🧭 Table of Contents
- [✨ Features](#-features)
- [🧱 Tech Stack](#-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [📜 Available Scripts](#-available-scripts)
- [📦 Build & Release (EAS)](#-build--release-eas)
- [🗄️ Local Database Schema](#️-local-database-schema)
- [🌐 Backend Contract](#-backend-contract)
- [⚠️ Known Limitations](#️-known-limitations)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [🧪 Quality & Testing](#-quality--testing)
- [🤝 Contributing](#-contributing)
- [🪪 License](#-license)
- [🙏 Acknowledgements](#-acknowledgements)

## ✨ Features
- 🔎 Search manga titles through a backend connected to MangaDex.
- 📖 Open manga details with title, status, author, genres, and synopsis.
- 🌍 Switch chapter language between available translations (currently `en` and `es-la` in UI logic).
- ❤️ Save/remove favorites locally.
- 📥 Download chapters for offline reading.
- 🧠 Persist reading progress (`last_page_read`) per chapter.
- 🕘 Track reading history with timestamps.
- 🔍 Reader gestures: single tap UI toggle, pinch-to-zoom, pan, and double-tap zoom.
- 🎞️ Supports two reading modes based on manga format:
  - `Normal`: horizontal, right-to-left navigation.
  - `Long Strip`: vertical scrolling.

## 🧱 Tech Stack
- ⚛️ React 19
- 📱 React Native 0.83
- 🚀 Expo SDK 55
- 🧭 React Navigation (Bottom Tabs + Native Stack)
- 🗃️ Expo SQLite
- 🎬 Reanimated + Gesture Handler
- 🖼️ Expo Image
- 🛜 Custom typed `fetcher` service for API requests

## 🏗️ Architecture
### App bootstrap
- `App.tsx` initializes:
  - global UI shell + status bar
  - `SQLiteProvider` with `useSuspense`
  - DB schema creation on startup (`users`, `mangas`, `chapters`, `favorites`, `downloads`, `records`)

### Navigation
- `routes/Navigation.tsx` defines:
  - Bottom tabs: `Home`, `Search`, `History`, `Settings`
  - Nested stacks for details and reader flows

### Data flow
1. UI calls `fetcher` with backend endpoints.
2. Data is cached/persisted in SQLite.
3. Screens read from SQLite first, then fetch/refresh when needed.
4. Reader updates progress/history on chapter open and page changes.

## 📁 Project Structure
```text
koeyomi/
├─ App.tsx
├─ index.ts
├─ app.json
├─ eas.json
├─ package.json
├─ assets/
│  ├─ icons/
│  └─ splash/
├─ components/
│  ├─ Accordion/
│  ├─ Carousel/
│  ├─ ChapterItem/
│  ├─ Flags/
│  ├─ Header/
│  ├─ HeaderBackButton/
│  ├─ Toast/
│  └─ Zoom/
├─ constants/
├─ interfaces/
├─ routes/
├─ screens/
│  ├─ HomeScreen/
│  ├─ SearchScreen/
│  ├─ MangaDetailsScreen/
│  ├─ MangaReaderScreen/
│  ├─ HistoryScreen/
│  └─ SettingsScreen/
├─ services/
└─ theme/
```

## 🚀 Getting Started
### Prerequisites
- Node.js (recommended LTS, `>=20`)
- npm
- Expo CLI (via `npx`)
- Android Studio + emulator/device (recommended primary target)
- EAS CLI (optional, for cloud builds)

### Installation
```bash
npm install
```

## ⚙️ Environment Variables
Create a `.env` file in the project root:

```env
EXPO_PUBLIC_KOEYOMI_BACKEND=https://your-backend-domain.com
EXPO_PUBLIC_MANGADEX_UPLOADS=https://uploads.mangadex.org
EXPO_PUBLIC_MYANIMELIST_BASE_URL=https://myanimelist.net
```

Notes:
- `EXPO_PUBLIC_KOEYOMI_BACKEND` must expose the endpoints documented below.
- `EXPO_PUBLIC_MANGADEX_UPLOADS` is used for chapter image URLs.
- `EXPO_PUBLIC_MYANIMELIST_BASE_URL` is used to open external manga references.

## 📜 Available Scripts
```bash
npm run start    # Expo dev server
npm run android  # Native Android run
npm run ios      # Native iOS run
npm run web      # Web preview
```

## 📦 Build & Release (EAS)
This project includes `development`, `preview`, and `production` profiles in `eas.json`.

```bash
npx eas login
npx eas build --platform android --profile development
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

## 🗄️ Local Database Schema
Initialized in `App.tsx`:

- `users`: local user identity.
- `mangas`: manga metadata + relationships + cover URL.
- `chapters`: chapter metadata, download status, local path, last page read.
- `favorites`: user ↔ manga relation.
- `downloads`: user ↔ chapter download records.
- `records`: user ↔ chapter reading history.

Indexes are created for manga/chapter lookup and relation tables.

## 🌐 Backend Contract
The app expects these backend routes:

- `GET /mangadex/search?title=<query>`
- `GET /mangadex/manga/:id`
- `GET /mangadex/manga/:id/feed?language=<lang>`
- `GET /mangadex/chapter/:id`

Expected response behavior (high-level):
- Manga objects include `attributes`, `relationships`, and `coverImageUrl`.
- Chapter image response includes `chapter.hash` and `chapter.dataSaver`.

## ⚠️ Known Limitations
- 📱 Some UI feedback uses `ToastAndroid`, so Android is currently the primary supported platform.
- 👤 User identity handling is partially hardcoded in some queries and should be normalized.
- ⚙️ `SettingsScreen` is currently a placeholder.
- 🧪 No dedicated lint/test scripts are defined in `package.json` yet.

## 🛠️ Troubleshooting
- **Environment vars not loaded**
  - Restart Expo with cache clear:
  ```bash
  npx expo start -c
  ```
- **Backend request failures**
  - Verify `EXPO_PUBLIC_KOEYOMI_BACKEND` and endpoint availability.
- **Android build/device issues**
  - Ensure SDK/device setup is correct and `adb` can detect your device.
- **Chapter images fail to render**
  - Check `EXPO_PUBLIC_MANGADEX_UPLOADS` value and backend chapter hash/dataSaver responses.

## 🧪 Quality & Testing
Current state:
- No test runner configured.
- No lint/typecheck scripts configured.

Recommended next additions:
- `npm run typecheck` with `tsc --noEmit`
- `npm run lint` (ESLint + React Native/TypeScript rules)
- Unit tests for `fetcher` and screen-level logic

## 🤝 Contributing
1. Fork the repository.
2. Create a feature branch.
3. Keep changes focused and documented.
4. Add/update tests when introducing behavior changes.
5. Open a Pull Request with a clear summary.

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

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
