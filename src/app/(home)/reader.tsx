import Carousel from '@/components/Carousel/Carousel';
import HeaderBackButton from '@/components/HeaderBackButton/HeaderBackButton';
import Toast from '@/components/Toast/Toast';
import { MAX_HEIGHT, MAX_WIDTH } from '@/Constants';
import { fetcher } from '@/services/fetcher';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, ToastAndroid } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function MangaReaderScreen() {

    const { id, format, title, chapter, chapterTitle } = useLocalSearchParams();
    const [imagesUrl, setImagesUrl] = useState<string[]>();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [hasStoredData, setHasStoredData] = useState<boolean>(false);
    const [hash, setHash] = useState<string>('');
    const [downloadDirectory, setDownloadDirectory] = useState<string>('');

    const db = useSQLiteContext();

    const router = useRouter();

    const headerStyle = useAnimatedStyle(() => {
        return {
            opacity: isMenuVisible
                ? withTiming(1, { duration: 200 })
                : withTiming(0, { duration: 200 })
        }
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
            const savedImages = await db.getFirstAsync(
                'SELECT file_path FROM chapters WHERE id = ?',
                [id]
            );


            if (savedImages.file_path) {
                setDownloadDirectory(savedImages.file_path)
                const directoryInfo = await FileSystem.getInfoAsync(savedImages.file_path);
                if (directoryInfo.exists) {
                    const directoryContent = await FileSystem.readDirectoryAsync(savedImages.file_path);
                    setHasStoredData(true);
                    orderSavedImages(directoryContent);
                    setHash('nohash');
                    setImagesUrl(directoryContent);
                }
            } else {
                const images = await fetcher(process.env.EXPO_PUBLIC_KOEYOMI_BACKEND, `/mangadex/chapter/${id}`) as object;
                setImagesUrl(images.chapter.dataSaver);
                setHash(images.chapter.hash);
            }

        } catch (error) {
            Toast({ message: `Error while getting savedImages: ${error}`, duration: ToastAndroid.SHORT });
            router.back();
            console.log(error);
        }
    };

    async function saveTimestamp() {
        try {
            const record = await db.getFirstAsync(
                'SELECT * FROM records WHERE chapter_id = ?',
                [id]
            );

            if (record) {
                await db.runAsync(
                    'UPDATE records SET timestamp = ? WHERE chapter_id = ?',
                    [
                        `${Date.now()}`,
                        id
                    ]
                );
            } else {
                await db.runAsync(
                    'INSERT INTO records (user_id, chapter_id, timestamp) VALUES (?, ?, ?)',
                    [
                        'Redmi-2015-2201117TL-13',
                        id,
                        `${Date.now()}`
                    ]
                );
            }
        } catch (error) {
            Toast({ message: `Error while saving date: ${error}`, duration: ToastAndroid.SHORT });
        }
    }

    useEffect(() => {
        const getImagesUrl = async () => {
            try {
                await Promise.all([
                    saveTimestamp(),
                    getSavedImages()
                ])
            } catch (error) {
                Toast({ message: `Error while loading images: ${error}`, duration: ToastAndroid.SHORT })
            }
        }

        getImagesUrl();
    }, [])

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, position: 'relative' }}>
                <Animated.View style={[styles.header, headerStyle]}>
                    <HeaderBackButton
                        hasFilter={false}
                        hasDownloadOption={false}
                        title={title}
                        subtitle={`${chapter} ${chapterTitle ? chapterTitle: ''}`}
                        hidden={true} />
                </Animated.View>

                {imagesUrl &&
                    <Carousel
                        id={id}
                        images={imagesUrl}
                        hash={hash}
                        format={format}
                        onSingleTap={() => setIsMenuVisible(!isMenuVisible)}
                        menuVisible={isMenuVisible}
                        storedData={hasStoredData}
                        downloadDirectory={downloadDirectory}
                    />
                }

            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',

        zIndex: 1000,
    },
    imageWraper: {
        flex: 1,
        minWidth: MAX_WIDTH,
        minHeight: MAX_HEIGHT,

        alignItems: 'center',
        justifyContent: 'center',
    }
})