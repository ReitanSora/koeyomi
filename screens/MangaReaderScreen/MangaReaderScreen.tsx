import HeaderBackButton from '../../components/HeaderBackButton/HeaderBackButton';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { fetcher } from '../../services/fetcher';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { styles } from './MangaReaderScreen.styles';
import Carousel from '../../components/Carousel/Carousel';

export default function MangaReaderScreen({ route }: any) {

    const { id, format, title, subtitle } = route.params;
    const [imagesUrl, setImagesUrl] = useState<object>();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const headerStyle = useAnimatedStyle(() => {
        return {
            opacity: isMenuVisible
                ? withTiming(1, { duration: 200 })
                : withTiming(0, { duration: 200 })
        }
    })

    useEffect(() => {
        const getImagesUrl = async () => {
            const images = await fetcher(process.env.EXPO_PUBLIC_KOEYOMI_BACKEND, `/mangadex/chapter/${id}`) as object;
            setImagesUrl(images);
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
                        subtitle={subtitle}
                        hidden={true} />
                </Animated.View>

                {imagesUrl &&
                    <Carousel
                        images={imagesUrl}
                        format={format}
                        onSingleTap={() => setIsMenuVisible(!isMenuVisible)}
                        menuVisible={isMenuVisible} />
                }

            </SafeAreaView>
        </SafeAreaProvider>
    );
};
