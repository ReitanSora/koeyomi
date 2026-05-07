import { MAX_WIDTH } from '@/constants';
import { Theme } from '@/theme';
import { Column, FilledTonalButton, Host, Row, Shape, Text } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, height, width } from '@expo/ui/jetpack-compose/modifiers';
import React from 'react';
import { Text as RNText, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

interface ContainerProps {
    containerStyle?: StyleProp<ViewStyle>;
    InsideElement: React.ReactNode;
    subtitle?: string;
    subtitleStyle?: TextStyle;
}

interface SegmentedControlProps {
    containerProps?: ContainerProps;
    options: Array<{
        label: string;
        value: string;
    }>;
    widthContainer?: number;
    selectedOption: string | undefined;
    setSelectedOption: (value: any) => void;
    subtitle?: string;
    textStyle?: TextStyle;
}

function Container({ containerStyle, InsideElement, subtitle, subtitleStyle }: ContainerProps) {
    return (
        <View style={containerStyle}>
            {subtitle && <RNText style={[styles.subtitle, subtitleStyle]}>{subtitle}</RNText>}
            <View style={styles.sectionContent}>{InsideElement}</View>
        </View>
    );
}

export default function SegmentedControl({ containerProps, options, widthContainer = ~~MAX_WIDTH - 40, selectedOption, setSelectedOption, subtitle, textStyle }: SegmentedControlProps) {
    return (
        <Container
            containerStyle={[containerProps?.containerStyle, { paddingHorizontal: 20, gap: 10 }]}
            subtitle={subtitle}
            subtitleStyle={containerProps?.subtitleStyle}
            InsideElement={
                <View style={styles.segmentedControl}>
                    <Host matchContents>
                        <Column modifiers={[width(widthContainer - 10), height(48)]}>
                            <Row
                                horizontalArrangement='spaceBetween'
                                modifiers={[fillMaxWidth()]}>
                                {options.map((option, index) => (
                                    <FilledTonalButton
                                        key={`segmented-control-option-${index}-${option}`}
                                        onClick={() => setSelectedOption(option.value)}
                                        modifiers={[width(widthContainer / 2), height(48)]}
                                        colors={{ containerColor: option.value === selectedOption ? Theme.colors.midGray : 'transparent' }}
                                        shape={Shape.RoundedCorner({ cornerRadii: { topStart: 24, topEnd: 24, bottomStart: 24, bottomEnd: 24 } })}>
                                        <Text
                                            style={{ fontSize: Theme.fonts.paragraph, fontWeight: 'bold' }}
                                            color={option.value === selectedOption ? Theme.colors.gunmetalGray : Theme.colors.lightGray}>
                                            {option.label}
                                        </Text>
                                    </FilledTonalButton>
                                ))}
                            </Row>
                        </Column>
                    </Host>
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
