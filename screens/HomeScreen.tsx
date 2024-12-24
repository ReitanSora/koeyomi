import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/Colors';

export default function HomeScreen() {
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <ScrollView style={styles.homeContainer}>
                    <Text>Esta es la pantalla de Inicio</Text>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    homeContainer: {
        height: '100%',
        //backgroundColor: Colors.light.white,
        //backgroundColor: Colors.dark.background,
    },
});
