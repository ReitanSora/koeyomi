import { Text, TouchableNativeFeedback, View } from "react-native";
import { styles } from "./HeaderBackButton.styles";
import Constants from 'expo-constants';
import { Ionicons, Octicons } from "@expo/vector-icons";
import { Theme } from "../../theme/Theme";
import { useNavigation } from "@react-navigation/native";

export default function HeaderBackButton({ title = '', subtitle = '', hasFilter = true, hasDownloadOption = true, hidden = false }) {

    const navigation = useNavigation();

    return (
        <View style={[styles.header, hidden && { position: 'absolute', top: Constants.statusBarHeight, backgroundColor: 'rgba(30,30,30,0.8)', zIndex: 1000 }]}>
            <View style={styles.headerLeft}>
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
                <View style={styles.headerText}>
                    {title && <Text numberOfLines={1} lineBreakMode="tail" style={styles.headerTextTitle}>{title}</Text>}
                    {subtitle && <Text numberOfLines={1} lineBreakMode="tail" style={styles.headerTextSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {hasFilter && hasDownloadOption ?
                <View style={[styles.headerRight]}>
                    <View style={styles.headerButtons}>
                        {hasDownloadOption &&
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
                        }
                        {hasFilter &&
                            <View style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}>
                                <TouchableNativeFeedback
                                    background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                                    useForeground={true}>
                                    <View style={styles.circleButton}>
                                        <Ionicons name="filter" size={24} color={Theme.colors.vermillion} />
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        }
                    </View>
                </View> : <></>}
        </View>
    )
};
