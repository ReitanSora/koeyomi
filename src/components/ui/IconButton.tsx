import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

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
            <Pressable
                onPress={onPress}
                android_ripple={{ color: rippleColor, borderless: false, foreground: true }}
                style={{flex: 1}}>
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
            </Pressable>
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
