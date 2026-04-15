import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import {
  cancelSubscription,
  reactivateSubscription,
  openBillingPortal,
} from '../api/subscriptionsService';

const STATUS_CONFIG = {
  active: { label: 'Active', color: '#66cc33', bg: 'rgba(102,204,51,0.12)' },
  free: { label: 'Free', color: '#fff', bg: 'rgba(255,255,255,0.1)' },
  trialing: { label: 'Trialing', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  past_due: { label: 'Past Due', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  canceled: { label: 'Canceled', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  unpaid: { label: 'Unpaid', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const CancelModal = ({ visible, periodEnd, onCancel, onKeep, loading }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onKeep}
    statusBarTranslucent
  >
    <TouchableWithoutFeedback onPress={onKeep}>
      <View style={cmStyles.backdrop} />
    </TouchableWithoutFeedback>
    <View style={cmStyles.box}>
      <View style={cmStyles.iconWrap}>
        <MaterialIcons name="warning" size={28} color="#FBBF24" />
      </View>
      <Text style={cmStyles.title}>Cancel Subscription?</Text>
      <Text style={cmStyles.body}>
        Your plan stays active until{' '}
        <Text style={cmStyles.bold}>{fmtDate(periodEnd)}</Text>. After that you'll
        revert to Harmony (free).
      </Text>
      <TouchableOpacity
        onPress={onCancel}
        disabled={loading}
        style={cmStyles.cancelBtn}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={cmStyles.cancelBtnText}>Yes, Cancel</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={onKeep} style={cmStyles.keepBtn}>
        <Text style={cmStyles.keepBtnText}>Keep My Plan</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

const cmStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  box: {
    position: 'absolute',
    top: '30%',
    left: 24,
    right: 24,
    backgroundColor: '#0d1117',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(251,191,36,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  body: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  bold: { color: '#fff', fontFamily: 'Oswald-Bold' },
  cancelBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  keepBtn: { padding: 12, width: '100%', alignItems: 'center' },
  keepBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
  },
});

const BillingScreen = () => {
  const navigation = useNavigation();
  const {
    subscription,
    tokens,
    tokenBalance,
    tokenGranted,
    tokenColor,
    tokenPct,
    isLoading,
    fetchSubscription,
    fetchTokens,
    refreshAll,
  } = useSubscription();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, []),
  );

  const plan = subscription?.plan;
  const status = subscription?.status ?? 'free';
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.free;
  const isFree = status === 'free';
  const isPaid = ['active', 'trialing', 'past_due'].includes(status);
  const cancelAtEnd = subscription?.cancelAtPeriodEnd ?? false;
  const periodEnd = subscription?.currentPeriodEnd;
  const periodEndFmt = fmtDate(periodEnd);
  const downloadsUsed = tokens?.downloadsUsedThisPeriod ?? 0;
  const downloadLimit = plan?.monthlyDownloadLimit ?? 5;

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelSubscription();
      await refreshAll();
      setCancelModalVisible(false);
      Alert.alert('Subscription Canceled', `Your subscription will end on ${periodEndFmt}.`);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not cancel. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      await reactivateSubscription();
      await refreshAll();
      Alert.alert('Reactivated', 'Your subscription has been reactivated.');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not reactivate. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await openBillingPortal('strataSounds://settings/billing');
      const url = res.data?.data?.url ?? res.data?.url;
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Could not open billing portal.');
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0066CC', 'rgba(0,153,153,1)', '#66cc33']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.root}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Billing & Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading && !subscription ? (
        <ActivityIndicator color="#fff" size="large" style={{ flex: 1 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Past-due warning */}
          {(status === 'past_due') && (
            <TouchableOpacity
              style={styles.pastDueBanner}
              onPress={handlePortal}
              activeOpacity={0.85}
            >
              <MaterialIcons name="warning" size={16} color="#FBBF24" />
              <Text style={styles.pastDueBannerText}>
                Payment failed — update your payment method to avoid losing access
              </Text>
              <MaterialIcons name="chevron-right" size={16} color="#FBBF24" />
            </TouchableOpacity>
          )}

          {/* Cancel-at-end warning */}
          {cancelAtEnd && (
            <View style={styles.cancelBanner}>
              <MaterialIcons name="info" size={16} color="#FBBF24" />
              <Text style={styles.cancelBannerText}>
                Your subscription ends on {periodEndFmt}. After that, you'll revert to Harmony.
              </Text>
            </View>
          )}

          {/* Plan card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>CURRENT PLAN</Text>
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>{plan?.name ?? 'Harmony'}</Text>
                {isPaid && subscription?.billingInterval && (
                  <Text style={styles.billingInterval}>
                    {subscription.billingInterval === 'yearly' ? 'Yearly billing' : 'Monthly billing'}
                  </Text>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.statusText, { color: statusCfg.color }]}>
                  {statusCfg.label}
                </Text>
              </View>
            </View>

            {isPaid && periodEnd && (
              <View style={styles.infoRow}>
                <MaterialIcons name="event" size={14} color="rgba(255,255,255,0.45)" />
                <Text style={styles.infoText}>
                  {cancelAtEnd ? 'Ends on' : 'Renews on'} {periodEndFmt}
                </Text>
              </View>
            )}
          </View>

          {/* Token balance */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>TOKEN BALANCE</Text>
            <View style={styles.tokenRow}>
              <View>
                <Text style={[styles.tokenValue, { color: tokenColor }]}>
                  {tokenBalance}
                </Text>
                <Text style={styles.tokenOf}>of {tokenGranted} tokens remaining</Text>
              </View>
              <Text style={styles.tokenCost}>7 / song</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.min(tokenPct * 100, 100)}%`, backgroundColor: tokenColor },
                ]}
              />
            </View>
            {tokens?.periodEnd && (
              <Text style={styles.resetText}>
                Resets {fmtDate(tokens.periodEnd)}
              </Text>
            )}
          </View>

          {/* Downloads */}
          {plan && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>DOWNLOADS THIS PERIOD</Text>
              <Text style={styles.downloadsValue}>
                {downloadsUsed}
                <Text style={styles.downloadsOf}>
                  {' '}/ {downloadLimit === -1 ? '∞' : downloadLimit}
                </Text>
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsCard}>
            {/* Upgrade / Change plan */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('PricingScreen')}
              activeOpacity={0.75}
            >
              <View style={styles.actionLeft}>
                <MaterialIcons name="upgrade" size={20} color="#66cc33" />
                <Text style={styles.actionText}>
                  {isFree ? 'Upgrade Plan' : 'Change Plan'}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.35)" />
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            {/* Manage payment method */}
            {isPaid && (
              <>
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handlePortal}
                  disabled={portalLoading}
                  activeOpacity={0.75}
                >
                  <View style={styles.actionLeft}>
                    <MaterialIcons name="credit-card" size={20} color="#047ec9" />
                    <Text style={styles.actionText}>Manage Payment Method</Text>
                  </View>
                  {portalLoading ? (
                    <ActivityIndicator size="small" color="#047ec9" />
                  ) : (
                    <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.35)" />
                  )}
                </TouchableOpacity>
                <View style={styles.actionDivider} />
              </>
            )}

            {/* Reactivate (if cancel-at-end) */}
            {cancelAtEnd && (
              <>
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handleReactivate}
                  disabled={actionLoading}
                  activeOpacity={0.75}
                >
                  <View style={styles.actionLeft}>
                    <MaterialIcons name="refresh" size={20} color="#66cc33" />
                    <Text style={styles.actionText}>Reactivate Subscription</Text>
                  </View>
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#66cc33" />
                  ) : (
                    <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.35)" />
                  )}
                </TouchableOpacity>
                <View style={styles.actionDivider} />
              </>
            )}

            {/* Cancel */}
            {isPaid && !cancelAtEnd && (
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => setCancelModalVisible(true)}
                activeOpacity={0.75}
              >
                <View style={styles.actionLeft}>
                  <MaterialIcons name="cancel" size={20} color="#EF4444" />
                  <Text style={[styles.actionText, { color: '#EF4444' }]}>
                    Cancel Subscription
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.35)" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      <CancelModal
        visible={cancelModalVisible}
        periodEnd={periodEnd}
        onCancel={handleCancel}
        onKeep={() => setCancelModalVisible(false)}
        loading={actionLoading}
      />
    </LinearGradient>
  );
};

export default BillingScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 12,
    paddingBottom: 12,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  screenTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  // Banners
  pastDueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  pastDueBannerText: {
    flex: 1,
    color: '#FBBF24',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    lineHeight: 17,
  },
  cancelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.2)',
  },
  cancelBannerText: {
    flex: 1,
    color: '#FBBF24',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    lineHeight: 17,
  },

  // Cards
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  billingInterval: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  infoText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
  },

  // Tokens
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tokenValue: {
    fontSize: 32,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  tokenOf: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    marginTop: 2,
  },
  tokenCost: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
  },
  barFill: { height: '100%', borderRadius: 3 },
  resetText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    marginTop: 6,
  },

  // Downloads
  downloadsValue: {
    color: '#fff',
    fontSize: 26,
    fontFamily: 'Oswald-Bold',
  },
  downloadsOf: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    fontFamily: 'Oswald-Regular',
  },

  // Actions
  actionsCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Oswald-Regular',
  },
  actionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 16,
  },
});
