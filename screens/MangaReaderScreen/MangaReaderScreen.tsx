import HeaderBackButton from '../../components/HeaderBackButton/HeaderBackButton';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { fetcher } from '../../services/fetcher';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { styles } from './MangaReaderScreen.styles';
import Carousel from '../../components/Carousel/Carousel';
import Toast from '../../components/Toast/Toast';
import { useSQLiteContext } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { ToastAndroid } from 'react-native';

export default function MangaReaderScreen({ route }: any) {

    const { id, format, title, subtitle } = route.params;
    const [imagesUrl, setImagesUrl] = useState<string[]>();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [hasStoredData, setHasStoredData] = useState<boolean>(false);
    const [hash, setHash] = useState<string>('');
    const [downloadDirectory, setDownloadDirectory] = useState<string>('');

    const db = useSQLiteContext();

    const navigation = useNavigation();

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

    useEffect(() => {
        const getImagesUrl = async () => {
            try {
                db.withTransactionAsync(async () => {
                    await getSavedImages();
                });
            } catch (error) {
                Toast({ message: `Error while loading images: ${error}`, duration: ToastAndroid.SHORT })
            }
        }

        getImagesUrl();
    }, [])

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
            navigation.goBack();
            console.log(error);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, position: 'relative' }}>
                <Animated.View style={[styles.header, headerStyle]}>
                    <HeaderBackButton
                        hasFilter={false}
                        hasDownloadOption={false}
                        title={title}
                        subtitle={subtitle}
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
