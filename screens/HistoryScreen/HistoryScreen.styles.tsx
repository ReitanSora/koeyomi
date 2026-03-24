import { StyleSheet } from "react-native";
import { Theme } from "../../theme/Theme";

export const styles = StyleSheet.create({
    historyContainer: {
        height: '100%',
    },
    chapterItem: {
        width: '100%',
        backgroundColor: Theme.colors.jetgray,

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
        paddingHorizontal: 10,
        paddingVertical: 5,

        flex: 1,
        flexDirection: 'column',
    },
    chapterText: {
        fontSize: Theme.fonts.paragraph,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
    mangaText: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    timestampContainer: {
        width: 100,

        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    timestampText: {
        fontSize: Theme.fonts.tiny,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
})