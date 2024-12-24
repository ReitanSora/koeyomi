import { StatusBar } from 'expo-status-bar';
import Navigation from './routes/Navigation';

export default function App() {
  return (
    //<StatusBar animated={true} hidden={false} backgroundColor='#000'></StatusBar>
    <Navigation />
  );
}