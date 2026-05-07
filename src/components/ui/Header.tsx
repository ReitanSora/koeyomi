import { MAX_WIDTH } from "@/constants";
import { Theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import IconButton from "./IconButton";

interface HeaderProps {
    children?: React.ReactNode;
    hasSearchFilter: boolean;
    handleChangeText?: (text: string) => void;
    handleClose?: () => void;
    handleFilter?: (text: string) => void;
    handleSearch?: () => void;
    inputValue?: any;
    isSearchBarVisible?: boolean;
    setIsSearchBarVisible?: (value: boolean) => void;
    title?: string;
}

interface StaticHeaderProps {
    children?: React.ReactNode;
    containerStyle?: ViewStyle;
    hasLeftAction?: boolean;
    hasFilter: boolean;
    title: string;
    titleStyle?: TextStyle;
    onLeftActionPress: () => void;
    rightHeaderStyle?: ViewStyle;
    subtitle?: string;
}

export function SearchHeader({
    isSearchBarVisible,
    setIsSearchBarVisible = () => { },
    title,
    handleFilter = undefined,
    handleSearch = undefined,
    hasSearchFilter,
    inputValue = undefined,
    handleClose = () => { },
    handleChangeText = () => { },
    children
}: HeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                {isSearchBarVisible ?
                    (
                        <Animated.View entering={FadeInRight.springify().duration(500).damping(1).stiffness(100)} style={[styles.headerSearchBarContainer, { width: MAX_WIDTH / 2 }]}>
                            <Ionicons name="search" size={15} color={Theme.colors.midGray} />
                            <TextInput
                                placeholder="Search"
                                placeholderTextColor={Theme.colors.midGray}
                                keyboardType="default"
                                numberOfLines={1}
                                cursorColor={Theme.colors.vermillion}
                                selectionColor={Theme.colors.vermillion}
                                selectionHandleColor={Theme.colors.midGray}
                                autoCapitalize="none"
                                autoFocus={true}
                                autoCorrect={false}
                                spellCheck={false}
                                value={!hasSearchFilter ? inputValue : undefined}
                                onChangeText={hasSearchFilter ? handleFilter : (newText) => handleChangeText(newText)}
                                onSubmitEditing={!hasSearchFilter ? handleSearch : undefined}
                                style={styles.headerSearchBarInput}
                            />
                        </Animated.View>
                    )
                    :
                    (
                        <Animated.Text entering={FadeInRight.springify().duration(500)} style={styles.headerTitle}>
                            {title}
                        </Animated.Text>
                    )}
            </View>
            <View style={styles.headerRight}>
                <View style={[styles.headerButtons, { flex: 1 }]}>
                    <IconButton
                        onPress={() => {
                            setIsSearchBarVisible(!isSearchBarVisible);
                            handleClose();
                        }}
                        IconSet={Ionicons}
                        iconName={isSearchBarVisible ? 'close' : 'search'}
                        iconColor={Theme.colors.vermillion}
                    />
                    {children}
                </View>
            </View>
        </View>
    );
}

export function StaticHeader({ children, containerStyle, hasFilter, hasLeftAction = true, onLeftActionPress, subtitle, title, titleStyle, rightHeaderStyle }: StaticHeaderProps) {
    return (
        <View style={[styles.header, containerStyle]}>
            <View style={[styles.headerLeft]}>
                {hasLeftAction &&
                    <IconButton
                        onPress={onLeftActionPress}
                        IconSet={Ionicons}
                        iconName='chevron-back'
                        iconColor={Theme.colors.lightGray}
                    />
                }
                <View style={styles.headerText}>
                    {title && <Animated.Text numberOfLines={1} lineBreakMode="tail" style={[styles.headerTextTitle, titleStyle]}>{title}</Animated.Text>}
                    {subtitle && <Text numberOfLines={1} lineBreakMode="tail" style={styles.headerTextSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {hasFilter &&
                <View style={[styles.headerRight, { width: 48 }, rightHeaderStyle]}>
                    <View style={[styles.headerButtons]}>
                        {children}
                    </View>
                </View>
            }
        </View>
    )
}


const styles = StyleSheet.create({
    header: {
        width: "100%",
        height: 55,
        // backgroundColor: '#FFF',
        paddingHorizontal: 20,

        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'flex-start',
        gap: 10,
    },
    headerSearchBarContainer: {
        width: "auto",
        height: 40,
        backgroundColor: Theme.colors.jetgray,
        paddingHorizontal: 10,

        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 10,

        borderRadius: Theme.borders.cardItem
    },
    headerSearchBarInput: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.lightGray,
        flex: 1,
        height: '100%',
    },
    headerTitle: {
        fontSize: Theme.fonts.title,
        fontWeight: "bold",
        color: Theme.colors.lightGray,
    },
    headerRight: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerButtons: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    headerText: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    headerTextTitle: {
        fontSize: Theme.fonts.title,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
    headerTextSubtitle: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
    },
});
