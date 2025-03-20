import { View, TouchableNativeFeedback, TextInput } from 'react-native';
import { styles } from './Header.styles'
import Animated, { FadeInRight } from 'react-native-reanimated';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/Theme';
import { Dispatch, SetStateAction } from 'react';

interface HeaderProps {
    isSearchBarVisible: boolean;
    setIsSearchBarVisible: Dispatch<SetStateAction<any>>;
    title: string;
    isFilterSearch: boolean;
    handleFilter?: (text: any) => void;
    handleSearch?: () => void;
    inputValue?: any;
    // setInputValue?: Dispatch<SetStateAction<any>>;
    handleClose?: () => void;
    handleChangeText?: (text: string) => void;
}

export default function Header({ isSearchBarVisible, setIsSearchBarVisible, title, handleFilter = undefined, handleSearch = undefined, isFilterSearch, inputValue = undefined, handleClose, handleChangeText }: HeaderProps) {

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft} onAccessibilityAction={() => console.log('Escape?')}>
                {isSearchBarVisible ?
                    <Animated.View
                        entering={
                            FadeInRight.springify()
                                .duration(500)
                                .damping(1)
                                .stiffness(100)
                        }
                        style={styles.headerSearchBarContainer}
                    >
                        <FontAwesome5 name="search" size={15} color={Theme.colors.lightGray} />
                        {isFilterSearch ?
                            <TextInput
                                placeholder='Buscar...'
                                placeholderTextColor={Theme.colors.lightGray}
                                keyboardType='default'
                                numberOfLines={1}
                                cursorColor={Theme.colors.vermillion}
                                selectionColor={Theme.colors.vermillion}
                                selectionHandleColor={Theme.colors.midGray}
                                autoCapitalize='none'
                                autoFocus={true}
                                autoCorrect={false}
                                spellCheck={false}
                                onChangeText={handleFilter}
                                style={styles.headerSearchBarInput} /> :
                            <TextInput
                                placeholder='Buscar...'
                                placeholderTextColor={Theme.colors.lightGray}
                                keyboardType='default'
                                numberOfLines={1}
                                cursorColor={Theme.colors.vermillion}
                                selectionColor={Theme.colors.vermillion}
                                selectionHandleColor={Theme.colors.midGray}
                                autoCapitalize='none'
                                autoFocus={true}
                                autoCorrect={false}
                                spellCheck={false}
                                value={inputValue}
                                onChangeText={newText => handleChangeText(newText)}
                                onSubmitEditing={handleSearch}
                                style={styles.headerSearchBarInput} />
                        }
                    </Animated.View> :
                    <Animated.Text
                        entering={
                            FadeInRight.springify()
                                .duration(500)
                        }
                        style={styles.headerTitle}>{title}</Animated.Text>}
            </View>
            <View style={styles.headerRight}>
                <View style={styles.headerButtons}>
                    <View style={{ borderRadius: Theme.borders.circle, overflow: 'hidden' }}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                            useForeground={true}
                            onPress={() => {
                                setIsSearchBarVisible(!isSearchBarVisible);
                                handleClose()
                            }}>
                            <View style={styles.circleButton}>
                                {isSearchBarVisible ? <Ionicons name="close" size={24} color={Theme.colors.vermillion} /> : <Ionicons name="search" size={24} color={Theme.colors.vermillion} />}
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
    );
};
