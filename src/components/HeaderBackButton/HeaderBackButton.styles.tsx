import { StyleSheet } from "react-native";
import { Theme } from "../../Theme";

export const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 55,
        paddingHorizontal: 15,

        display: "flex",
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    headerText: {
        maxWidth: '90%',
        flexDirection: 'column',
    },
    headerTextTitle: {
        fontSize: Theme.fonts.title,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
    headerTextSubtitle: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end'
    },

    headerSearchBarContainer: {
        width: 'auto',
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,

        flexDirection: 'row',
        gap: 10,

        borderBottomWidth: 2,
        borderColor: Theme.colors.vermillion,
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
    headerButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    circleButton: {
        width: 40,
        height: 40,

        justifyContent: 'center',
        alignItems: 'center',
    },
})