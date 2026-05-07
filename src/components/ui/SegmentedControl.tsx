import { Theme } from '@/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import IconButton from './IconButton';

interface ContainerProps {
    containerStyle?: StyleProp<ViewStyle>;
    InsideElement: React.ReactNode;
    subtitle?: string;
    subtitleStyle?: TextStyle;
}

interface SegmentedControlProps {
    containerProps?: ContainerProps;
    options: Array<string>;
    selectedOption: string | undefined;
    setSelectedOption: (value: any) => void;
    subtitle?: string;
    textStyle?: TextStyle;
}

function Container({ containerStyle, InsideElement, subtitle, subtitleStyle }: ContainerProps) {
    return (
        <View style={containerStyle}>
            {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
            <View style={styles.sectionContent}>{InsideElement}</View>
        </View>
    );
}

export default function SegmentedControl({ containerProps, options, selectedOption, setSelectedOption, subtitle, textStyle }: SegmentedControlProps) {
    return (
        <Container
            containerStyle={[containerProps?.containerStyle, { paddingHorizontal: 20, gap: 10 }]}
            subtitle={subtitle}
            subtitleStyle={containerProps?.subtitleStyle}
            InsideElement={
                <View style={styles.segmentedControl}>
                    {options.map((option) => (
                        <IconButton
                            key={option}
                            onPress={() => setSelectedOption(option)}
                            rippleColor='rgba(128, 128, 128, 0.1)'
                            containerStyle={{ flex: 1 }}
                            insideStyle={{
                                backgroundColor: option === selectedOption ? Theme.colors.midGray : 'transparent',
                                borderRadius: 48,
                                paddingHorizontal: 20,
                                justifyContent: 'center',
                            }}
                            InsideElement={<Text style={[styles.text, textStyle, { color: option === selectedOption ? Theme.colors.gunmetalGray : Theme.colors.lightGray }]}>{option}</Text>}
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
        textTransform: 'capitalize',
    },
    sectionContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    segmentedControl: {
        width: '100%',
        backgroundColor: Theme.colors.jetgray,
        padding: 5,

        flexDirection: 'row',
        overflow: 'hidden',

        borderRadius: 58,
    },
});
