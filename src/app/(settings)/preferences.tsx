import Dropdown from '@/components/ui/Dropdown';
import { StaticHeader } from '@/components/ui/Header';
import SegmentedControl from '@/components/ui/SegmentedControl';
import ToggleSwitch from '@/components/ui/Toggle';
import { useSettings } from '@/context/appContext';
import { Theme } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PreferenceSectionProps {
    children: React.ReactNode;
    title: string;
}

interface CardProps {
    horizontal: boolean;
    inverted: boolean;
    progress: SharedValue<number>;
}

function Card({ horizontal, inverted, progress }: CardProps) {
    const translationAnimation = useAnimatedStyle(() => {
        if (horizontal) {
            const translateX = interpolate(progress.value, [0, 1], inverted ? [0, 160] : [0, -160], Extrapolation.CLAMP);
            return { transform: [{ translateX: translateX }] };
        } else {
            const translateY = interpolate(progress.value, [0, 1], inverted ? [0, 210] : [0, -210], Extrapolation.CLAMP);
            return { transform: [{ translateY: translateY }] };
        }
    });

    const cardStyle = StyleSheet.create({
        container: {
            backgroundColor: Theme.colors.jetgray,
            padding: 10,

            alignItems: 'center',
            gap: 10,

            borderRadius: Theme.borders.cardItem,
        },
        wrapper: {
            width: 150,
            height: 200,
            overflow: 'hidden',
        },
        card: {
            width: '100%',
            height: '100%',
            backgroundColor: Theme.colors.midGray,

            alignItems: 'center',
            justifyContent: 'center',

            borderRadius: 5,
        },
        text: {
            fontSize: Theme.fonts.paragraph,
            color: Theme.colors.lightGray,
        },
    });

    return (
        <Pressable onPress={() => (progress.value = withTiming(progress.value === 0 ? 1 : 0, { duration: 1000 }))}>
            <View style={cardStyle.container}>
                <View style={cardStyle.wrapper}>
                    <Animated.View style={[translationAnimation, { flex: 1, flexDirection: horizontal ? (inverted ? 'row-reverse' : 'row') : inverted ? 'column-reverse' : 'column', gap: 10 }]}>
                        <View style={cardStyle.card}>
                            <Text style={[cardStyle.text, { fontSize: Theme.fonts.subtitle, fontWeight: 'bold' }]}>Page 1</Text>
                        </View>
                        <View style={cardStyle.card}>
                            <Text style={[cardStyle.text, { fontSize: Theme.fonts.subtitle, fontWeight: 'bold' }]}>Page 2</Text>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </Pressable>
    );
}

function PreferenceSection({ children, title }: PreferenceSectionProps) {
    return (
        <>
            <View style={{ paddingHorizontal: 20 }}>
                <Text style={[styles.text, styles.subtitle]}>{title}</Text>
            </View>
            <View style={styles.section}>{children}</View>
        </>
    );
}

