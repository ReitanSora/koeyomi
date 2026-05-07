import Constants from "expo-constants";
import { brand, deviceName, deviceYearClass } from "expo-device";
import { Dimensions } from "react-native";

export const { width: MAX_WIDTH, height: MAX_HEIGHT } = Dimensions.get("window");
export const Padding = 10;
export const statusBarHeight = Constants.statusBarHeight;
export const MIN_SCALE = 1.4;
export const MAX_SCALE = 4;
export const deviceId = [brand, deviceYearClass, deviceName].filter(Boolean).join("-") || "unknown-device";
