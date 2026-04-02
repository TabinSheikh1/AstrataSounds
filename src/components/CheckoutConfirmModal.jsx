import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createCheckoutSession } from '../api/subscriptionsService';

const PLAN_PERKS = {
  Harmony: [
    '500 tokens/month (~7 AI songs)',
    '5 downloads/month',
    '5 Vibe presets',
    '10 playlists max',
  ],
  Melody: [
    '2,500 tokens/month (~35 AI songs)',
    '30 downloads/month',
    '25 Vibe presets',
    'Unlimited playlists',
    'Priority queue',
  ],
  Symphony: [
    '7,000 tokens/month (~100 AI songs)',
    'Unlimited downloads & Vibes',
    'Unlimited playlists',
    'Commercial license',
    'Early access features',
  ],
};

const CheckoutConfirmModal = ({
  visible,
  onClose,
  plan,
  billingInterval,
}) => {
  const [loading, setLoading] = useState(false);

  if (!plan) return null;

  const isYearly = billingInterval === 'yearly';
  const yearlyPrice = plan.priceYearly ?? plan.priceMonthly * 12 * 0.8;
  const effectiveMonthly = isYearly
    ? (yearlyPrice / 12)
    : plan.priceMonthly;
  const displayPrice = isYearly
    ? `$${yearlyPrice}/yr`
    : `$${plan.priceMonthly}/mo`;
  const perks = PLAN_PERKS[plan.name] ?? [];

  const handleProceed = async () => {
    setLoading(true);
    try {
      const res = await createCheckoutSession({
        planId: plan.id,
        billingInterval,
        successUrl: 'strataSounds://subscription/success',
        cancelUrl: 'strataSounds://subscription/cancel',
      });
      const checkoutUrl = res.data?.data?.url ?? res.data?.url;


      if (checkoutUrl) {
        onClose();
        await Linking.openURL(checkoutUrl);
      } else {
        Alert.alert('Error', 'Could not get checkout URL. Please try again.');
      }
    } catch (e) {
      Alert.alert(
        'Checkout Failed',
        e?.response?.data?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Confirm Your Plan</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={22} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        {/* Plan summary */}
        <View style={styles.planCard}>
          <LinearGradient
            colors={['rgba(0,102,204,0.2)', 'rgba(102,204,51,0.1)']}
            style={styles.planGrad}
          >
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.intervalBadge}>
                  {isYearly ? 'Yearly · Save ~20%' : 'Monthly'}
                </Text>
              </View>
              <View style={styles.priceWrap}>
                <Text style={styles.price}>{displayPrice}</Text>
                {isYearly && (
                  <Text style={styles.effMonthly}>${effectiveMonthly.toFixed(2)}/mo</Text>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Perks */}
          <View style={styles.perksSection}>
            {perks.map((p, i) => (
              <View key={i} style={styles.perkRow}>
                <MaterialIcons name="check-circle" size={15} color="#66cc33" />
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleProceed}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={loading ? ['#555', '#444'] : ['#66cc33', '#047ec9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proceedBtn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="lock" size={16} color="#fff" />
                  <Text style={styles.proceedText}>Proceed to Payment</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CheckoutConfirmModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d1117',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  closeBtn: { padding: 4 },
  planCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(102,204,51,0.25)',
    marginBottom: 20,
  },
  planGrad: {
    // padding: 16,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  planName: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  intervalBadge: {
    color: '#66cc33',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  priceWrap: { alignItems: 'flex-end' },
  price: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
  },
  effMonthly: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    marginTop: 2,
  },
  perksSection: {
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  perkText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
    flex: 1,
  },
  actions: { paddingHorizontal: 20 },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,

    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#66cc33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 52,
  },
  proceedText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
  },
});
