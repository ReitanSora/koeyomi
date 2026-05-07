import Carousel from '@/components/manga/Carousel';
import { StaticHeader } from '@/components/ui/Header';
import Toast from '@/components/ui/Toast';
import { deviceId, MAX_HEIGHT, MAX_WIDTH, statusBarHeight } from '@/constants';
import { useSettings } from '@/context/appContext';
import { fetcher } from '@/services/fetcher';
import { ChapterImages, Chapters } from '@/types/chapters';
import { Directory } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function MangaReaderScreen() {
    const { id, title, chapter, chapterTitle } = useLocalSearchParams<{ id: string; title: string; chapter: string; chapterTitle: string }>();
    const [imagesUrl, setImagesUrl] = useState<string[]>();
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
    const [hasStoredData, setHasStoredData] = useState<boolean>(false);
    const [hash, setHash] = useState<string>('');
    const [downloadDirectory, setDownloadDirectory] = useState<string>('');
    const subtitle = chapter + (chapterTitle ? ` - ${chapterTitle}` : '');
    const backend = process.env.EXPO_PUBLIC_KOEYOMI_BACKEND;
    const db = useSQLiteContext();
    const router = useRouter();
    const { imageQuality } = useSettings();

    const headerStyle = useAnimatedStyle(() => {
        return {
            opacity: isMenuVisible ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 }),
        };
    });

    const orderSavedImages = (array: string[]) => {
        array.sort((a, b) => {
            const numberA = parseInt(a.split('-')[0]);
            const numberB = parseInt(b.split('-')[0]);

            return numberA - numberB;
        });

        return array;
    };

    async function getSavedImages() {
        try {
            const savedImages = (await db.getFirstAsync('SELECT file_path FROM chapters WHERE id = ?', id)) as Chapters;

            if (savedImages.file_path) {
                setDownloadDirectory(savedImages.file_path);
                const directoryInfo = new Directory(savedImages.file_path);
                if (directoryInfo.exists) {
                    setHasStoredData(true);
                    setHash('nohash');
                    setImagesUrl(directoryInfo.info().files);
                }
            } else {
                if (!backend) throw new Error('Backend URL not defined');

                const images = (await fetcher(backend, `/mangadex/chapter/${id}`)) as ChapterImages;
                setImagesUrl(imageQuality === 'high' ? images.chapter.data : images.chapter.dataSaver);
                setHash(images.chapter.hash);
            }
        } catch (error) {
            Toast({ message: 'No saved images' });
            router.back();
            // console.log(error);
        }
    }

    async function saveTimestamp() {
        try {
            const record = await db.getFirstAsync('SELECT * FROM records WHERE chapter_id = ?', [id]);

            if (record) {
                await db.runAsync('UPDATE records SET timestamp = ? WHERE chapter_id = ?', [`${Date.now()}`, id]);
            } else {
                await db.runAsync('INSERT INTO records (user_id, chapter_id, timestamp) VALUES (?, ?, ?)', [deviceId, id, `${Date.now()}`]);
            }
        } catch (error) {
            Toast({ message: `Error saving date: ${error}` });
        }
    }

    useEffect(() => {
        const getImagesUrl = async () => {
            try {
                await Promise.all([saveTimestamp(), getSavedImages()]);
            } catch (error) {
                Toast({ message: `Error loading images: ${error}` });
            }
        };

        getImagesUrl();
    }, []);

    return (
        <>
            <StatusBar hidden={!isMenuVisible} />
            <Animated.View style={[headerStyle, { position: 'absolute', width: '100%', height: statusBarHeight, backgroundColor: 'rgba(54, 54, 54, 0.8)', zIndex: 1 }]} />
            <View style={{ flex: 1 }}>
                <Animated.View style={[styles.header, headerStyle, { top: statusBarHeight }]}>
                    <StaticHeader
                        hasFilter={false}
                        onLeftActionPress={() => router.back()}
                        title={title}
                        subtitle={subtitle}
                        containerStyle={{ position: 'absolute', backgroundColor: 'rgba(54, 54, 54, 0.8)', zIndex: 1 }}
                    />
                </Animated.View>

                {imagesUrl && (
                    <Carousel
                        id={id}
                        images={orderSavedImages(imagesUrl)}
                        hash={hash}
                        onSingleTap={() => setIsMenuVisible(!isMenuVisible)}
                        menuVisible={isMenuVisible}
                        storedData={hasStoredData}
                        downloadDirectory={downloadDirectory}
                    />
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        width: '100%',

        zIndex: 1,
    },
    imageWraper: {
        flex: 1,
        minWidth: MAX_WIDTH,
        minHeight: MAX_HEIGHT,

        alignItems: 'center',
        justifyContent: 'center',
    },
});
