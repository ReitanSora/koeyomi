import { SearchHeader } from '@/components/ui/Header';
import ListEmpty from '@/components/ui/ListEmpty';
import Toast from '@/components/ui/Toast';
import { getTitle } from '@/services/getTitle';
import { Theme } from '@/theme';
import { Records } from '@/types/records';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useIsFocused } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function RecordElement(item: Records) {
    return (
        <View>
            <TouchableWithoutFeedback>
                <View style={styles.chapterItem}>
                    <View style={styles.imageContainer}>
                        <Image
                            cachePolicy={'none'}
                            placeholder={{ blurhash: 'KLEv+{so1z$Oo1S41#Wq|t' }}
                            transition={200}
                            source={item.coverImageUrl}
                            style={{ width: '100%', height: '100%' }}
                            contentFit='cover'
                        />
                    </View>
                    <View style={styles.infoContainer}>
                        <Text
                            numberOfLines={1}
                            lineBreakMode='tail'
                            style={styles.chapterText}>
                            {item.chapter_attributes.title || 'Unknown Chapter Title'}
                        </Text>
                        <Text style={styles.chapterText}>{`Chapter ${item.chapter_attributes.chapter || 'Unknown'}`}</Text>
                        <Text
                            numberOfLines={1}
                            lineBreakMode='tail'
                            style={[styles.chapterText, { fontWeight: 'regular', color: Theme.colors.midGray }]}>
                            {getTitle(item.manga_attributes)}
                        </Text>
                    </View>
                    <View style={styles.timestampContainer}>
                        <Ionicons
                            name='time-outline'
                            size={24}
                            color={Theme.colors.midGray}
                        />
                        <Text style={styles.timestampText}>{`${item.formated_timestamp.toLocaleDateString()}`}</Text>
                        <Text style={styles.timestampText}>{`${item.formated_timestamp.toLocaleTimeString()}`}</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
}

export default function HistoryScreen() {
    const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);
    const [refresing, setRefreshing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filteredData, setFilteredData] = useState<Records[]>();
    const [records, setRecords] = useState<Records[]>([]);
    const db = useSQLiteContext();
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    const searchFilterFunction = (text: string) => {
        if (text) {
            const newData = records.filter((item) => {
                const title = getTitle(item.manga_attributes);
                const itemData = title?.toLowerCase();
                const textData = text.toLowerCase();
                return itemData.indexOf(textData) > -1;
            });
            setFilteredData(newData);
        } else {
            setFilteredData(records);
        }
    };

    const loadData = useCallback(async () => {
        try {
            const savedRecords = (await db.getAllAsync(
                `SELECT mangas.attributes as manga_attributes, mangas.coverImageUrl, chapters.attributes as chapter_attributes, chapters.id, records.timestamp
                FROM mangas, chapters, records
                WHERE records.chapter_id=chapters.id AND chapters.manga_id=mangas.id`,
            )) as Records[];

            for (const savedRecord of savedRecords) {
                savedRecord.chapter_attributes = JSON.parse(savedRecord.chapter_attributes.toString());
                savedRecord.manga_attributes = JSON.parse(savedRecord.manga_attributes.toString());
                savedRecord.formated_timestamp = new Date(parseFloat(savedRecord.timestamp));
            }

            savedRecords.sort((a, b) => {
                return b.formated_timestamp.getTime() - a.formated_timestamp.getTime();
            });

            setRecords(savedRecords);
            setFilteredData(savedRecords);
            setIsLoading(false);
        } catch (error) {
            Toast({ message: `${error}` });
            setIsLoading(false);
        }
    }, [db]);

    const handleCloseSearchBar = () => {
        setFilteredData(records);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    useFocusEffect(
        useCallback(() => {
            onRefresh();
        }, [onRefresh]),
    );

    if (!isFocused) {
        return null;
    }

    return (
        <View style={[styles.historyContainer, { paddingTop: insets.top }]}>
            <SearchHeader
                title={'History'}
                hasSearchFilter={true}
                handleFilter={searchFilterFunction}
                isSearchBarVisible={isSearchBarVisible}
                setIsSearchBarVisible={setIsSearchBarVisible}
                handleClose={handleCloseSearchBar}
            />
            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator
                        size={'large'}
                        color={Theme.colors.midGray}
                    />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => `record-chapter-${item.id}`}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={20}
                    removeClippedSubviews={true}
                    contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom }]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refresing}
                            onRefresh={onRefresh}
                            colors={[Theme.colors.jetgray]}
                            progressBackgroundColor={Theme.colors.midGray}
                        />
                    }
                    ListEmptyComponent={
                        <ListEmpty
                            description='Start reading chapters to see your history and keep track of your progress.'
                            IconSet={MaterialCommunityIcons}
                            iconName='content-save-off-outline'
                        />
                    }
                    renderItem={({ item }) => {
                        return <RecordElement {...item} />;
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    historyContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        gap: 20,
    },
    chapterItem: {
        width: '100%',
        backgroundColor: Theme.colors.gunmetalGray,

        flex: 1,
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: Theme.borders.cardItem,
    },
    imageContainer: {
        width: 65,
        height: 100,

        overflow: 'hidden',

        borderTopStartRadius: Theme.borders.cardItem,
    },
    infoContainer: {
        padding: 20,

        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
    },
    chapterText: {
        fontSize: Theme.fonts.paragraph,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
    timestampContainer: {
        width: 100,

        alignItems: 'center',
        justifyContent: 'center',
    },
    timestampText: {
        fontSize: Theme.fonts.tiny,
        color: Theme.colors.midGray,
    },
});
