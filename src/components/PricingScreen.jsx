import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useSubscription } from '../hooks/useSubscription';
import CheckoutConfirmModal from './CheckoutConfirmModal';
import { creditPackCheckout } from '../api/subscriptionsService';

// ─── Plan display metadata ────────────────────────────────────────────────────

const PLAN_META = {
  Spark: {
    tagline: 'Try it free, no card needed',
    icon: 'auto-awesome',
    accentColor: 'rgba(255,255,255,0.15)',
    highlight: false,
    badgeLabel: null,
  },
  Basic: {
    tagline: 'More songs, no watermark',
    icon: 'music-note',
    accentColor: 'rgba(4,126,201,0.2)',
    highlight: false,
    badgeLabel: null,
  },
  Pro: {
    tagline: 'Built for serious creators',
    icon: 'queue-music',
    accentColor: 'rgba(102,204,51,0.15)',
    highlight: true,
    badgeLabel: 'MOST POPULAR',
  },
  Creator: {
    tagline: 'Full creative control',
    icon: 'workspace-premium',
    accentColor: 'rgba(255,165,0,0.15)',
    highlight: false,
    badgeLabel: 'BEST VALUE',
  },
  Commercial: {
    tagline: 'For agencies & brands',
    icon: 'business-center',
    accentColor: 'rgba(200,50,255,0.15)',
    highlight: false,
    badgeLabel: null,
  },
};

// ─── Credit pack config ───────────────────────────────────────────────────────

const CREDIT_PACKS = [
  {
    packSize: 5,
    songs: 5,
    price: '$7.99',
    priceNote: '$1.60/song',
    label: 'Starter Pack',
    highlight: false,
  },
  {
    packSize: 15,
    songs: 15,
    price: '$19.99',
    priceNote: '$1.33/song',
    label: 'Value Pack',
    highlight: true,
  },
  {
    packSize: 50,
    songs: 50,
    price: '$59.99',
    priceNote: '$1.20/song',
    label: 'Creator Pack',
    highlight: false,
  },
];

// ─── Plan Card ────────────────────────────────────────────────────────────────

