import { StyleSheet } from "react-native";
import { Theme } from "../../Theme";

export const styles = StyleSheet.create({
    chapterItem: {
        flex: 1,
        // backgroundColor: Theme.colors.gunmetalGray,
        padding: 10,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

    },
    chapterInfo: {
        flex: 1,
        // backgroundColor: '#f2f2f2',

        flexDirection: 'column',
        gap: 5,
    },
    chapterTitle: {
        maxWidth: '50%',

        flexDirection: 'row',
    },
    chapterTitleText: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.lightGray,
    },
    chapterPublisher: {
        flexDirection: 'row',
    },
    chapterPublisherText: {
        fontSize: Theme.fonts.tiny,
        color: Theme.colors.midGray,
    },
    chapterOptions: {
        marginLeft: 10,
    },
    chapterButton: {
        width: 35,
        height: 35,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    downloadIcon: {
        width: '100%',
        height: '100%',

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',

        borderWidth: 2,
        borderColor: Theme.colors.jetgray,
        borderRadius: Theme.borders.circle,
    },
    downloadingButton: {
        position: 'absolute',
        top: 0,
        width: 35,
        height: 35,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // backgroundColor: Theme.colors.vermillion,
        borderWidth: 2,
        borderTopColor: Theme.colors.vermillion,
        borderRightColor: Theme.colors.jetgray,
        borderBottomColor: Theme.colors.jetgray,
        borderLeftColor: Theme.colors.jetgray,
        borderRadius: Theme.borders.circle,

        zIndex: 10,
    },
})