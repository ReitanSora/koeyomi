import { Ionicons } from "@expo/vector-icons";
import { Directory, File, Paths } from 'expo-file-system';
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Text, ToastAndroid, TouchableNativeFeedback, View } from "react-native";
import Animated, { cancelAnimation, Easing, PinwheelIn, PinwheelOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { fetcher } from "../../services/fetcher";
import { Theme } from "../../Theme";
import { ChapterImages, ChapterInfo } from "../../types/Chapter";
import Toast from "../Toast/Toast";
import { styles } from "./ChapterItem.styles";

interface ChapterItemProps {
    item: ChapterInfo;
    format: string;
    title: string;
}

export default function ChapterItem({ item, format, title }: ChapterItemProps) {

    const date = new Date(item.attributes.publishAt).toLocaleDateString();
    const author = item.relationships.find((item: ChapterInfo) => item.type === 'scanlation_group')
    const router = useRouter();

    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [isDownloaded, setIsDownloaded] = useState<boolean>(item.download_status === 'not_downloaded' ? false : true);
    const [alreadySeen, setAlreadySeen] = useState<boolean>(parseInt(item.last_page_read) >= 0);

    const db = useSQLiteContext();

    const rotation = useSharedValue(0);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);

            const images = await fetcher(process.env.EXPO_PUBLIC_KOEYOMI_BACKEND, `/mangadex/chapter/${item.id}`) as ChapterImages;
            const downloadDirectory = new Directory(Paths.document.uri + `${item.id}`)

            if (!downloadDirectory.exists) {
                downloadDirectory.create()
            }

            await Promise.allSettled(
                images.chapter.dataSaver.map(
                    async (image) => {
                        await File.downloadFileAsync(
                            `${process.env.EXPO_PUBLIC_MANGADEX_UPLOADS}/data-saver/${images.chapter.hash}/${image}`,
                            downloadDirectory,
                        )
                    }

                )
            )

            setIsDownloaded(true);
            setIsDownloading(false);
            await updateChapterInfo(true, downloadDirectory.uri);
        } catch (error) {
            Toast({ message: `Error downloading chapter: ${error}`, duration: ToastAndroid.SHORT })
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
                    easing: Easing.ease
                }),
                -1,
                false
            );
        } else {
            cancelAnimation(rotation);
            rotation.value = withTiming(0, { duration: 300 });
        }

        return () => {
            cancelAnimation(rotation);
        };
    }, [isDownloading])

    const downloadButtonAnimated = useAnimatedStyle(() => {
        return {
            transform: [
                { rotateZ: `${rotation.value}deg` }
            ]
        }
    })

    return (
        <View>
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                useForeground={true}
                onPress={() => {
                    router.navigate({
                        pathname: '/(home)/reader',
                        params: {
                            id: item.id,
                            format: format,
                            title: title,
                            chapter: item.attributes.chapter,
                            chapterTitle: item.attributes.title
                        }
                    });
                    setAlreadySeen(true);
                }}
            >
                <View style={styles.chapterItem}>
                    <View style={styles.chapterInfo}>
                        <View style={[styles.chapterTitle, alreadySeen && { opacity: 0.4 }]}>
                            <Text style={styles.chapterTitleText} numberOfLines={1}>Capítulo {item.attributes.chapter}</Text>
                            <Text style={styles.chapterTitleText} numberOfLines={1} lineBreakMode='tail'>{item.attributes.title && ` | ${item.attributes.title}`}</Text>
                        </View>
                        <View style={[styles.chapterPublisher, alreadySeen && { opacity: 0.4 }]}>
                            <Text style={styles.chapterPublisherText} numberOfLines={1}>{date}</Text>
                            <Text style={styles.chapterPublisherText} numberOfLines={1} lineBreakMode='tail'>{author && ` | ${author.attributes.name}`}</Text>
                        </View>
                    </View>
                    <View style={styles.chapterOptions}>
                        {!isDownloading && !isDownloaded && (
                            <Animated.View
                                exiting={PinwheelOut.duration(400)}
                                style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}
                            >
                                <TouchableNativeFeedback
                                    background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                                    useForeground={true}
                                    onPress={handleDownload}
                                >
                                    <View style={styles.chapterButton}>
                                        <View style={styles.downloadIcon}>
                                            <Ionicons name="arrow-down-outline" size={18} color={Theme.colors.midGray} />
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>
                            </Animated.View>
                        )}
                        {isDownloading && !isDownloaded && (
                            <Animated.View
                                entering={PinwheelIn.duration(400)}
                                exiting={PinwheelOut.duration(400)}
                                style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}
                            >
                                <TouchableNativeFeedback
                                    background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                                    useForeground={true}
                                >
                                    <View style={styles.chapterButton}>
                                        <Animated.View style={[styles.downloadingButton, downloadButtonAnimated]}></Animated.View>
                                        <View style={styles.downloadIcon}>
                                            <Ionicons name="arrow-down-outline" size={18} color={Theme.colors.midGray} />
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>
                            </Animated.View>
                        )}
                        {!isDownloading && isDownloaded && (
                            <Animated.View
                                entering={PinwheelIn.duration(400)}
                                style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}
                            >
                                <TouchableNativeFeedback
                                    background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                                    useForeground={true}
                                    onPress={() => Toast({ message: 'Already downloaded' })}
                                >
                                    <View style={styles.chapterButton}>
                                        <View style={[styles.downloadIcon, isDownloaded && { borderColor: Theme.colors.softVermillion }]}>
                                            <Ionicons name="checkmark" size={18} color={Theme.colors.vermillion} />
                                        </View>

                                    </View>
                                </TouchableNativeFeedback>
                            </Animated.View>
                        )}
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    )
}