const PlanCard = ({ plan, isYearly, currentPlanId, isAuthenticated, onUpgrade }) => {
  const meta = PLAN_META[plan.name] ?? {};
  const isCurrent = plan.id === currentPlanId;
  const isFree = plan.name === 'Spark';

  const priceMonthly = parseFloat(plan.priceMonthly) || 0;
  const priceYearly = parseFloat(plan.priceYearly) || priceMonthly * 12 * 0.8;
  const effectiveMonthly = isYearly
    ? (priceYearly / 12).toFixed(2)
    : priceMonthly.toFixed(2);

  return (
    <View
      style={[
        styles.card,
        meta.highlight && styles.cardHighlight,
        isCurrent && styles.cardCurrent,
      ]}
    >
      {meta.badgeLabel && (
        <LinearGradient
          colors={meta.highlight ? ['#66cc33', '#047ec9'] : ['#ff9500', '#e67300']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badge}
        >
          <View style={{padding:12, flexDirection: 'row', gap:4, alignItems:'center'}}>
            <MaterialIcons name="star" size={10} color="#fff" />
            <Text style={styles.badgeText}>{meta.badgeLabel}</Text>
          </View>
        </LinearGradient>
      )}

      {isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: meta.accentColor }]}>
          <MaterialIcons
            name={meta.icon ?? 'music-note'}
            size={22}
            color={meta.highlight ? '#66cc33' : '#fff'}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planTagline}>{meta.tagline}</Text>
        </View>
      </View>

      {!isFree && (
        <View style={styles.priceSection}>
          {isYearly ? (
            <>
              <Text style={styles.priceText}>
                ${effectiveMonthly}
                <Text style={styles.perMonth}>/mo</Text>
              </Text>
              <Text style={styles.yearlyNote}>${priceYearly.toFixed(2)} billed yearly</Text>
            </>
          ) : (
            <Text style={styles.priceText}>
              ${effectiveMonthly}
              <Text style={styles.perMonth}>/mo</Text>
            </Text>
          )}
        </View>
      )}

      <View style={styles.divider} />

      {(plan.perks ?? []).map((perk, i) => (
        <View key={i} style={styles.perkRow}>
          <MaterialIcons name="check-circle" size={14} color="#66cc33" />
          <Text style={styles.perkText}>{perk}</Text>
        </View>
      ))}

      <View style={styles.ctaWrap}>
        {isCurrent ? (
          <View style={styles.currentBtn}>
            <MaterialIcons name="check" size={15} color="#66cc33" />
            <Text style={styles.currentBtnText}>Your Current Plan</Text>
          </View>
        ) : isFree ? (
          <View style={styles.freeBtn}>
            <Text style={styles.freeBtnText}>Free Forever</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => isAuthenticated && onUpgrade(plan)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={meta.highlight ? ['#66cc33', '#047ec9'] : ['#047ec9', '#0066CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeBtn}
            >
              <MaterialIcons name="bolt" size={15} color="#fff" />
              <Text style={styles.upgradeBtnText}>Upgrade to {plan.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Credit Pack Card ─────────────────────────────────────────────────────────

const CreditPackCard = ({ pack, onBuy, loading }) => (
  <View style={[styles.packCard, pack.highlight && styles.packCardHighlight]}>
    {pack.highlight && (
      <View style={styles.packBestValue}>
        <Text style={styles.packBestValueText}>BEST VALUE</Text>
      </View>
    )}
    <Text style={styles.packSongs}>{pack.songs} Songs</Text>
    <Text style={styles.packLabel}>{pack.label}</Text>
    <Text style={styles.packPrice}>{pack.price}</Text>
    <Text style={styles.packPriceNote}>{pack.priceNote}</Text>
    <TouchableOpacity
      onPress={() => onBuy(pack)}
      activeOpacity={0.85}
      disabled={loading}
      style={[styles.packBtn, pack.highlight && styles.packBtnHighlight]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.packBtnText}>Buy</Text>
      )}
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const PricingScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { subscription, plans, fetchPlans } = useSubscription();

  const [isYearly, setIsYearly] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState({ visible: false, plan: null });
  const [packLoadingId, setPackLoadingId] = useState(null);

  useEffect(() => {
    if (plans.length === 0) {
      setPlansLoading(true);
      fetchPlans().finally(() => setPlansLoading(false));
    }
  }, []);

  const currentPlanId = subscription?.plan?.id ?? null;
  const isOnPaidPlan = subscription && subscription.status !== 'free';
  const visiblePlans = plans.filter((p) => !(p.name === 'Spark' && isOnPaidPlan));

  const handleUpgrade = (plan) => {
    setCheckoutModal({ visible: true, plan });
  };

  const handleBuyPack = async (pack) => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please sign in to purchase a credit pack.');
      return;
    }
    setPackLoadingId(pack.packSize);
    try {
      const res = await creditPackCheckout({
        packSize: pack.packSize,
        successUrl: 'strataSounds://subscription/success',
        cancelUrl: 'strataSounds://subscription/cancel',
      });
      const url = res.data?.data?.url ?? res.data?.url;
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Could not start checkout. Please try again.');
      }
    } catch (e) {
      Alert.alert('Purchase Failed', e?.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setPackLoadingId(null);
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

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Plans & Credits</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Unlock Your{'\n'}Creative Potential</Text>
        <Text style={styles.subheadline}>
          Generate full songs or short reels. Pick a plan or grab a credit pack anytime.
        </Text>

        {/* Billing toggle */}
        <View style={styles.toggleWrap}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isYearly && styles.toggleBtnActive]}
            onPress={() => setIsYearly(false)}
          >
            <Text style={[styles.toggleText, !isYearly && styles.toggleTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isYearly && styles.toggleBtnActive]}
            onPress={() => setIsYearly(true)}
          >
            <Text style={[styles.toggleText, isYearly && styles.toggleTextActive]}>Yearly</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>~20% off</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Subscription plans */}
        {plansLoading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 48 }} />
        ) : (
          visiblePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isYearly={isYearly}
              currentPlanId={currentPlanId}
              isAuthenticated={isAuthenticated}
              onUpgrade={handleUpgrade}
            />
          ))
        )}

        {/* Credit packs divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.sectionDividerText}>OR BUY A CREDIT PACK</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.packSectionNote}>
          One-time purchase. Credits never expire. Works on all plans including free.
        </Text>

        {/* Generation cost reference */}
        <View style={styles.costReference}>
          <View style={styles.costRow}>
            <MaterialIcons name="music-note" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.costText}>Full song — 1 credit</Text>
          </View>
          <View style={styles.costRow}>
            <MaterialIcons name="timer" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.costText}>30s reel — 0.5 credits</Text>
          </View>
          <View style={styles.costRow}>
            <MaterialIcons name="timer" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.costText}>15s reel — 0.25 credits</Text>
          </View>
        </View>

        {/* Credit pack cards */}
        <View style={styles.packRow}>
          {CREDIT_PACKS.map((pack) => (
            <CreditPackCard
              key={pack.packSize}
              pack={pack}
              loading={packLoadingId === pack.packSize}
              onBuy={handleBuyPack}
            />
          ))}
        </View>

        {/* Cover art upsell note */}
        <View style={styles.coverArtNote}>
          <MaterialIcons name="image" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.coverArtNoteText}>
            AI cover art available as an optional add-on after song creation ($0.99 standard · $1.99 premium)
          </Text>
        </View>

        <Text style={styles.footer}>Cancel anytime. No hidden fees. Monthly credits reset each billing period.</Text>
      </ScrollView>

      <CheckoutConfirmModal
        visible={checkoutModal.visible}
        plan={checkoutModal.plan}
        billingInterval={isYearly ? 'yearly' : 'monthly'}
        onClose={() => setCheckoutModal({ visible: false, plan: null })}
      />
    </LinearGradient>
  );
};

