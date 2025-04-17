import { Text, ToastAndroid, TouchableNativeFeedback, View } from "react-native";
import { styles } from "./ChapterItem.styles";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../theme/Theme";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import Toast from "../Toast/Toast";
import { useEffect, useState } from "react";
import { fetcher } from "../../services/fetcher";
import { ChapterItemInterface, ChapterImagesInterface } from "../../interfaces/Chapter.Interface";
import { useSQLiteContext } from "expo-sqlite";
import Animated, { cancelAnimation, Easing, PinwheelIn, PinwheelOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

interface ChapterItemProps {
    item: ChapterItemInterface;
    format: string;
    title: string;
}

export default function ChapterItem({ item, format, title }: ChapterItemProps) {

    const date = new Date(item.attributes.publishAt).toLocaleDateString();
    const author = item.relationships.find((item: ChapterItemInterface) => item.type === 'scanlation_group')
    const navigation = useNavigation();

    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [isDownloaded, setIsDownloaded] = useState<boolean>(item.download_status === 'not_downloaded' ? false : true);

    const db = useSQLiteContext();

    const rotation = useSharedValue(0);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);

            const images = await fetcher(process.env.EXPO_PUBLIC_KOEYOMI_BACKEND, `/mangadex/chapter/${item.id}`) as ChapterImagesInterface;
            const downloadDirectory = FileSystem.documentDirectory + `KoeYomi/${item.id}`;

            const dirInfo = await FileSystem.getInfoAsync(downloadDirectory);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(downloadDirectory, { intermediates: true });
            }

            await Promise.all(
                images.chapter.dataSaver.map(
                    image => FileSystem.downloadAsync(
                        `${process.env.EXPO_PUBLIC_MANGADEX_UPLOADS}/data-saver/${images.chapter.hash}/${image}`,
                        downloadDirectory + `/${image}`,
                    )
                )
            )

            setIsDownloaded(true);
            setIsDownloading(false);
            db.withTransactionAsync(async () => {
                await updateChapterInfo(true, downloadDirectory);
            })
        } catch (error) {
            Toast({ message: `Error while downloading chapter: ${error}`, duration: ToastAndroid.SHORT })
            db.withTransactionAsync(async () => {
                await updateChapterInfo(false, '');
            })
            console.log(error)
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
                    navigation.navigate('MangaDetailsStack', {
                        screen: 'MangaReaderScreen',
                        params: {
                            id: item.id,
                            format: format,
                            title: title,
                            subtitle: item.attributes.title,
                        }
                    })
                }}
            >
                <View style={styles.chapterItem}>
                    <View style={styles.chapterInfo}>
                        <View style={styles.chapterTitle}>
                            <Text style={styles.chapterTitleText} numberOfLines={1}>Capítulo {item.attributes.chapter}</Text>
                            <Text style={styles.chapterTitleText} numberOfLines={1} lineBreakMode='tail'>{item.attributes.title && ` | ${item.attributes.title}`}</Text>
                        </View>
                        <View style={styles.chapterPublisher}>
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