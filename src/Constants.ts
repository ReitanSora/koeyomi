import { Dimensions } from "react-native";
import Constants from 'expo-constants';

export const { width: MAX_WIDTH, height: MAX_HEIGHT } = Dimensions.get('window');
export const Padding = 10;
export const statusBarHeight = Constants.statusBarHeight;