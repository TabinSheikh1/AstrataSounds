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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useSubscription } from '../hooks/useSubscription';
import CheckoutConfirmModal from './CheckoutConfirmModal';

const TOKENS_PER_SONG = 70;

const approxSongs = (tokens) => Math.floor(tokens / TOKENS_PER_SONG);

const PLAN_META = {
  Harmony: {
    tagline: 'Start creating for free',
    icon: 'music-note',
    color: 'rgba(255,255,255,0.15)',
    highlight: false,
    perks: [
      `500 tokens/month (~${approxSongs(500)} AI songs)`,
      '5 song downloads/month',
      '5 saved Vibe presets',
      '10 playlists max',
      'Standard generation queue',
    ],
    excluded: ['Commercial license', 'Priority queue'],
  },
  Melody: {
    tagline: 'For serious creators',
    icon: 'queue-music',
    color: 'rgba(4,126,201,0.25)',
    highlight: false,
    perks: [
      `2,500 tokens/month (~${approxSongs(2500)} AI songs)`,
      '30 song downloads/month',
      '25 saved Vibe presets',
      'Unlimited playlists',
      'Priority generation queue',
    ],
    excluded: ['Commercial license'],
  },
  Symphony: {
    tagline: 'Unlimited creative power',
    icon: 'workspace-premium',
    color: 'rgba(102,204,51,0.2)',
    highlight: true,
    perks: [
      `7,000 tokens/month (~${approxSongs(7000)} AI songs)`,
      'Unlimited downloads',
      'Unlimited Vibe presets',
      'Unlimited playlists',
      'Highest priority queue',
      'Commercial use license',
      'Early access to new features',
    ],
    excluded: [],
  },
};

