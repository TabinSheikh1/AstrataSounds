import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Header from './Header';
import GradientBackground from './GradientBackground';
import { getLeaderboard } from '../api/songsService';

const { width } = Dimensions.get('window');

const MEDAL = {
  1: { color: '#FFD700', bg: 'rgba(255,215,0,0.18)', border: '#FFD700', label: '🥇' },
  2: { color: '#C0C0C0', bg: 'rgba(192,192,192,0.15)', border: '#C0C0C0', label: '🥈' },
  3: { color: '#CD7F32', bg: 'rgba(205,127,50,0.15)', border: '#CD7F32', label: '🥉' },
};

const getInitials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const formatPoints = (pts) => {
  if (pts >= 1000) return `${(pts / 1000).toFixed(1)}k`;
  return String(pts);
};

// ─── Podium Card (top 3) ──────────────────────────────────────────────────────
const PodiumCard = ({ entry, isCurrentUser }) => {
  const medal = MEDAL[entry.rank];
  const initials = getInitials(entry.firstName, entry.lastName);
  const barHeights = { 1: 90, 2: 68, 3: 52 };
  const barHeight = barHeights[entry.rank] ?? 52;
  const avatarSize = entry.rank === 1 ? 62 : 52;

  return (
    <View style={[styles.podiumCard, entry.rank === 1 && styles.podiumCardCenter]}>
      {/* Avatar */}
      <View
        style={[
          styles.podiumAvatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            borderColor: medal.color,
            backgroundColor: medal.bg,
          },
          isCurrentUser && styles.currentUserAvatarBorder,
        ]}
      >
        <Text style={[styles.podiumInitials, { fontSize: entry.rank === 1 ? 20 : 16, color: medal.color }]}>
          {initials}
        </Text>
        {isCurrentUser && (
          <View style={styles.youBadge}>
            <Text style={styles.youBadgeText}>YOU</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={[styles.podiumName, isCurrentUser && { color: '#66cc33' }]} numberOfLines={1}>
        {entry.firstName} {entry.lastName}
      </Text>

      {/* Points */}
      <View style={styles.podiumPoints}>
        <MaterialIcons name="stars" size={12} color={medal.color} />
        <Text style={[styles.podiumPointsText, { color: medal.color }]}>
          {formatPoints(entry.totalPoints)}
        </Text>
      </View>

      {/* Podium bar */}
      <LinearGradient
        colors={[medal.color + '55', medal.color + '22']}
        style={[styles.podiumBar, { height: barHeight, borderColor: medal.color }]}
      >
        <Text style={[styles.podiumRankText, { color: medal.color }]}>#{entry.rank}</Text>
      </LinearGradient>
    </View>
  );
};

// ─── Row (rank 4+) ────────────────────────────────────────────────────────────
const LeaderRow = ({ entry, isCurrentUser }) => {
  const initials = getInitials(entry.firstName, entry.lastName);

  return (
    <View style={[styles.row, isCurrentUser && styles.rowHighlight]}>
      {/* Rank */}
      <Text style={[styles.rowRank, isCurrentUser && { color: '#66cc33' }]}>
        {String(entry.rank).padStart(2, '0')}
      </Text>

      {/* Avatar */}
      <View style={[styles.rowAvatar, isCurrentUser && styles.rowAvatarHighlight]}>
        <Text style={[styles.rowInitials, isCurrentUser && { color: '#66cc33' }]}>{initials}</Text>
      </View>

      {/* Name + YOU */}
      <View style={styles.rowInfo}>
        <View style={styles.rowNameRow}>
          <Text style={[styles.rowName, isCurrentUser && { color: '#66cc33' }]} numberOfLines={1}>
            {entry.firstName} {entry.lastName}
          </Text>
          {isCurrentUser && (
            <View style={styles.youChip}>
              <Text style={styles.youChipText}>YOU</Text>
            </View>
          )}
        </View>
      </View>

      {/* Points */}
      <View style={styles.rowPointsWrap}>
        <MaterialIcons name="stars" size={14} color={isCurrentUser ? '#66cc33' : '#a0aec0'} />
        <Text style={[styles.rowPoints, isCurrentUser && { color: '#66cc33' }]}>
          {formatPoints(entry.totalPoints)}
        </Text>
      </View>
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const LeaderBoardScreen = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useSelector((s) => s.auth.user);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getLeaderboard(50);
      // API may wrap in { data: [...] } or return array directly
      setEntries(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const renderRow = ({ item }) => (
    <LeaderRow entry={item} isCurrentUser={user?.id === item.userId} />
  );

  const podiumOrder = top3.length === 3
    ? [top3[1], top3[0], top3[2]] // 2, 1, 3 — classic podium layout
    : top3;

  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" />

      <Header title="STRATASOUND MUSIC" />

      {/* Page heading */}
      <View style={styles.heading}>
        <Text style={styles.headingTitle}>Leaderboard</Text>
        <Text style={styles.headingSubtitle}>Top creators by community points</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#66cc33" />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="leaderboard" size={52} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>No entries yet</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => String(item.userId)}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#66cc33"
            />
          }
          ListHeaderComponent={
            top3.length > 0 ? (
              <>
                {/* ── Podium ── */}
                <View style={styles.podiumWrap}>
                  {podiumOrder.map((entry) => (
                    <PodiumCard
                      key={entry.userId}
                      entry={entry}
                      isCurrentUser={user?.id === entry.userId}
                    />
                  ))}
                </View>

                {/* Divider before ranked list */}
                {rest.length > 0 && (
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerLabel}>Rankings</Text>
                    <View style={styles.dividerLine} />
                  </View>
                )}
              </>
            ) : null
          }
        />
      )}
    </GradientBackground>
  );
};

