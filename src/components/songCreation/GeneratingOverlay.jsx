import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './songCreationStyles';

const GeneratingOverlay = ({ visible, step }) => {
    const pulse = useRef(new Animated.Value(0.6)).current;
    useEffect(() => {
        if (!visible) return;
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.6, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, [visible]);

    if (!visible) return null;
    return (
        <View style={styles.genOverlay}>
            <LinearGradient colors={['rgba(10,10,26,0.96)', 'rgba(0,50,100,0.96)']} style={styles.genOverlayInner}>
                <Animated.View style={[styles.genSpinWrap, { opacity: pulse }]}>
                    <LinearGradient colors={['#66cc33', '#047ec9']} style={styles.genSpinGrad}>
                        <MaterialIcons name="auto-awesome" size={32} color="#fff" />
                    </LinearGradient>
                </Animated.View>
                <Text style={styles.genTitle}>Generating Your Song</Text>
                <Text style={styles.genStep}>{step || 'Starting up...'}</Text>
                <View style={styles.genDots}>
                    {[0, 1, 2].map((i) => (
                        <Animated.View key={i} style={[styles.genDot, { opacity: pulse }]} />
                    ))}
                </View>
            </LinearGradient>
        </View>
    );
};

export default GeneratingOverlay;
