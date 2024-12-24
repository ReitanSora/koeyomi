import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import { Colors } from "../theme/Colors";

const Stack = createNativeStackNavigator();

function RootStack() {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    headerTitle: 'Librería',
                    // headerTitleStyle: {
                    //     fontWeight: "light",
                    //     color: Colors.dark.white,
                    // },
                    // headerStyle: {
                    //     backgroundColor: Colors.dark.black,
                    // },
                    // headerTintColor: Colors.dark.white,
                    // headerShadowVisible: false,
                    // headerSearchBarOptions: {
                    //     placeholder: 'Search...',
                    //     shouldShowHintSearchIcon: false,
                    //     headerIconColor: Colors.dark.white,
                    //     textColor: Colors.dark.white,
                    //     barTintColor: Colors.dark.black,
                    //     hintTextColor: Colors.dark.white,
                    //     disableBackButtonOverride: true,
                    // },
                }}
            />
        </Stack.Navigator>
    );
}

export default function Navigation() {
    return (
        <NavigationContainer>
            <RootStack></RootStack>
        </NavigationContainer>
    );
};
