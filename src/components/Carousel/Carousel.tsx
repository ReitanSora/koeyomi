import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, ToastAndroid, TouchableNativeFeedback, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, scrollTo, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { MAX_HEIGHT, MAX_WIDTH } from '../../Constants';
import { Theme } from '../../Theme';
import Toast from '../Toast/Toast';
import Zoom from '../Zoom/Zoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CarouselProps {
    id: string;
    images: string[];
    hash: string;
    format: string;
    onSingleTap: () => void;
    menuVisible: boolean;
    storedData: boolean;
    downloadDirectory?: string;
}

export default function Carousel({ id, images, hash, format, onSingleTap, menuVisible, storedData, downloadDirectory = '' }: CarouselProps) {

    const scrollX = useSharedValue(0);
    const flatListRef = useAnimatedRef<Animated.FlatList<any>>();
    const THUMB_WITH = 20
    const imagesLength = images.length;
    const [currentPage, setCurrentPage] = useState(1);

    const db = useSQLiteContext();
    const insets = useSafeAreaInsets();

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            const trackPosition = (MAX_WIDTH - (MAX_WIDTH * 0.65)) / 2;
            const newPos = e.absoluteX - trackPosition - THUMB_WITH / 2;
            const rawPage = interpolate(
                newPos,
                [(MAX_WIDTH * 0.65), 0],
                [imagesLength, 0],
                Extrapolation.CLAMP
            )
            const currentPage = Math.max(0, Math.min(imagesLength - 1, ~~(rawPage)));

            scrollX.value = ((imagesLength - 1) * MAX_WIDTH) - (currentPage * MAX_WIDTH);
            scrollTo(flatListRef, scrollX.value, 0, false)
        })

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
            const page = ~~(~~event.contentOffset.x / ~~MAX_WIDTH)
            scheduleOnRN(setCurrentPage, page + 1)
        },
    });

    const animatedDotStyle = (index: number) => {

        return useAnimatedStyle(() => {
            const inputRange = [
                (index - 1) * MAX_WIDTH,
                index * MAX_WIDTH,
                (index + 1) * MAX_WIDTH,
            ];

            const opacity = interpolate(
                scrollX.value,
                inputRange,
                [0.3, 1, 0.3],
                Extrapolation.CLAMP
            );

            const scale = interpolate(
                scrollX.value,
                inputRange,
                [0.7, 1.5, 0.7],
                Extrapolation.CLAMP
            );

            return {
                opacity,
                transform: [{ scale }],
            };
        });
    };

    const sliderStyle = useAnimatedStyle(() => {
        const trackWidth = ~~(MAX_WIDTH * 0.65);
        const maxThumbPosition = trackWidth - 40;

        return {
            transform: [{
                translateX: interpolate(
                    scrollX.value,
                    [~~((imagesLength - 1) * MAX_WIDTH), 0],
                    [maxThumbPosition, 0],
                    Extrapolation.CLAMP
                )
            }],
        }
    })

    const paginationStyle = useAnimatedStyle(() => {
        return {
            opacity: menuVisible
                ? withTiming(1, { duration: 200 })
                : withTiming(0, { duration: 200 }),
        }
    })

    const pageNumberStyle = useAnimatedStyle(() => {

        return {
            opacity: !menuVisible
                ? withTiming(1, { duration: 100 })
                : withTiming(0, { duration: 100 }),
            // transform: [{
            //     translateY: menuVisible
            //         ? withTiming(-100, { duration: 200 })
            //         : withTiming(-10, { duration: 200 })
            // }]
        }
    })

    async function updateLastPageRead() {
        await db.runAsync(
            'UPDATE chapters SET last_page_read = ? WHERE id = ?',
            [
                `${currentPage - 1}`,
                id
            ]
        );
    }

    async function getLastPageRead() {
        try {
            const lastPage = await db.getFirstAsync('SELECT * FROM chapters WHERE id = ?', [id]);

            if (lastPage && lastPage.last_page_read !== null) {
                const pageIndex = parseInt(lastPage.last_page_read);

                if (pageIndex >= 0 && pageIndex < images.length) {
                    flatListRef.current?.scrollToIndex({ animated: false, index: pageIndex });
                }
            }
        } catch (error) {
            throw new Error("Error in get last page read");
        }
    }

    useEffect(() => {
        try {
            const loadData = async () => {
                await getLastPageRead();
            }
            loadData();
            const instruction = format === 'Normal' ? 'Right to left' : 'To bottom';
            Toast({ message: instruction, duration: ToastAndroid.SHORT })
        } catch (error) {
            Toast({ message: `${error}` })
        }
    }, [])

    useEffect(() => {
        try {
            const loadData = async () => {
                await updateLastPageRead();
            }
            loadData();
        } catch (error) {
            Toast({ message: `${error}` })
        }
    }, [currentPage])

    return (
        <GestureHandlerRootView>
            <Zoom onSingleTap={onSingleTap}>
                <View>
                    <Animated.FlatList
                        ref={flatListRef}
                        onScroll={scrollHandler}
                        showsHorizontalScrollIndicator={format !== 'Normal'}
                        data={images}
                        keyExtractor={(item) => `dataSaver-${hash}-${item}`}
                        horizontal={format === 'Normal'}
                        inverted={format === 'Normal'}
                        pagingEnabled={format === 'Normal'}
                        initialNumToRender={images.length}
                        renderItem={({ item }) => {
                            return (
                                <Animated.View style={{ flex: 1, minWidth: MAX_WIDTH, minHeight: MAX_HEIGHT }}>
                                    <Image
                                        transition={100}
                                        source={storedData ? `${downloadDirectory}/${item}` : `${process.env.EXPO_PUBLIC_MANGADEX_UPLOADS}/data-saver/${hash}/${item}`}
                                        style={{ width: '100%', height: '100%' }}
                                        contentFit='contain' />
                                </Animated.View>

                            )
                        }} />
                </View>
            </Zoom>
            {format === 'Normal' &&
                <>
                    <Animated.View style={[styles.pagination, paginationStyle, {bottom: insets.bottom}]}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                            useForeground={true}
                            onPress={() => flatListRef.current?.scrollToIndex({ animated: true, index: 0 })}
                        >
                            <View style={[styles.paginationButton, styles.paginationButtonFirst]}>
                                <Ionicons name="play-skip-forward-outline" size={24} color={Theme.colors.midGray} />
                            </View>
                        </TouchableNativeFeedback>
                        <GestureDetector gesture={panGesture}>
                            <Animated.View
                                style={styles.sliderTrack}>
                                <View style={styles.dotContainer}>
                                    {images.map((_, index) => (
                                        <Animated.View
                                            key={index}
                                            style={[styles.dot, animatedDotStyle(index), imagesLength > 40 && {width: 2, borderRadius: 2}]}
                                        />
                                    ))}
                                </View>
                                <Animated.View style={[styles.sliderThumb, sliderStyle]}>
                                    <Text style={styles.sliderThumbText}>{currentPage}</Text>
                                </Animated.View>
                            </Animated.View>
                        </GestureDetector>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                            useForeground={true}
                            onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}

                        >
                            <View style={[styles.paginationButton, styles.paginationButtonLast]}>
                                <Ionicons name="play-skip-forward-outline" size={24} color={Theme.colors.midGray} />
                            </View>
                        </TouchableNativeFeedback>
                    </Animated.View>
                    <Animated.View style={[styles.pageNumber, pageNumberStyle, {bottom: insets.bottom}]}>
                        <Text style={styles.pageNumberText}>{`${currentPage} / ${imagesLength}`}</Text>
                    </Animated.View>
                </>
            }
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    pagination: {
        position: 'absolute',
        width: (MAX_WIDTH * 0.65),
        height: 50,
        backgroundColor: Theme.colors.jetgray,
        paddingHorizontal: 20,

        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-evenly',

        borderRadius: 25,

        transform: [{ rotate: '180deg' }],
    },
    paginationButton: {
        position: 'absolute',

        width: 50,
        height: 50,
        backgroundColor: Theme.colors.jetgray,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',

        borderRadius: Theme.borders.circle,

    },
    paginationButtonLast: {
        right: -60,
    },
    paginationButtonFirst: {
        left: -60,

        transform: [{ rotate: '180deg' }]
    },
    sliderTrack: {
        width: '100%',
        // height: 2,
        // backgroundColor: Theme.colors.softVermillion,

        // alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',

        borderRadius: 2,
    },
    dotContainer: {
        width: '100%',

        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dot: {
        height: 10,
        width: 5,
        backgroundColor: Theme.colors.vermillion,

        borderRadius: 5,
    },
    sliderThumb: {
        width: 40,
        height: 40,
        borderRadius: '100%',
        backgroundColor: Theme.colors.vermillion,
        position: 'absolute',
        top: 20,
        left: -20,

        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderThumbText: {
        // position: 'absolute',

        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
        color: Theme.colors.jetgray,

        transform: [{ rotate: '180deg' }],
    },
    pageNumber: {
        position: 'absolute',
        backgroundColor: Theme.colors.gunmetalGray,
        paddingHorizontal: 10,
        paddingVertical: 5,

        alignSelf: 'center',

        borderRadius: 5,
    },
    pageNumberText: {
        fontSize: Theme.fonts.tiny,
        color: Theme.colors.midGray,
    },
})