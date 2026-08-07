import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Gift, Sparkles } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { dismissWelcomeModal } from '../store/slices/authSlice';
import { navigationRef } from '../../App';

const FREE_TOKENS = 500;

const WelcomeTokensModal = ({ isVisible }) => {
    const dispatch = useDispatch();
    const scaleAnim = useRef(new Animated.Value(0.7)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const glowPulse = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 60,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowPulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                    Animated.timing(glowPulse, { toValue: 0.85, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                ]),
            ).start();
        } else {
            scaleAnim.setValue(0.7);
            opacityAnim.setValue(0);
        }
    }, [isVisible]);

    const handleDismiss = () => {
        dispatch(dismissWelcomeModal());
    };

    const handleViewPlans = () => {
        dispatch(dismissWelcomeModal());
        if (navigationRef.isReady()) {
            navigationRef.navigate('PricingScreen');
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={isVisible}
            onRequestClose={handleDismiss}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.cardWrap,
                        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <View style={styles.card}>
                    <Animated.View style={[styles.iconGlow, { opacity: glowPulse }]} />
                    <View style={styles.cardInner}>
                        <LinearGradient
                            colors={['#0d1117', '#0d2a1a', '#0a1628']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.6, y: 1 }}
                            style={styles.cardBackground}
                        />

                        <View style={styles.iconBadgeWrap}>
                            <LinearGradient
                                colors={['#66cc33', '#047ec9']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.iconBadge}
                            >
                                <Gift color="#fff" size={34} />
                            </LinearGradient>
                            <View style={styles.sparkle1}>
                                <Sparkles color="#FFD700" size={16} />
                            </View>
                            <View style={styles.sparkle2}>
                                <Sparkles color="#66cc33" size={12} />
                            </View>
                        </View>

                        <Text style={styles.title}>Welcome to Astrata Sounds!</Text>
                        <Text style={styles.subtitle}>
                            You've been gifted a free trial to start creating right away.
                        </Text>

                        <View style={styles.tokenPill}>
                            <Text style={styles.tokenNumber}>{FREE_TOKENS}</Text>
                            <Text style={styles.tokenLabel}>FREE TOKENS</Text>
                        </View>

                        <Text style={styles.body}>
                            That's enough for 5 full songs or 5 reels — no credit card required.
                            Want more? You can upgrade anytime.
                        </Text>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleDismiss}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#66cc33', '#047ec9']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryButtonGradient}
                            >
                                <Text style={styles.primaryButtonText}>START CREATING</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleViewPlans}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryButtonText}>View Subscription Plans</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default WelcomeTokensModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    cardWrap: {
        width: '100%',
        maxWidth: 380,
    },
    card: {
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#66cc33',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 14,
    },
    cardInner: {
        width: '100%',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(102,204,51,0.25)',
        paddingVertical: 32,
        paddingHorizontal: 26,
        alignItems: 'center',
        overflow: 'hidden',
    },
    cardBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    iconGlow: {
        position: 'absolute',
        top: -30,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(102,204,51,0.12)',
        shadowColor: '#66cc33',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
    },
    iconBadgeWrap: {
        position: 'relative',
        marginBottom: 18,
    },
    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#047ec9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 8,
    },
    sparkle1: {
        position: 'absolute',
        top: -8,
        right: -10,
    },
    sparkle2: {
        position: 'absolute',
        bottom: -4,
        left: -12,
    },
    title: {
        color: '#fff',
        fontSize: 21,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: 'Oswald-Regular',
        textAlign: 'center',
        lineHeight: 19,
        marginBottom: 22,
        paddingHorizontal: 6,
    },
    tokenPill: {
        alignItems: 'center',
        backgroundColor: 'rgba(102,204,51,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(102,204,51,0.3)',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 36,
        marginBottom: 18,
    },
    tokenNumber: {
        color: '#66cc33',
        fontSize: 40,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 1,
    },
    tokenLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 2,
        marginTop: 2,
    },
    body: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontFamily: 'Oswald-Regular',
        textAlign: 'center',
        lineHeight: 19,
        marginBottom: 24,
    },
    primaryButton: {
        width: '100%',
       
       
        alignSelf: 'stretch',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#047ec9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
        marginBottom: 12,
    },
    primaryButtonGradient: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 1.5,
    },
    secondaryButton: {
        width: '100%',
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 1,
    },
});
