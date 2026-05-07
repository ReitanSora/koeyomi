import { MAX_WIDTH } from '@/constants';
import { getTitle } from '@/services/getTitle';
import { Theme } from '@/theme';
import { Manga } from '@/types/mangas';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';

export default function MangaItem(item: Manga) {
    const router = useRouter();

    return (
        <View style={[styles.mangaItemContainer, { height: (MAX_WIDTH / 2) * 1.3 }]}>
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.2)', false)}
                useForeground={true}
                onPress={() => {
                    router.navigate({
                        pathname: '/(home)/manga/[mangaId]',
                        params: { mangaId: item.id },
                    });
                }}>
                <View style={styles.mangaItem}>
                    <Image
                        cachePolicy={'memory-disk'}
                        placeholder={{ blurhash: 'KLEv+{so1z$Oo1S41#Wq|t' }}
                        transition={200}
                        source={item.coverImageUrl}
                        style={[styles.mangaItemImage, { width: '100%' }]}
                        contentFit='cover'
                    />
                    <View style={[styles.mangaItemFooter]}>
                        <Text
                            style={[styles.mangaItemTitle]}
                            numberOfLines={1}>
                            {getTitle(item.attributes)}
                        </Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    mangaItemContainer: {
        flex: 1,
        overflow: 'hidden',

        borderRadius: Theme.borders.cardItem,
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
        position: 'absolute',
        bottom: 0,

        width: '100%',
        backgroundColor: 'rgba(54,54,54,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        overflow: 'hidden',
    },
    mangaItemTitle: {
        fontSize: Theme.fonts.subtitle,
        flexWrap: 'nowrap',
        color: Theme.colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
