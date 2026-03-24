import { View, Text, TouchableNativeFeedback, FlatList } from 'react-native';
import { styles } from './SearchScreen.style';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { Theme } from '../../theme/Theme';
import { Entypo } from '@expo/vector-icons';
import Header from '../../components/Header/Header';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { fetcher } from '../../services/fetcher';

export default function SearchScreen() {

    const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
    const [searchTitle, setSearchTitle] = useState('');
    const [searchResults, setSearchResults] = useState<object>();
    const flatListRef = useRef(null);
    const navigation = useNavigation();
    const blurhash = 'L68{CzsEJ5s?Orbc}1bHEZoLW9j?';

    const handleSearch = async () => {
        if (searchTitle.trim().length > 0) {
            try {
                const response = await fetcher(process.env.EXPO_PUBLIC_KOEYOMI_BACKEND,`/mangadex/search?title=${encodeURIComponent(searchTitle)}`) as object;
                setSearchResults(response);
            } catch (error) {
                console.log('Error searching:', error)
            }
        }
    };

    const handleBackPress = () => {
        if (isSearchBarVisible) {
            setIsSearchBarVisible(false);
            return true;
        }
        return false
    }

    const handleCloseSearchBar = () => {
        setSearchTitle('');
    }

    const handleChangeText = (text: string) => {
        setSearchTitle(text);
    }

    navigation.addListener('blur', handleBackPress)

    useEffect(() => {
        if (flatListRef.current && searchResults.data.length > 0) {
            flatListRef.current.scrollToOffset({ animeted: true, offset: 0 })
        }
    }, [searchResults])


    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.SearchContainer}>
                <Header
                    isSearchBarVisible={isSearchBarVisible}
                    setIsSearchBarVisible={setIsSearchBarVisible}
                    title={'Search'}
                    isFilterSearch={false}
                    inputValue={searchTitle}
                    handleSearch={handleSearch}
                    handleClose={handleCloseSearchBar}
                    handleChangeText={handleChangeText} />
                {searchResults &&
                    <FlatList
                        data={searchResults.data}
                        ref={flatListRef}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        style={{ flexGrow: 1 }}
                        contentContainerStyle={styles.mangaListContainer}
                        initialNumToRender={6}
                        maxToRenderPerBatch={12}
                        windowSize={10}
                        removeClippedSubviews={true}
                        renderItem={({ item }) => {
                            return (
                                // <View>
                                //     <Image placeholder={{ blurhash }} transition={500} source={item.coverImageUrl} style={{ width: 100, height: 200, marginLeft: 10 }} contentFit='cover'></Image>
                                //     <Text>{item.attributes.title.en}</Text>
                                // </View>
                                <View style={styles.mangaItemWrapper}>
                                    <TouchableNativeFeedback
                                        background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                                        useForeground={true}
                                        onPress={() => {
                                            navigation.navigate('MangaDetailsStack', {
                                                screen: 'MangaDetailsScreen',
                                                params: { id: item.id }
                                            })
                                        }}
                                    >
                                        <View style={styles.mangaItemContainer}>
                                            <View style={styles.mangaItemImage}>
                                                <Image placeholder={{ blurhash }} transition={500} source={item.coverImageUrl} style={{ width: '100%', height: '100%' }} contentFit='cover'></Image>
                                            </View>
                                            <View style={styles.mangaItemInfo}>{/*Aqui modificar el width cuando la pantalla gira a modo horizontal */}
                                                <View style={styles.mangaItemInfoHeader}>
                                                    <View style={styles.title}>
                                                        <Text
                                                            numberOfLines={1}
                                                            ellipsizeMode='tail'
                                                            style={styles.titleText}>
                                                            {item.attributes.title.ja !== "" ? item.attributes.title.ja : (item.attributes.title["ja-ro"] ? item.attributes.title["ja-ro"] : (item.attributes.title.en ? item.attributes.title.en : item.attributes.title["zh-ro"]))}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.status}>
                                                        <Entypo
                                                            name="controller-record"
                                                            size={12}
                                                            color={item.attributes.status === 'completed' ? Theme.colors.midGray : Theme.colors.vermillion} />
                                                        <Text
                                                            ellipsizeMode='tail'
                                                            style={[styles.statusText, item.attributes.status === 'completed' ? { color: Theme.colors.midGray } : { color: Theme.colors.vermillion }]}>
                                                            {item.attributes.status === 'ongoing' ? 'En Curso' : 'Finalizado'}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View style={styles.mangaItemInfoGenres}>
                                                    {item.attributes.tags.filter(tag => tag.attributes?.group === 'genre').map((tag) => {
                                                        return (
                                                            <View style={styles.genre} key={`${item.id}-genre-${tag.attributes.name.en}`}>
                                                                <Text numberOfLines={1} style={styles.genreText}>{tag.attributes.name.en}</Text>
                                                            </View>
                                                        )
                                                    })}
                                                </View>
                                                <View style={styles.mangaItemDescription}>
                                                    <Text
                                                        numberOfLines={6}
                                                        ellipsizeMode='tail'
                                                        style={styles.descriptionText}>
                                                        {item.attributes.description['es-la'] ?
                                                            item.attributes.description['es-la'] :
                                                            item.attributes.description['en']}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>

                            )
                        }}
                    />}
            </SafeAreaView>
        </SafeAreaProvider>
    );
};
