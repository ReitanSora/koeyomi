import { StaticHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import { Theme } from '@/theme';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsHome() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StaticHeader
                hasFilter={false}
                hasLeftAction={false}
                onLeftActionPress={() => {}}
                title='Settings'
            />
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        cachePolicy={'disk'}
                        transition={200}
                        source={require('../../../assets/splash/splash-icon-dark.png')}
                        style={{ width: '100%', height: '100%' }}
                        contentFit='cover'
                    />
                </View>
                <View style={styles.intro}>
                    <Text style={styles.text}>Koeyomi</Text>
                    <Text style={[styles.text, { fontSize: Theme.fonts.paragraph, color: Theme.colors.midGray }]}>By ReitanSora</Text>
                </View>
                <View style={styles.options}>
                    <IconButton
                        onPress={() => router.navigate('/(settings)/preferences')}
                        containerStyle={{ width: '100%', height: 100, borderRadius: 0 }}
                        insideStyle={styles.optionInsideStyle}
                        IconSet={Feather}
                        iconName='sliders'
                        iconColor={Theme.colors.lightGray}
                        InsideElement={
                            <View style={styles.optionWrapper}>
                                <Text style={styles.text}>Preferences</Text>
                                <Text style={[styles.text, { fontSize: Theme.fonts.paragraph, color: Theme.colors.midGray }]}>Language, Reader, Data</Text>
                            </View>
                        }
                    />
                    <IconButton
                        onPress={() => router.navigate('/(settings)/(storageManager)')}
                        containerStyle={{ width: '100%', height: 100, borderRadius: 0 }}
                        insideStyle={styles.optionInsideStyle}
                        IconSet={Ionicons}
                        iconName='server-outline'
                        iconColor={Theme.colors.lightGray}
                        InsideElement={
                            <View style={styles.optionWrapper}>
                                <Text style={styles.text}>Storage Management</Text>
                                <Text style={[styles.text, { fontSize: Theme.fonts.paragraph, color: Theme.colors.midGray }]}>Manage downloaded chapters</Text>
                            </View>
                        }
                    />
                    <IconButton
                        onPress={() => router.navigate('/(settings)/about')}
                        containerStyle={{ width: '100%', height: 100, borderRadius: 0 }}
                        insideStyle={styles.optionInsideStyle}
                        IconSet={Ionicons}
                        iconName='information-circle-outline'
                        iconColor={Theme.colors.lightGray}
                        InsideElement={
                            <View style={styles.optionWrapper}>
                                <Text style={styles.text}>About</Text>
                                <Text style={[styles.text, { fontSize: Theme.fonts.paragraph, color: Theme.colors.midGray }]}>App information</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 20,
    },
    imageContainer: {
        width: 250,
        height: 250,
    },
    intro: {
        alignItems: 'center',
    },
    text: {
        color: Theme.colors.lightGray,
        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
    },
    options: {
        width: '100%',
    },
    optionWrapper: {
        flexDirection: 'column',
        gap: 5,
    },
    optionInsideStyle: {
        padding: 20,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 20,
    },
});
