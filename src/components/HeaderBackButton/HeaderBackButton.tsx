import { Ionicons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableNativeFeedback, View } from "react-native";
import { Theme } from "../../Theme";
import { styles } from "./HeaderBackButton.styles";

export default function HeaderBackButton({ title = '', subtitle = '', hasFilter = true, hasDownloadOption = true, hidden = false, background = '' }) {

    const router = useRouter();

    return (
        <View style={[styles.header, hidden && { position: 'absolute', backgroundColor: background, zIndex: 1 }]}>
            <View style={styles.headerLeft}>
                <View style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}>
                    <TouchableNativeFeedback
                        background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                        useForeground={true}
                        onPress={() => {
                            router.back();
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
