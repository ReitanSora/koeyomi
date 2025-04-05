import { StyleSheet } from "react-native";
import { MAX_WIDTH } from "../../constants/Constants";
import { Theme } from "../../theme/Theme";

export const styles = StyleSheet.create({
    pagination: {
        position: 'absolute',
        bottom: 40,
        width: (MAX_WIDTH * 0.6),
        height: 50,
        backgroundColor: Theme.colors.jetgray,
        paddingHorizontal: 20,

        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-evenly',

        borderRadius: 25,

        transform: [{ rotate: '180deg' }]
    },
    paginationButton: {
        position: 'absolute',

        width: 50,
        height: 50,
        backgroundColor: Theme.colors.jetgray,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',

        borderRadius: Theme.borders.circle,

    },
    paginationButtonLast: {
        right: -60,
    },
    paginationButtonFirst: {
        left: -60,

        transform: [{ rotate: '180deg' }]
    },
    sliderTrack: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,69,0,0.1)',

        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',

        borderRadius: 4,
    },
    dotContainer: {
        width: '100%',

        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dot: {
        height: 4,
        width: 4,
        backgroundColor: Theme.colors.vermillion,

        borderRadius: 4,
    },
    sliderThumb: {
        width: 20,
        height: 20,
        borderRadius: '100%',
        backgroundColor: Theme.colors.vermillion,
        position: 'absolute',
        left: -10,
    },
    pageNumber:{
        position: 'absolute',
        bottom: 0,
        backgroundColor: Theme.colors.jetgray,
        paddingHorizontal: 10,
        paddingVertical: 5,

        alignSelf: 'center',

        borderRadius: 5,
    },
    pageNumberText:{
        fontSize: Theme.fonts.tiny,
        color: Theme.colors.midGray,
    },
})