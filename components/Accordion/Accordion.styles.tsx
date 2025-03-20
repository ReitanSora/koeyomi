import { StyleSheet } from "react-native"
import { Theme } from "../../theme/Theme"

export const styles = StyleSheet.create({
    accordion: {
        width: '100%',
        minHeight: 50,
        // maxHeight: 150,
        backgroundColor: Theme.colors.jetgray,
        padding: 10,

        overflow: 'hidden',

        // borderWidth: 1,
        // borderColor: Theme.colors.midGray,
        borderRadius: Theme.borders.cardItem,
    },
    accordionTrigger: {
        height: 30,

        alignItems: 'center',
        justifyContent: 'center',
    },
    triggerContent: {
        width: '100%',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleText: {
        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
        color: Theme.colors.midGray,
    },
    icon: {},
    accordionContent: {
    },
    description: {
    },
    descriptionText: {
        paddingTop: 10,

        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
})