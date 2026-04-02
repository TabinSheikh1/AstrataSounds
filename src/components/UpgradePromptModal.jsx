import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const PLAN_PERKS = {
  Melody: [
    '2,500 tokens/month (~35 AI songs)',
    '30 downloads/month',
    '25 saved Vibe presets',
    'Unlimited playlists',
    'Priority generation queue',
  ],
  Symphony: [
    '7,000 tokens/month (~100 AI songs)',
    'Unlimited downloads',
    'Unlimited Vibe presets',
    'Unlimited playlists',
    'Commercial use license',
    'Early access to new features',
  ],
};

const UpgradePromptModal = ({
  visible,
  onClose,
  currentPlanName = 'Harmony',
  blockedFeature = 'this feature',
  nextPlan = null,
}) => {
  const navigation = useNavigation();

  const suggestedPlan = nextPlan?.name ?? (currentPlanName === 'Harmony' ? 'Melody' : 'Symphony');
  const perks = PLAN_PERKS[suggestedPlan] ?? [];
  const price =
    suggestedPlan === 'Melody' ? '$9.99/mo' : '$24.99/mo';

  const handleUpgrade = () => {
    onClose();
    navigation.navigate('PricingScreen');
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
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <LinearGradient
          colors={['rgba(0,102,204,0.15)', 'rgba(102,204,51,0.08)']}
          style={styles.headerGrad}
        >
          <View style={styles.iconWrap}>
            <MaterialIcons name="workspace-premium" size={28} color="#66cc33" />
          </View>
          <Text style={styles.title}>
            You've hit your {currentPlanName} limit
          </Text>
          <Text style={styles.subtitle}>
            {blockedFeature} is not available on your current plan.
          </Text>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {/* Next plan card */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{suggestedPlan}</Text>
              <Text style={styles.planPrice}>{price}</Text>
            </View>
            <View style={styles.divider} />
            {perks.map((perk, i) => (
              <View key={i} style={styles.perkRow}>
                <MaterialIcons name="check-circle" size={16} color="#66cc33" />
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.85}>
            <LinearGradient
              colors={['#66cc33', '#047ec9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeBtn}
            >
              <MaterialIcons name="bolt" size={18} color="#fff" />
              <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onClose();
              navigation.navigate('PricingScreen');
            }}
            style={styles.allPlansBtn}
          >
            <Text style={styles.allPlansText}>See All Plans</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default UpgradePromptModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d1117',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
  headerGrad: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(102,204,51,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(102,204,51,0.3)',
    padding: 16,
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  planPrice: {
    color: '#66cc33',
    fontSize: 16,
    fontFamily: 'Oswald-Bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 12,
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
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#66cc33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  allPlansBtn: {
    alignItems: 'center',
    padding: 12,
  },
  allPlansText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
    textDecorationLine: 'underline',
  },
});