export default PricingScreen;

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
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  headline: {
    color: '#fff',
    fontSize: 30,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 36,
    marginTop: 4,
  },
  subheadline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    alignSelf: 'center',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  toggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  toggleText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: 'Oswald-Bold', letterSpacing: 0.3 },
  toggleTextActive: { color: '#fff' },
  saveBadge: { backgroundColor: '#66cc33', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  saveText: { color: '#fff', fontSize: 10, fontFamily: 'Oswald-Bold', letterSpacing: 0.3 },

  // Plan cards
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 20,
    marginBottom: 16,
  },
  cardHighlight: {
    borderColor: 'rgba(102,204,51,0.5)',
    backgroundColor: 'rgba(102,204,51,0.07)',
  },
  cardCurrent: { borderColor: 'rgba(4,126,201,0.5)' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    gap: 4,
    // paddingHorizontal: 8,
    // paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: { color: '#fff', fontSize: 10, fontFamily: 'Oswald-Bold', letterSpacing: 1 },
  currentBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(4,126,201,0.25)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(4,126,201,0.4)',
  },
  currentBadgeText: { color: '#047ec9', fontSize: 10, fontFamily: 'Oswald-Bold', letterSpacing: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  planName: { color: '#fff', fontSize: 20, fontFamily: 'Oswald-Bold', letterSpacing: 0.3 },
  planTagline: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontFamily: 'Oswald-Regular', marginTop: 2 },
  priceSection: { marginBottom: 16 },
  priceText: { color: '#fff', fontSize: 28, fontFamily: 'Oswald-Bold', letterSpacing: 0.3 },
  perMonth: { fontSize: 14, color: 'rgba(255,255,255,0.55)', fontFamily: 'Oswald-Regular' },
  yearlyNote: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Oswald-Regular', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 14 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  perkText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Oswald-Regular', flex: 1 },
  ctaWrap: { marginTop: 16 },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 12, elevation: 5,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  upgradeBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Oswald-Bold', letterSpacing: 0.5, padding: 14 },
  freeBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 14, alignItems: 'center' },
  freeBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontFamily: 'Oswald-Bold', letterSpacing: 0.5 },
  currentBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: 14, borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(102,204,51,0.3)', backgroundColor: 'rgba(102,204,51,0.06)',
  },
  currentBtnText: { color: '#66cc33', fontSize: 15, fontFamily: 'Oswald-Bold', letterSpacing: 0.3 },

  // Section divider
  sectionDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  sectionDividerText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Oswald-Bold', letterSpacing: 1.5 },
  packSectionNote: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Oswald-Regular',
    textAlign: 'center', marginBottom: 12, lineHeight: 18,
  },

  // Cost reference
  costReference: {
    flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16,
  },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontFamily: 'Oswald-Regular' },

  // Credit packs
  packRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  packCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 14, alignItems: 'center',
  },
  packCardHighlight: { borderColor: 'rgba(102,204,51,0.45)', backgroundColor: 'rgba(102,204,51,0.07)' },
  packBestValue: {
    backgroundColor: '#66cc33', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 8,
  },
  packBestValueText: { color: '#fff', fontSize: 8, fontFamily: 'Oswald-Bold', letterSpacing: 1 },
  packSongs: { color: '#fff', fontSize: 20, fontFamily: 'Oswald-Bold', letterSpacing: 0.3 },
  packLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Oswald-Regular', marginBottom: 8 },
  packPrice: { color: '#fff', fontSize: 18, fontFamily: 'Oswald-Bold', marginBottom: 2 },
  packPriceNote: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Oswald-Regular', marginBottom: 12 },
  packBtn: {
    width: '100%', alignItems: 'center', padding: 10, borderRadius: 10,
    backgroundColor: 'rgba(4,126,201,0.5)', borderWidth: 1, borderColor: 'rgba(4,126,201,0.6)',
    minHeight: 38, justifyContent: 'center',
  },
  packBtnHighlight: { backgroundColor: 'rgba(102,204,51,0.4)', borderColor: 'rgba(102,204,51,0.6)' },
  packBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Oswald-Bold', letterSpacing: 0.5 },

  // Cover art note
  coverArtNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
    padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  coverArtNoteText: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontFamily: 'Oswald-Regular', flex: 1, lineHeight: 18 },

  footer: {
    color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'Oswald-Regular',
    textAlign: 'center', marginTop: 8, lineHeight: 18,
  },
});
