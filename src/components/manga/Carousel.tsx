import { useSettings } from '@/context/appContext';
import { Chapters } from '@/types/chapters';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, scrollTo, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { MAX_HEIGHT, MAX_WIDTH } from '../../constants';
import { Theme } from '../../theme';
import Toast from '../ui/Toast';
import Zoom from './Zoom/Zoom';

interface CarouselProps {
    id: string;
    images: string[];
    hash: string;
    onSingleTap: () => void;
    menuVisible: boolean;
    storedData: boolean;
    downloadDirectory?: string;
}

export default function Carousel({ id, images, hash, onSingleTap, menuVisible, storedData, downloadDirectory = '' }: CarouselProps) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const flatListRef = useAnimatedRef<Animated.FlatList<any>>();
    const scrollX = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const THUMB_WITH = 20;
    const imagesLength = images.length;
    const uploads = process.env.EXPO_PUBLIC_MANGADEX_UPLOADS;
    const { imageQuality, readingMode, readingDirection, readingPaging } = useSettings();
    const downloadUrl = `${uploads}/${imageQuality === 'high' ? 'data' : 'data-saver'}`;
    const db = useSQLiteContext();
    const insets = useSafeAreaInsets();

    const panGesture = Gesture.Pan().onUpdate((e) => {
        const trackPosition = (MAX_WIDTH - MAX_WIDTH * 0.65) / 2;
        const newPos = e.absoluteX - trackPosition - THUMB_WITH / 2;
        const rawPage = interpolate(newPos, [0, MAX_WIDTH * 0.65], readingMode === 'horizontal' && readingDirection === 'rtl' ? [0, imagesLength] : [imagesLength, 0], Extrapolation.CLAMP);
        const currentPage = Math.max(0, Math.min(imagesLength - 1, ~~rawPage));

        scrollX.value = (imagesLength - 1) * MAX_WIDTH - currentPage * MAX_WIDTH;
        scrollY.value = (imagesLength - 1) * MAX_HEIGHT - currentPage * MAX_HEIGHT;
        if (readingMode === 'horizontal') {
            scrollTo(flatListRef, scrollX.value, 0, false);
        } else {
            scrollTo(flatListRef, 0, scrollY.value, false);
        }
    });

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
            scrollY.value = event.contentOffset.y;
            const page = readingMode === 'horizontal' ? ~~(~~event.contentOffset.x / ~~MAX_WIDTH) : ~~(~~event.contentOffset.y / ~~MAX_HEIGHT);
            scheduleOnRN(setCurrentPage, page + 1);
        },
    });

    const animatedDotStyle = (index: number) => {
        return useAnimatedStyle(() => {
            const inputRange =
                readingMode === 'horizontal' ? [(index - 1) * MAX_WIDTH, index * MAX_WIDTH, (index + 1) * MAX_WIDTH] : [(index - 1) * MAX_HEIGHT, index * MAX_HEIGHT, (index + 1) * MAX_HEIGHT];

            const opacity =
                readingMode === 'horizontal' ? interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP) : interpolate(scrollY.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);

            const scale =
                readingMode === 'horizontal'
                    ? interpolate(scrollX.value, inputRange, [0.7, 1.5, 0.7], Extrapolation.CLAMP)
                    : interpolate(scrollY.value, inputRange, [0.7, 1.5, 0.7], Extrapolation.CLAMP);

            return {
                opacity,
                transform: [{ scale }],
            };
        });
    };

    const sliderStyle = useAnimatedStyle(() => {
        const trackWidth = ~~(MAX_WIDTH * 0.65);
        const maxThumbPosition = trackWidth - 40;

        if (readingMode === 'horizontal') {
            return {
                transform: [
                    {
                        translateX: interpolate(scrollX.value, [~~((imagesLength - 1) * MAX_WIDTH), 0], [maxThumbPosition, 0], Extrapolation.CLAMP),
                    },
                ],
            };
        } else {
            return {
                transform: [
                    {
                        translateX: interpolate(scrollY.value, [~~((imagesLength - 1) * MAX_HEIGHT), 0], [maxThumbPosition, 0], Extrapolation.CLAMP),
                    },
                ],
            };
        }
    });

    const paginationStyle = useAnimatedStyle(() => {
        return {
            opacity: menuVisible ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 }),
        };
    });

    const pageNumberStyle = useAnimatedStyle(() => {
        return {
            opacity: !menuVisible ? withTiming(1, { duration: 100 }) : withTiming(0, { duration: 100 }),
            // transform: [{
            //     translateY: menuVisible
            //         ? withTiming(-100, { duration: 200 })
            //         : withTiming(-10, { duration: 200 })
            // }]
        };
    });

    async function updateLastPageRead() {
        await db.runAsync('UPDATE chapters SET last_page_read = ? WHERE id = ?', [`${currentPage - 1}`, id]);
    }

    async function getLastPageRead() {
        try {
            const lastPage = (await db.getFirstAsync('SELECT * FROM chapters WHERE id = ?', [id])) as Chapters;

            if (lastPage && lastPage.last_page_read !== null) {
                const pageIndex = parseInt(lastPage.last_page_read);

                if (pageIndex >= 0 && pageIndex < images.length) {
                    flatListRef.current?.scrollToIndex({ animated: false, index: pageIndex });
                }
            }
        } catch (error) {
            console.log(error);
            throw new Error('Get last page read');
        }
    }

    useEffect(() => {
        try {
            const loadData = async () => {
                await getLastPageRead();
            };
            loadData();
            const instruction = readingMode === 'horizontal' ? (readingDirection === 'rtl' ? 'Right to Left' : 'Left to Right') : readingDirection === 'rtl' ? 'Bottom to Top' : 'Top to Bottom';

            Toast({ message: instruction });
        } catch (error) {
            Toast({ message: `${error}` });
        }
    }, []);

    useEffect(() => {
        try {
            const loadData = async () => {
                await updateLastPageRead();
            };
            loadData();
        } catch (error) {
            Toast({ message: `${error}` });
        }
    }, [currentPage]);

    return (
        <GestureHandlerRootView>
            <Zoom onSingleTap={onSingleTap}>
                <View>
                    <Animated.FlatList
                        ref={flatListRef}
                        onScroll={scrollHandler}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        data={images}
                        keyExtractor={(item, index) => `${index}-${hash}-${item}`}
                        horizontal={readingMode === 'horizontal'}
                        inverted={readingDirection === 'rtl'}
                        pagingEnabled={readingPaging === 'single'}
                        initialNumToRender={imagesLength}
                        removeClippedSubviews
                        renderItem={({ item }) => {
                            return (
                                <Animated.View style={{ flex: 1, minWidth: MAX_WIDTH, minHeight: MAX_HEIGHT }}>
                                    <Image
                                        transition={100}
                                        source={storedData ? `${downloadDirectory}/${item}` : `${downloadUrl}/${hash}/${item}`}
                                        style={{ width: '100%', height: '100%' }}
                                        contentFit='contain'
                                    />
                                </Animated.View>
                            );
                        }}
                    />
                </View>
            </Zoom>
            <Animated.View style={[styles.pagination, paginationStyle, { bottom: insets.bottom }, readingMode === 'horizontal' && readingDirection === 'rtl' && { transform: [{ scaleX: -1 }] }]}>
                <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                    useForeground={true}
                    onPress={() => flatListRef.current?.scrollToIndex({ animated: true, index: 0 })}>
                    <View style={[styles.paginationButton, styles.paginationButtonFirst]}>
                        <Ionicons
                            name='play-skip-forward-outline'
                            size={24}
                            color={Theme.colors.midGray}
                        />
                    </View>
                </TouchableNativeFeedback>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={styles.sliderTrack}>
                        <View style={styles.dotContainer}>
                            {images.map((_, index) => (
                                <Animated.View
                                    key={index}
                                    style={[styles.dot, animatedDotStyle(index), imagesLength > 40 && { width: 2, borderRadius: 2 }]}
                                />
                            ))}
                        </View>
                        <Animated.View style={[styles.sliderThumb, sliderStyle]}>
                            <Text style={[styles.sliderThumbText, readingMode === 'horizontal' && readingDirection === 'rtl' && { transform: [{ scaleX: -1 }] }]}>{currentPage}</Text>
                        </Animated.View>
                    </Animated.View>
                </GestureDetector>
                <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                    useForeground={true}
                    onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}>
                    <View style={[styles.paginationButton, styles.paginationButtonLast]}>
                        <Ionicons
                            name='play-skip-forward-outline'
                            size={24}
                            color={Theme.colors.midGray}
                        />
                    </View>
                </TouchableNativeFeedback>
            </Animated.View>
            <Animated.View style={[styles.pageNumber, pageNumberStyle, { bottom: insets.bottom }]}>
                <Text style={styles.pageNumberText}>{`${currentPage} / ${imagesLength}`}</Text>
            </Animated.View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    pagination: {
        position: 'absolute',
        width: MAX_WIDTH * 0.65,
        height: 50,
        backgroundColor: Theme.colors.jetgray,
        paddingHorizontal: 20,

        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-evenly',

        borderRadius: 25,
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

        transform: [{ rotate: '180deg' }],
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
        top: -50,
        left: -20,

        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderThumbText: {
        // position: 'absolute',

        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
        color: Theme.colors.jetgray,
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
});
