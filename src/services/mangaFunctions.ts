import { Manga } from '@/types/mangas';
import { Directory, File, Paths } from 'expo-file-system';
import { SQLiteDatabase } from 'expo-sqlite';

const backend = process.env.EXPO_PUBLIC_KOEYOMI_BACKEND;

export const handleCoverDownload = async (manga: Manga | undefined, db: SQLiteDatabase) => {
    try {
        if (!backend) throw new Error('Backend URL not defined');
        if (!manga) throw new Error('Saving manga cover');

        const parentDirectory = new Directory(Paths.document.uri, 'cover');
        const mangaDirectory = new Directory(Paths.document.uri, 'cover', manga.id);

        if (!parentDirectory.exists) {
            parentDirectory.create();
        }

        if (!mangaDirectory.exists) {
            mangaDirectory.create();
        }

        const result = await File.downloadFileAsync(`${manga.coverImageUrl}`, mangaDirectory);
        await db.runAsync('UPDATE mangas SET coverImageUrl = ? WHERE id = ?', [result.uri, manga.id]);
    } catch (error) {
        throw error;
    }
};

export const handleCoverDelete = async (mangaId: string, db: SQLiteDatabase) => {
    try {
        new Directory(Paths.document, 'cover', mangaId).delete();
        await db.runAsync('UPDATE mangas SET coverImageUrl = ? WHERE id = ?', ['', mangaId]);
    } catch (error) {
        throw error;
    }
};

export const getFileName = (urlOrPath: string | undefined) => {
    if (!urlOrPath) return;
    return urlOrPath.split('/').pop();
};
