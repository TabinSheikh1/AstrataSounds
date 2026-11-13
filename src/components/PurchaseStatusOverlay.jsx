import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { purchaseDismissed } from '../store/slices/subscriptionSlice';

const PurchaseStatusOverlay = () => {
    const dispatch = useDispatch();
    const { purchaseStatus, purchaseResult } = useSelector((s) => s.subscription);
    const scaleAnim = useRef(new Animated.Value(0.7)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const visible = purchaseStatus === 'pending' || purchaseStatus === 'success';
    const isSuccess = purchaseStatus === 'success';

    useEffect(() => {
        if (!visible) {
            scaleAnim.setValue(0.7);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const handleShow = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    };

    const dismiss = () => dispatch(purchaseDismissed());

    return (
        <Modal visible={visible} transparent animationType="fade" onShow={handleShow} onRequestClose={isSuccess ? dismiss : undefined}>
            <View style={styles.backdrop}>
                {isSuccess ? (
                    <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.iconWrap}>
                            <LinearGradient colors={['#66cc33', '#047ec9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
                                <View style={styles.iconInner}>
                                    <MaterialIcons name="check" size={34} color="#fff" />
                                </View>
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>{purchaseResult?.title ?? 'Purchase Complete'}</Text>
                        <Text style={styles.message}>{purchaseResult?.message ?? 'Your purchase was successful.'}</Text>
                        <TouchableOpacity activeOpacity={0.85} onPress={dismiss} style={styles.ctaBtn}>
                            <LinearGradient colors={['#66cc33', '#047ec9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
                                <View style={styles.ctaContent}>
                                    <Text style={styles.ctaText}>Continue</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                ) : (
                    <View style={styles.pendingBox}>
                        <ActivityIndicator size="large" color="#66cc33" />
                        <Text style={styles.pendingText}>Completing your purchase…</Text>
                        <Text style={styles.pendingSub}>Please don't close the app.</Text>
                    </View>
                )}
            </View>
        </Modal>
    );
};

export default PurchaseStatusOverlay;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.78)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    pendingBox: {
        alignItems: 'center',
        gap: 14,
    },
    pendingText: {
        color: '#fff',
        fontFamily: 'Oswald-Regular',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    pendingSub: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Oswald-Regular',
        fontSize: 12,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 26,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
    },
    iconWrap: { marginBottom: 16 },
    iconCircle: { borderRadius: 44 },
    iconInner: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
    title: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 22,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    message: {
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Oswald-Regular',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 22,
    },
    ctaBtn: { alignSelf: 'stretch' },
    ctaGradient: { borderRadius: 16 },
    ctaContent: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 15,
        letterSpacing: 0.5,
    },
});
