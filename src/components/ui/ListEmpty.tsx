import { Theme } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ListEmptyProps {
    description: string;
    IconSet?: React.ElementType;
    iconName?: string;
    iconSize?: number;
    iconColor?: string;
}

export default function ListEmpty({ description, IconSet, iconColor, iconName, iconSize }: ListEmptyProps) {
    return (
        <View style={styles.wrapper}>
            {IconSet && iconName && (
                <IconSet
                    name={iconName}
                    size={iconSize || 50}
                    color={iconColor || Theme.colors.midGray}
                />
            )}
            <Text style={styles.text}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '70%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    text: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.midGray,
        textAlign: 'center',
    },
});
