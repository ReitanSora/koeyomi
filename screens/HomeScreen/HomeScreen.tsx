import { View, Text, FlatList, RefreshControl, TouchableNativeFeedback, useWindowDimensions, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme/Theme';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { styles } from './HomeScreen.styles';
import Header from '../../components/Header/Header';
import { useSQLiteContext } from 'expo-sqlite';
import Toast from '../../components/Toast/Toast';

export default function HomeScreen() {

    const [mangaItems, setMangaItems] = useState<[]>([]);
    const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState(2);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const SCREEN_WIDTH = useWindowDimensions().width;
    const SCREEN_HEIGHT = useWindowDimensions().height;
    const blurhash = 'L68{CzsEJ5s?Orbc}1bHEZoLW9j?';
    const db = useSQLiteContext();

    async function getFavorites() {
        try {
            let savedMangas = [];
            const favorites = await db.getAllAsync(
                'SELECT * FROM favorites WHERE user_id = ?',
                ['Redmi-2015-2201117TL-13']
            )
            for (const favorite of favorites) {
                const savedData = await db.getFirstAsync(
                    'SELECT * FROM mangas WHERE id = ?',
                    [favorite.manga_id]
                );
                savedData.attributes = JSON.parse(savedData.attributes);
                savedData.relationships = JSON.parse(savedData.relationships);
                savedMangas.push(savedData);
            }
            setMangaItems(savedMangas)
        } catch (error) {
            Toast({ message: `Error while getting favorites: ${error}` })
        }

    }

    const searchFilterFunction = (text: string) => {
        if (text) {
            const newData = mangaItems.filter(item => {
                const title = item.attributes.title.ja || item.attributes.title.en;
                const itemData = title.toLowerCase();
                const textData = text.toLowerCase();
                return itemData.indexOf(textData) > -1;
            })
            setFilteredData(newData);
        } else {
            setFilteredData(mangaItems);
        }
    };

    const onRefresh = () => {
        setLoading(true);
        db.withTransactionAsync(async () => {
            await getFavorites();
        })
        setLoading(false);
    }

    useEffect(() => {
        db.withTransactionAsync(async () => {
            await getFavorites();
        })
    }, []);

    useEffect(() => {
        setFilteredData(mangaItems);
    }, [mangaItems])

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
                    title={'Library'}
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
                                            params: { id: item.id }
                                        })
                                    }}>
                                    <View style={styles.mangaItem}>
                                        <Image
                                            cachePolicy={'memory-disk'}
                                            placeholder={{ blurhash }}
                                            transition={200}
                                            source={item.coverImageUrl}
                                            style={[styles.mangaItemImage, { width: '100%' }]}
                                            contentFit='cover'
                                        />
                                        <View style={[styles.mangaItemFooter, columns > 2 ? { height: 20 } : { height: 30 }]}>
                                            <Text
                                                style={[styles.mangaItemTitle, columns > 2 ? { fontSize: Theme.fonts.tiny } : { fontSize: Theme.fonts.paragraph }]}
                                                numberOfLines={1}
                                            >
                                                {item.attributes.title.ja ? item.attributes.title.ja : item.attributes.title.en}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        );
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={onRefresh}
                            colors={[Theme.colors.jetgray]}
                            progressBackgroundColor={Theme.colors.midGray}
                        />
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
