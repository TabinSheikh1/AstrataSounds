import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../assets/theme/colors';

// Default background image
const DefaultBgImage = require('../assets/images/overlay.jpg');

const GradientBackground = ({ children, overlayImage, opacity = 0.1 }) => {
    return (
        <View style={styles.container}>
            {/* Gradient */}
            <LinearGradient
                colors={[Colors.top, Colors.middle, Colors.bottom]}
                style={styles.gradient}
            />

            {/* Overlay Image */}
            <Image
                source={overlayImage || DefaultBgImage} // use default if none passed
                style={[styles.overlayImage, { opacity }]}
                resizeMode="contain"
            />

            {/* Screen Content */}
            <View style={styles.content}>{children}</View>
        </View>
    );
};

export default GradientBackground;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlayImage: {
        position: 'absolute',

    },
    content: {
        flex: 1,
    },
});
