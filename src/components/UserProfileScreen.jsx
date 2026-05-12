import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserPublicProfile } from '../api/userService';

const BASE_URL = 'http://localhost:3000';

const buildAvatarUri = (profilePicture) => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith('http')) return profilePicture;
  return `${BASE_URL}${profilePicture.startsWith('/') ? '' : '/uploads/users/avatars/'}${profilePicture}`;
};

const fmtBirthday = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const getInitials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

const RANK_COLORS = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

const InfoCard = ({ icon, label, value, fadeAnim, slideAnim }) => (
  <Animated.View style={[styles.infoCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
    <View style={styles.infoIconWrap}>
      <MaterialIcons name={icon} size={20} color="#66cc33" />
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </Animated.View>
);

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, firstName: initFirst = '', lastName: initLast = '', rank, totalPoints } = route.params ?? {};

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animations
  const avatarScale = useRef(new Animated.Value(0.7)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const card1Fade = useRef(new Animated.Value(0)).current;
  const card1Slide = useRef(new Animated.Value(24)).current;
  const card2Fade = useRef(new Animated.Value(0)).current;
  const card2Slide = useRef(new Animated.Value(24)).current;
  const card3Fade = useRef(new Animated.Value(0)).current;
  const card3Slide = useRef(new Animated.Value(24)).current;
  const card4Fade = useRef(new Animated.Value(0)).current;
  const card4Slide = useRef(new Animated.Value(24)).current;

  const runEntrance = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(avatarOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(avatarScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.stagger(80, [
        Animated.parallel([
          Animated.timing(card1Fade, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(card1Slide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(card2Fade, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(card2Slide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(card3Fade, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(card3Slide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(card4Fade, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(card4Slide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getUserPublicProfile(userId);
        const data = res.data?.data ?? res.data;
        setProfile(data);
      } catch (e) {
        setError('Could not load profile.');
      } finally {
        setLoading(false);
        runEntrance();
      }
    };
    fetch();
  }, [userId]);

  const displayFirst = profile?.firstName ?? initFirst;
  const displayLast = profile?.lastName ?? initLast;
  const fullName = `${displayFirst} ${displayLast}`.trim() || 'Unknown User';
  const avatarUri = buildAvatarUri(profile?.profilePicture);
  const initials = getInitials(displayFirst, displayLast);
  const rankColor = RANK_COLORS[rank] ?? '#66cc33';
  const hasBio = !!profile?.bio;
  const hasBirthday = !!profile?.birthday;
  const hasAge = profile?.age != null;
  const hasPoints = totalPoints != null;

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={['#040810', '#071520', '#0a1e0e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative glow orb behind avatar */}
      <View style={styles.glowOrb} />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <View style={styles.backBtnInner}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </View>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero section ── */}
        <Animated.View style={[styles.heroSection, { opacity: headerFade }]}>
          {/* Rank badge */}
          {rank && rank <= 3 && (
            <View style={[styles.rankBadge, { borderColor: rankColor + '88' }]}>
              <Text style={styles.rankEmoji}>
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
              </Text>
              <Text style={[styles.rankLabel, { color: rankColor }]}>
                #{rank} on Leaderboard
              </Text>
            </View>
          )}
          {rank && rank > 3 && (
            <View style={[styles.rankBadge, { borderColor: 'rgba(255,255,255,0.12)' }]}>
              <MaterialIcons name="leaderboard" size={13} color="rgba(255,255,255,0.5)" />
              <Text style={[styles.rankLabel, { color: 'rgba(255,255,255,0.5)' }]}>
                #{rank} on Leaderboard
              </Text>
            </View>
          )}

          {/* Avatar */}
          <Animated.View
            style={[
              styles.avatarWrap,
              { opacity: avatarOpacity, transform: [{ scale: avatarScale }] },
            ]}
          >
            {/* Glow ring */}
            <View style={[styles.avatarGlowRing, { borderColor: rankColor + '55' }]} />

            {loading ? (
              <LinearGradient
                colors={['#1a2a1a', '#0a1628']}
                style={styles.avatarCircle}
              >
                <ActivityIndicator color="#66cc33" size="large" />
              </LinearGradient>
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={['#1a5c22', '#0a4a8a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarCircle}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
          </Animated.View>

          {/* Name */}
          <Text style={styles.nameText}>{fullName}</Text>

          {/* Points pill */}
          {hasPoints && (
            <View style={styles.pointsPill}>
              <MaterialIcons name="stars" size={14} color="#FFD700" />
              <Text style={styles.pointsText}>
                {totalPoints >= 1000 ? `${(totalPoints / 1000).toFixed(1)}k` : totalPoints} pts
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Info cards ── */}
        {!loading && !error && (
          <View style={styles.cards}>
            {hasBio && (
              <InfoCard
                icon="notes"
                label="Bio"
                value={profile.bio}
                fadeAnim={card1Fade}
                slideAnim={card1Slide}
              />
            )}

            {!hasBio && (
              <Animated.View style={[styles.emptyBioCard, { opacity: card1Fade, transform: [{ translateY: card1Slide }] }]}>
                <MaterialIcons name="edit" size={18} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyBioText}>No bio yet</Text>
              </Animated.View>
            )}

            {hasBirthday && (
              <InfoCard
                icon="cake"
                label="Birthday"
                value={fmtBirthday(profile.birthday)}
                fadeAnim={card2Fade}
                slideAnim={card2Slide}
              />
            )}

            {hasAge && (
              <InfoCard
                icon="person"
                label="Age"
                value={`${profile.age} years old`}
                fadeAnim={card3Fade}
                slideAnim={card3Slide}
              />
            )}

            {profile?.gender && (
              <InfoCard
                icon="wc"
                label="Gender"
                value={profile.gender}
                fadeAnim={card4Fade}
                slideAnim={card4Slide}
              />
            )}
          </View>
        )}

        {error && (
          <View style={styles.errorWrap}>
            <MaterialIcons name="error-outline" size={36} color="rgba(255,255,255,0.2)" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default UserProfileScreen;

const AVATAR_SIZE = 120;

const styles = StyleSheet.create({
  root: { flex: 1 },

  glowOrb: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(102,204,51,0.07)',
    shadowColor: '#66cc33',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 80,
    elevation: 0,
  },

  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 12,
    left: 16,
    zIndex: 10,
  },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: {
    paddingTop: Platform.OS === 'ios' ? 120 : (StatusBar.currentHeight ?? 24) + 70,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },

  // ── Hero ──
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },

  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rankEmoji: { fontSize: 13 },
  rankLabel: {
    fontSize: 11,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  avatarWrap: { position: 'relative', marginBottom: 16 },

  avatarGlowRing: {
    position: 'absolute',
    width: AVATAR_SIZE + 16,
    height: AVATAR_SIZE + 16,
    borderRadius: (AVATAR_SIZE + 16) / 2,
    top: -8,
    left: -8,
    borderWidth: 2,
  },

  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarInitials: {
    fontSize: 40,
    fontFamily: 'Oswald-Bold',
    color: '#fff',
    letterSpacing: 1,
  },

  nameText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 10,
  },

  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pointsText: {
    color: '#FFD700',
    fontSize: 13,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 24,
  },

  // ── Info cards ──
  cards: { gap: 12 },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 16,
    gap: 14,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(102,204,51,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(102,204,51,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Oswald-Regular',
    lineHeight: 21,
  },

  emptyBioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
  },
  emptyBioText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 0.3,
  },

  errorWrap: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 40,
  },
  errorText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
  },
});
