import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import IconButton from './IconButton';

interface ContainerProps {
    containerStyle?: StyleProp<ViewStyle>;
    InsideElement: React.ReactNode;
    subtitle: string;
    subtitleStyle?: TextStyle;
}

interface FilterChipsProps {
    containerProps?: ContainerProps;
    options: Array<string>;
    selectedOptions: Array<string>;
    setSelectedOptions: (value: Array<string>) => void;
    subtitle: string;
}

function Container({ containerStyle, InsideElement, subtitle, subtitleStyle }: ContainerProps) {
    return (
        <View style={containerStyle}>
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
            <View style={styles.sectionContent}>{InsideElement}</View>
        </View>
    );
}

export default function FilterChips({ containerProps, options, selectedOptions, setSelectedOptions, subtitle }: FilterChipsProps) {
    const handleSelect = (item: string) => {
        if (selectedOptions.find((option) => option === item)) {
            const tempSelectedOptions = selectedOptions.filter((option) => option !== item);
            setSelectedOptions(tempSelectedOptions);
        } else {
            setSelectedOptions([...selectedOptions, item]);
        }
    };

    return (
        <Container
            containerStyle={[containerProps?.containerStyle, { paddingHorizontal: 20, gap: 10 }]}
            subtitle={subtitle}
            subtitleStyle={containerProps?.subtitleStyle}
            InsideElement={
                <View style={styles.filterChips}>
                    {options.map((option) => (
                        <IconButton
                            key={option}
                            onPress={() => handleSelect(option)}
                            rippleColor='rgba(128, 128, 128, 0.0)'
                            containerStyle={{ flex: 1 }}
                            IconSet={selectedOptions.includes(option) ? Ionicons : undefined}
                            iconName='checkmark'
                            iconColor={Theme.colors.gunmetalGray}
                            insideStyle={{
                                backgroundColor: selectedOptions.find((item) => item === option) ? Theme.colors.midGray : Theme.colors.jetgray,
                                borderRadius: 48,
                                // borderWidth: !selectedOptions.find(item => item === option) ? 2 : 0,
                                // borderColor: Theme.colors.jetgray,
                                justifyContent: 'center',
                                gap: 10,
                            }}
                            InsideElement={
                                <Text
                                    style={[
                                        styles.text,
                                        {
                                            color: selectedOptions.includes(option) ? Theme.colors.gunmetalGray : Theme.colors.lightGray,
                                        },
                                    ]}>
                                    {option}
                                </Text>
                            }
                        />
                    ))}
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    subtitle: {
        fontSize: Theme.fonts.subtitle,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
    text: {
        fontSize: Theme.fonts.paragraph,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sectionContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    filterChips: {
        width: '100%',

        flexDirection: 'row',
        overflow: 'hidden',
        gap: 10,
    },
});