export default function Preferences() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {
        defaultLanguage,
        setDefaultLanguage,
        readingMode,
        setReadingMode,
        readingDirection,
        setReadingDirection,
        readingPaging,
        setReadingPaging,
        imageQuality,
        setImageQuality,
        dataMode,
        setDataMode,
    } = useSettings();

    const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es-la'>(defaultLanguage);
    const [selectedReadMode, setSelectedReadMode] = useState<'horizontal' | 'vertical'>(readingMode);
    const [invertDirection, setInvertDirection] = useState<boolean>(readingDirection === 'rtl');
    const [saveData, setSaveData] = useState<boolean>(dataMode === 'wifi-only');
    const [lowQualityImages, setLowQualityImages] = useState<boolean>(imageQuality === 'low');
    const [snapToScreen, setSnapToScreen] = useState<boolean>(readingPaging === 'single');
    const previewAnimation = useSharedValue(0);

    const handlePreviewTriggerAnimation = () => {
        previewAnimation.value = withTiming(previewAnimation.value === 0 ? 1 : 0, { duration: 1000 });
    };

    useEffect(() => {
        handlePreviewTriggerAnimation();
    }, [selectedReadMode, invertDirection]);

    useEffect(() => {
        setDefaultLanguage(selectedLanguage);
        setReadingMode(selectedReadMode);
        setDataMode(saveData ? 'wifi-only' : 'always');
        setImageQuality(lowQualityImages ? 'low' : 'high');
        setReadingPaging(snapToScreen ? 'single' : 'multiple');
        setReadingDirection(invertDirection ? 'rtl' : 'ltr');
    }, [selectedLanguage, selectedReadMode, saveData, lowQualityImages, snapToScreen, invertDirection]);

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StaticHeader
                hasFilter={false}
                onLeftActionPress={() => router.back()}
                title='Preferences'
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <PreferenceSection title='General'>
                        <View style={styles.description}>
                            <Text style={[styles.text, styles.title]}>Language</Text>
                            <Text style={styles.text}>Set the language in which the chapter translations will be displayed.</Text>
                        </View>
                        <View style={styles.option}>
                            <Dropdown
                                selectedOption={selectedLanguage}
                                setSelectedOption={(value) => setSelectedLanguage(value as 'en' | 'es-la')}
                                options={[
                                    { label: 'English', value: 'en' },
                                    { label: 'Español', value: 'es-la' },
                                ]}
                            />
                        </View>
                    </PreferenceSection>
                    <PreferenceSection title='Reader'>
                        <View style={styles.description}>
                            <Text style={[styles.text, styles.title]}>Reading Mode</Text>
                            <Text style={styles.text}>Choose how manga pages are displayed while reading.</Text>
                        </View>
                        <View style={styles.option}>
                            <SegmentedControl
                                options={['horizontal', 'vertical']}
                                selectedOption={selectedReadMode}
                                setSelectedOption={setSelectedReadMode}></SegmentedControl>
                        </View>
                        <View style={styles.horizontalOption}>
                            <View style={[styles.description, { flex: 2 }]}>
                                <Text style={[styles.text, styles.title]}>Reading Direction</Text>
                                <Text style={styles.text}>Invert reading direction</Text>
                            </View>
                            <View style={[styles.option, { flex: 1 }]}>
                                <ToggleSwitch
                                    checked={invertDirection}
                                    setChecked={() => setInvertDirection(!invertDirection)}
                                />
                            </View>
                        </View>
                        <View style={styles.horizontalOption}>
                            <View style={[styles.description, { flex: 2 }]}>
                                <Text style={[styles.text, styles.title]}>Snap to Screen</Text>
                                <Text style={styles.text}>Force the list to stop scrolling at multiples of the scroll view's size. One page per scroll.</Text>
                            </View>
                            <View style={[styles.option, { flex: 1 }]}>
                                <ToggleSwitch
                                    checked={snapToScreen}
                                    setChecked={() => setSnapToScreen(!snapToScreen)}
                                />
                            </View>
                        </View>
                        <View style={styles.description}>
                            <Text style={[styles.text, styles.title]}>Preview:</Text>
                            <Text style={styles.text}>Press card to play preview.</Text>
                        </View>
                        <View style={[styles.option, { paddingBottom: 20 }]}>
                            <Card
                                horizontal={selectedReadMode === 'horizontal'}
                                inverted={invertDirection}
                                progress={previewAnimation}
                            />
                        </View>
                    </PreferenceSection>
                    <PreferenceSection title='Data & Storage'>
                        <View style={styles.horizontalOption}>
                            <View style={[styles.description, { flex: 2 }]}>
                                <Text style={[styles.text, styles.title]}>Image Quality</Text>
                                <Text style={styles.text}>Download compressed images to save space on your device and reduce bandwidth usage, higher-quality images use more bandwidth.</Text>
                            </View>
                            <View style={[styles.option, { flex: 1 }]}>
                                <ToggleSwitch
                                    checked={lowQualityImages}
                                    setChecked={() => setLowQualityImages(!lowQualityImages)}
                                />
                            </View>
                        </View>
                        <View style={styles.horizontalOption}>
                            <View style={[styles.description, { flex: 2 }]}>
                                <Text style={[styles.text, styles.title]}>Data Saver</Text>
                                <Text style={styles.text}>Restrict downloads to WiFi connections to save mobile data.</Text>
                            </View>
                            <View style={[styles.option, { flex: 1 }]}>
                                <ToggleSwitch
                                    checked={saveData}
                                    setChecked={() => setSaveData(!saveData)}
                                />
                            </View>
                        </View>
                    </PreferenceSection>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    content: {
        width: '100%',
        // backgroundColor: '#FFF',
        padding: 20,
        paddingBottom: 0,

        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 20,
    },
    title: {
        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
    },
    subtitle: {
        fontWeight: 'bold',
    },
    text: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.lightGray,
    },
    section: {
        width: '100%',
        backgroundColor: Theme.colors.gunmetalGray,

        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',

        borderRadius: Theme.borders.cardItem,
    },
    description: {
        // backgroundColor: '#FFF',
        padding: 20,

        width: '100%',
        gap: 10,
    },
    option: {
        width: '100%',
        // backgroundColor: Theme.colors.jetgray,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    horizontalOption: {
        flexDirection: 'row',
    },
});
