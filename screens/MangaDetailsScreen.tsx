import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../theme/Theme';

export default function MangaDetailsScreen() {

    const navigation = useNavigation();

    return(
        <View style={{backgroundColor: Theme.colors.charcoalBlack}}>
            <Text>Esta es la pantalla MangaDetailsScreen</Text>
            <Button title='MangaChapterScreen' onPress={() => navigation.navigate("MangaChapterScreen")}></Button>
        </View>
    );
};
