import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    ActivityIndicator,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { dismissWelcomeModal } from '../store/slices/authSlice';
import { purchaseSubscription, getSubscriptionProducts } from '../iap/iapService';
import { SUBSCRIPTION_SKUS } from '../iap/products';
import { getErrorMessage } from '../utils/errorHandler';

const FALLBACK_PRICE = '$14.99';

const PERKS = [
    'Full access for 7 days',
    'Generate up to 10 songs',
    'Cancel anytime before day 7',
];

const TrialOnboardingModal = ({ isVisible }) => {
    const dispatch = useDispatch();
    const scaleAnim = useRef(new Animated.Value(0.7)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState(FALLBACK_PRICE);

    useEffect(() => {
        if (!isVisible) {
            scaleAnim.setValue(0.7);
            opacityAnim.setValue(0);
        }
    }, [isVisible]);

    useEffect(() => {
        let active = true;
        if (isVisible) {
            getSubscriptionProducts()
                .then((products) => {
                    const basic = products?.find((p) => (p.id ?? p.productId) === SUBSCRIPTION_SKUS.basicMonthly);
                    if (active && basic?.displayPrice) setPrice(basic.displayPrice);
                })
                .catch(() => {});
        }
        return () => { active = false; };
    }, [isVisible]);

    const handleShow = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    };

    const startTrial = async () => {
        setLoading(true);
        try {
            await purchaseSubscription(SUBSCRIPTION_SKUS.basicMonthly);
        } catch (e) {
            Alert.alert('Could not start trial', getErrorMessage(e, 'Please try again in a moment.'));
        } finally {
            setLoading(false);
        }
    };

    const skip = () => {
        if (loading) return;
        dispatch(dismissWelcomeModal());
    };

    return (
        <Modal visible={isVisible} transparent animationType="fade" onShow={handleShow} onRequestClose={skip}>
            <View style={styles.backdrop}>
                <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.iconWrap}>
                        <LinearGradient colors={['#66cc33', '#047ec9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
                            <View style={styles.iconInner}>
                                <MaterialIcons name="auto-awesome" size={28} color="#fff" />
                            </View>
                        </LinearGradient>
                    </View>

                    <Text style={styles.title}>Start Creating Music</Text>
                    <Text style={styles.subtitle}>Begin your 7-day free trial, or skip for now.</Text>

                    <View style={styles.perks}>
                        {PERKS.map((perk) => (
                            <View key={perk} style={styles.perkRow}>
                                <MaterialIcons name="check-circle" size={16} color="#66cc33" />
                                <Text style={styles.perkText}>{perk}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.priceNote}>
                        Free for 7 days, then {price}/month. Cancel anytime before the trial ends and you won't be charged.
                    </Text>

                    <TouchableOpacity activeOpacity={0.85} onPress={startTrial} disabled={loading} style={styles.ctaBtn}>
                        <LinearGradient colors={['#66cc33', '#047ec9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
                            <View style={styles.ctaContent}>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
                                )}
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={skip} disabled={loading} style={styles.skipBtn} activeOpacity={0.7}>
                        <Text style={styles.skipText}>Skip for now</Text>
                    </TouchableOpacity>
                    <Text style={styles.skipNote}>
                        You won't have any credits to generate songs until you start a trial or buy a credit pack.
                    </Text>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default TrialOnboardingModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
    },
    iconWrap: { marginBottom: 16 },
    iconCircle: { borderRadius: 40 },
    iconInner: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
    title: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 24,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.55)',
        fontFamily: 'Oswald-Regular',
        fontSize: 13.5,
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 20,
    },
    perks: {
        alignSelf: 'stretch',
        gap: 10,
        marginBottom: 18,
    },
    perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    perkText: {
        color: 'rgba(255,255,255,0.85)',
        fontFamily: 'Oswald-Regular',
        fontSize: 14,
    },
    priceNote: {
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'Oswald-Regular',
        fontSize: 11.5,
        lineHeight: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    ctaBtn: { alignSelf: 'stretch' },
    ctaGradient: { borderRadius: 16 },
    ctaContent: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    skipBtn: {
        marginTop: 16,
        paddingVertical: 6,
    },
    skipText: {
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Oswald-Regular',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    skipNote: {
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'Oswald-Regular',
        fontSize: 10.5,
        lineHeight: 15,
        textAlign: 'center',
        marginTop: 8,
    },
});
