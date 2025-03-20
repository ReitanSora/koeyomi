import { Text, TouchableNativeFeedback, View } from "react-native";
import { styles } from "./HeaderBackButton.styles";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { Theme } from "../../theme/Theme";
import { useNavigation } from "@react-navigation/native";

export default function HeaderBackButton() {

    const navigation = useNavigation();

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft} onAccessibilityAction={() => console.log('Escape?')}>
                <View style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}>
                    <TouchableNativeFeedback
                        background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                        useForeground={true}
                        onPress={() => {
                            navigation.goBack();
                        }}>
                        <View style={styles.circleButton}>
                            <Ionicons name="chevron-back" size={24} color={Theme.colors.lightGray} />
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
            <View style={styles.headerRight}>
                <View style={styles.headerButtons}>
                    <View style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                            useForeground={true}
                            onPress={() => {
                            }}>
                            <View style={styles.circleButton}>
                                <Octicons name="download" size={24} color={Theme.colors.vermillion} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                    <View style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                            useForeground={true}>
                            <View style={styles.circleButton}>
                                <Ionicons name="filter" size={24} color={Theme.colors.vermillion} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </View>
        </View>
    )
};
