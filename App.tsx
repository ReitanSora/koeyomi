import { StatusBar } from 'expo-status-bar';
import Navigation from './routes/Navigation';
import { View } from 'react-native';
import { Theme } from './theme/Theme';

export default function App() {
  return (
    //<StatusBar animated={true} hidden={false} backgroundColor='#000'></StatusBar>
    <View style={{flex: 1, backgroundColor: Theme.colors.charcoalBlack}}>
      <Navigation />
    </View>
  );
}