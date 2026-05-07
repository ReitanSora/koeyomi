import MangaItem from '@/components/home/MangaItem';
import { BottomSheetFilter } from '@/components/manga/BottomSheet';
import { SearchHeader } from '@/components/ui/Header';
import ListEmpty from '@/components/ui/ListEmpty';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Toast from '@/components/ui/Toast';
import { deviceId } from '@/constants';
import { getTitle } from '@/services/getTitle';
import { Theme } from '@/theme';
import { Favorites } from '@/types/favorites';
import { Manga } from '@/types/mangas';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const [mangaItems, setMangaItems] = useState<Manga[]>([]);
    const [filteredData, setFilteredData] = useState<Manga[]>([]);
    const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const sortOptions = ['A-Z', 'Z-A'];
    const [sortSelectedOption, setSortSelectedOption] = useState<string>(sortOptions[0]);
    const db = useSQLiteContext();
    const insets = useSafeAreaInsets();

    const handleReset = () => {
        setSortSelectedOption(sortOptions[0]);
    };

    const formatData = (data: object[], columns: number) => {
        const numberOfFullRows = Math.floor(data.length / columns);
        let numberOfElementsLastRow = data.length - numberOfFullRows * columns;

        while (numberOfElementsLastRow !== columns && numberOfElementsLastRow !== 0) {
            data.push({ empty: true, attributes: { title: '' } });
            numberOfElementsLastRow++;
        }

        return data as Manga[];
    };

    const getFavorites = useCallback(async () => {
        try {
            let savedMangas = [];

            const favorites = (await db.getAllAsync('SELECT * FROM favorites WHERE user_id = ?', deviceId)) as Favorites[];

            for (const favorite of favorites) {
                const savedData = (await db.getFirstAsync('SELECT * FROM mangas WHERE id = ?', [favorite.manga_id])) as Manga;

                savedData.attributes = JSON.parse(savedData.attributes.toString());
                savedData.relationships = JSON.parse(savedData.relationships.toString());

                savedMangas.push(savedData);
            }
            setMangaItems(savedMangas);
            setFilteredData(savedMangas);
            setLoading(false);
        } catch (error) {
            Toast({ message: `${error}` });
            setLoading(false);
        }
    }, [db]);

    const searchFilterFunction = (text: string) => {
        if (text) {
            const newData = mangaItems.filter((item) => {
                const title = getTitle(item.attributes);
                const itemData = title?.toLowerCase();
                const textData = text.toLowerCase();
                return itemData.indexOf(textData) > -1;
            });
            setFilteredData(newData);
        } else {
            setFilteredData(mangaItems);
        }
    };

    const handleBackPress = () => {
        if (isSearchBarVisible) {
            setIsSearchBarVisible(false);
            setFilteredData(mangaItems);
            return true;
        }
        return false;
    };
    // router.addListener('blur', handleBackPress)

    const handleCloseSearchBar = () => {
        setFilteredData(mangaItems);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await getFavorites();
        setRefreshing(false);
    }, [getFavorites]);

    useFocusEffect(
        useCallback(() => {
            onRefresh();
        }, [onRefresh]),
    );

    useMemo(() => {
        if (!filteredData) return;

        const index = filteredData.findIndex((item) => item.empty);
        if (index !== -1) filteredData.splice(index, 1);

        filteredData.sort((a, b) => {
            const aProperty = getTitle(a.attributes);
            const bProperty = getTitle(b.attributes);

            const comparison = aProperty.localeCompare(bProperty, undefined, { sensitivity: 'base' });
            return sortSelectedOption === 'A-Z' ? comparison : -comparison;
        });
    }, [filteredData, sortSelectedOption]);

    return (
        <View style={[styles.homeContainer, { paddingTop: insets.top }]}>
            <SearchHeader
                isSearchBarVisible={isSearchBarVisible}
                setIsSearchBarVisible={setIsSearchBarVisible}
                title={'Library'}
                hasSearchFilter={true}
                handleFilter={searchFilterFunction}
                handleClose={handleCloseSearchBar}>
                <BottomSheetFilter
                    onReset={handleReset}
                    heightDivider={3}>
                    <SegmentedControl
                        options={sortOptions}
                        selectedOption={sortSelectedOption}
                        setSelectedOption={setSortSelectedOption}
                        subtitle='Sort'
                    />
                </BottomSheetFilter>
            </SearchHeader>
            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator
                        size={'large'}
                        color={Theme.colors.midGray}
                    />
                </View>
            ) : (
                <FlatList
                    data={formatData(filteredData, 2)}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ width: '100%', padding: 20, paddingBottom: insets.bottom, gap: 20 }}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 20 }}
                    initialNumToRender={6}
                    maxToRenderPerBatch={12}
                    windowSize={11}
                    removeClippedSubviews={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Theme.colors.jetgray]}
                            progressBackgroundColor={Theme.colors.midGray}
                        />
                    }
                    ListEmptyComponent={
                        <ListEmpty
                            description='Save your favorite mangas to access them quickly from here.'
                            IconSet={MaterialCommunityIcons}
                            iconName='book-heart-outline'
                        />
                    }
                    renderItem={({ item }) => {
                        if (item.empty) {
                            return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
                        }
                        return <MangaItem {...item} />;
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    homeContainer: {
        width: '100%',
        flex: 1,
    },
    headerSearchBarContainer: {
        height: 'auto',
        flexDirection: 'row',
        gap: 10,
        backgroundColor: Theme.colors.gunmetalGray,
        borderBottomWidth: 2,
        borderColor: Theme.colors.vermillion,
        borderRadius: Theme.borders.input,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    headerSearchBarInput: {
        fontSize: Theme.fonts.subtitle,
        color: Theme.colors.lightGray,
        width: '100%',
        height: 40,
    },
    headerTitle: {
        fontSize: Theme.fonts.title,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
});
