import { Theme } from '@/theme';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface PillProps {
    containerStyle?: ViewStyle;
    IconElement?: React.ReactNode;
    text: string;
    textStyle?: TextStyle;
}

export default function Pill({ containerStyle, IconElement, text, textStyle }: PillProps) {
    return (
        <>
            {text && (
                <View style={[styles.pills, containerStyle]}>
                    {IconElement}
                    <Text style={[styles.text, textStyle]}>{text}</Text>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    pills: {
        width: 'auto',
        backgroundColor: Theme.colors.jetgray,
        paddingHorizontal: 10,
        paddingVertical: 3,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',

        borderRadius: 20,
    },
    text: {
        fontSize: Theme.fonts.paragraph,
        fontWeight: 'bold',
        color: Theme.colors.midGray,
    },
});
