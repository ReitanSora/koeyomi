import { Theme } from '@/theme';
import { DropdownMenu, DropdownMenuItem, Host } from '@expo/ui/jetpack-compose';
import { align, clip, Shapes, width } from '@expo/ui/jetpack-compose/modifiers';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import IconButton from './IconButton';

interface DropdownProps {
    options: Array<{ label: string; value: string }>;
    selectedOption: string;
    setSelectedOption: (value: string) => void;
}

export default function Dropdown({ options, selectedOption, setSelectedOption }: DropdownProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const selectedLabel = options.find((l) => l.value === selectedOption)?.label ?? '';
    return (
        <Host
            matchContents
            style={{ width: '100%'}}
            >
            <DropdownMenu
                expanded={isExpanded}
                color={Theme.colors.jetgray}
                onDismissRequest={() => setIsExpanded(false)}>
                <DropdownMenu.Trigger>
                    <IconButton
                        IconSet={Ionicons}
                        iconName='chevron-down'
                        iconColor={Theme.colors.lightGray}
                        iconSize={20}
                        onPress={() => setIsExpanded(true)}
                        containerStyle={{ width: '100%', borderRadius: 0 }}
                        insideStyle={{ paddingHorizontal: 20, flexDirection: 'row-reverse',justifyContent: 'flex-end', gap: 10 }}
                        InsideElement={<Text style={[styles.text, { fontWeight: 'bold' }]}>{selectedLabel}</Text>}
                    />
                </DropdownMenu.Trigger>
                <DropdownMenu.Items>
                    {options.map((option) => {
                        return (
                            <DropdownMenuItem
                                key={`${option.label}-dropdown`}
                                modifiers={[width(150)]}
                                onClick={() => {
                                    setSelectedOption(option.value);
                                    setIsExpanded(false);
                                }}>
                                <DropdownMenuItem.Text>
                                    <Text style={styles.text}>{option.label}</Text>
                                </DropdownMenuItem.Text>
                            </DropdownMenuItem>
                            // <IconButton
                            //     key={`${option.label}-dropdown`}
                            //     onPress={() => setIsExpanded(false)}
                            //     containerStyle={{ width: '100%', borderRadius: 0 }}
                            //     insideStyle={{ flex: 1, flexDirection: 'row-reverse', gap: 10 }}
                            //     TextElement={
                            //         <>
                            //             <Text style={styles.text}>{option.label}</Text>
                            //         </>
                            //     }
                            // />
                        );
                    })}
                </DropdownMenu.Items>
            </DropdownMenu>
        </Host>
    );
}

const styles = StyleSheet.create({
    trigger: {
        width: '100%',
    },
    text: {
        fontSize: Theme.fonts.paragraph,
        color: Theme.colors.lightGray,
        textAlign: 'center',
    },
    menu: {
        position: 'absolute',
        top: 0,

        width: '100%',
        backgroundColor: Theme.colors.jetgray,

        overflow: 'hidden',

        borderRadius: Theme.borders.cardItem,
    },
});
