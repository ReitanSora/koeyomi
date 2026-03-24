import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createNavigationContainerRef } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import MangaDetailsScreen from "../screens/MangaDetailsScreen/MangaDetailsScreen";
import MangaReaderScreen from "../screens/MangaReaderScreen/MangaReaderScreen";
import SearchScreen from "../screens/SearchScreen/SearchScreen";
import HistoryScreen from "../screens/HistoryScreen/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen/SettingsScreen";
import { Theme } from "../theme/Theme";
import { useState } from "react";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
const MyTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: Theme.colors.charcoalBlack
    }
};

function RootTabs(props: any) {
    const screensWithTabBar = ['HomeScreen', 'SearchScreen', 'History', 'SettingScreen']
    const hideTabBar = !screensWithTabBar.includes(props.routeName);

    return (
        <Tab.Navigator
            initialRouteName="Home"
            backBehavior="none"
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: Theme.colors.gunmetalGray,
                    borderTopWidth: 0,
                    elevation: 0,
                    display: hideTabBar ? "none" : "flex",
                },
                tabBarActiveTintColor: Theme.colors.vermillion,
                tabBarHideOnKeyboard: true,
                tabBarVisibilityAnimationConfig: {
                    show: {
                        animation: 'timing',
                        config: {
                            duration: 500,
                            isInteraction: true,
                        }
                    }
                },
                headerShown: false,
                // animation: 'fade',
            }}>
            <Tab.Screen
                name='Home'
                component={HomeStack}
            >
            </Tab.Screen>
            <Tab.Screen
                name='Search'
                component={SearchStack}
                options={{
                }}>
            </Tab.Screen>
            <Tab.Screen
                name='History'
                component={HistoryScreen}
                options={{
                }}>
            </Tab.Screen>
            <Tab.Screen
                name='Settings'
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
                headerShown: false,
                orientation: 'default',
            }}>
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
            />
            <Stack.Screen
                name="MangaDetailsStack"
                component={MangaDetailsStack}
            />
        </Stack.Navigator>
    );
};

function SearchStack() {
    return (
        <Stack.Navigator
            initialRouteName="SearchScreen"
            screenOptions={{
                headerShown: false,
                orientation: 'default',
            }}
        >
            <Stack.Screen
                name="SearchScreen"
                component={SearchScreen}
            />
            <Stack.Screen
                name="MangaDetailsStack"
                component={MangaDetailsStack}
            />
        </Stack.Navigator>
    );
};

function MangaDetailsStack({ route }: any) {
    return (
        <Stack.Navigator
            initialRouteName="MangaDetailsScreen"
            screenOptions={{
                headerShown: false,
                orientation: 'default',
            }}>
            <Stack.Screen
                name="MangaDetailsScreen"
                component={MangaDetailsScreen}
                initialParams={route?.params}
            />
            <Stack.Screen
                name="MangaReaderScreen"
                component={MangaReaderScreen}
                initialParams={route?.params}
            />
        </Stack.Navigator>
    );
};

function SettingStack() {
    return (
        <Stack.Navigator
            initialRouteName="SettingScreen"
            screenOptions={{
                headerShown: false,
                orientation: 'default',
            }}>
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
            ref={navigationRef}
            onReady={() => {
                setRouteName(navigationRef.getCurrentRoute().name)
            }}
            onStateChange={async () => {
                const currentRouteName = navigationRef.getCurrentRoute().name;
                setRouteName(currentRouteName);
            }}
            theme={MyTheme}>
            <RootTabs routeName={routeName}></RootTabs>
        </NavigationContainer>
    );
};
