import { SearchHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import ListEmpty from '@/components/ui/ListEmpty';
import Pill from '@/components/ui/Pill';
import Toast from '@/components/ui/Toast';
import { deviceId } from '@/constants';
import { fetcher } from '@/services/fetcher';
import { getTitle } from '@/services/getTitle';
import { handleCoverDelete, handleCoverDownload } from '@/services/mangaFunctions';
import { Theme } from '@/theme';
import { Manga, MangaAPIResponse } from '@/types/mangas';
import { SearchAPIResponse } from '@/types/searchs';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useIsFocused } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ResultElement(item: Manga) {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const db = useSQLiteContext();
    const backend = process.env.EXPO_PUBLIC_KOEYOMI_BACKEND;

    const handleFavoriteButton = async () => {
        try {
            setIsFavorite(!isFavorite);
            Toast({ message: !isFavorite ? 'Added to favorites' : 'Deleted from favorites' });
            await saveOrDeleteFavorite();
            if (!isFavorite) {
                const manga = await fetchMangaInfo();
                await handleCoverDownload(manga, db);
            } else {
                handleCoverDelete(item.id, db);
            }
        } catch (error) {
            Toast({ message: `${error}` });
            console.log(error);
        }
    };

    async function getIfMangaIsFavorite() {
        try {
            const favoriteManga = await db.getFirstAsync('SELECT * FROM favorites WHERE manga_id = ?', item.id);

            if (favoriteManga) {
                setIsFavorite(true);
            }
        } catch (error) {
            Toast({ message: 'Error get if favorite' });
        }
    }

    async function saveToDatabase(fetchData: MangaAPIResponse) {
        let savedData;
        const mangaData = fetchData.data as Manga;
        await db.runAsync('INSERT OR REPLACE INTO mangas (id, type, attributes, relationships, coverImageUrl) VALUES (?, ?, ?, ?, ?)', [
            item.id,
            mangaData.type,
            JSON.stringify(mangaData.attributes),
            JSON.stringify(mangaData.relationships),
            mangaData.coverImageUrl,
        ]);

        savedData = (await db.getFirstAsync('SELECT * FROM mangas WHERE id = ?', item.id)) as Manga;

        if (savedData) {
            savedData.attributes = JSON.parse(savedData.attributes.toString());
            savedData.relationships = JSON.parse(savedData.relationships.toString());
        }

        return savedData;
    }

    async function fetchMangaInfo() {
        try {
            if (!backend) throw new Error('Backend URL not defined');

            const response = (await fetcher(backend, `/mangadex/manga/${item.id}`)) as MangaAPIResponse;

            const resultData = (await saveToDatabase(response)) as Manga;

            return resultData;
        } catch (error) {
            Toast({ message: `${error}` });
        }
    }

    async function saveOrDeleteFavorite() {
        if (isFavorite) {
            await db.runAsync('DELETE FROM favorites WHERE manga_id = ?', item.id);
        } else {
            await db.runAsync('INSERT INTO favorites (user_id, manga_id, timestamp) VALUES (?, ?, ?)', [deviceId, item.id, `${Date.now()}`]);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            await getIfMangaIsFavorite();
        };

        loadData();
    }, []);

    return (
        <View style={styles.mangaItemWrapper}>
            <View style={styles.mangaItemContainer}>
                <View style={styles.mangaItemImage}>
                    <Image
                        cachePolicy={'memory'}
                        placeholder={{ blurhash: 'KLEv+{so1z$Oo1S41#Wq|t' }}
                        transition={200}
                        source={item.coverImageUrl}
                        style={{ width: '100%', height: '100%' }}
                        contentFit='cover'
                    />
                </View>
                <View style={styles.mangaItemInfo}>
                    <View style={[styles.mangaItemInfoLeft]}>
                        <Pill
                            IconElement={
                                <MaterialCommunityIcons
                                    name='record'
                                    size={15}
                                    color={item.attributes.status === 'ongoing' ? Theme.colors.vermillion : Theme.colors.midGray}
                                />
                            }
                            containerStyle={{
                                width: '100%',
                                backgroundColor: Theme.colors.jetgray,

                                flexDirection: 'row',
                                gap: 10,
                            }}
                            textStyle={{
                                color: item.attributes.status === 'ongoing' ? Theme.colors.vermillion : Theme.colors.midGray,
                            }}
                            text={item.attributes.status.toUpperCase() || 'UNKNOWN'}
                        />
                        <Text
                            numberOfLines={3}
                            ellipsizeMode='tail'
                            style={styles.titleText}>
                            {getTitle(item.attributes)}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {item.attributes.publicationDemographic && (
                                <Pill
                                    containerStyle={{ backgroundColor: Theme.colors.jetgray }}
                                    text={item.attributes.publicationDemographic.toUpperCase()}
                                />
                            )}
                            {item.attributes.year && (
                                <Pill
                                    containerStyle={{ backgroundColor: Theme.colors.jetgray }}
                                    text={item.attributes.year}
                                />
                            )}
                        </View>
                    </View>
                    <View style={styles.mangaItemInfoRight}>
                        <IconButton
                            IconSet={Ionicons}
                            iconName={isFavorite ? 'heart' : 'heart-outline'}
                            iconColor={isFavorite ? Theme.colors.vermillion : Theme.colors.midGray}
                            onPress={handleFavoriteButton}
                            containerStyle={{ borderWidth: 2, borderColor: isFavorite ? Theme.colors.vermillion : Theme.colors.midGray }}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

export default function SearchScreen() {
    const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTitle, setSearchTitle] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchAPIResponse>();
    const flatListRef = useRef<FlatList<Manga>>(null);
    const backend = process.env.EXPO_PUBLIC_KOEYOMI_BACKEND;
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    const handleSearch = async () => {
        if (searchTitle.trim().length > 0) {
            setLoading(true);
            setSearchResults(undefined);
            try {
                if (!backend) throw new Error('Backend URL not defined');
                const response = (await fetcher(backend, `/mangadex/search?title=${encodeURIComponent(searchTitle)}`)) as SearchAPIResponse;
                setSearchResults(response);
                setLoading(false);
            } catch (error) {
                Toast({ message: `${error}` });
                setLoading(false);
            }
        }
    };

    const handleBackPress = () => {
        if (isSearchBarVisible) {
            setIsSearchBarVisible(false);
            return true;
        }
        return false;
    };

    const handleCloseSearchBar = () => {
        setSearchTitle('');
    };

    const handleChangeText = (text: string) => {
        setSearchTitle(text);
    };

    useEffect(() => {
        if (flatListRef.current && searchResults && searchResults.data.length > 0) {
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
    }, [searchResults]);

    if (!isFocused) {
        return null;
    }

    return (
        <View style={[styles.SearchContainer, { paddingTop: insets.top }]}>
            <SearchHeader
                isSearchBarVisible={isSearchBarVisible}
                setIsSearchBarVisible={setIsSearchBarVisible}
                title={'Search'}
                hasSearchFilter={false}
                inputValue={searchTitle}
                handleSearch={handleSearch}
                handleClose={handleCloseSearchBar}
                handleChangeText={handleChangeText}
            />
            {searchResults ? (
                <FlatList
                    data={searchResults.data}
                    ref={flatListRef}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.mangaListContainer, { paddingBottom: insets.bottom }]}
                    initialNumToRender={6}
                    maxToRenderPerBatch={12}
                    windowSize={10}
                    removeClippedSubviews={true}
                    ListEmptyComponent={
                        <ListEmpty
                            description="We couldn't find any manga matching your search. Try using different keywords."
                            IconSet={MaterialIcons}
                            iconName='search-off'
                        />
                    }
                    renderItem={({ item }) => {
                        return <ResultElement {...item} />;
                    }}
                />
            ) : loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 20, gap: 10 }}>
                    <ActivityIndicator
                        size={'large'}
                        color={Theme.colors.midGray}
                    />
                    <Text style={{ width: '70%', textAlign: 'center', fontSize: Theme.fonts.paragraph, color: Theme.colors.midGray }}>Searching for your next story... please wait a moment.</Text>
                </View>
            ) : (
                <ListEmpty
                    description='Search by title to discover new stories.'
                    IconSet={MaterialCommunityIcons}
                    iconName='file-find-outline'
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    SearchContainer: {
        height: '100%',
    },
    mangaListContainer: {
        padding: 20,

        gap: 20,
    },
    mangaItemWrapper: {
        borderRadius: Theme.borders.cardItem,

        overflow: 'hidden',
    },
    mangaItemContainer: {
        flex: 1,
        height: 200,
        backgroundColor: Theme.colors.gunmetalGray,

        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    mangaItemImage: {
        width: 130,
        height: 200,
    },
    mangaItemInfo: {
        height: 200,
        padding: 20,

        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    mangaItemInfoLeft: {
        flex: 2,
        height: '100%',
        justifyContent: 'space-between',
    },
    mangaItemInfoRight: {
        flex: 1,
        height: '100%',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    titleText: {
        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
});
