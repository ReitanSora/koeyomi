import Accordion from '@/components/Accordion/Accordion';
import ChapterItem from '@/components/ChapterItem/ChapterItem';
import { MexicoFlag, UnitedStatesFlag } from '@/components/Flags/Flags';
import HeaderBackButton from '@/components/HeaderBackButton/HeaderBackButton';
import Toast from '@/components/Toast/Toast';
import { MAX_HEIGHT, MAX_WIDTH } from '@/Constants';
import { fetcher } from '@/services/fetcher';
import { Theme } from '@/Theme';
import { ChapterInfo } from '@/types/Chapter';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, ToastAndroid, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MangaDetailsScreen() {

    const [manga, setManga] = useState<object>()
    const [mangaFormat, setMangaFormat] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [language, setLanguage] = useState<string>('en');
    const [chapters, setChapters] = useState<[object]>();
    const [availableLanguages, setAvailableLanguages] = useState<[]>();

    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { id } = useLocalSearchParams();

    const db = useSQLiteContext()
    const insets = useSafeAreaInsets();

    const handleBrowserAsync = async (id: string) => {
        await WebBrowser.openBrowserAsync(`${process.env.EXPO_PUBLIC_MYANIMELIST_BASE_URL}/manga/${id}`)
    };

    const handleLanguageSelector = async (key: string) => {
        setLanguage(key);
    };

    const handleFavoriteButton = async () => {
        setIsFavorite(!isFavorite);
        Toast({ message: !isFavorite ? 'Added to favorites' : 'Deleted from favorites' })
        await saveOrDeleteFavorite()
    }

    async function getFavoriteManga() {
        try {
            const favoriteManga = await db.getFirstAsync(
                'SELECT * FROM favorites WHERE manga_id = ?',
                [id]
            );

            if (favoriteManga) {
                setIsFavorite(true);
            }
        } catch (error) {
            console.log('Error get favorite manga', error)
        }
    }

    async function saveOrDeleteFavorite() {
        if (isFavorite) {
            await db.runAsync('DELETE FROM favorites WHERE manga_id = ?', [id])
        } else {
            await db.runAsync(
                'INSERT INTO favorites (user_id, manga_id) VALUES (? ,?)',
                [
                    'Redmi-2015-2201117TL-13',
                    id
                ]
            );
        }

    }

    async function fetchMangaChapters() {
        try {
            const savedData = await db.getAllAsync(
                'SELECT * FROM chapters WHERE manga_id = ?',
                [id]
            );

            if (Array.isArray(savedData) && savedData.length > 0) {
                for (const row of savedData) {
                    row.attributes = JSON.parse(row.attributes);
                    row.relationships = JSON.parse(row.relationships);
                };
                const filteredData = savedData.filter((item) => item.attributes.translatedLanguage === language)
                if (filteredData.length > 0) {
                    filteredData.sort((a, b) => {
                        return parseFloat(b.attributes.chapter) - parseFloat(a.attributes.chapter);
                    })
                    setChapters(filteredData)
                    return;
                }
            };

            const response = await fetcher(
                process.env.EXPO_PUBLIC_KOEYOMI_BACKEND,
                `/mangadex/manga/${id}/feed?language=${language}`
            );

            const data = await saveToDatabase(
                'chapters',
                response
            );
            const filteredData = data.filter((item) => item.attributes.translatedLanguage === language)
            filteredData.sort((a, b) => {
                return parseFloat(b.attributes.chapter) - parseFloat(a.attributes.chapter);
            })
            setChapters(filteredData)

        } catch (error) {
            Toast({ message: `Error en el fetchMangaChapters: ${error}` })
            console.log(error)
        }
    }

    async function fetchMangaInfo() {
        try {
            const savedData = await db.getFirstAsync(
                'SELECT * FROM mangas WHERE id = ?',
                [id]
            );

            if (savedData) {
                savedData.attributes = JSON.parse(savedData.attributes);
                savedData.relationships = JSON.parse(savedData.relationships);
                setManga(savedData);
                return;
            };

            const response = await fetcher(
                process.env.EXPO_PUBLIC_KOEYOMI_BACKEND,
                `/mangadex/manga/${id}`
            )

            const resultData = await saveToDatabase(
                'mangas',
                response
            );

            setManga(resultData);

        } catch (error) {
            Toast({ message: `Error en el fetchMangaInfo: ${error}` })
            console.log(error)
        }

    };

    async function refreshMangaInfo() {
        try {
            const savedData = await db.getFirstAsync(
                'SELECT * FROM mangas WHERE id = ?',
                [id]
            );

            savedData.attributes = JSON.parse(savedData.attributes);
            savedData.relationships = JSON.parse(savedData.relationships);

            const response = await fetcher(
                process.env.EXPO_PUBLIC_KOEYOMI_BACKEND,
                `/mangadex/manga/${id}`
            );
            const formatedSavedData = JSON.stringify(savedData);
            const formatedResponse = JSON.stringify(response.data);

            if (formatedSavedData === formatedResponse) {
                Toast({ message: `MangaInfo up to date`, duration: ToastAndroid.SHORT });
                return;
            };

            const resultData = await updateMangaInfo(response);

            setManga(resultData);

            Toast({ message: `MangaInfo updated`, duration: ToastAndroid.SHORT })
        } catch (error) {
            Toast({ message: `Error while refreshing manga: ${error}` })
            console.log(error)
        }
    }

    async function refreshMangaChapters() {
        try {
            const savedData = await db.getAllAsync(
                'SELECT * FROM chapters WHERE manga_id = ?',
                [id]
            );

            for (const row of savedData) {
                row.attributes = JSON.parse(row.attributes);
                row.relationships = JSON.parse(row.relationships);
            };

            const filteredSavedData = savedData.filter((item) => item.attributes.translatedLanguage === language);

            const response = await fetcher(
                process.env.EXPO_PUBLIC_KOEYOMI_BACKEND,
                `/mangadex/manga/${id}/feed?language=${language}`
            );

            if (filteredSavedData.length === response.data.length) {
                Toast({ message: `Chapters up to date`, duration: ToastAndroid.SHORT })
                return;
            };

            let savedChaptersIds: any[] = [];
            filteredSavedData.filter((item) => {
                savedChaptersIds.push(item.id);
            });

            let newChapters: any[] = [];
            response.data.filter((item) => {
                if (!savedChaptersIds.includes(item.id)) {
                    newChapters.push(item);
                }
            })

            const refreshedChapters = await updateChapters(newChapters);
            const filteredRefreshData = refreshedChapters.filter((item) => item.attributes.translatedLanguage === language);
            filteredRefreshData.sort((a, b) => {
                return parseFloat(b.attributes.chapter) - parseFloat(a.attributes.chapter);
            })
            setChapters(filteredRefreshData);

            Toast({ message: `Chapters updated`, duration: ToastAndroid.SHORT })
        } catch (error) {
            Toast({ message: `Error while refreshing chapters: ${error}` })
            console.log(error)
        }


    }

    async function updateMangaInfo(fetchData: object) {
        await db.runAsync(
            'UPDATE mangas SET attributes = ?, relationships = ?, coverImageUrl = ? WHERE id = ?',
            [
                JSON.stringify(fetchData.data.attributes),
                JSON.stringify(fetchData.data.relationships),
                fetchData.data.coverImageUrl,
                id
            ]
        );

        const savedData = await db.getFirstAsync('SELECT * FROM mangas WHERE id = ?', [id]);

        savedData.attributes = JSON.parse(savedData.attributes);
        savedData.relationships = JSON.parse(savedData.relationships);

        return savedData;
    }

    async function updateChapters(fetchData: []) {
        for (const newChapter of fetchData) {
            await db.runAsync(
                'INSERT INTO chapters (id, manga_id, type, attributes, relationships) VALUES (?, ?, ?, ?, ?)',
                [
                    newChapter.id,
                    id,
                    newChapter.type,
                    JSON.stringify(newChapter.attributes),
                    JSON.stringify(newChapter.relationships)
                ]
            );
        };

        const savedData = await db.getAllAsync('SELECT * FROM chapters WHERE manga_id = ?', [id]);

        if (Array.isArray(savedData)) {
            for (const row of savedData) {
                row.attributes = JSON.parse(row.attributes);
                row.relationships = JSON.parse(row.relationships);
            }
        }

        return savedData;
    }

    async function saveToDatabase(entity: string, fetchData: object | []) {
        let savedData;
        if (entity === 'mangas') {
            await db.runAsync(
                'INSERT INTO mangas (id, type, attributes, relationships, coverImageUrl) VALUES (?, ?, ?, ?, ?)',
                [
                    id,
                    fetchData.data.type,
                    JSON.stringify(fetchData.data.attributes),
                    JSON.stringify(fetchData.data.relationships),
                    fetchData.data.coverImageUrl
                ]
            );
        } else {
            for (const row of fetchData.data) {
                await db.runAsync(
                    'INSERT INTO chapters (id, manga_id, type, attributes, relationships) VALUES (?, ?, ?, ?, ?)',
                    [
                        row.id,
                        id,
                        row.type,
                        JSON.stringify(row.attributes),
                        JSON.stringify(row.relationships)
                    ]
                );
            }
        }

        if (entity === 'mangas') {
            savedData = await db.getFirstAsync('SELECT * FROM mangas WHERE id = ?', [id]);
        } else {
            savedData = await db.getAllAsync('SELECT * FROM chapters WHERE manga_id = ?', [id]);
        }

        if (savedData) {
            if (Array.isArray(savedData)) {
                for (const row of savedData) {
                    row.attributes = JSON.parse(row.attributes);
                    row.relationships = JSON.parse(row.relationships);
                }
            } else {
                savedData.attributes = JSON.parse(savedData.attributes);
                savedData.relationships = JSON.parse(savedData.relationships);
            }
        }


        return savedData;
    }

    const onRefresh = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                refreshMangaInfo(),
                refreshMangaChapters()
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    getFavoriteManga(),
                    fetchMangaInfo(),
                    fetchMangaChapters(),
                ])
            } catch (error) {
                Toast({ message: `Error loading data ${error}` })
            }
        }

        loadData();
    }, [])

    useEffect(() => {
        fetchMangaChapters();
    }, [language])

    useEffect(() => {
        if (!manga) return;

        setAvailableLanguages(manga.attributes.availableTranslatedLanguages.filter(item => {
            if (item === 'es-la' || item === 'en') { return item }
        }))

        const format = manga.attributes.tags?.find(
            (item) => item.attributes?.name?.en === 'Long Strip'
        );
        setMangaFormat(format ? format.attributes.name.en : 'Normal');

        const tempTitle = manga.attributes.title.ja !== "" ? manga.attributes.title.ja : (manga.attributes.title["ja-ro"] ? manga.attributes.title["ja-ro"] : (manga.attributes.title.en ? manga.attributes.title.en : manga.attributes.title["zh-ro"]))
        setTitle(tempTitle);

    }, [manga]);

    return (
        <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <HeaderBackButton />
            {manga && chapters ?
                <FlatList
                    data={chapters}
                    keyExtractor={(item: ChapterInfo) => `${item.id}-${item.attributes.translatedLanguage}`}
                    initialNumToRender={30}
                    maxToRenderPerBatch={20}
                    windowSize={31}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={onRefresh}
                            colors={[Theme.colors.jetgray]}
                            progressBackgroundColor={Theme.colors.midGray}
                        />
                    }
                    renderItem={({ item }) => {
                        return (
                            <ChapterItem item={item} format={mangaFormat} title={title} />
                        )
                    }}
                    style={{ height: MAX_HEIGHT - 55 }}
                    ListHeaderComponent={
                        <>
                            <View style={styles.mangaHeader}>
                                <View style={styles.mangaImage}>
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
                                    <View style={styles.mangaTitle}>
                                        <Text style={styles.title}>
                                            {title}
                                        </Text>
                                        <View style={styles.author}>
                                            <Ionicons name="person-circle-outline" size={15} color={Theme.colors.midGray} />
                                            <Text style={styles.authorText}>
                                                {manga.relationships.find((item) => item.type === 'author').attributes.name}
                                            </Text>
                                        </View>
                                        <View style={styles.status}>
                                            {manga.attributes.status === 'completed' ?
                                                <Ionicons
                                                    name="checkmark-done-circle-outline"
                                                    size={15}
                                                    color={Theme.colors.midGray} /> :
                                                <MaterialCommunityIcons
                                                    name="record-circle-outline"
                                                    size={15}
                                                    color={Theme.colors.vermillion} />
                                            }
                                            <Text
                                                style={[styles.statusText, manga.attributes.status === 'completed' ? { color: Theme.colors.midGray } : { color: Theme.colors.vermillion }]}>
                                                {manga.attributes.status === 'ongoing' ? 'En Curso' : 'Finalizado'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.mangaGenres}>
                                        {manga.attributes.tags.filter(tag => tag.attributes?.group === 'genre').map((tag) => {
                                            return (
                                                <View style={styles.genre} key={`${manga.id}-genre-${tag.attributes.name.en}`}>
                                                    <Text numberOfLines={1} style={styles.genreText}>{tag.attributes.name.en}</Text>
                                                </View>
                                            )
                                        })}
                                    </View>
                                    <View style={styles.mangaOptions}>
                                        <TouchableOpacity onPress={handleFavoriteButton}>
                                            <View style={[styles.button, isFavorite && { borderColor: Theme.colors.vermillion }]}>
                                                {isFavorite
                                                    ? <MaterialCommunityIcons name="heart-multiple" size={18} color={Theme.colors.vermillion} />
                                                    : <MaterialCommunityIcons name="heart-multiple-outline" size={18} color={Theme.colors.midGray} />
                                                }
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleBrowserAsync(manga.attributes.links.mal)}>
                                            <View style={[styles.button]}>
                                                <Ionicons name="planet-outline" size={18} color={Theme.colors.midGray} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.mangaDescription}>
                                <Accordion content={manga.attributes.description['es-la'] ? manga.attributes.description['es-la'] : manga.attributes.description.en}></Accordion>
                            </View>
                            <View style={styles.languageSelector}>
                                {availableLanguages?.map(item => {
                                    return (
                                        <View
                                            style={{ borderTopEndRadius: Theme.borders.cardItem, borderTopStartRadius: Theme.borders.cardItem, overflow: 'hidden' }}
                                            key={`languageOption-${item}`}
                                        >
                                            <TouchableNativeFeedback
                                                background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                                                useForeground={true}
                                                onPress={() => handleLanguageSelector(item)}
                                            >
                                                <Animated.View
                                                    style={[styles.languageItem, language === item ? { backgroundColor: Theme.colors.jetgray } : { opacity: 0.4 }]}
                                                >
                                                    <Text style={styles.languageText}>{`${item.toUpperCase()}`}</Text>
                                                    {item === 'en' ? <UnitedStatesFlag width={16} /> : <MexicoFlag width={16} />}
                                                </Animated.View>
                                            </TouchableNativeFeedback>
                                        </View>
                                    )
                                })
                                }
                            </View>
                        </>
                    }
                    ListFooterComponent={
                        <>
                            <View style={styles.mangaFooter}>
                                {/* {mangaFetchStatus === 'partial' &&
                                        <TouchableOpacity onPress={handleLimitChapter}>
                                            <View style={styles.mangaLoader}>
                                                <Animated.View style={animatedLimit}>
                                                    <Ionicons name="reload" size={18} color={Theme.colors.vermillion} />
                                                </Animated.View>
                                                <Text style={styles.mangaLoaderText}>Cargar todos</Text>
                                            </View>
                                        </TouchableOpacity>
                                    } */}
                            </View>
                        </>
                    }
                /> : <></>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: MAX_HEIGHT - 55,
    },
    loadingText: {
        color: Theme.colors.midGray,
        fontSize: Theme.fonts.paragraph,
    },
    mangaContainer: {
        width: '100%',
        flex: 1,
        // height: MAX_HEIGHT-55,
    },
    mangaHeader: {
        width: '100%',
        padding: 10,

        flexDirection: 'row',
        gap: 10,
    },
    mangaImage: {
        width: 150,
        height: 225,

        overflow: 'hidden',

        borderRadius: Theme.borders.image
    },
    mangaInfo: {
        width: MAX_WIDTH - 180,

        flexDirection: 'column',
        gap: 10,
    },
    mangaTitle: {
        gap: 5,
    },
    title: {
        fontSize: Theme.fonts.title,
        color: Theme.colors.lightGray,
    },
    author: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    authorText: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    status: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statusText: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    mangaGenres: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    genre: {
        backgroundColor: Theme.colors.jetgray,
        paddingHorizontal: 10,
        paddingVertical: 3,

        alignItems: 'center',
        justifyContent: 'center',

        // borderWidth: 1,
        // borderColor: Theme.colors.midGray,
        borderRadius: 20
    },
    genreText: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    mangaOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    button: {
        width: 35,
        height: 35,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 1,
        borderColor: Theme.colors.midGray,
        borderRadius: Theme.borders.circle,
    },
    mangaDescription: {
        width: '100%',
        paddingHorizontal: 10,
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
})