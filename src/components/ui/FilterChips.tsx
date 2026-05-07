import { MAX_WIDTH } from '@/constants';
import { Theme } from '@/theme';
import { Column, FilledTonalButton, Host, Icon, Row, Shape, Text } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, height, width } from '@expo/ui/jetpack-compose/modifiers';
import React from 'react';
import { Text as RNText, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

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
    widthContainer?: number;
}

function Container({ containerStyle, InsideElement, subtitle, subtitleStyle }: ContainerProps) {
    return (
        <View style={containerStyle}>
            <RNText style={[styles.subtitle, subtitleStyle]}>{subtitle}</RNText>
            <View style={styles.sectionContent}>{InsideElement}</View>
        </View>
    );
}

export default function FilterChips({ containerProps, options, selectedOptions, setSelectedOptions, subtitle, widthContainer = ~~MAX_WIDTH - 40 }: FilterChipsProps) {
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
                    <Host matchContents>
                        <Column modifiers={[width(widthContainer), height(48)]}>
                            <Row
                                horizontalArrangement='spaceBetween'
                                modifiers={[fillMaxWidth()]}>
                                {options.map((option, index) => (
                                    <FilledTonalButton
                                        key={`segmented-control-option-${index}-${option}`}
                                        onClick={() => handleSelect(option)}
                                        modifiers={[width(widthContainer / 3 - 5), height(48)]}
                                        contentPadding={{ start: 0, end: 0 }}
                                        colors={{ containerColor: selectedOptions.find((item) => item === option) ? Theme.colors.midGray : Theme.colors.jetgray }}
                                        shape={Shape.RoundedCorner({ cornerRadii: { topStart: 24, topEnd: 24, bottomStart: 24, bottomEnd: 24 } })}>
                                        <Row
                                            verticalAlignment='center'
                                            horizontalAlignment='center'>
                                            {selectedOptions.includes(option) && (
                                                <Icon
                                                    source={require('../../../assets/icons/check.png')}
                                                    size={24}
                                                    tint={Theme.colors.gunmetalGray}></Icon>
                                            )}
                                            <Text
                                                maxLines={1}
                                                softWrap={false}
                                                style={{ fontSize: Theme.fonts.paragraph, fontWeight: 'bold' }}
                                                color={selectedOptions.includes(option) ? Theme.colors.gunmetalGray : Theme.colors.lightGray}>
                                                {option}
                                            </Text>
                                        </Row>
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
