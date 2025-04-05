import { StyleSheet } from "react-native";
import { Theme } from "../../theme/Theme";

export const styles = StyleSheet.create({
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
        width: '100%',
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
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(54,54,54,0.8)',
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
        // backgroundColor: Theme.colors.vermillion,
        
        flexDirection: 'row',
        gap: 20,
    },
    circleButton: {
        width: 40,
        height: 40,

        justifyContent: 'center',
        alignItems: 'center',
    },
});
