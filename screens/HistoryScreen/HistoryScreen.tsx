import { useEffect, useState } from 'react';
import { View, Text, TouchableNativeFeedback, RefreshControl } from 'react-native';
import Toast from '../../components/Toast/Toast';
import { useSQLiteContext } from 'expo-sqlite';
import { FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import { styles } from './HistoryScreen.styles';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/Theme';

export default function HistoryScreen() {
    const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<[]>();
    const [records, setRecords] = useState<[]>();

    const db = useSQLiteContext();

    async function getRecords() {
        const savedRecords = await db.getAllAsync(
            `SELECT mangas.attributes as manga_attributes, mangas.coverImageUrl, chapters.attributes as chapter_attributes, chapters.id, records.timestamp
            FROM mangas, chapters, records
            WHERE records.chapter_id=chapters.id AND chapters.manga_id=mangas.id`
        );

        for (const savedRecord of savedRecords) {
            savedRecord.chapter_attributes = JSON.parse(savedRecord.chapter_attributes);
            savedRecord.manga_attributes = JSON.parse(savedRecord.manga_attributes);
            savedRecord.formated_timestamp = new Date(parseFloat(savedRecord.timestamp));
        };

        savedRecords.sort((a, b) => {
            return b.formated_timestamp - a.formated_timestamp;
        })

        setRecords(savedRecords)
    };

    const handleCloseSearchBar = () => {
        setFilteredData(records);
    };

    const onRefresh = () => {
        setIsLoading(true);
        db.withTransactionAsync(async () => {
            await getRecords();
        })
        setIsLoading(false);
    };

    useEffect(() => {
        try {
            db.withTransactionAsync(async () => {
                await getRecords();
            })
        } catch (error) {
            Toast({ message: `Error while loading. ${error}` })
        }
    }, []);

    useEffect(() => {
        setFilteredData(records);
    }, [records])

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.historyContainer}>
                <Header
                    title={'History'}
                    isFilterSearch={true}
                    isSearchBarVisible={isSearchBarVisible}
                    setIsSearchBarVisible={setIsSearchBarVisible}
                    handleClose={handleCloseSearchBar}
                />
                {records &&
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => `record-chapter-${item.id}`}
                        initialNumToRender={60}
                        maxToRenderPerBatch={40}
                        windowSize={31}
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoading}
                                onRefresh={onRefresh}
                                colors={[Theme.colors.jetgray]}
                                progressBackgroundColor={Theme.colors.midGray}
                            />
                        }
                        contentContainerStyle={{ padding: 10, gap: 10 }}
                        renderItem={({ item }) => {
                            return (
                                <View>
                                    <TouchableNativeFeedback
                                        background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                                        useForeground={true}
                                    >
                                        <View style={styles.chapterItem}>
                                            <View style={styles.imageContainer}>
                                                <Image
                                                    cachePolicy={'memory-disk'}
                                                    // transition={200}
                                                    source={item.coverImageUrl}
                                                    style={{ width: '100%', height: '100%' }}
                                                    contentFit='cover'
                                                />
                                            </View>
                                            <View style={styles.infoContainer}>
                                                <Text
                                                    numberOfLines={1}
                                                    lineBreakMode='tail'
                                                    style={styles.chapterText}
                                                >
                                                    {item.chapter_attributes.title}
                                                </Text>
                                                <Text
                                                    style={styles.chapterText}
                                                >
                                                    {`Chapter ${item.chapter_attributes.chapter}`}
                                                </Text>
                                                <Text
                                                    numberOfLines={1}
                                                    lineBreakMode='tail'
                                                    style={styles.mangaText}
                                                >
                                                    {item.manga_attributes.title.ja || item.manga_attributes.title.en}
                                                </Text>
                                            </View>
                                            <View style={styles.timestampContainer}>
                                                <Ionicons name="time-outline" size={24} color={Theme.colors.midGray} />
                                                <Text
                                                    style={styles.timestampText}
                                                >
                                                    {`${item.formated_timestamp.toLocaleDateString()}`}
                                                </Text>
                                                <Text
                                                    style={styles.timestampText}
                                                >
                                                    {`${item.formated_timestamp.toLocaleTimeString()}`}
                                                </Text>
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
