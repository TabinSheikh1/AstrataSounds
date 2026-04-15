import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useSubscription } from '../hooks/useSubscription';
import { getMySongs } from '../api/songsService';
import { getMyPlaylists } from '../api/playlistsService';
import Header from './Header';

const { width } = Dimensions.get('window');
const FILE_BASE = 'http://localhost:3000';
const TOKENS_PER_SONG = 70;

// Plan token amounts (mirrors PLAN_META in PricingScreen)
const PLAN_TOKENS = { Harmony: 500, Melody: 2500, Symphony: 7000 };

const approxSongs = (tokens) => Math.floor(tokens / TOKENS_PER_SONG);

const formatCount = (n) => {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

// ── Section header ─────────────────────────────────────────────
const SectionHeader = ({ title, onSeeAll }) => (
  <View style={s.sectionRow}>
    <Text style={s.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={s.seeAll}>See all</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Song card (horizontal scroll) ──────────────────────────────
const SongCard = ({ item, onPress }) => {
  const imageUri = item.imagePath
    ? { uri: `${FILE_BASE}${item.imagePath}` }
    : require('../assets/images/Rectangle-9560.png');

  return (
    <TouchableOpacity style={s.songCard} onPress={onPress} activeOpacity={0.88}>
      <Image source={imageUri} style={s.songCover} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.88)']}
        style={s.songOverlay}
      >
        <MaterialIcons name="play-circle-filled" size={30} color="#66cc33" style={s.songPlayIcon} />
        <Text style={s.songCardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={s.songCardMeta}>
          <MaterialIcons name="headset" size={11} color="rgba(255,255,255,0.55)" />
          <Text style={s.songCardMetaText}>{formatCount(item.listensCount)}</Text>
          <MaterialIcons name="favorite" size={11} color="rgba(255,255,255,0.55)" style={{ marginLeft: 8 }} />
          <Text style={s.songCardMetaText}>{formatCount(item.likesCount)}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ── Playlist card (horizontal scroll) ─────────────────────────
const PlaylistCard = ({ item }) => {
  const imageUri = item.bannerUrl
    ? { uri: `${FILE_BASE}${item.bannerUrl}` }
    : require('../assets/images/Rectangle-9560.png');
  const count = item.songs?.length ?? 0;

  return (
    <TouchableOpacity style={s.playlistCard} activeOpacity={0.88}>
      <Image source={imageUri} style={s.playlistCover} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={s.playlistOverlay}
      >
        <Text style={s.playlistCardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={s.playlistCardCount}>{count} {count === 1 ? 'song' : 'songs'}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ── Empty slot ─────────────────────────────────────────────────
const EmptySlot = ({ icon, label, sublabel, onPress }) => (
  <TouchableOpacity
    style={s.emptySlot}
    onPress={onPress}
    activeOpacity={onPress ? 0.8 : 1}
    disabled={!onPress}
  >
    <MaterialIcons name={icon} size={34} color="rgba(255,255,255,0.2)" />
    <Text style={s.emptySlotLabel}>{label}</Text>
    {sublabel ? <Text style={s.emptySlotSub}>{sublabel}</Text> : null}
  </TouchableOpacity>
);

// ── Upgrade plan card ─────────────────────────────────────────
const UpgradePlanCard = ({ plan, onPress }) => {
  const tokens = PLAN_TOKENS[plan.name] ?? 0;
  const songs = approxSongs(tokens);
  const isPremium = plan.name === 'Symphony';

  return (
    <TouchableOpacity
      style={[s.upgCard, isPremium && s.upgCardPremium]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      {isPremium && (
        <LinearGradient
          colors={['#66cc33', '#047ec9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.upgBestBadge}
        >
          <MaterialIcons name="star" size={10} color="#fff" />
          <Text style={s.upgBestText}>BEST VALUE</Text>
        </LinearGradient>
      )}

      <MaterialIcons
        name={isPremium ? 'workspace-premium' : 'queue-music'}
        size={26}
        color={isPremium ? '#66cc33' : '#047ec9'}
        style={{ marginBottom: 10 }}
      />

      <Text style={s.upgPlanName}>{plan.name}</Text>
      <Text style={s.upgTokens}>{tokens.toLocaleString()} tokens</Text>
      <Text style={s.upgSongs}>~{songs} songs / month</Text>

      <View style={s.upgPriceRow}>
        <Text style={s.upgPrice}>${plan.priceMonthly ?? '—'}</Text>
        <Text style={s.upgPer}>/mo</Text>
      </View>

      <LinearGradient
        colors={isPremium ? ['#66cc33', '#047ec9'] : ['#047ec9', '#0055aa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.upgBtn}
      >
        <MaterialIcons name="bolt" size={14} color="#fff" />
        <Text style={s.upgBtnText}>Upgrade</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ── Main screen ────────────────────────────────────────────────
const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector((st) => st.auth);
  const { status, plans, fetchPlans } = useSubscription();

  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);

  const isFree = status === 'free';
  const firstName = user?.firstName ?? 'there';
  const paidPlans = plans.filter((p) => p.name !== 'Harmony');

  const loadData = useCallback(async () => {
    setSongsLoading(true);
    setPlaylistsLoading(true);
    try {
      const [songsRes, playlistsRes] = await Promise.all([
        getMySongs().catch(() => ({})),
        getMyPlaylists().catch(() => ({})),
      ]);
      setSongs(Array.isArray(songsRes) ? songsRes : (songsRes?.data ?? []));
      setPlaylists(Array.isArray(playlistsRes) ? playlistsRes : (playlistsRes?.data ?? []));
    } finally {
      setSongsLoading(false);
      setPlaylistsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      if (isFree && paidPlans.length === 0) fetchPlans();
    }, [loadData, isFree, paidPlans.length, fetchPlans]),
  );

  return (
    <LinearGradient
      colors={['#0066CC', 'rgba(0,153,153,1)', '#66cc33']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={s.root}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Shared app header (menu, logo, token pill) */}
      <Header />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ─────────────────────────────────────── */}
        <View style={s.greetingCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)']}
            style={s.greetingInner}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.greetingText}>{getGreeting()},</Text>
              <Text style={s.greetingName}>{firstName}!</Text>
              <Text style={s.greetingSub}>Ready to create something amazing?</Text>
            </View>
            <TouchableOpacity
              style={s.greetingCreateBtn}
              onPress={() => navigation.navigate('SongCreationScreen')}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={22} color="#fff" />
              <Text style={s.greetingCreateText}>Create</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ── Recent Songs ─────────────────────────────────── */}
        <SectionHeader
          title="Recent Songs"
          onSeeAll={() => navigation.navigate('HomeSongsScreen')}
        />

        {songsLoading ? (
          <ActivityIndicator color="#66cc33" size="large" style={s.loader} />
        ) : songs.length === 0 ? (
          <View style={{ paddingHorizontal: 20 }}>
            <EmptySlot
              icon="music-note"
              label="No songs yet"
              sublabel="Tap Create to generate your first AI song"
              onPress={() => navigation.navigate('SongCreationScreen')}
            />
          </View>
        ) : (
          <FlatList
            horizontal
            data={songs.slice(0, 12)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SongCard
                item={item}
                onPress={() => navigation.navigate('SongDetailScreen', { song: item })}
              />
            )}
            contentContainerStyle={s.hList}
            showsHorizontalScrollIndicator={false}
          />
        )}

        {/* ── My Playlists ──────────────────────────────────── */}
        <SectionHeader
          title="My Playlists"
          onSeeAll={() => navigation.navigate('LibraryHomeScreen')}
        />

        {playlistsLoading ? (
          <ActivityIndicator color="#66cc33" size="large" style={s.loader} />
        ) : playlists.length === 0 ? (
          <View style={{ paddingHorizontal: 20 }}>
            <EmptySlot
              icon="library-music"
              label="No playlists yet"
              sublabel="Go to Library to create one"
            />
          </View>
        ) : (
          <FlatList
            horizontal
            data={playlists.slice(0, 12)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PlaylistCard item={item} />}
            contentContainerStyle={s.hList}
            showsHorizontalScrollIndicator={false}
          />
        )}

        {/* ── Upgrade section (free users only) ─────────────── */}
        {isFree && (
          <View style={s.upgradeSection}>
            {/* Banner */}
            <LinearGradient
              colors={['rgba(4,126,201,0.2)', 'rgba(102,204,51,0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.upgradeBanner}
            >
              <View style={s.upgradeBannerIcon}>
                <MaterialIcons name="workspace-premium" size={22} color="#66cc33" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.upgradeBannerTitle}>Unlock Your Full Potential</Text>
                <Text style={s.upgradeBannerSub}>
                  Get more tokens and create more songs every month
                </Text>
              </View>
            </LinearGradient>

            {/* Plan cards */}
            {paidPlans.length > 0 ? (
              <FlatList
                horizontal
                data={paidPlans}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <UpgradePlanCard
                    plan={item}
                    onPress={() => navigation.navigate('PricingScreen')}
                  />
                )}
                contentContainerStyle={[s.hList, { paddingTop: 4 }]}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <TouchableOpacity
                style={s.upgradeCtaBtn}
                onPress={() => navigation.navigate('PricingScreen')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#66cc33', '#047ec9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.upgradeCtaGradient}
                >
                  <MaterialIcons name="bolt" size={18} color="#fff" />
                  <Text style={s.upgradeCtaText}>View All Plans</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;

// ── Styles ─────────────────────────────────────────────────────
const CARD_W = 165;
const PLAYLIST_W = 148;

const s = StyleSheet.create({
  root: { flex: 1 },

  scroll: {
    paddingBottom: 110,
  },

  loader: { marginVertical: 28 },

  // ── Greeting card
  greetingCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  greetingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 20,
    gap: 12,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 0.3,
    padding:12
  },
  greetingName: {
    color: '#fff',
    fontSize: 26,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
    lineHeight: 30,
    paddingLeft:12
  },
  greetingSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    marginTop: 4,
    letterSpacing: 0.2,
    paddingLeft:12,
    paddingBottom:12
  },
  greetingCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(102,204,51,0.25)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(102,204,51,0.4)',
    marginRight:12
  },
  greetingCreateText: {
    color: '#fff',
    fontFamily: 'Oswald-Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ── Section header
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  seeAll: {
    color: '#66cc33',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 0.3,
  },

  // ── Horizontal list
  hList: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 4,
    marginBottom: 24,
  },

  // ── Song card
  songCard: {
    width: CARD_W,
    height: 185,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  songCover: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  songOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 40,
  },
  songPlayIcon: {
    marginBottom: 6,
  },
  songCardTitle: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  songCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  songCardMetaText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
  },

  // ── Playlist card
  playlistCard: {
    width: PLAYLIST_W,
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  playlistCover: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  playlistOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 48,
  },
  playlistCardTitle: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  playlistCardCount: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
  },

  // ── Empty slot
  emptySlot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    paddingVertical: 28,
    marginBottom: 24,
    gap: 6,
  },
  emptySlotLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'Oswald-Bold',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  emptySlotSub: {
    color: 'rgba(255,255,255,0.28)',
    fontFamily: 'Oswald-Regular',
    fontSize: 12,
    letterSpacing: 0.2,
  },

  // ── Upgrade section
  upgradeSection: {
    marginTop: 4,
  },
  upgradeBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
  },
  upgradeBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(102,204,51,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:12
  },
  upgradeBannerTitle: {
    color: '#fff',
    fontFamily: 'Oswald-Bold',
    fontSize: 15,
    letterSpacing: 0.3,
    marginBottom: 2,
    paddingTop:12
  },
  upgradeBannerSub: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Oswald-Regular',
    fontSize: 12,
    lineHeight: 17,
    paddingBottom:12
  },

  // Upgrade plan card
  upgCard: {
    width: 180,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 18,
    marginRight: 12,
    alignItems: 'flex-start',
  },
  upgCardPremium: {
    borderColor: 'rgba(102,204,51,0.4)',
    backgroundColor: 'rgba(102,204,51,0.07)',
  },
  upgBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
   
    marginBottom: 10,
  },
  upgBestText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 1,
    padding:6
  },
  upgPlanName: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  upgTokens: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    marginBottom: 2,
  },
  upgSongs: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    marginBottom: 12,
  },
  upgPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  upgPrice: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
  },
  upgPer: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
    marginLeft: 2,
  },
  upgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 14,
    // paddingVertical: 9,
    alignSelf: 'stretch',
    // justifyContent: 'center',
  },
  upgBtnText: {
    color: '#fff',
    fontFamily: 'Oswald-Bold',
    fontSize: 14,
    letterSpacing: 0.5,
    padding:12
  },

  // Fallback upgrade CTA button
  upgradeCtaBtn: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
  },
  upgradeCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  upgradeCtaText: {
    color: '#fff',
    fontFamily: 'Oswald-Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
