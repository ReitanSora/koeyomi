import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createNavigationContainerRef } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import MangaDetailsScreen from "../screens/MangaDetailsScreen";
import MangaChapterScreen from "../screens/MangaChapterScreen";
import SearchScreen from "../screens/SearchScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { Theme } from "../theme/Theme";
import { useState } from "react";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ref = createNavigationContainerRef();
const MyTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: Theme.colors.charcoalBlack
    }
};

function RootTabs(props) {

    const hideTabBarHome = props.routeName !== 'HomeScreen';
    const options = {
        backgroundColor: Theme.colors.charcoalBlack,
        borderTopWidth: 0,
        elevation: 0,
    }

    return (
        <Tab.Navigator
            initialRouteName="HomeTab"
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: Theme.colors.gunmetalGray,
                    borderTopWidth: 0,
                    elevation: 0,
                },
                tabBarActiveTintColor: Theme.colors.vermillion,
                tabBarHideOnKeyboard: true,
                headerShown: false,
                animation: 'fade',
            }}>
            <Tab.Screen
                name='HomeTab'
                component={HomeStack}
                options={{
                    tabBarStyle: {
                        ...options,
                        display: hideTabBarHome ? "none" : "flex",
                    },
                }}>
            </Tab.Screen>
            <Tab.Screen
                name='SearchTab'
                component={SearchScreen}
                options={{
                }}>
            </Tab.Screen>
            <Tab.Screen
                name='HistoryTab'
                component={HistoryScreen}
                options={{
                }}>
            </Tab.Screen>
            <Tab.Screen
                name='SettingsTab'
                component={SettingStack}
                options={{
                }}>
            </Tab.Screen>
        </Tab.Navigator>
    );
};

function HomeStack() {
    return (
        <Stack.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{
                headerStyle: {
                    backgroundColor: Theme.colors.gunmetalGray
                },
                headerTintColor: Theme.colors.lightGray,
                headerShadowVisible: false,
                orientation: 'default',
            }}>
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
            />
            <Stack.Screen
                name="MangaDetailsScreen"
                component={MangaDetailsScreen}
            />
            <Stack.Screen
                name="MangaChapterScreen"
                component={MangaChapterScreen}
            />
        </Stack.Navigator>
    );
};

function SettingStack() {
    return (
        <Stack.Navigator initialRouteName="SettingScreen">
            <Stack.Screen
                name="SettingScreen"
                component={SettingsScreen}
            />
        </Stack.Navigator>
    );
};

export default function Navigation() {

    const [routeName, setRouteName] = useState('');

    return (
        <NavigationContainer
            ref={ref}
            onReady={() => {
                setRouteName(ref.getCurrentRoute().name)
            }}
            onStateChange={async () => {
                const currentRouteName = ref.getCurrentRoute().name;
                setRouteName(currentRouteName);
            }}
            theme={MyTheme}>
            <RootTabs routeName={routeName}></RootTabs>
        </NavigationContainer>
    );
};