const PlanCard = ({
  plan,
  isYearly,
  currentPlanId,
  isAuthenticated,
  onUpgrade,
}) => {
  const meta = PLAN_META[plan.name] ?? {};
  const isCurrent = plan.id === currentPlanId;
  const isHighlight = meta.highlight;
  const isFree = plan.name === 'Harmony';

  const yearlyPrice = plan.priceYearly ?? plan.priceMonthly * 12 * 0.8;
  const effectiveMonthly = isYearly
    ? (yearlyPrice / 12).toFixed(2)
    : plan.monthlyPrice?.toFixed(2);

  return (
    <View
      style={[
        styles.card,
        isHighlight && styles.cardHighlight,
        isCurrent && styles.cardCurrent,
      ]}
    >
      {isHighlight && (
        <LinearGradient
          colors={['#66cc33', '#047ec9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.popularBadge}
        >
          <View style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: "center"
          }}>

            <MaterialIcons name="star" size={11} color="#fff" />
            <Text style={styles.popularText}>BEST VALUE</Text>
          </View>
        </LinearGradient>
      )}

      {isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
        </View>
      )}

      {/* Plan icon + name */}
      <View style={styles.cardHeader}>
        <View style={[styles.planIconWrap, { backgroundColor: meta.color }]}>
          <MaterialIcons
            name={meta.icon ?? 'music-note'}
            size={22}
            color={isHighlight ? '#66cc33' : '#fff'}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planTagline}>{meta.tagline}</Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceSection}>
        {isFree ? (
          <Text style={styles.priceText}>Free Forever</Text>
        ) : (
          <>
            {isYearly ? (
              <View>
                <Text style={styles.priceText}>
                  ${effectiveMonthly}
                  <Text style={styles.perMonth}>/mo</Text>
                </Text>
                <Text style={styles.yearlyTotal}>
                  ${yearlyPrice} billed yearly
                </Text>
              </View>
            ) : (
              <Text style={styles.priceText}>
                ${plan.priceMonthly}
                <Text style={styles.perMonth}>/mo</Text>
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.divider} />

      {/* Perks */}
      {(meta.perks ?? []).map((perk, i) => (
        <View key={i} style={styles.perkRow}>
          <MaterialIcons name="check-circle" size={15} color="#66cc33" />
          <Text style={styles.perkText}>{perk}</Text>
        </View>
      ))}
      {(meta.excluded ?? []).map((perk, i) => (
        <View key={i} style={styles.perkRow}>
          <MaterialIcons name="cancel" size={15} color="rgba(255,255,255,0.2)" />
          <Text style={[styles.perkText, styles.perkExcluded]}>{perk}</Text>
        </View>
      ))}

      {/* CTA */}
      <View style={styles.ctaWrap}>
        {isCurrent ? (
          <View style={styles.currentBtn}>
            <MaterialIcons name="check" size={16} color="#66cc33" />
            <Text style={styles.currentBtnText}>Your Current Plan</Text>
          </View>
        ) : isFree ? (
          <TouchableOpacity
            style={styles.freeBtn}
            onPress={() => {
              /* navigate to register */
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.freeBtnText}>Get Started Free</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => isAuthenticated && onUpgrade(plan)}
            activeOpacity={0.85}
            disabled={!isAuthenticated && false}
          >
            <LinearGradient
              colors={isHighlight ? ['#66cc33', '#047ec9'] : ['#047ec9', '#0066CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeBtn}
            >
              <MaterialIcons name="bolt" size={16} color="#fff" />
              <Text style={styles.upgradeBtnText}>
                Upgrade to {plan.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const PricingScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { subscription, plans, fetchPlans } = useSubscription();

  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState({ visible: false, plan: null });

  useEffect(() => {
    if (plans.length === 0) {
      setLoading(true);
      fetchPlans().finally(() => setLoading(false));
    }
    console.log(subscription, plans);

  }, []);

  const currentPlanId = subscription?.plan?.id ?? null;
  const isOnPaidPlan = subscription && subscription.status !== 'free';
  const visiblePlans = plans.filter((plan) => !(plan.name === 'Harmony' && isOnPaidPlan));

  const handleUpgrade = (plan) => {
    setCheckoutModal({ visible: true, plan });
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
        <Text style={styles.screenTitle}>Choose Your Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.headline}>Unlock Your Full{'\n'}Creative Potential</Text>
        <Text style={styles.subheadline}>
          Every generation costs 70 tokens. Pick the plan that fits your workflow.
        </Text>

        {/* Billing toggle */}
        <View style={styles.toggleWrap}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isYearly && styles.toggleBtnActive]}
            onPress={() => setIsYearly(false)}
          >
            <Text style={[styles.toggleText, !isYearly && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isYearly && styles.toggleBtnActive]}
            onPress={() => setIsYearly(true)}
          >
            <Text style={[styles.toggleText, isYearly && styles.toggleTextActive]}>
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>~20% off</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plan cards */}
        {loading ? (
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

        <Text style={styles.footer}>
          Cancel anytime. No hidden fees. Tokens reset monthly.
        </Text>
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
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  headline: {
    color: '#fff',
    fontSize: 30,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 36,
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
  toggleBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  toggleTextActive: {
    color: '#fff',
  },
  saveBadge: {
    backgroundColor: '#66cc33',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },

  // Cards
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
    backgroundColor: 'rgba(102,204,51,0.08)',
  },
  cardCurrent: {
    borderColor: 'rgba(4,126,201,0.5)',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    // paddingHorizontal: 8,
    // paddingVertical: 4,
    gap: 4,
    marginBottom: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
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
  currentBadgeText: {
    color: '#047ec9',
    fontSize: 10,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  planIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  planTagline: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    marginTop: 2,
  },
  priceSection: { marginBottom: 16 },
  priceText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  perMonth: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Oswald-Regular',
  },
  yearlyTotal: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  perkText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
    flex: 1,
  },
  perkExcluded: { color: 'rgba(255,255,255,0.25)' },
  ctaWrap: { marginTop: 16 },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    // padding: 14,
    borderRadius: 12,
    shadowColor: '#66cc33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
    padding: 14
  },
  freeBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  freeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  currentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(102,204,51,0.3)',
    backgroundColor: 'rgba(102,204,51,0.06)',
  },
  currentBtnText: {
    color: '#66cc33',
    fontSize: 15,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  footer: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
