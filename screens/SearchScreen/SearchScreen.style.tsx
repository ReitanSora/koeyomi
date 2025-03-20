import { StyleSheet } from "react-native";
import { Theme } from "../../theme/Theme";
import { MAX_WIDTH } from "../../constants/Constants";

export const styles = StyleSheet.create({
    SearchContainer: {
        height: '100%',
    },
    mangaListContainer:{
        padding: 10,

        gap: 10
    },
    mangaItemWrapper:{
        borderRadius: 20,

        overflow: 'hidden'
    },
    mangaItemContainer:{
        flex: 1,
        height: 200,
        backgroundColor: Theme.colors.jetgray,

        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    mangaItemImage:{
        width: 130,
        height: 200,
    },
    mangaItemInfo:{
        width: MAX_WIDTH - 150,
        padding: 10,

        gap: 5,
        overflow: 'hidden'
    },
    mangaItemInfoHeader:{
        position: 'relative',
        minWidth: '100%',

        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    title:{
        width: '60%',
    },
    titleText:{
        fontSize: Theme.fonts.subtitle,
        color: Theme.colors.lightGray
    },
    status: {
        position: 'absolute',
        right: 0,
        width: 'auto',
        maxWidth: '40%',
        backgroundColor: Theme.colors.gunmetalGray,
        paddingVertical: 5,
        paddingHorizontal: 10,

        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,

        borderRadius: 20,
    },
    statusText:{
        fontSize: Theme.fonts.tiny,
        textTransform: 'capitalize',
    },
    mangaItemInfoGenres:{
        marginTop: 10,
        padding: 0,

        flexDirection: 'row',
        gap: 5,
        flexWrap: 'wrap',
    },
    genre:{
        backgroundColor: Theme.colors.gunmetalGray,
        paddingVertical: 2,
        paddingHorizontal: 7,

        borderRadius: 20
    },
    genreText:{
        fontSize: Theme.fonts.tiny,
        color: Theme.colors.midGray,
    },
    mangaItemDescription:{
        width: '100%',
    },
    descriptionText:{
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    }
})