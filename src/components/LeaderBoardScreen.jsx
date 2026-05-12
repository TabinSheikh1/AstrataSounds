import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Header from './Header';
import { getLeaderboard } from '../api/songsService';

const { width } = Dimensions.get('window');

const MEDAL = {
  1: { color: '#FFD700', gradStart: '#FFD700', gradEnd: '#B8860B', bg: 'rgba(255,215,0,0.14)', border: '#FFD700', label: '👑', rank: '1ST' },
  2: { color: '#C0C0C0', gradStart: '#D8D8D8', gradEnd: '#909090', bg: 'rgba(192,192,192,0.12)', border: '#C0C0C0', label: '🥈', rank: '2ND' },
  3: { color: '#CD7F32', gradStart: '#E8A050', gradEnd: '#9E5A1C', bg: 'rgba(205,127,50,0.12)', border: '#CD7F32', label: '🥉', rank: '3RD' },
};

const BAR_H   = { 1: 108, 2: 76, 3: 56 };
const AVT_SZ  = { 1: 72,  2: 58, 3: 52 };

const getInitials = (f = '', l = '') => `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
const formatPoints = (pts) => {
  if (!pts) return '0';
  if (pts >= 1_000_000) return `${(pts / 1_000_000).toFixed(1)}M`;
  if (pts >= 1000) return `${(pts / 1000).toFixed(1)}k`;
  return String(pts);
};

// ── Podium card (top 3) ────────────────────────────────────────
const PodiumCard = ({ entry, isCurrentUser, onPress }) => {
  const m         = MEDAL[entry.rank];
  const barH      = BAR_H[entry.rank]  ?? 56;
  const avtSz     = AVT_SZ[entry.rank] ?? 52;
  const isFirst   = entry.rank === 1;
  const initials  = getInitials(entry.firstName, entry.lastName);

  return (
    <TouchableOpacity style={s.podiumItem} onPress={onPress} activeOpacity={0.8}>
      {/* Crown / medal label above avatar */}
      <Text style={[s.crownEmoji, isFirst && s.crownEmojiLarge]}>{m.label}</Text>

      {/* Avatar */}
      <View style={s.podiumAvatarWrap}>
        <LinearGradient
          colors={[m.gradStart + '44', m.gradEnd + '22']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[
            s.podiumAvatar,
            { width: avtSz, height: avtSz, borderRadius: avtSz / 2, borderColor: m.color },
            isFirst && s.podiumAvatarFirst,
            isCurrentUser && { borderColor: '#66cc33' },
          ]}
        >
          <Text style={[s.podiumInitials, { fontSize: isFirst ? 24 : 18, color: m.color }]}>
            {initials}
          </Text>
        </LinearGradient>

        {isCurrentUser && (
          <LinearGradient
            colors={['#66cc33', '#047ec9']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.youPill}
          >
            <Text style={s.youPillText}>YOU</Text>
          </LinearGradient>
        )}
      </View>

      {/* Name */}
      <Text
        style={[s.podiumName, { color: isCurrentUser ? '#66cc33' : '#fff' }]}
        numberOfLines={1}
      >
        {entry.firstName || '—'}
      </Text>

      {/* Points */}
      <View style={s.podiumPts}>
        <MaterialIcons name="stars" size={11} color={m.color} />
        <Text style={[s.podiumPtsText, { color: m.color }]}>
          {formatPoints(entry.totalPoints)}
        </Text>
      </View>

      {/* Podium bar */}
      <LinearGradient
        colors={[m.gradStart + '66', m.gradStart + '33', m.gradStart + '0d']}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={[s.podiumBar, { height: barH, borderColor: m.color + '55' }]}
      >
        <Text style={[s.podiumBarLabel, { color: m.color + 'cc' }]}>{m.rank}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ── Ranked row (rank 4+) ───────────────────────────────────────
const LeaderRow = ({ entry, isCurrentUser, onPress }) => {
  const initials = getInitials(entry.firstName, entry.lastName);
  const stripOpacity = Math.max(0.05, 0.35 - (entry.rank - 4) * 0.012);

  return (
    <TouchableOpacity
      style={[s.row, isCurrentUser && s.rowYou]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Left accent strip */}
      <LinearGradient
        colors={
          isCurrentUser
            ? ['#66cc33', '#047ec9']
            : [`rgba(102,204,51,${stripOpacity})`, `rgba(4,126,201,${stripOpacity * 0.6})`]
        }
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={s.rowStrip}
      />

      {/* Rank */}
      <Text style={[s.rowRank, isCurrentUser && s.rowRankYou]}>
        {String(entry.rank).padStart(2, '0')}
      </Text>

      {/* Avatar */}
      <LinearGradient
        colors={
          isCurrentUser
            ? ['rgba(102,204,51,0.25)', 'rgba(4,126,201,0.18)']
            : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']
        }
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[s.rowAvatar, isCurrentUser && s.rowAvatarYou]}
      >
        <Text style={[s.rowInitials, isCurrentUser && s.rowInitialsYou]}>{initials}</Text>
      </LinearGradient>

      {/* Name + YOU chip */}
      <View style={s.rowInfo}>
        <Text
          style={[s.rowName, isCurrentUser && s.rowNameYou]}
          numberOfLines={1}
        >
          {entry.firstName} {entry.lastName}
        </Text>
        {isCurrentUser && (
          <LinearGradient
            colors={['#66cc33', '#047ec9']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.youChip}
          >
            <Text style={s.youChipText}>YOU</Text>
          </LinearGradient>
        )}
      </View>

      {/* Points */}
      <View style={s.rowPts}>
        <MaterialIcons
          name="stars"
          size={14}
          color={isCurrentUser ? '#66cc33' : 'rgba(255,255,255,0.35)'}
        />
        <Text style={[s.rowPtsText, isCurrentUser && s.rowPtsYou]}>
          {formatPoints(entry.totalPoints)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ── Main screen ────────────────────────────────────────────────
const LeaderBoardScreen = () => {
  const navigation = useNavigation();
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useSelector((s) => s.auth.user);

  const goToProfile = (entry) =>
    navigation.navigate('UserProfileScreen', {
      userId: entry.userId,
      firstName: entry.firstName,
      lastName: entry.lastName,
      rank: entry.rank,
      totalPoints: entry.totalPoints,
    });

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getLeaderboard(50);
      setEntries(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  // Classic podium: 2nd left, 1st centre, 3rd right
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  const ListHeader = () => (
    <>
      {/* ── Trophy banner ── */}
      <View style={s.banner}>
        <LinearGradient
          colors={['#66cc33', '#FFD700', '#047ec9']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.bannerTopLine}
        />
        <LinearGradient
          colors={['rgba(255,215,0,0.12)', 'rgba(4,126,201,0.08)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.bannerGrad}
        >
          <View style={s.bannerIconWrap}>
            <MaterialIcons name="emoji-events" size={38} color="#FFD700" />
          </View>
          <View style={s.bannerText}>
            <Text style={s.bannerTitle}>LEADERBOARD</Text>
            <Text style={s.bannerSub}>Top creators by community points</Text>
          </View>
          {/* Decorative stars */}
          <View style={[s.starDot, { top: 10, right: 24, width: 4, height: 4 }]} />
          <View style={[s.starDot, { top: 22, right: 14, width: 3, height: 3, opacity: 0.5 }]} />
          <View style={[s.starDot, { bottom: 14, right: 32, width: 5, height: 5, opacity: 0.35 }]} />
        </LinearGradient>
      </View>

      {/* ── Podium ── */}
      {top3.length > 0 && (
        <View style={s.podiumSection}>
          {/* Ambient glow behind #1 */}
          <View style={s.podiumGlow} />

          <View style={s.podiumRow}>
            {podiumOrder.map((entry) => (
              <PodiumCard
                key={String(entry.userId)}
                entry={entry}
                isCurrentUser={user?.id === entry.userId}
                onPress={() => goToProfile(entry)}
              />
            ))}
          </View>
        </View>
      )}

      {/* ── Divider ── */}
      {rest.length > 0 && (
        <View style={s.dividerRow}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.dividerLine}
          />
          <View style={s.dividerChip}>
            <MaterialIcons name="format-list-numbered" size={12} color="#66cc33" />
            <Text style={s.dividerLabel}>RANKINGS</Text>
          </View>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.dividerLine}
          />
        </View>
      )}
    </>
  );

  return (
    <ImageBackground
      source={require('../assets/images/image-1.jpg')}
      style={s.background}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Header />

      {loading ? (
        <View style={s.centered}>
          <LinearGradient
            colors={['rgba(255,215,0,0.15)', 'rgba(4,126,201,0.1)']}
            style={s.loadingIconWrap}
          >
            <MaterialIcons name="emoji-events" size={36} color="#FFD700" />
          </LinearGradient>
          <ActivityIndicator size="large" color="#66cc33" />
          <Text style={s.loadingText}>Loading rankings...</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={s.centered}>
          <View style={s.emptyIconWrap}>
            <MaterialIcons name="emoji-events" size={40} color="rgba(255,215,0,0.4)" />
          </View>
          <Text style={s.emptyTitle}>No entries yet</Text>
          <Text style={s.emptySub}>Be the first to create songs and earn points!</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => String(item.userId)}
          renderItem={({ item }) => (
            <LeaderRow
              entry={item}
              isCurrentUser={user?.id === item.userId}
              onPress={() => goToProfile(item)}
            />
          )}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#66cc33"
            />
          }
        />
      )}
    </ImageBackground>
  );
};

export default LeaderBoardScreen;

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 60,
  },
  loadingIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Oswald-Regular',
    fontSize: 14,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Oswald-Bold',
    fontSize: 18,
  },
  emptySub: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: 'Oswald-Regular',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  listContent: {
    paddingBottom: 100,
  },

  // ── Trophy banner ──────────────────────────────────────────
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  bannerTopLine: { height: 2 },
  bannerGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 16,
    gap: 14,
    position: 'relative',
    // overflow: 'hidden',
  },
  bannerIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    margin:16
    
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    color: '#fff',
    fontFamily: 'Oswald-Bold',
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 3,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'Oswald-Regular',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  starDot: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: '#FFD700',
  },

  // ── Podium section ─────────────────────────────────────────
  podiumSection: {
    marginHorizontal: 12,
    marginBottom: 8,
    position: 'relative',
  },
  podiumGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: 10,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,215,0,0.06)',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  // ── Podium card ────────────────────────────────────────────
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  crownEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  crownEmojiLarge: {
    fontSize: 28,
    marginBottom: 2,
  },
  podiumAvatarWrap: {
    position: 'relative',
    marginBottom: 7,
  },
  podiumAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  podiumAvatarFirst: {
    shadowColor: '#FFD700',
    elevation: 12,
  },
  podiumInitials: {
    fontFamily: 'Oswald-Bold',
  },
  youPill: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  youPillText: {
    color: '#fff',
    fontSize: 7,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  podiumName: {
    fontSize: 12,
    fontFamily: 'Oswald-Bold',
    textAlign: 'center',
    marginBottom: 3,
    letterSpacing: 0.3,
    maxWidth: 90,
  },
  podiumPts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 8,
  },
  podiumPtsText: {
    fontSize: 12,
    fontFamily: 'Oswald-Bold',
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumBarLabel: {
    fontSize: 13,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 1,
  },

  // ── Divider ────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(102,204,51,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(102,204,51,0.2)',
  },
  dividerLabel: {
    color: '#66cc33',
    fontFamily: 'Oswald-Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },

  // ── Ranked row ─────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingRight: 14,
    overflow: 'hidden',
    gap: 10,
  },
  rowYou: {
    backgroundColor: 'rgba(102,204,51,0.08)',
    borderColor: 'rgba(102,204,51,0.3)',
  },
  rowStrip: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  rowRank: {
    width: 26,
    fontFamily: 'Oswald-Bold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  rowRankYou: { color: '#66cc33' },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  rowAvatarYou: {
    borderColor: 'rgba(102,204,51,0.5)',
  },
  rowInitials: {
    fontSize: 14,
    fontFamily: 'Oswald-Bold',
    color: 'rgba(255,255,255,0.7)',
  },
  rowInitialsYou: { color: '#66cc33' },
  rowInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  rowName: {
    fontFamily: 'Oswald-Bold',
    fontSize: 14,
    color: '#fff',
    flexShrink: 1,
  },
  rowNameYou: { color: '#66cc33' },
  youChip: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  youChipText: {
    fontSize: 8,
    fontFamily: 'Oswald-Bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  rowPts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowPtsText: {
    fontFamily: 'Oswald-Bold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  rowPtsYou: { color: '#66cc33' },
});
