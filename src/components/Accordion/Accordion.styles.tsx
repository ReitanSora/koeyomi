import { StyleSheet } from "react-native"
import { Theme } from "../../Theme"

export const styles = StyleSheet.create({
    accordion: {
        width: '100%',
        backgroundColor: Theme.colors.jetgray,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',

        // borderWidth: 1,
        // borderColor: Theme.colors.midGray,
        borderRadius: Theme.borders.cardItem,
    },
    accordionTrigger: {
        height: 50,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    triggerContent: {
        width: '100%',
        height: '100%',
        padding: 10,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleText: {
        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
        lineHeight: Theme.fonts.subtitle + 1, // delete this in case of bug in accordion title Text
        color: Theme.colors.midGray,
    },
    icon: {},
    accordionContent: {
    },
    description: {
    },
    descriptionText: {
        padding: 10,

        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
})