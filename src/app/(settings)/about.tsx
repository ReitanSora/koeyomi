import { StaticHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function About() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleBrowserAsync = async (url: string) => {
        await openBrowserAsync(url);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StaticHeader
                hasFilter={false}
                onLeftActionPress={() => router.back()}
                title='About'
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={[styles.text, { fontWeight: 'bold', paddingLeft: 20 }]}>Acknowledgments</Text>
                    <View style={styles.section}>
                        <View style={styles.sectionContent}>
                            <View style={{ width: 250, height: 250 }}>
                                <Image
                                    transition={250}
                                    source={require('../../../assets/images/manga-dex.svg')}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit='contain'
                                />
                            </View>
                            <Text style={[styles.text, styles.subtitle]}>MangaDex</Text>
                        </View>
                        <Text style={styles.text}>
                            This application is powered by the MangaDex API. We would like to express our gratitude to the MangaDex team for providing a high-quality, ad-free platform for the manga
                            community.
                        </Text>
                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Our Commitment</Text>
                        <View style={styles.unorderedListItem}>
                            <View style={styles.bullet} />
                            <Text style={styles.text}>Full credit goes to MangaDex and the dedicated scanlation groups who make these stories accessible.</Text>
                        </View>
                        <View style={styles.unorderedListItem}>
                            <View style={styles.bullet} />
                            <Text style={styles.text}>
                                We honor all content removal requests from scanlation groups. If you are a group leader and wish to have your work removed, please contact us.
                            </Text>
                        </View>
                        <View style={styles.unorderedListItem}>
                            <View style={styles.bullet} />
                            <Text style={styles.text}>In accordance with MangaDex's policy, this app is entirely free. We do not run ads or offer paid services.</Text>
                        </View>
                    </View>
                    <Text style={[styles.text, { fontWeight: 'bold', paddingLeft: 20 }]}>Support</Text>
                    <View style={styles.section}>
                        <Text style={styles.text}>
                            We're here to help! If you encounter any issues, have feature requests, or simply want to leave feedback, feel free to reach out. You can also view our source code or
                            report bugs on GitHub.
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
                            <IconButton
                                onPress={() => handleBrowserAsync('https://github.com/ReitanSora/koeyomi')}
                                IconSet={Ionicons}
                                iconName='logo-github'
                            />
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={[styles.text, { fontWeight: 'bold', alignSelf: 'center' }]}>{Application.applicationName}</Text>
                        <View style={{ width: '100%', flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
                            <Text style={[styles.text]}>Version {Application.nativeApplicationVersion}</Text>
                            <Text style={[styles.text]}>(Build {Application.nativeBuildVersion})</Text>
                        </View>
                    </View>
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
        padding: 20,
        paddingBottom: 0,

        gap: 20,
    },
    section: {
        width: '100%',
        backgroundColor: Theme.colors.gunmetalGray,
        padding: 20,

        overflow: 'hidden',
        gap: 20,

        borderRadius: Theme.borders.cardItem,
    },
    sectionContent: {
        width: '100%',

        alignItems: 'center',
    },
    text: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.lightGray,
    },
    subtitle: {
        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
    },
    unorderedListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    bullet: {
        width: 6,
        height: 6,
        backgroundColor: Theme.colors.midGray,

        borderRadius: 3,
    },
});
