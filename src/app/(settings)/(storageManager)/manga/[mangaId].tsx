import { StaticHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import Toast from '@/components/ui/Toast';
import { MAX_WIDTH } from '@/constants';
import { Theme } from '@/theme';
import { Chapters } from '@/types/chapters';
import { Box, Column, FilledTonalButton, Host, ModalBottomSheet, ModalBottomSheetRef, RNHostView, Row, Shape, Text } from '@expo/ui/jetpack-compose';
import { background, clip, fillMaxWidth, height, offset, padding, Shapes, width } from '@expo/ui/jetpack-compose/modifiers';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Directory, Paths } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Text as RNText, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FileSystemChapters extends Chapters {
    size: number;
    uri: string;
}

interface DownloadedItem {
    handleAction: (value: FileSystemChapters) => void;
    item: FileSystemChapters;
    selectAll: boolean;
}

interface BottomSheetProps {
    handleAction: () => void;
    itemCount: number;
}

function BottomSheetConfirmation({ handleAction, itemCount }: BottomSheetProps) {
    const [visible, setVisible] = useState(false);
    const sheetRef = useRef<ModalBottomSheetRef>(null);

    const bottomSheetStyle = StyleSheet.create({
        container: {
            width: '100%',
            height: '100%',
            padding: 20,
        },
        section: {
            width: '100%',
            gap: 10,
        },
        subtitle: {
            fontSize: Theme.fonts.subtitle,
            fontWeight: 'bold',
        },
        text: {
            fontSize: Theme.fonts.paragraph,
            color: Theme.colors.lightGray,
        },
        actionButtons: {
            width: '100%',
            marginBottom: 20,

            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 20,
        },
    });

    return (
        <Host matchContents>
            <IconButton
                onPress={() => {
                    if (itemCount > 0) {
                        setVisible(!visible);
                    } else {
                        Toast({ message: 'No items selected' });
                    }
                }}
                IconSet={Ionicons}
                iconName='trash-outline'
                iconColor={Theme.colors.vermillion}
            />
            {visible && (
                <ModalBottomSheet
                    ref={sheetRef}
                    onDismissRequest={() => setVisible(false)}
                    containerColor={Theme.colors.gunmetalGray}
                    skipPartiallyExpanded>
                    <ModalBottomSheet.DragHandle>
                        <Column
                            horizontalAlignment='center'
                            modifiers={[fillMaxWidth(), padding(0, 10, 0, 10)]}>
                            <Box modifiers={[width(60), height(6), clip(Shapes.Circle), background(Theme.colors.midGray)]} />
                        </Column>
                    </ModalBottomSheet.DragHandle>
                    <Column modifiers={[height(150)]}>
                        <RNHostView>
                            <View style={bottomSheetStyle.container}>
                                <View style={bottomSheetStyle.section}>
                                    <RNText style={[bottomSheetStyle.text, bottomSheetStyle.subtitle]}>Delete Items</RNText>
                                    <RNText style={[bottomSheetStyle.text]}>Are you sure you want to delete {itemCount} items?</RNText>
                                </View>
                            </View>
                        </RNHostView>
                    </Column>
                    <Column modifiers={[fillMaxWidth(), height(48), padding(20, 0, 20, 0), offset(0, -10)]}>
                        <Row
                            horizontalArrangement='spaceBetween'
                            modifiers={[fillMaxWidth()]}>
                            <FilledTonalButton
                                onClick={() => setVisible(!visible)}
                                modifiers={[width(~~MAX_WIDTH / 2 - 30), height(48)]}
                                colors={{ containerColor: Theme.colors.gunmetalGray }}
                                shape={Shape.RoundedCorner({ cornerRadii: { topStart: 24, topEnd: 24, bottomStart: 24, bottomEnd: 24 } })}>
                                <Text
                                    style={{ fontSize: Theme.fonts.subtitle, fontWeight: 'bold' }}
                                    color={Theme.colors.midGray}>
                                    Cancel
                                </Text>
                            </FilledTonalButton>
                            <FilledTonalButton
                                onClick={() => {
                                    handleAction();
                                    setVisible(!visible);
                                }}
                                modifiers={[width(~~MAX_WIDTH / 2 - 30), height(48)]}
                                colors={{ containerColor: Theme.colors.vermillion }}
                                shape={Shape.RoundedCorner({ cornerRadii: { topStart: 24, topEnd: 24, bottomStart: 24, bottomEnd: 24 } })}>
                                <Text
                                    style={{ fontSize: Theme.fonts.subtitle, fontWeight: 'bold' }}
                                    color={Theme.colors.gunmetalGray}>
                                    Delete
                                </Text>
                            </FilledTonalButton>
                        </Row>
                    </Column>
                </ModalBottomSheet>
            )}
        </Host>
    );
}

