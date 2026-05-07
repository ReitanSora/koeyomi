import { MAX_HEIGHT, MAX_WIDTH } from '@/constants';
import { Theme } from '@/theme';
import { Manga } from '@/types/mangas';
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import { Box, Column, FilledTonalButton, FilledTonalIconButton, Host, Icon, ModalBottomSheet, RNHostView, Row, Shape, Text } from '@expo/ui/jetpack-compose';
import { background, clip, fillMaxWidth, height, offset, padding, Shapes, width } from '@expo/ui/jetpack-compose/modifiers';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React, { useRef, useState } from 'react';
import { Text as RNText, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import IconButton from '../ui/IconButton';
import Pill from '../ui/Pill';

interface BottomSheetInfoProps {
    data: Manga;
}

interface BottomSheetFilterProps {
    children: React.ReactNode;
    heightDivider: number;
    onReset: () => void;
}

interface BottomSheetSectionProps {
    containerStyle?: ViewStyle;
    InsideElement: React.ReactNode;
    subtitle: string;
    subtitleStyle?: TextStyle;
}

function BottomSheetSection({ containerStyle, InsideElement, subtitle, subtitleStyle }: BottomSheetSectionProps) {
    return (
        <View style={[{ gap: 10 }, containerStyle]}>
            <RNText style={[styles.subtitle, subtitleStyle]}>{subtitle}</RNText>
            <RNText style={styles.sectionContent}>{InsideElement}</RNText>
        </View>
    );
}

export function BottomSheetInfo({ data }: BottomSheetInfoProps) {
    const [visible, setVisible] = useState(false);
    const sheetRef = useRef<ModalBottomSheetRef>(null);

    const handleBrowserAsync = async (url: string) => {
        await WebBrowser.openBrowserAsync(url);
    };

    return (
        <Host matchContents>
            <IconButton
                onPress={() => setVisible(!visible)}
                IconSet={MaterialIcons}
                iconName='menu'
                iconColor={Theme.colors.midGray}
                containerStyle={{
                    borderWidth: 2,
                    borderColor: Theme.colors.jetgray,
                }}
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
                    <Column modifiers={[height(~~MAX_HEIGHT / 1.25)]}>
                        <RNHostView>
                            <View style={styles.containerInsideModal}>
                                <Pill
                                    IconElement={
                                        <MaterialCommunityIcons
                                            name='record'
                                            size={15}
                                            color={data.attributes.status === 'ongoing' ? Theme.colors.vermillion : Theme.colors.midGray}
                                        />
                                    }
                                    containerStyle={{
                                        position: 'absolute',
                                        top: 20,
                                        right: 20,

                                        flexDirection: 'row',
                                        gap: 10,
                                    }}
                                    text={data.attributes.status.toUpperCase()}
                                    textStyle={{
                                        color: data.attributes.status === 'ongoing' ? Theme.colors.vermillion : Theme.colors.midGray,
                                    }}
                                />
                                <BottomSheetSection
                                    subtitle='Description'
                                    InsideElement={
                                        <RNText
                                            style={styles.text}
                                            numberOfLines={10}
                                            lineBreakMode='tail'>
                                            {data.attributes.description['es-la'] ?? data.attributes.description.en}
                                        </RNText>
                                    }
                                />
                                <BottomSheetSection
                                    subtitle='Genres'
                                    InsideElement={data.attributes.tags
                                        .filter((tag) => tag.attributes?.group === 'genre')
                                        .map((tag) => {
                                            return (
                                                <Pill
                                                    text={tag.attributes.name.en}
                                                    key={`${data.id}-genre-${tag.attributes.name.en}`}
                                                />
                                            );
                                        })}
                                />
                                <BottomSheetSection
                                    subtitle='Themes'
                                    InsideElement={data.attributes.tags
                                        .filter((tag) => tag.attributes?.group === 'theme')
                                        .map((tag) => {
                                            return (
                                                <Pill
                                                    text={tag.attributes.name.en}
                                                    key={`${data.id}-genre-${tag.attributes.name.en}`}
                                                />
                                            );
                                        })}
                                />
                                <BottomSheetSection
                                    subtitle='Author & Artist'
                                    InsideElement={
                                        <>
                                            <Pill text={data.relationships.find((item) => item.type === 'author')?.attributes.name || 'unknown'} />
                                            <Pill text={data.relationships.find((item) => item.type === 'artist')?.attributes.name || 'unknown'} />
                                        </>
                                    }
                                />
                                <BottomSheetSection
                                    subtitle='External links'
                                    InsideElement={
                                        <Host matchContents>
                                            <Row horizontalArrangement={{ spacedBy: 10 }}>
                                                <FilledTonalIconButton
                                                    onClick={() => handleBrowserAsync(`https://myanimelist.net/manga/${data.attributes.links.mal}`)}
                                                    modifiers={[width(48), height(48)]}
                                                    colors={{ containerColor: Theme.colors.jetgray }}
                                                    shape={Shape.RoundedCorner({ cornerRadii: { topStart: 24, topEnd: 24, bottomStart: 24, bottomEnd: 24 } })}>
                                                    <Icon
                                                        source={require('../../../assets/icons/browser.png')}
                                                        size={24}
                                                        tint={Theme.colors.midGray}></Icon>
                                                </FilledTonalIconButton>
                                                <FilledTonalIconButton
                                                    onClick={() => handleBrowserAsync(data.attributes.links.raw)}
                                                    modifiers={[width(48), height(48)]}
                                                    colors={{ containerColor: Theme.colors.jetgray }}
                                                    shape={Shape.RoundedCorner({ cornerRadii: { topStart: 24, topEnd: 24, bottomStart: 24, bottomEnd: 24 } })}>
                                                    <Icon
                                                        source={require('../../../assets/icons/raw.png')}
                                                        size={24}
                                                        tint={Theme.colors.midGray}></Icon>
                                                </FilledTonalIconButton>
                                            </Row>
                                        </Host>
                                    }
                                />
                            </View>
                        </RNHostView>
                    </Column>
                </ModalBottomSheet>
            )}
        </Host>
    );
}

