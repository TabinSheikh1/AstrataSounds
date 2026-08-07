import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../hooks/useSubscription';

// Simple confetti particle
const Particle = ({ style }) => (
  <Animated.View style={[styles.particle, style]} />
);

const COLORS = ['#66cc33', '#047ec9', '#FBBF24', '#fff', '#0066CC'];

// Plan activation happens via an async Stripe webhook, which can land after
// (not before) the OS finishes the deep-link redirect back into the app —
// so we poll briefly instead of trusting a single one-shot refetch.
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 6; // ~12s total before we stop waiting and show a softer message

const SubscriptionSuccessScreen = () => {
  const navigation = useNavigation();
  const { subscription, refreshAll } = useSubscription();

  const [confirming, setConfirming] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const attemptsRef = useRef(0);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    [...Array(18)].map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    })),
  ).current;

  const isConfirmedActive = subscription?.status === 'active' && subscription?.plan?.tier !== 'spark';

  // Kick off the first check as soon as the deep link lands us here.
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Keep polling until the plan actually reflects the upgrade, or we give up.
  useEffect(() => {
    if (!confirming) return undefined;

    if (isConfirmedActive) {
      setConfirming(false);
      return undefined;
    }

    if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
      setTimedOut(true);
      setConfirming(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      attemptsRef.current += 1;
      refreshAll();
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [subscription, confirming, isConfirmedActive, refreshAll]);

  const handleManualRetry = () => {
    attemptsRef.current = 0;
    setTimedOut(false);
    setConfirming(true);
    refreshAll();
  };

  useEffect(() => {
    if (confirming) return; // hold the celebration animation until confirmation resolves

    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 55,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti burst
    const { width: W } = require('react-native').Dimensions.get('window');
    confettiAnims.forEach((anim, i) => {
      const angle = (i / confettiAnims.length) * Math.PI * 2;
      const dist = 80 + Math.random() * 120;
      Animated.sequence([
        Animated.delay(i * 40),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(anim.x, {
            toValue: Math.cos(angle) * dist,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: Math.sin(angle) * dist - 40,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() > 0.5 ? 360 : -360,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });
  }, [confirming, confettiAnims, fadeAnim, scaleAnim]);

  const planName = subscription?.plan?.name ?? 'your new plan';

  if (confirming) {
    return (
      <ImageBackground
        source={require('../assets/images/image-1.jpg')}
        style={styles.root}
        resizeMode="cover"
      >
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#66cc33" />
          <Text style={styles.confirmingTitle}>Confirming your payment...</Text>
          <Text style={styles.note}>This only takes a few seconds.</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/image-1.jpg')}
      style={styles.root}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.center}>
        {/* Confetti */}
        {confettiAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: COLORS[i % COLORS.length],
                opacity: anim.opacity,
                transform: [
                  { translateX: anim.x },
                  { translateY: anim.y },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ['-360deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        {/* Icon */}
        <Animated.View
          style={[
            styles.iconWrap,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={['#66cc33', '#047ec9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGrad}
          >
            <MaterialIcons name="check" size={48} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.title}>{timedOut ? 'Payment received!' : "You're all set!"}</Text>
          {timedOut ? (
            <Text style={styles.note}>
              We're still finishing setup on our end — this can take a minute. Pull to refresh on the billing screen if your plan doesn't show up right away.
            </Text>
          ) : (
            <>
              <Text style={styles.subtitle}>
                You're now on{' '}
                <Text style={styles.planName}>{planName}</Text>
              </Text>
              <Text style={styles.note}>
                Your song credits have been refreshed. Start creating AI music now.
              </Text>
            </>
          )}
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', marginTop: 32 }}>
          {timedOut && (
            <TouchableOpacity onPress={handleManualRetry} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Check again</Text>
            </TouchableOpacity>
          )}

          {/* Start Creating */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MainApp')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#66cc33', '#047ec9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.ctaBtn}>
                <MaterialIcons name="bolt" size={20} color="#fff" />
                <Text style={styles.ctaBtnText}>Start Creating</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* View billing */}
          <TouchableOpacity
            onPress={() => navigation.navigate('BillingScreen')}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>View Billing Details</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default SubscriptionSuccessScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 12,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confirmingTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    marginTop: 20,
    marginBottom: 6,
    textAlign: 'center',
  },
  iconWrap: { marginBottom: 24 },
  iconGrad: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#66cc33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 18,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    marginBottom: 12,
  },
  planName: {
    color: '#66cc33',
    fontFamily: 'Oswald-Bold',
  },
  note: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    lineHeight: 19,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#66cc33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  secondaryBtn: { alignItems: 'center', padding: 12 },
  secondaryBtnText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
    textDecorationLine: 'underline',
  },
});
