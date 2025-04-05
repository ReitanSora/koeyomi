import { StyleSheet } from "react-native";
import { MAX_HEIGHT, MAX_WIDTH } from "../../constants/Constants";

export const styles = StyleSheet.create({
    header:{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',

        zIndex: 1000,
    },
    imageWraper:{
        flex: 1,
        minWidth: MAX_WIDTH,
        minHeight: MAX_HEIGHT,

        alignItems: 'center',
        justifyContent: 'center',
    }
})