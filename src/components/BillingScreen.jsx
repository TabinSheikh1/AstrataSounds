import React from 'react';
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
  Linking,
  ImageBackground,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useSubscription } from '../hooks/useSubscription';

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

const BillingScreen = () => {
  const navigation = useNavigation();
  const {
    subscription,
    tokens,
    tokenBalance,
    tokenGranted,
    purchasedBalance,
    totalBalance,
    tokenColor,
    tokenPct,
    isLoading,
    refreshAll,
  } = useSubscription();

  // Credits display helpers (100 tokens = 1 full-song credit)
  const toCredits = (t) => (t / 100).toFixed(1).replace(/\.0$/, '');


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
  const downloadsUsed = subscription?.downloadsUsedThisPeriod ?? 0;
  const downloadLimit = plan?.monthlyDownloadLimit ?? 5;

  // Subscriptions are bought through the App Store / Google Play, so cancelling, changing
  // the payment method and reactivating all happen in the store's own settings.
  const openStoreSubscriptions = () => {
    const url = Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Could not open settings',
        Platform.OS === 'ios'
          ? 'Open Settings → your name → Subscriptions.'
          : 'Open the Play Store → profile icon → Payments & subscriptions → Subscriptions.',
      );
    });
  };

  return (
    <ImageBackground
      source={require('../assets/images/image-1.jpg')}
      style={styles.root}
      resizeMode="cover"
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
              onPress={openStoreSubscriptions}
              activeOpacity={0.85}
            >
              <MaterialIcons name="warning" size={16} color="#FBBF24" />
              <Text style={styles.pastDueBannerText}>
                Payment failed — update your payment method in your store account to avoid losing access
              </Text>
              <MaterialIcons name="chevron-right" size={16} color="#FBBF24" />
            </TouchableOpacity>
          )}

          {/* Cancel-at-end warning */}
          {cancelAtEnd && (
            <View style={styles.cancelBanner}>
              <MaterialIcons name="info" size={16} color="#FBBF24" />
              <Text style={styles.cancelBannerText}>
                Your subscription ends on {periodEndFmt}. After that, you'll revert to Spark.
              </Text>
            </View>
          )}

          {/* Plan card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>CURRENT PLAN</Text>
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>{plan?.name ?? 'Spark'}</Text>
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

          {/* Song Credits balance */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>SONG CREDITS</Text>
            <View style={styles.tokenRow}>
              <View>
                <Text style={[styles.tokenValue, { color: tokenColor }]}>
                  {toCredits(tokenBalance)}
                </Text>
                <Text style={styles.tokenOf}>of {toCredits(tokenGranted)} credits this period</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.tokenCost}>Full song · 1 credit</Text>
                <Text style={[styles.tokenCost, { marginTop: 2 }]}>Reel (15s or 30s) · 1 credit</Text>
              </View>
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

            {/* Manage / cancel — handled by the store that billed the subscription */}
            {isPaid && (
              <TouchableOpacity
                style={styles.actionRow}
                onPress={openStoreSubscriptions}
                activeOpacity={0.75}
              >
                <View style={styles.actionLeft}>
                  <MaterialIcons name="credit-card" size={20} color="#047ec9" />
                  <Text style={styles.actionText}>
                    {Platform.OS === 'ios' ? 'Manage in App Store' : 'Manage in Google Play'}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.35)" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

    </ImageBackground>
  );
};

export default BillingScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d1117' },
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

  // Buy tokens

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