export function BottomSheetFilter({ children, onReset, heightDivider }: BottomSheetFilterProps) {
    const [visible, setVisible] = useState(false);
    const sheetRef = useRef<ModalBottomSheetRef>(null);

    const handleReset = () => {
        onReset();
    };

    return (
        <Host matchContents>
            <IconButton
                onPress={() => setVisible(!visible)}
                IconSet={Ionicons}
                iconName='filter'
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
                    <Column modifiers={[height(~~MAX_HEIGHT / heightDivider)]}>
                        <RNHostView>
                            <View style={{ height: '100%', paddingTop: 20, gap: 20 }}>{children}</View>
                        </RNHostView>
                    </Column>
                    <Column modifiers={[fillMaxWidth(), height(48), padding(20, 0, 20, 0), offset(0, -10)]}>
                        <FilledTonalButton
                            onClick={handleReset}
                            modifiers={[width(~~MAX_WIDTH - 40), height(48)]}
                            colors={{ containerColor: Theme.colors.gunmetalGray }}
                            shape={Shape.RoundedCorner({ cornerRadii: { topStart: 24, topEnd: 24, bottomStart: 24, bottomEnd: 24 } })}>
                            <Text
                                style={{ fontSize: Theme.fonts.subtitle, fontWeight: 'bold' }}
                                color={Theme.colors.midGray}>
                                Reset
                            </Text>
                        </FilledTonalButton>
                    </Column>
                </ModalBottomSheet>
            )}
        </Host>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: Theme.colors.jetgray,

        overflow: 'hidden',

        borderRadius: Theme.borders.cardItem,
    },
    title: {
        fontSize: Theme.fonts.title,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
    subtitle: {
        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
    text: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    containerInsideModal: {
        padding: 20,

        flex: 1,
        gap: 20,
    },
    modalHeader: {
        gap: 10,
    },
    sectionContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    segmentedControl: {
        width: '100%',
        backgroundColor: Theme.colors.jetgray,
        padding: 5,

        flexDirection: 'row',
        overflow: 'hidden',

        borderRadius: 58,
    },
    filterOptions: {
        position: 'absolute',
        bottom: 0,

        width: '100%',
        // backgroundColor: '#FFF',
        padding: 20,

        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
        gap: 20,
        overflow: 'hidden',
    },
});
