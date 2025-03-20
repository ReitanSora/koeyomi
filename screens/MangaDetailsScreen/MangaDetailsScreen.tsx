import { View, Text, Button, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme/Theme';
import { memo, PureComponent, ReactNode, useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HeaderBackButton from '../../components/HeaderBackButton/HeaderBackButton';
import { fetcher } from '../../services/fetcher';
import { styles } from './MangaDetailsScreen.styles';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import Accordion from '../../components/Accordion/Accordion';
import { MAX_HEIGHT } from '../../constants/Constants';

export default function MangaDetailsScreen({ route }) {

    const [manga, setManga] = useState<object>()
    const [language, setLanguage] = useState('es-la');
    const [chapters, setChapters] = useState<object>();
    const { id } = route.params;
    const blurhash = 'L68{CzsEJ5s?Orbc}1bHEZoLW9j?';
    const navigation = useNavigation();

    const handleBrowserAsync = async (id: string) => {
        await WebBrowser.openBrowserAsync(`https://myanimelist.net/manga/${id}`)
    }

    const ChapterItem = memo(({ item }) => {
        return (
            <Text key={`title-${item.id}`}>{item.attributes.title}</Text>
        )
    })

    useEffect(() => {
        const getDetails = async () => {
            const response = await fetcher('http://192.168.1.9:4040', `/mangadex/manga/${id}`) as object;
            const chapters = await fetcher('http://192.168.1.9:4040', `/mangadex/manga/${id}/feed?limit=yes&language=${language}`) as object;
            setManga(response)
            setChapters(chapters)

        };

        getDetails()
    }, [])

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <HeaderBackButton />
                {manga && chapters ?
                    <FlatList
                        data={chapters.data}
                        keyExtractor={(item) => `${item.id}-${item.attributes.translatedLanguage}`}
                        initialNumToRender={20}
                        maxToRenderPerBatch={10}
                        windowSize={11}
                        removeClippedSubviews={true}
                        renderItem={({ item }) => {
                            return (
                                <ChapterItem item={item} />
                            )
                        }}
                        // contentContainerStyle={styles.mangaChapters}
                        style={{height: MAX_HEIGHT - 55}}
                        ListHeaderComponent={
                            <>
                                <View style={styles.mangaHeader}>
                                    <View style={styles.mangaImage}>
                                        <Image placeholder={{ blurhash }} transition={500} source={manga.data.coverImageUrl} style={{ width: '100%', height: '100%' }} contentFit='cover'></Image>
                                    </View>
                                    <View style={styles.mangaInfo}>
                                        <View style={styles.mangaTitle}>
                                            <Text style={styles.title}>
                                                {manga.data.attributes.title.ja ? manga.data.attributes.title.ja : manga.data.attributes.title.en}
                                            </Text>
                                            <View style={styles.author}>
                                                <Ionicons name="person-circle-outline" size={15} color={Theme.colors.midGray} />
                                                <Text style={styles.authorText}>
                                                    {manga.data.relationships.find((item) => item.type === 'author').attributes.name}
                                                </Text>
                                            </View>
                                            <View style={styles.status}>
                                                {manga.data.attributes.status === 'completed' ?
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
                                                    style={[styles.statusText, manga.data.attributes.status === 'completed' ? { color: Theme.colors.midGray } : { color: Theme.colors.vermillion }]}>
                                                    {manga.data.attributes.status === 'ongoing' ? 'En Curso' : 'Finalizado'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.mangaGenres}>
                                            {manga.data.attributes.tags.filter(tag => tag.attributes?.group === 'genre').map((tag) => {
                                                return (
                                                    <View style={styles.genre} key={`${manga.data.id}-genre-${tag.attributes.name.en}`}>
                                                        <Text numberOfLines={1} style={styles.genreText}>{tag.attributes.name.en}</Text>
                                                    </View>
                                                )
                                            })}
                                        </View>
                                        <View style={styles.mangaOptions}>
                                            <TouchableOpacity>
                                                <View style={[styles.button]}>
                                                    <MaterialCommunityIcons name="heart-multiple-outline" size={18} color={Theme.colors.midGray} />
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleBrowserAsync(manga.data.attributes.links.mal)}>
                                                <View style={[styles.button]}>
                                                    <Ionicons name="planet-outline" size={18} color={Theme.colors.midGray} />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.mangaDescription}>
                                    <Accordion content={manga.data.attributes.description['es-la'] ? manga.data.attributes.description['es-la'] : manga.data.attributes.description.en}></Accordion>
                                </View>

                            </>
                        }
                        ListFooterComponent={
                            <View>
                                {chapters.fetchStatus === 'partial' ?
                                    <Text>Cargar todos...</Text> : <></>}
                            </View>
                        }
                    /> : <></>
                }
            </SafeAreaView>
        </SafeAreaProvider>
    );
};
