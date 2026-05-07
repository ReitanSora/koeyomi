import React from 'react';
import { StyleProp, StyleSheet, TouchableNativeFeedback, View, ViewStyle } from 'react-native';

interface IconButtonProps {
    onPress: () => void;
    rippleColor?: string;
    containerStyle?: ViewStyle;
    insideStyle?: StyleProp<ViewStyle>;
    IconSet?: React.ElementType;
    iconName?: string;
    iconSize?: number;
    iconColor?: string;
    InsideElement?: React.ReactNode;
}

export default function IconButton({ onPress, rippleColor = 'rgba(139, 139, 139, 0.25)', containerStyle, insideStyle, IconSet, iconName, iconSize, iconColor, InsideElement }: IconButtonProps) {
    return (
        <View style={[styles.buttonNormalContainer, containerStyle]}>
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(rippleColor, false)}
                useForeground={true}
                onPress={onPress}>
                <View style={[styles.buttonInside, insideStyle]}>
                    {IconSet && (
                        <IconSet
                            name={iconName}
                            size={iconSize || 24}
                            color={iconColor || 'white'}
                        />
                    )}
                    {InsideElement}
                </View>
            </TouchableNativeFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonNormalContainer: {
        width: 48,
        height: 48,

        overflow: 'hidden',

        borderRadius: 48,
    },
    buttonInside: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
