import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native'
import Animated, { LinearTransition, SlideInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Theme } from '../../theme/Theme';
import { styles } from './Accordion.styles';
import { useState } from 'react';

interface AccordionProps {
    content: string;
}

export default function Accordion(props: AccordionProps) {

    const [isExpanded, setIsExpanded] = useState(false);
    const measuredHeight = useSharedValue(0);
    const animatedAccordion = useAnimatedStyle(() => {
        const animatedBorder = isExpanded ? withTiming(1) : withTiming(0);
        const animatedOpacity = isExpanded ? withTiming(1) : withTiming(0);
        return {
            height: isExpanded ? withTiming(measuredHeight.value) : withTiming(0),
            opacity: animatedOpacity,
            borderTopWidth: animatedBorder,
            borderTopColor: Theme.colors.midGray,
            overflow: 'hidden',
        }
    })
    const animatedArrow = useAnimatedStyle(() => {
        const animatedRotate = isExpanded ? withTiming('180deg') : withTiming('0deg');
        return {
            transform: [{ rotate: animatedRotate }],
        }
    })

    return (
        <View style={styles.accordion}>
            <View style={{ position: 'absolute', top: 0, opacity: 0, pointerEvents: 'none' }}
                onLayout={(event) => {
                    measuredHeight.value = event.nativeEvent.layout.height;
                }}>
                <Text style={styles.descriptionText}>
                    {props.content}
                </Text>
            </View>
            <View style={styles.accordionTrigger}>
                <TouchableNativeFeedback
                    
                    background={TouchableNativeFeedback.Ripple('rgba(224,224,224,.3)', false)}
                    useForeground={true}
                    onPress={() => setIsExpanded(!isExpanded)}
                >
                    <View style={styles.triggerContent}>
                        <View style={styles.title}>
                            <Text style={styles.titleText}>Sinopsis</Text>
                        </View>
                        <Animated.View style={[styles.icon, animatedArrow]}>
                            <Ionicons name="chevron-down" size={24} color={isExpanded ? Theme.colors.vermillion : Theme.colors.midGray} />
                        </Animated.View>
                    </View>
                </TouchableNativeFeedback>
            </View>
            <Animated.View
                style={animatedAccordion}
            >
                <View style={styles.description}>
                    <Text style={styles.descriptionText}>
                        {props.content}
                    </Text>
                </View>
            </Animated.View>
        </View>
    )
}
