import { View, TouchableNativeFeedback, ToastAndroid, Text } from 'react-native'
import { styles } from './Carousel.styles';
import { useEffect, useState } from 'react';
import Animated, { Extrapolation, interpolate, runOnJS, scrollTo, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { MAX_HEIGHT, MAX_WIDTH } from '../../constants/Constants';
import Zoom from '../Zoom/Zoom';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/Theme';
import Toast from '../Toast/Toast';

interface CarouselProps {
    images: string[];
    hash: string;
    format: string;
    onSingleTap: () => void;
    menuVisible: boolean;
    storedData: boolean;
    downloadDirectory?: string;
}

export default function Carousel({ images, hash, format, onSingleTap, menuVisible, storedData, downloadDirectory = '' }: CarouselProps) {

    const scrollX = useSharedValue(0);
    const flatListRef = useAnimatedRef<Animated.FlatList<any>>();
    const THUMB_WITH = 20
    const imagesLength = images.length;
    const [currentPage, setCurrentPage] = useState(1);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            const trackPosition = (MAX_WIDTH - (MAX_WIDTH * 0.6)) / 2;
            const newPos = e.absoluteX - trackPosition - THUMB_WITH / 2;
            const currentPage = Math.floor(
                interpolate(
                    newPos,
                    [(MAX_WIDTH * 0.6), 0],
                    [imagesLength, 0],
                    Extrapolation.CLAMP
                )
            );

            scrollX.value = ((imagesLength - 1) * MAX_WIDTH) - (currentPage * MAX_WIDTH);
            scrollTo(flatListRef, scrollX.value, 0, false)
        })

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
            const page = Math.floor(event.contentOffset.x / MAX_WIDTH + 0.5)
            runOnJS(setCurrentPage)(page + 1)
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
                [0.7, 1.2, 0.7],
                Extrapolation.CLAMP
            );

            return {
                opacity,
                transform: [{ scale }],
            };
        });
    };

    const sliderStyle = useAnimatedStyle(() => {

        return {
            transform: [{
                translateX: interpolate(
                    scrollX.value,
                    [(imagesLength - 1) * MAX_WIDTH, 0],
                    [(MAX_WIDTH * 0.6) - THUMB_WITH - 22, 2],
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
            transform: [{
                translateY: menuVisible
                    ? withTiming(-100, { duration: 200 })
                    : withTiming(-10, { duration: 200 })
            }]
        }
    })

    useEffect(() => {
        const instruction = format === 'Normal' ? 'Leer de derecha a izquierda' : 'Leer hacia abajo';
        Toast({ message: instruction, duration: ToastAndroid.SHORT })
    }, [])

    return (
        <GestureHandlerRootView>
            <Zoom onSingleTap={onSingleTap}>
                <View>
                    <Animated.FlatList
                        ref={flatListRef}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        showsHorizontalScrollIndicator={format !== 'Normal'}
                        data={images}
                        keyExtractor={(item) => `dataSaver-${hash}-${item}`}
                        horizontal={format === 'Normal'}
                        inverted={format === 'Normal'}
                        pagingEnabled={format === 'Normal'}
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
                    <Animated.View style={[styles.pagination, paginationStyle]}>
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
                                            style={[styles.dot, animatedDotStyle(index)]}
                                        />
                                    ))}
                                </View>
                                <Animated.View style={[styles.sliderThumb, sliderStyle]} />
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
                    <Animated.View style={[styles.pageNumber, pageNumberStyle]}>
                        <Text style={styles.pageNumberText}>{`${currentPage} / ${imagesLength}`}</Text>
                    </Animated.View>
                </>
            }
        </GestureHandlerRootView>
    )
}