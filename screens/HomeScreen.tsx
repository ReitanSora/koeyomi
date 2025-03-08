import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableNativeFeedback, useWindowDimensions, Dimensions, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../theme/Theme';
import { Image } from 'expo-image';
import { useEffect, useLayoutEffect, useState } from 'react';
import Animated, { CurvedTransition, FadeInRight } from 'react-native-reanimated';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
const exampleData = [
    {
        id: 1,
        title: 'Boku no Kokoro no Yabai Yatsu',
        image: ''
    },
    {
        id: 2,
        title: 'Boku no Hero',
        image: require('../assets/2.jpg')
    },
    {
        id: 3,
        title: 'Shingeki no Kyojin',
        image: require('../assets/2.jpg')
    },
    {
        id: 4,
        title: 'Clannad',
        image: require('../assets/1.png')
    },
    {
        id: 5,
        title: 'Kaoru Hana wa Rin to Saku',
        image: require('../assets/1.png')
    },
    {
        id: 6,
        title: 'Sono Bisque Doll wa Koi wo Suru',
        image: require('../assets/2.jpg')
    },
]

export default function HomeScreen() {

    const [mangaItems, setMangaItems] = useState(exampleData);
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState(2);
    const [loading, setLoading] = useState(false);
    const [visibleSearchBar, setVisibleSearchBar] = useState(false);
    const navigation = useNavigation();
    const SCREEN_WIDTH = useWindowDimensions().width;
    const SCREEN_HEIGHT = useWindowDimensions().height;
    const blurhash =
  'L68{CzsEJ5s?Orbc}1bHEZoLW9j?';


    const searchFilterFunction = (text: string) => {
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
    };

    useEffect(() => {
        setFilteredData(mangaItems);
    }, []);

    useLayoutEffect(() => {
        const commonOptions = {
            headerTitle: '',
            headerRight: () => (
                <View style={styles.headerButtons}>
                    <View style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                            useForeground={true}
                            onPress={() => {
                                setVisibleSearchBar(!visibleSearchBar);
                                searchFilterFunction('');
                                }}>
                            <View style={[styles.circleButton, visibleSearchBar ? { backgroundColor: Theme.colors.lightGray } : { backgroundColor: Theme.colors.vermillion, }]}>
                                {visibleSearchBar ? <Ionicons name="close" size={24} color={Theme.colors.vermillion} /> : <FontAwesome5 name="search" size={15} color={Theme.colors.lightWhite} />}
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                    <View style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                            useForeground={true}>
                            <View style={styles.circleButton}>
                                <FontAwesome6 name="filter" size={15} color={Theme.colors.lightGray} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            ),
        };

        const additionalOptions = visibleSearchBar ? {
            headerLeft: () => (
                <Animated.View
                    entering={
                        //FadeInRight.duration(300)
                        FadeInRight.springify()
                        .duration(500)
                        .damping(1)
                        .stiffness(100)
                    }
                    style={[styles.headerSearchBarContainer]}
                >
                    <FontAwesome5 name="search" size={15} color={Theme.colors.lightGray} />
                    <TextInput
                        placeholder='Buscar...'
                        placeholderTextColor={Theme.colors.lightGray}
                        keyboardType='default'
                        numberOfLines={1}
                        maxLength={20}
                        cursorColor={Theme.colors.vermillion}
                        selectionColor={Theme.colors.vermillion}
                        selectionHandleColor={Theme.colors.midGray}
                        autoCapitalize='none'
                        autoFocus={false}
                        autoCorrect={false}
                        spellCheck={false}
                        onChangeText={newText => searchFilterFunction(newText)}
                        style={[styles.headerSearchBarInput, { width: (SCREEN_WIDTH / 3) }]} />
                </Animated.View>
            ),
        } : {
            headerLeft: () => (
                <View>
                    <Animated.Text
                        entering={
                            //FadeInRight.duration(300)
                            FadeInRight.springify()
                            .duration(500)
                            .damping(1)
                            .stiffness(100)
                        }
                        style={styles.headerTitle}>Librería</Animated.Text>
                </View>
            ),
        };

        navigation.setOptions({
            ...commonOptions,
            ...additionalOptions
        })

    }, [navigation, visibleSearchBar]);

    Dimensions.addEventListener("change", () => {
        if (SCREEN_WIDTH > SCREEN_HEIGHT) {
            setColumns(2);
        } else {
            setColumns(5);
        }
    });

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.homeContainer}>
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
                                        navigation.navigate("MangaDetailsScreen");
                                        setVisibleSearchBar(false);
                                        }}>
                                    <View style={styles.mangaItem}>
                                        <Image cachePolicy={'none'} placeholder={{ blurhash }} transition={1000} source={item.image} style={[styles.mangaItemImage, { width: '100%' }]} contentFit='cover' />
                                        <View  style={[styles.mangaItemFooter, columns > 2 ? { height: 20 } : { height: 30 }]}>
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

const styles = StyleSheet.create({
    homeContainer: {
        height: '100%',
        backgroundColor: Theme.colors.charcoalBlack,
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
        height: 40
    },
    headerTitle: {
        fontSize: Theme.fonts.title,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
    mangaListContainer: {
        gap: 10,
        backgroundColor: Theme.colors.charcoalBlack,
        padding: 10,
        overflow: 'hidden',
    },
    mangaItemContainer: {
        flex: 1,
        borderRadius: Theme.borders.cardItem,
        overflow: 'hidden',
    },
    mangaItem: {
        flex: 1,
    },
    mangaItemImage: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    mangaItemFooter: {
        bottom: 0,
        backgroundColor: Theme.colors.midGray,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        overflow: 'hidden',
    },
    mangaItemTitle: {
        flexWrap: 'nowrap',
        color: Theme.colors.white,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    circleButton: {
        width: 40,
        height: 40,
        backgroundColor: Theme.colors.vermillion,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
