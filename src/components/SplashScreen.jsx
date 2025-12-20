import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Easing, 
  StatusBar, 
  Text 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../assets/theme/colors';

const LogoImage = require('../assets/images/logo.jpg');
const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  
  // Create 5 animated values for the music bars
  const barScales = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // 1. Entrance Animation (Logo Fade & Slide)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Subtle Breathing Pulse for Logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Staggered Music Bars Animation
    const startBarAnimations = () => {
      const animations = barScales.map((bar, i) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 0.4 + Math.random() * 0.6,
              duration: 500 + i * 100,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: 0.2,
              duration: 400 + i * 150,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        );
      });
      Animated.stagger(100, animations).start();
    };

    startBarAnimations();

    // 4. Navigate to main app
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[Colors.top || '#1a1a1a', Colors.middle || '#000', Colors.bottom || '#000']}
        style={styles.gradient}
      >
        {/* Logo Section */}
        <Animated.View style={[
          styles.logoWrapper,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: logoScale }] 
          }
        ]}>
          <Animated.Image
            source={LogoImage}
            resizeMode="contain"
            style={styles.logo}
          />
        </Animated.View>

        {/* Music Visualizer Section */}
        {/* <View style={styles.barsContainer}>
          {barScales.map((scale, index) => (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                { transform: [{ scaleY: scale }] }
              ]}
            />
          ))}
        </View> */}

        {/* Branding Text */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Text style={styles.footerText}>PREMIUM AUDIO EXPERIENCE</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logo: {
    width: width * 0.8,
    height: 180,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    marginTop: 20,
    gap: 6,
  },
  bar: {
    width: 6,
    height: 40, // Max height
    backgroundColor: '#fff',
    borderRadius: 3,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    letterSpacing: 3,
    fontFamily: 'Oswald-Regular', // Ensure this font is linked
  },
});

export default SplashScreen;