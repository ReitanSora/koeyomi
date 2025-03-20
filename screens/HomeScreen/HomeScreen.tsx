import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableNativeFeedback, useWindowDimensions, Dimensions, TextInput, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme/Theme';
import { Image } from 'expo-image';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import Animated, { CurvedTransition, FadeInRight } from 'react-native-reanimated';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styles } from './HomeScreen.styles';
import Header from '../../components/Header/Header';
const exampleData = [
    {
        id: 1,
        title: 'Boku no Kokoro no Yabai Yatsu',
        image: ''
    },
    {
        id: 2,
        title: 'Boku no Hero',
        image: require('../../assets/2.jpg')
    },
    {
        id: 3,
        title: 'Shingeki no Kyojin',
        image: require('../../assets/2.jpg')
    },
    {
        id: 4,
        title: 'Clannad',
        image: require('../../assets/1.png')
    },
    {
        id: 5,
        title: 'Kaoru Hana wa Rin to Saku',
        image: require('../../assets/1.png')
    },
    {
        id: 6,
        title: 'Sono Bisque Doll wa Koi wo Suru',
        image: require('../../assets/2.jpg')
    },
]

export default function HomeScreen() {

    const [mangaItems, setMangaItems] = useState(exampleData);
    const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState(2);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const SCREEN_WIDTH = useWindowDimensions().width;
    const SCREEN_HEIGHT = useWindowDimensions().height;
    const blurhash = 'L68{CzsEJ5s?Orbc}1bHEZoLW9j?';


    const searchFilterFunction = useCallback((text: string) => {
        if (text) {
            const newData = mangaItems.filter(item => {
                const itemData = item.title ? item.title.toLowerCase() : ''.toLowerCase();
                const textData = text.toLowerCase();
                return itemData.indexOf(textData) > -1;
            })
            setFilteredData(newData);
        } else {
            setFilteredData(mangaItems);
        }
    }, []);

    useEffect(() => {
        setFilteredData(mangaItems);
        console.log('Cargando datos...')
        setLoading(false);
    }, []);

    Dimensions.addEventListener("change", () => {
        if (SCREEN_WIDTH > SCREEN_HEIGHT) {
            setColumns(2);
        } else {
            setColumns(5);
        }
    });

    const handleBackPress = () => {
        if (isSearchBarVisible) {
            setIsSearchBarVisible(false);
            setFilteredData(mangaItems);
            return true;
        }
        return false;
    }

    const handleCloseSearchBar = () => {
        setFilteredData(mangaItems);
    }

    navigation.addListener('blur', handleBackPress)

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.homeContainer}>
                <Header
                    isSearchBarVisible={isSearchBarVisible}
                    setIsSearchBarVisible={setIsSearchBarVisible}
                    title={'Librería'}
                    isFilterSearch={true}
                    handleFilter={searchFilterFunction}
                    handleClose={handleCloseSearchBar}
                ></Header>
                <FlatList
                    data={filteredData}
                    key={columns}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        return (
                            <View style={[styles.mangaItemContainer, { width: (SCREEN_WIDTH / columns) - 15, height: ((SCREEN_WIDTH / columns) - 15) * 1.5, maxWidth: (SCREEN_WIDTH / columns) - 15 }]}>
                                <TouchableNativeFeedback
                                    background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                                    useForeground={true}
                                    onPress={() => {
                                        navigation.navigate('MangaDetailsStack', {
                                            screen: 'MangaDetailsScreen',
                                            params: { id: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0' }
                                        })
                                    }}>
                                    <View style={styles.mangaItem}>
                                        <Image placeholder={{ blurhash }} transition={500} source={item.image} style={[styles.mangaItemImage, { width: '100%' }]} contentFit='cover' />
                                        <View style={[styles.mangaItemFooter, columns > 2 ? { height: 20 } : { height: 30 }]}>
                                            <Text style={[styles.mangaItemTitle, columns > 2 ? { fontSize: Theme.fonts.tiny } : { fontSize: Theme.fonts.paragraph }]} numberOfLines={1}>{item.title}</Text>
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        );
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={loading}></RefreshControl>
                    }
                    style={{ flexGrow: 1 }}
                    contentContainerStyle={styles.mangaListContainer}
                    numColumns={columns}
                    columnWrapperStyle={{ gap: 10 }}
                    initialNumToRender={6}
                    maxToRenderPerBatch={12}
                    windowSize={10}
                    removeClippedSubviews={true}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
};
