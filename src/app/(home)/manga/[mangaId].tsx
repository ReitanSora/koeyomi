import { BottomSheetFilter, BottomSheetInfo } from '@/components/manga/BottomSheet';
import ChapterItem from '@/components/manga/ChapterItem';
import FilterChips from '@/components/ui/FilterChips';
import { StaticHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import ListEmpty from '@/components/ui/ListEmpty';
import Pill from '@/components/ui/Pill';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Toast from '@/components/ui/Toast';
import { deviceId, MAX_WIDTH, statusBarHeight } from '@/constants';
import { useSettings } from '@/context/appContext';
import { fetcher } from '@/services/fetcher';
import { getTitle } from '@/services/getTitle';
import { getFileName, handleCoverDelete, handleCoverDownload } from '@/services/mangaFunctions';
import { Theme } from '@/theme';
import { ChapterAPIResponse, Chapters } from '@/types/chapters';
import { Manga, MangaAPIResponse } from '@/types/mangas';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MangaDetailsScreen() {
    const [manga, setManga] = useState<Manga>();
    const [title, setTitle] = useState<string>('');
    const [chapters, setChapters] = useState<Chapters[]>();
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [headerHeight, setHeaderHeight] = useState<number>(0);
    const flatListRef = useRef<FlatList<Chapters>>(null);
    const { defaultLanguage } = useSettings();
    const [sortSelectedOption, setSortSelectedOption] = useState<string>('Newest');
    const [statusSelectedOption, setStatusSelectedOption] = useState<string[]>(['Read', 'Unread', 'Saved']);
    const [languageSelectedOption, setLanguageSelectedOption] = useState<string>(defaultLanguage);
    const sortOptions = ['Newest', 'Oldest'];
    const statusOptions = ['Read', 'Unread', 'Saved'];
    const isHeaderVisible = useSharedValue<number>(1);
    const { mangaId } = useLocalSearchParams<{ mangaId: string }>();
    const backend = process.env.EXPO_PUBLIC_KOEYOMI_BACKEND;
    const db = useSQLiteContext();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const isHeaderVisibleRef = useRef(true);

    const textStyle = useAnimatedStyle(() => {
        return {
            opacity: isHeaderVisible.value === 0 ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 }),
        };
    });

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        if (offsetY >= headerHeight && isHeaderVisibleRef.current) {
            isHeaderVisibleRef.current = false;
            isHeaderVisible.set(0);
        } else if (offsetY < headerHeight && !isHeaderVisibleRef.current) {
            isHeaderVisibleRef.current = true;
            isHeaderVisible.set(1);
        }
    };

    const handleFavoriteButton = async () => {
        try {
            setIsFavorite(!isFavorite);
            Toast({ message: !isFavorite ? 'Added to favorites' : 'Deleted from favorites' });
            await saveOrDeleteFavorite();
            if (isFavorite && manga) {
                handleCoverDelete(manga.id, db);
            }
        } catch (error) {
            Toast({ message: `${error}` });
        }
    };

    const handleReset = () => {
        setSortSelectedOption(sortOptions[0]);
        setStatusSelectedOption(statusOptions);
        setLanguageSelectedOption(defaultLanguage);
    };

    const sortedChapters = useMemo(() => {
        if (!chapters) return;

        const filtered = chapters.filter((chapter) => {
            if (statusSelectedOption?.length === 0) return false;

            if (statusSelectedOption?.length === 3) return true;

            const matchRead = statusSelectedOption?.includes('Read') && chapter.last_page_read !== '-1';
            const matchUnread = statusSelectedOption?.includes('Unread') && chapter.last_page_read === '-1';
            const matchSaved = statusSelectedOption?.includes('Saved') && chapter.download_status === 'downloaded';

            return matchRead || matchUnread || matchSaved;
        });

        const sorted = filtered.sort((a, b) => {
            const comparison = parseFloat(b.attributes.chapter) - parseFloat(a.attributes.chapter);
            return sortSelectedOption === 'Newest' ? comparison : -comparison;
        });

        if (flatListRef.current && sorted.length > 0) {
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }

        return sorted;
    }, [chapters, sortSelectedOption, statusSelectedOption]);

    async function getIfMangaIsFavorite() {
        try {
            const favoriteManga = await db.getFirstAsync('SELECT * FROM favorites WHERE manga_id = ?', mangaId);

            if (favoriteManga) {
                setIsFavorite(true);
            }
        } catch (error) {
            Toast({ message: 'Error get if favorite' });
        }
    }

    async function saveOrDeleteFavorite() {
        if (isFavorite) {
            await db.runAsync('DELETE FROM favorites WHERE manga_id = ?', [mangaId]);
        } else {
            await db.runAsync('INSERT INTO favorites (user_id, manga_id, timestamp) VALUES (?, ?, ?)', [deviceId, mangaId, `${Date.now()}`]);
        }
    }

    async function fetchMangaInfo() {
        try {
            const savedData = (await db.getFirstAsync('SELECT * FROM mangas WHERE id = ?', [mangaId])) as Manga;

            if (savedData) {
                savedData.attributes = JSON.parse(savedData.attributes.toString());
                savedData.relationships = JSON.parse(savedData.relationships.toString());
                setManga(savedData);
                return;
            }

            if (!backend) throw new Error('Backend URL not defined');

            const response = (await fetcher(backend, `/mangadex/manga/${mangaId}`)) as MangaAPIResponse;

            const resultData = (await saveToDatabase(response)) as Manga;

            setManga(resultData);
        } catch (error) {
            Toast({ message: `Error en el fetchMangaInfo: ${error}` });
            // console.log(error)
        }
    }

    async function fetchMangaChapters() {
        try {
            const savedData = (await db.getAllAsync('SELECT * FROM chapters WHERE manga_id = ?', mangaId)) as Chapters[];

            if (Array.isArray(savedData) && savedData.length > 0) {
                for (const row of savedData) {
                    row.attributes = JSON.parse(row.attributes.toString());
                    row.relationships = JSON.parse(row.relationships.toString());
                }

                const filteredData = savedData.filter((item) => item.attributes.translatedLanguage === languageSelectedOption);

                if (filteredData.length > 0) {
                    setChapters(filteredData);
                    return;
                }
            }

            if (!backend) throw new Error('Backend URL not defined');

            const response = (await fetcher(backend, `/mangadex/manga/${mangaId}/feed?language=${languageSelectedOption}`)) as ChapterAPIResponse;

            const data = (await saveToDatabase(response)) as Chapters[];

            const filteredData = data.filter((item) => item.attributes.translatedLanguage === languageSelectedOption);
            setChapters(filteredData);
        } catch (error) {
            Toast({ message: `Error fetchMangaChapters: ${error}` });
            // console.log(error)
        }
    }

    async function refreshMangaInfo() {
        try {
            const savedData = (await db.getFirstAsync('SELECT * FROM mangas WHERE id = ?', [mangaId])) as Manga;

            savedData.attributes = JSON.parse(savedData.attributes.toString());
            savedData.relationships = JSON.parse(savedData.relationships.toString());

            if (!backend) throw new Error('Backend URL not defined');

            const response = (await fetcher(backend, `/mangadex/manga/${mangaId}`)) as MangaAPIResponse;

            const formatedSavedData = JSON.stringify(savedData);
            const formatedResponse = JSON.stringify(response.data);

            if (formatedSavedData === formatedResponse) {
                return;
            }

            const resultData = await updateMangaInfo(response);

            setManga(resultData);
        } catch (error) {
            Toast({ message: `Error while refreshing manga: ${error}` });
        }
    }

    async function refreshMangaChapters() {
        try {
            const savedData = (await db.getAllAsync('SELECT * FROM chapters WHERE manga_id = ?', [mangaId])) as Chapters[];

            for (const row of savedData) {
                row.attributes = JSON.parse(row.attributes.toString());
                row.relationships = JSON.parse(row.relationships.toString());
            }

            const filteredSavedData = savedData.filter((item) => item.attributes.translatedLanguage === languageSelectedOption);

            if (!backend) throw new Error('Backend URL not defined');

            const response = (await fetcher(backend, `/mangadex/manga/${mangaId}/feed?language=${languageSelectedOption}`)) as ChapterAPIResponse;

            if (filteredSavedData.length === response.data.length) {
                return;
            }

            let savedChaptersIds: string[] = [];
            filteredSavedData.filter((item) => {
                savedChaptersIds.push(item.id);
            });

            let newChapters: Chapters[] = [];
            response.data.filter((item) => {
                if (!savedChaptersIds.includes(item.id)) {
                    newChapters.push(item);
                }
            });

            const refreshedChapters = await updateChapters(newChapters);
            const filteredRefreshData = refreshedChapters.filter((item) => item.attributes.translatedLanguage === languageSelectedOption);
            filteredRefreshData.sort((a, b) => {
                return parseFloat(b.attributes.chapter) - parseFloat(a.attributes.chapter);
            });
            setChapters(filteredRefreshData);

            Toast({ message: `Chapters updated`, duration: ToastAndroid.SHORT });
        } catch (error) {
            Toast({ message: `Error while refreshing chapters: ${error}` });
            // console.log(error)
        }
    }

    async function updateMangaInfo(fetchData: MangaAPIResponse) {
        await db.runAsync('UPDATE mangas SET attributes = ?, relationships = ? WHERE id = ?', [JSON.stringify(fetchData.data.attributes), JSON.stringify(fetchData.data.relationships), mangaId]);

        if (getFileName(manga?.coverImageUrl) !== getFileName(fetchData.data.coverImageUrl)) {
            await handleCoverDownload(fetchData.data, db);
        }

        const savedData = (await db.getFirstAsync('SELECT * FROM mangas WHERE id = ?', [mangaId])) as Manga;

        savedData.attributes = JSON.parse(savedData.attributes.toString());
        savedData.relationships = JSON.parse(savedData.relationships.toString());

        return savedData;
    }

    async function updateChapters(fetchData: Chapters[]) {
        for (const newChapter of fetchData) {
            await db.runAsync('INSERT INTO chapters (id, manga_id, type, attributes, relationships) VALUES (?, ?, ?, ?, ?)', [
                newChapter.id,
                mangaId,
                newChapter.type,
                JSON.stringify(newChapter.attributes),
                JSON.stringify(newChapter.relationships),
            ]);
        }

        const savedData = (await db.getAllAsync('SELECT * FROM chapters WHERE manga_id = ?', [mangaId])) as Chapters[];

        if (Array.isArray(savedData)) {
            for (const row of savedData) {
                row.attributes = JSON.parse(row.attributes.toString());
                row.relationships = JSON.parse(row.relationships.toString());
            }
        }

        return savedData;
    }

    async function saveToDatabase(fetchData: MangaAPIResponse | ChapterAPIResponse) {
        let savedData;
        if (fetchData.response === 'entity') {
            const mangaData = fetchData.data as Manga;
            await db.runAsync('INSERT OR REPLACE INTO mangas (id, type, attributes, relationships, coverImageUrl) VALUES (?, ?, ?, ?, ?)', [
                mangaId,
                mangaData.type,
                JSON.stringify(mangaData.attributes),
                JSON.stringify(mangaData.relationships),
                mangaData.coverImageUrl,
            ]);
        } else {
            const chaptersData = fetchData.data as Chapters[];
            for (const row of chaptersData) {
                await db.runAsync('INSERT OR REPLACE INTO chapters (id, manga_id, type, attributes, relationships) VALUES (?, ?, ?, ?, ?)', [
                    row.id,
                    mangaId,
                    row.type,
                    JSON.stringify(row.attributes),
                    JSON.stringify(row.relationships),
                ]);
            }
        }

        if (fetchData.response === 'entity') {
            savedData = (await db.getFirstAsync('SELECT * FROM mangas WHERE id = ?', [mangaId])) as Manga;
        } else {
            savedData = (await db.getAllAsync('SELECT * FROM chapters WHERE manga_id = ?', [mangaId])) as Chapters[];
        }

        if (savedData) {
            if (Array.isArray(savedData)) {
                for (const row of savedData) {
                    row.attributes = JSON.parse(row.attributes.toString());
                    row.relationships = JSON.parse(row.relationships.toString());
                }
            } else {
                savedData.attributes = JSON.parse(savedData.attributes.toString());
                savedData.relationships = JSON.parse(savedData.relationships.toString());
            }
        }

        return savedData;
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refreshMangaInfo(), refreshMangaChapters()]);
        setRefreshing(false);
    }, [refreshMangaInfo, refreshMangaChapters]);

    useEffect(() => {
        fetchMangaChapters();
    }, [languageSelectedOption]);

    useEffect(() => {
        if (!manga) return;

        setAvailableLanguages(manga.attributes.availableTranslatedLanguages.filter((item) => item === 'es-la' || item === 'en'));

        setTitle(getTitle(manga.attributes));
    }, [manga]);

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([getIfMangaIsFavorite(), fetchMangaInfo(), fetchMangaChapters()]);
                setIsLoading(false);
            } catch (error) {
                Toast({ message: `Error loading data ${error}` });
            }
        };

        loadData();
    }, []);

    return (
        <View style={[styles.container, { paddingTop: statusBarHeight, paddingBottom: insets.bottom }]}>
            <StaticHeader
                hasFilter={true}
                title={title}
                titleStyle={textStyle}
                onLeftActionPress={() => router.back()}>
                <BottomSheetFilter
                    heightDivider={2}
                    onReset={handleReset}>
                    <SegmentedControl
                        options={sortOptions}
                        selectedOption={sortSelectedOption}
                        setSelectedOption={setSortSelectedOption}
                        subtitle='Sort'
                    />
                    <FilterChips
                        options={statusOptions}
                        selectedOptions={statusSelectedOption}
                        setSelectedOptions={setStatusSelectedOption}
                        subtitle='View'
                    />
                    <SegmentedControl
                        options={availableLanguages}
                        selectedOption={languageSelectedOption}
                        setSelectedOption={setLanguageSelectedOption}
                        subtitle='Language'
                        textStyle={{ textTransform: 'uppercase' }}
                    />
                </BottomSheetFilter>
            </StaticHeader>
            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <ActivityIndicator
                        size={'large'}
                        color={Theme.colors.midGray}
                    />
                    <Text style={[styles.languageText, { width: '70%', textAlign: 'center' }]}>Fetching your favorite stories... hang tight, we're gathering all the chapters for you!</Text>
                </View>
            ) : (
                manga &&
                chapters && (
                    <FlatList
                        ref={flatListRef}
                        data={sortedChapters}
                        keyExtractor={(item: Chapters, index) => `${index}-${item.id}`}
                        initialNumToRender={5}
                        maxToRenderPerBatch={10}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10 }}
                        removeClippedSubviews
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
                                description='There are no chapters available in this language. Try selecting a different language from the filters.'
                                IconSet={MaterialCommunityIcons}
                                iconName='book-off-outline'
                            />
                        }
                        renderItem={({ item }) => {
                            return (
                                <>
                                    <ChapterItem
                                        item={item}
                                        title={title}
                                    />
                                    <View style={styles.separator} />
                                </>
                            );
                        }}
                        ListHeaderComponent={
                            <View
                                style={styles.mangaHeader}
                                onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
                                <View style={styles.mangaHeaderTop}>
                                    <View style={[styles.mangaImage, { height: (MAX_WIDTH / 2) * 1.3 }]}>
                                        <Image
                                            cachePolicy={'memory-disk'}
                                            placeholder={{ blurhash: 'KLEv+{so1z$Oo1S41#Wq|t' }}
                                            transition={200}
                                            source={manga.coverImageUrl}
                                            style={{ width: '100%', height: '100%' }}
                                            contentFit='cover'
                                        />
                                    </View>
                                    <View style={styles.mangaInfo}>
                                        <Text
                                            style={styles.title}
                                            numberOfLines={5}
                                            lineBreakMode='tail'>
                                            {title}
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            {manga.attributes.publicationDemographic && <Pill text={manga.attributes.publicationDemographic.toUpperCase()} />}
                                            {manga.attributes.year && <Pill text={manga.attributes.year} />}
                                        </View>
                                        <View style={styles.mangaOptions}>
                                            <BottomSheetInfo data={manga} />
                                            <IconButton
                                                IconSet={Ionicons}
                                                iconName={isFavorite ? 'heart' : 'heart-outline'}
                                                iconColor={isFavorite ? Theme.colors.vermillion : Theme.colors.midGray}
                                                onPress={handleFavoriteButton}
                                                containerStyle={{ borderWidth: 2, borderColor: isFavorite ? Theme.colors.vermillion : Theme.colors.jetgray }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        }
                    />
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: Theme.colors.gunmetalGray,
        marginTop: 10,
    },
    mangaHeader: {
        width: '100%',
        padding: 20,

        gap: 20,
    },
    mangaHeaderTop: {
        width: '100%',
        flexDirection: 'row',
        gap: 20,
    },
    mangaHeaderBottom: {
        width: '100%',
        flexDirection: 'column',
        gap: 20,
    },
    mangaImage: {
        flex: 1,
        overflow: 'hidden',

        borderRadius: Theme.borders.cardItem,
    },
    mangaInfo: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    title: {
        fontSize: Theme.fonts.title,
        fontWeight: 'bold',
        textAlign: 'center',
        color: Theme.colors.lightGray,
    },
    mangaOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    //Language Selector
    languageSelector: {
        marginTop: 10,
        paddingHorizontal: 10,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    languageItem: {
        width: 100,
        backgroundColor: Theme.colors.gunmetalGray,
        paddingHorizontal: 15,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,

        borderBottomWidth: 2,
        borderColor: Theme.colors.midGray,
        borderTopEndRadius: Theme.borders.cardItem,
        borderTopStartRadius: Theme.borders.cardItem,
    },
    languageText: {
        fontSize: Theme.fonts.paragraph,
        fontWeight: 'bold',
        color: Theme.colors.midGray,
    },

    //Manga Footer
    mangaFooter: {
        width: MAX_WIDTH,
        height: 70,

        alignItems: 'center',
        justifyContent: 'center',
    },
    mangaLoader: {
        backgroundColor: Theme.colors.gunmetalGray,
        paddingVertical: 3,
        paddingHorizontal: 20,
        margin: 10,

        alignItems: 'center',
        justifyContent: 'center',

        borderRadius: 20,
    },
    mangaLoaderText: {
        fontSize: Theme.fonts.tiny,
        color: Theme.colors.midGray,
    },
});
