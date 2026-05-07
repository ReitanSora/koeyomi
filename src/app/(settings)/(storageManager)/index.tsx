import { StaticHeader } from '@/components/ui/Header';
import ListEmpty from '@/components/ui/ListEmpty';
import Toast from '@/components/ui/Toast';
import { getTitle } from '@/services/getTitle';
import { Theme } from '@/theme';
import { Manga } from '@/types/mangas';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Directory, Paths } from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FileSystemItems extends Manga {
    size: number;
    uri: string;
}

export default function StorageManagerHome() {
    const [downloadedItems, setDownloadedItems] = useState<Array<FileSystemItems>>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const db = useSQLiteContext();

    function getUID(url: string) {
        const section = url.replace(/\/+$/, '').split('/');
        return section[section.length - 1];
    }

    function getSize(size: number) {
        if (!size) return '0 Bytes';

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(size) / Math.log(1024));

        return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    }

    const loadData = useCallback(async () => {
        try {
            const elements = new Directory(Paths.document.uri, 'downloaded').list();

            let savedMangas = [];

            for (const element of elements) {
                const id = getUID(element.uri);
                const savedData = (await db.getFirstAsync('SELECT * FROM mangas WHERE id = ?', id)) as FileSystemItems;

                savedData.attributes = JSON.parse(savedData.attributes.toString());
                savedData.relationships = JSON.parse(savedData.relationships.toString());
                savedData.size = element.size ?? 0;
                savedData.uri = element.uri;

                savedMangas.push(savedData);
            }
            setDownloadedItems(savedMangas);
            setLoading(false);
        } catch (error) {
            Toast({ message: `${error}` });
            setLoading(false);
        }
    }, [db]);

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

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StaticHeader
                hasFilter={false}
                onLeftActionPress={() => router.back()}
                title='Storage Management'
            />
            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator
                        size={'large'}
                        color={Theme.colors.midGray}
                    />
                </View>
            ) : (
                <FlatList
                    data={downloadedItems}
                    keyExtractor={(item, index) => `downloaded-filesystem-${index}-${item.id}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 20, gap: 10 }}
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
                            description="You haven't downloaded any chapters yet. Your manga will appear here once you save them to read offline."
                            IconSet={MaterialCommunityIcons}
                            iconName='download-off-outline'
                        />
                    }
                    renderItem={({ item }) => {
                        return (
                            <>
                                <View style={styles.directoryItem}>
                                    <TouchableNativeFeedback
                                        background={TouchableNativeFeedback.Ripple('rgba(139, 139, 139, 0.25)', false)}
                                        useForeground={true}
                                        onPress={() => router.navigate({ pathname: '/(settings)/(storageManager)/manga/[mangaId]', params: { mangaId: item.id } })}>
                                        <View style={styles.insideItem}>
                                            <View style={styles.left}>
                                                <Text
                                                    style={[styles.text, { fontSize: Theme.fonts.subtitle, color: Theme.colors.lightGray }]}
                                                    numberOfLines={1}
                                                    lineBreakMode='tail'>
                                                    {getTitle(item.attributes)}
                                                </Text>
                                                <Text style={styles.text}>{getSize(item.size)}</Text>
                                            </View>
                                            <View style={styles.right}>
                                                <Ionicons
                                                    name='chevron-forward'
                                                    size={24}
                                                    color={Theme.colors.lightGray}
                                                />
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <View style={styles.separator} />
                            </>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    directoryItem: {
        width: '100%',
        height: 100,
    },
    insideItem: {
        width: '100%',
        height: '100%',
        paddingHorizontal: 20,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    left: {
        flex: 2,
        gap: 5,
    },
    right: {
        flex: 1,
        alignItems: 'flex-end',
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: Theme.colors.gunmetalGray,
        marginTop: 10,
    },
    text: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
});
