import Toast from '@/components/ui/Toast';
import { useSettings } from '@/context/appContext';
import { fetcher } from '@/services/fetcher';
import { Theme } from '@/theme';
import { ChapterImages, Chapters } from '@/types/chapters';
import { Ionicons } from '@expo/vector-icons';
import { Directory, File, Paths } from 'expo-file-system';
import * as Network from 'expo-network';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import IconButton from '../ui/IconButton';

interface ChapterItemProps {
    item: Chapters;
    title: string;
}

export default function ChapterItem({ item, title }: ChapterItemProps) {
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [isDownloaded, setIsDownloaded] = useState<boolean>(item.download_status === 'not_downloaded' ? false : true);
    const [alreadySeen, setAlreadySeen] = useState<boolean>(parseInt(item.last_page_read) >= 0);
    const db = useSQLiteContext();
    const rotation = useSharedValue(0);
    const date = new Date(item.attributes.publishAt).toLocaleDateString();
    const author = item.relationships.find((item) => item.type === 'scanlation_group');
    const router = useRouter();
    const backend = process.env.EXPO_PUBLIC_KOEYOMI_BACKEND;
    const uploads = process.env.EXPO_PUBLIC_MANGADEX_UPLOADS;
    const { imageQuality, dataMode } = useSettings();
    const downloadUrl = `${uploads}/${imageQuality === 'high' ? 'data' : 'data-saver'}`;

    const handleDownload = async () => {
        try {
            const networkData = await Network.getNetworkStateAsync();

            if (networkData.type !== 'WIFI' && dataMode === 'wifi-only') {
                throw new Error('Connect to a WIFI network or disable data saver setting.');
            }

            setIsDownloading(true);

            if (!backend) throw new Error('Backend URL not defined');

            const images = (await fetcher(backend, `/mangadex/chapter/${item.id}`)) as ChapterImages;
            const parentDirectory = new Directory(Paths.document.uri, 'downloaded');
            const mangaDirectory = new Directory(Paths.document.uri, 'downloaded', item.manga_id);
            const downloadDirectory = new Directory(Paths.document.uri, 'downloaded', item.manga_id, item.id);

            if (!parentDirectory.exists) {
                parentDirectory.create();
            }

            if (!mangaDirectory.exists) {
                mangaDirectory.create();
            }

            if (!downloadDirectory.exists) {
                downloadDirectory.create();
            }

            await Promise.allSettled(
                imageQuality === 'low'
                    ? images.chapter.dataSaver.map(async (image) => {
                          await File.downloadFileAsync(`${downloadUrl}/${images.chapter.hash}/${image}`, downloadDirectory);
                      })
                    : images.chapter.data.map(async (image) => {
                          await File.downloadFileAsync(`${downloadUrl}//${images.chapter.hash}/${image}`, downloadDirectory);
                      }),
            );

            setIsDownloaded(true);
            setIsDownloading(false);
            await updateChapterInfo(true, downloadDirectory.uri);
        } catch (error) {
            Toast({ message: `${error}` });
            console.log(error);
            await updateChapterInfo(false, '');
            setIsDownloaded(false);
            setIsDownloading(false);
        }
    };

    async function updateChapterInfo(downloaded: boolean, download_path: string) {
        await db.runAsync('UPDATE chapters SET download_status = ? WHERE id = ?', [downloaded ? 'downloaded' : 'not_downloaded', item.id]);
        await db.runAsync('UPDATE chapters SET file_path = ? WHERE id = ?', [download_path, item.id]);
    }

    useEffect(() => {
        if (isDownloading) {
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 500,
                    easing: Easing.ease,
                }),
                -1,
                false,
            );
        } else {
            cancelAnimation(rotation);
            rotation.value = withTiming(0, { duration: 300 });
        }

        return () => {
            cancelAnimation(rotation);
        };
    }, [isDownloading]);

    const downloadButtonAnimated = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${rotation.value}deg` }],
        };
    });

    return (
        <View style={styles.container}>
            <Pressable
                android_ripple={{ color: 'rgba(139, 139, 139, 0.25)', borderless: false, foreground: true }}
                style={{ flex: 1 }}
                onPress={() => {
                    router.navigate({
                        pathname: '/(home)/reader',
                        params: {
                            id: item.id,
                            title: title,
                            chapter: item.attributes.chapter,
                            chapterTitle: item.attributes.title,
                        },
                    });
                    setAlreadySeen(true);
                }}>
                <View style={styles.chapterItem}>
                    <View style={styles.chapterInfo}>
                        <View style={[styles.chapterItemHeader, alreadySeen && { opacity: 0.4 }]}>
                            <Text
                                style={styles.chapterTitleText}
                                numberOfLines={1}>
                                Chapter {item.attributes.chapter}
                            </Text>
                            <Text
                                style={styles.chapterDetailText}
                                numberOfLines={1}
                                lineBreakMode='tail'>
                                {item.attributes.pages} Pages
                            </Text>
                            <Text
                                style={styles.chapterDetailText}
                                numberOfLines={1}
                                lineBreakMode='tail'>
                                {author?.attributes.name}
                            </Text>
                            <Text
                                style={styles.chapterDetailText}
                                numberOfLines={1}>
                                {date}
                            </Text>
                        </View>
                    </View>
                    <View>
                        <IconButton
                            IconSet={Ionicons}
                            InsideElement={
                                isDownloading &&
                                !isDownloaded && (
                                    <Animated.View style={[downloadButtonAnimated, { flex: 1 }]}>
                                        <ActivityIndicator
                                            color={Theme.colors.midGray}
                                            size={'small'}
                                        />
                                    </Animated.View>
                                )
                            }
                            iconName={!isDownloading && !isDownloaded ? 'arrow-down-outline' : isDownloading && !isDownloaded ? undefined : 'checkmark'}
                            iconColor={!isDownloading && !isDownloaded ? Theme.colors.midGray : isDownloading && !isDownloaded ? undefined : Theme.colors.vermillion}
                            onPress={!isDownloading && !isDownloaded ? handleDownload : isDownloading && !isDownloaded ? () => {} : () => Toast({ message: 'Already downloaded' })}
                            containerStyle={{
                                borderWidth: 2,
                                borderColor: !isDownloading && isDownloaded ? Theme.colors.softVermillion : Theme.colors.jetgray,
                            }}
                        />
                    </View>
                </View>
            </Pressable>
        </View>
    );
}

export const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    chapterItem: {
        padding: 20,

        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    chapterInfo: {
        flex: 1,
        // backgroundColor: '#f2f2f2',

        flexDirection: 'column',
        gap: 5,
    },
    chapterItemHeader: {
        maxWidth: '50%',

        flexDirection: 'column',
    },
    chapterTitleText: {
        fontSize: Theme.fonts.subtitle,
        color: Theme.colors.lightGray,
    },
    chapterDetailText: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    chapterButton: {
        width: 35,
        height: 35,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    downloadingButton: {
        position: 'absolute',
        top: -2,
        bottom: -2,
        width: 46,
        height: 46,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // backgroundColor: Theme.colors.vermillion,
        borderWidth: 2,
        borderTopColor: Theme.colors.vermillion,
        borderRightColor: Theme.colors.jetgray,
        borderBottomColor: Theme.colors.jetgray,
        borderLeftColor: Theme.colors.jetgray,
        borderRadius: Theme.borders.circle,

        zIndex: 1,
    },
});
