import { StyleSheet } from "react-native";
import { Theme } from "../../theme/Theme";
import { MAX_HEIGHT, MAX_WIDTH } from "../../constants/Constants";

export const styles = StyleSheet.create({
    mangaContainer:{
        width: '100%',
        flex: 1,
        // height: MAX_HEIGHT-55,
    },
    mangaHeader:{
        width: '100%',
        padding: 10,
        
        flexDirection: 'row',
        gap: 10,
    },
    mangaImage:{
        width: 150,
        height: 225,

        overflow: 'hidden',

        borderRadius: Theme.borders.image
    },
    mangaInfo:{
        width: MAX_WIDTH - 180,

        flexDirection: 'column',
        gap: 10,
    },
    mangaTitle:{
        gap: 5,
    },
    title:{
        fontSize: Theme.fonts.title,
        color: Theme.colors.lightGray,
    },
    author:{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    authorText:{
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    status:{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statusText:{
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    mangaGenres:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    genre:{
        backgroundColor: Theme.colors.jetgray,
        paddingHorizontal: 10,
        paddingVertical: 3,

        alignItems: 'center',
        justifyContent: 'center',

        // borderWidth: 1,
        // borderColor: Theme.colors.midGray,
        borderRadius: 20
    },
    genreText:{
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
    mangaOptions:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    button:{
        width: 35,
        height: 35,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 1,
        borderColor: Theme.colors.midGray,
        borderRadius: Theme.borders.circle,
    },
    mangaDescription:{
        width: '100%',
        paddingHorizontal: 10,
    },
    mangaChapters:{
        // backgroundColor: '#F2F2F2',
        margin: 10,
    },
})