export default LeaderBoardScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  heading: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 12,
  },
  headingTitle: {
    fontSize: 26,
    fontFamily: 'Oswald-Bold',
    color: '#fff',
    letterSpacing: 1.5,
  },
  headingSubtitle: {
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Oswald-Regular',
    fontSize: 15,
  },

  // ── Podium ──────────────────────────────────────────
  podiumWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 4,
    marginTop: 8,
  },

  podiumCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  podiumCardCenter: {
    marginBottom: 0,
  },

  podiumAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 6,
  },
  currentUserAvatarBorder: {
    borderColor: '#66cc33',
    shadowColor: '#66cc33',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  podiumInitials: {
    fontFamily: 'Oswald-Bold',
  },
  youBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#66cc33',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  youBadgeText: {
    fontSize: 7,
    fontFamily: 'Oswald-Bold',
    color: '#0a0e19',
  },

  podiumName: {
    fontSize: 11,
    fontFamily: 'Oswald-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 3,
    maxWidth: 90,
    letterSpacing: 0.3,
  },
  podiumPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  podiumPointsText: {
    fontSize: 11,
    fontFamily: 'Oswald-Bold',
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRankText: {
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    opacity: 0.7,
  },

  // ── Divider ─────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Oswald-Regular',
    fontSize: 11,
    letterSpacing: 1.2,
    marginHorizontal: 10,
  },

  // ── Ranked rows ─────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  rowHighlight: {
    backgroundColor: 'rgba(102,204,51,0.08)',
    borderColor: 'rgba(102,204,51,0.3)',
  },

  rowRank: {
    width: 28,
    fontFamily: 'Oswald-Bold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
  },

  rowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rowAvatarHighlight: {
    backgroundColor: 'rgba(102,204,51,0.12)',
    borderColor: 'rgba(102,204,51,0.4)',
  },
  rowInitials: {
    fontSize: 13,
    fontFamily: 'Oswald-Bold',
    color: 'rgba(255,255,255,0.6)',
  },

  rowInfo: {
    flex: 1,
  },
  rowNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowName: {
    fontFamily: 'Oswald-Bold',
    fontSize: 14,
    color: '#fff',
    flexShrink: 1,
  },

  youChip: {
    backgroundColor: '#66cc33',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  youChipText: {
    fontSize: 8,
    fontFamily: 'Oswald-Bold',
    color: '#0a0e19',
  },

  rowPointsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowPoints: {
    fontFamily: 'Oswald-Bold',
    fontSize: 14,
    color: '#a0aec0',
  },
});
