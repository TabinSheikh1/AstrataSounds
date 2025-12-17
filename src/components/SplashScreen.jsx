import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../assets/theme/colors';

const LogoImage = require('../assets/images/logo.jpg');
const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  // animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // logo animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // navigation timer
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.top, Colors.middle, Colors.bottom]}
      style={styles.container}
    >
      <Animated.Image
        source={LogoImage}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.9,
    height: 180,
  },
});

export default SplashScreen;
