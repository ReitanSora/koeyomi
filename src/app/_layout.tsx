import { Theme } from '@/Theme';
import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Tabs, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import React, { Suspense, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

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
        file_path TEXT,
        last_page_read TEXT DEFAULT '-1'
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

        const deviceId = [
            Device.brand,
            Device.deviceYearClass,
            Constants.deviceName
        ].filter(Boolean).join('-') || 'unknown-device';

        const user = await db.getFirstAsync(
            'SELECT * FROM users WHERE id = ?',
            `${deviceId}-${Constants.systemVersion}`
        );

        if (!user) {
            await db.runAsync(
                'INSERT INTO users (id) VALUES (?)',
                `${deviceId}-${Constants.systemVersion}`
            );
        }
    })
}

function RootTabs() {
    const segment = useSegments();
    const page = segment[segment.length - 1]
    const pagesToHideTabBar = ['manga', 'reader']

    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: Theme.colors.charcoalBlack
        }
    };

    return (
        <ThemeProvider value={MyTheme}>
            <Tabs
                screenOptions={{
                    tabBarStyle: {
                        display: pagesToHideTabBar.includes(page) ? 'none' : 'flex',
                        height: 70,
                        backgroundColor: Theme.colors.gunmetalGray,
                        borderTopWidth: 0,
                        elevation: 0,
                    },
                    tabBarItemStyle: {
                        height: '100%',
                        margin: 0,
                        padding: 0,
                    },
                    tabBarIconStyle: {
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    tabBarActiveTintColor: Theme.colors.vermillion,
                    tabBarHideOnKeyboard: true,
                    tabBarShowLabel: false,
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name='(home)'
                    options={{
                        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />,
                        tabBarLabel: 'Home',

                    }}
                />
                <Tabs.Screen
                    name='search'
                    options={{
                        tabBarIcon: ({ color }) => <Ionicons size={24} name="search" color={color} />,
                        tabBarLabel: 'Search'
                    }}
                />
                <Tabs.Screen
                    name='history'
                    options={{
                        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />,
                        tabBarLabel: 'History'
                    }}
                />
                <Tabs.Screen
                    name='settings'
                    options={{
                        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />,
                        tabBarLabel: 'Settings'
                    }}
                />
            </Tabs>
        </ThemeProvider>
    )
}

export default function RootLayout() {

    const loaded = true;

    useEffect(() => {
        if (loaded) {
            SplashScreen.hide();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
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
                <RootTabs />
            </SQLiteProvider>
        </Suspense>
    )
}