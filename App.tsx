import { StatusBar } from 'expo-status-bar';
import Navigation from './routes/Navigation';
import { ActivityIndicator, View } from 'react-native';
import { Theme } from './theme/Theme';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { Suspense } from 'react';

export default function App() {
  return (
    <>
      <StatusBar animated backgroundColor={Theme.colors.charcoalBlack} />
      <View style={{ flex: 1, backgroundColor: Theme.colors.charcoalBlack }}>
        <Suspense
          fallback={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size={'large'} color={Theme.colors.vermillion} />
            </View>
          }>
          <SQLiteProvider
            databaseName='koeyomi.db'
            onInit={initDatabase}
            useSuspense={true}>
            <Navigation />
          </SQLiteProvider>
        </Suspense>
      </View>
    </>
  );
}

async function initDatabase(db: SQLiteDatabase) {
  db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT,
        email TEXT
      );
      CREATE TABLE IF NOT EXISTS mangas(
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        attributes TEXT NOT NULL,
        relationships TEXT NOT NULL,
        coverImageUrl TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS chapters(
        id TEXT PRIMARY KEY,
        manga_id TEXT REFERENCES mangas(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        attributes TEXT NOT NULL,
        relationships TEXT NOT NULL,
        download_status TEXT CHECK (download_status IN ('not_downloaded', 'downloaded')) DEFAULT 'not_downloaded',
        file_path TEXT
      );
      CREATE TABLE IF NOT EXISTS favorites(
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        manga_id TEXT REFERENCES mangas(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, manga_id)
      );
      CREATE TABLE IF NOT EXISTS downloads(
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        chapter_id TEXT REFERENCES chapters(id) ON DELETE CASCADE,
        timestamp TEXT NOT NULL,
        PRIMARY KEY (user_id, chapter_id)
      );
      CREATE TABLE IF NOT EXISTS records(
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        chapter_id TEXT REFERENCES chapters(id) ON DELETE CASCADE,
        timestamp TEXT NOT NULL,
        PRIMARY KEY (user_id, chapter_id)
      );
  
      CREATE INDEX IF NOT EXISTS idx_chapters_manga_id ON chapters(manga_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_manga_id ON favorites(manga_id);
      CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
      CREATE INDEX IF NOT EXISTS idx_downloads_chapter_id ON downloads(chapter_id);
      CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
      CREATE INDEX IF NOT EXISTS idx_records_chapter_id ON records(chapter_id);
      `
    );

    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE id = ?',
      `${Device.brand}-${Device.deviceYearClass}-${Constants.deviceName}-${Constants.systemVersion}`
    );

    if (!user) {
      await db.runAsync(
        'INSERT INTO users (id) VALUES (?)',
        `${Device.brand}-${Device.deviceYearClass}-${Constants.deviceName}-${Constants.systemVersion}`
      );
    }
  })
}