function DownloadedItem({ handleAction, item, selectAll }: DownloadedItem) {
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const isFirstRender = useRef(true);

    function getSize(size: number) {
        if (!size) return '0 Bytes';

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(size) / Math.log(1024));

        return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    }

    const handleSelect = () => {
        handleAction(item);
        setIsSelected(!isSelected);
    };

    const itemStyle = StyleSheet.create({
        inside: {
            width: '100%',
            height: '100%',
            padding: 20,

            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 20,
        },
        circle: {
            width: 28,
            height: 28,
            // backgroundColor: Theme.colors.midGray,

            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',

            borderWidth: 2,
            borderColor: Theme.colors.midGray,
            borderRadius: 14,
        },
        info: {
            flex: 2,
            flexDirection: 'column',
        },
        sizeInfo: {
            flex: 1,
            alignItems: 'flex-end',
        },
        text: {
            fontSize: Theme.fonts.paragraph,
            color: Theme.colors.lightGray,
        },
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (selectAll && !isSelected) {
            setIsSelected(true);
            handleAction(item);
        } else if (!selectAll && isSelected) {
            setIsSelected(false);
            handleAction(item);
        }
    }, [selectAll]);

    return (
        <IconButton
            onPress={handleSelect}
            // rippleColor={Theme.colors.softVermillion}
            containerStyle={{ width: '100%', height: 100, borderRadius: 0 }}
            insideStyle={[itemStyle.inside, isSelected && { backgroundColor: Theme.colors.softVermillion }]}
            InsideElement={
                <>
                    <View style={[itemStyle.circle, isSelected ? { backgroundColor: Theme.colors.lightGray, borderColor: Theme.colors.lightGray } : {}]}>
                        {isSelected && (
                            <Ionicons
                                name='checkmark-sharp'
                                size={24}
                                color={Theme.colors.gunmetalGray}
                            />
                        )}
                    </View>
                    <View style={itemStyle.info}>
                        <RNText style={itemStyle.text}>Chapter {item.attributes.chapter ?? 'Unknown'}</RNText>
                        <RNText style={itemStyle.text}>{item.attributes.pages ?? 'Unknown'} Pages</RNText>
                        <RNText style={itemStyle.text}>{item.attributes.translatedLanguage.toUpperCase() ?? 'Unknown Laguange'}</RNText>
                    </View>
                    <View style={itemStyle.sizeInfo}>
                        <RNText style={itemStyle.text}>{getSize(item.size)}</RNText>
                    </View>
                </>
            }
        />
    );
}

export default function StorageManagerManga() {
    const [downloadedChapters, setDownloadedChapters] = useState<Array<FileSystemChapters>>([]);
    const [selectedItems, setSelectedItems] = useState<Array<{ uri: string; id: string }>>([]);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const db = useSQLiteContext();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { mangaId } = useLocalSearchParams<{ mangaId: string }>();

    function getUID(url: string) {
        const section = url.replace(/\/+$/, '').split('/');
        return section[section.length - 1];
    }

    const handleSelectItems = (value: FileSystemChapters) => {
        if (selectedItems.find((item) => item.id === value.id)) {
            setSelectedItems((prev) => prev.filter((item) => item.id !== value.id));
        } else {
            setSelectedItems((prev) => [...prev, { uri: value.uri, id: value.id }]);
        }
    };

    const handleDelete = async () => {
        try {
            if (selectedItems.length === downloadedChapters.length) {
                new Directory(Paths.document.uri, 'downloaded', mangaId).delete();
                await db.runAsync('UPDATE chapters SET download_status = ?, file_path = ? WHERE manga_id = ?', ['not_downloaded', null, mangaId]);
                setDownloadedChapters([]);
                setSelectedItems([]);
                router.back();
            } else {
                for (const item of selectedItems) {
                    new Directory(item.uri).delete();
                    await db.runAsync('UPDATE chapters SET download_status = ?, file_path = ? WHERE id = ?', ['not_downloaded', null, item.id]);
                    setDownloadedChapters((prev) => prev.filter((downloaded) => downloaded.id !== item.id));
                }
                setSelectedItems([]);
            }
        } catch (error) {
            Toast({ message: `Error: ${error}` });
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const elements = new Directory(Paths.document.uri, 'downloaded', mangaId).list();

            let savedChapters = [];

            for (const element of elements) {
                const id = getUID(element.uri);
                const savedData = (await db.getFirstAsync('SELECT * FROM chapters WHERE id = ?', id)) as FileSystemChapters;

                savedData.attributes = JSON.parse(savedData.attributes.toString());
                savedData.relationships = JSON.parse(savedData.relationships.toString());
                savedData.size = element.size ?? 0;
                savedData.uri = element.uri;

                savedChapters.push(savedData);
            }
            setDownloadedChapters(savedChapters);
        };

        loadData();
    }, []);

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StaticHeader
                hasFilter={true}
                onLeftActionPress={() => router.back()}
                rightHeaderStyle={{ width: 'auto' }}
                title=''>
                <IconButton
                    onPress={() => setSelectAll(!selectAll)}
                    IconSet={MaterialIcons}
                    iconName='select-all'
                    iconColor={Theme.colors.vermillion}
                />
                <BottomSheetConfirmation
                    handleAction={handleDelete}
                    itemCount={selectedItems.length}
                />
            </StaticHeader>
            <FlatList
                data={downloadedChapters}
                keyExtractor={(item, index) => `downloaded-chapter-${index}-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 20, gap: 10 }}
                renderItem={({ item }) => {
                    return (
                        <>
                            <DownloadedItem
                                handleAction={handleSelectItems}
                                item={item}
                                selectAll={selectAll}
                            />
                            <View style={styles.separator} />
                        </>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: Theme.colors.gunmetalGray,
        marginTop: 10,
    },
});
