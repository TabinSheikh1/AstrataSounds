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
  ImageBackground,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getMySongs } from '../api/songsService';
import { getMyPlaylists } from '../api/playlistsService';
import Header from './Header';

const { width } = Dimensions.get('window');
const FILE_BASE = 'http://localhost:3000';

const formatCount = (n) => {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// ── Sub-components ─────────────────────────────────────────────

const HeroStat = ({ label, value, loading }) => (
  <View style={s.heroStat}>
    <Text style={s.heroStatNum}>{loading ? '—' : value}</Text>
    <Text style={s.heroStatLabel}>{label}</Text>
  </View>
);

const SectionHeader = ({ title, onSeeAll }) => (
  <View style={s.sectionRow}>
    <View style={s.sectionLeft}>
      <LinearGradient
        colors={['#66cc33', '#047ec9']}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={s.sectionAccent}
      />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={s.seeAll}>See all →</Text>
      </TouchableOpacity>
    )}
  </View>
);

const SongCard = ({ item, onPress }) => {
  const imageUri = item.imagePath
    ? { uri: `${FILE_BASE}${item.imagePath}` }
    : require('../assets/images/play.png');

  return (
    <TouchableOpacity style={s.songCard} onPress={onPress} activeOpacity={0.88}>
      <Image source={imageUri} style={s.songCover} />
      {item.genre ? (
        <View style={s.genreTag}>
          <Text style={s.genreTagText}>{item.genre.toUpperCase()}</Text>
        </View>
      ) : null}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.93)']}
        style={s.songOverlay}
      >
        <View style={s.songPlayRow}>
          <View style={s.songPlayBtn}>
            <MaterialIcons name="play-arrow" size={18} color="#fff" />
          </View>
        </View>
        <Text style={s.songCardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={s.songCardMeta}>
          <MaterialIcons name="headset" size={11} color="rgba(255,255,255,0.55)" />
          <Text style={s.metaText}>{formatCount(item.listensCount)}</Text>
          <View style={s.metaDot} />
          <MaterialIcons name="favorite" size={11} color="rgba(255,255,255,0.55)" />
          <Text style={s.metaText}>{formatCount(item.likesCount)}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const PlaylistCard = ({ item }) => {
  const imageUri = item.bannerUrl
    ? { uri: `${FILE_BASE}${item.bannerUrl}` }
    : require('../assets/images/Rectangle-9560.png');
  const count = item.songs?.length ?? 0;

  return (
    <TouchableOpacity style={s.playlistCard} activeOpacity={0.88}>
      <Image source={imageUri} style={s.playlistCover} />
      <View style={s.playlistBadge}>
        <MaterialIcons name="music-note" size={10} color="#fff" />
        <Text style={s.playlistBadgeText}>{count}</Text>
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={s.playlistOverlay}
      >
        <Text style={s.playlistTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={s.playlistCount}>{count} {count === 1 ? 'song' : 'songs'}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const EmptySlot = ({ icon, label, sublabel, onPress }) => (
  <TouchableOpacity
    style={s.emptySlot}
    onPress={onPress}
    activeOpacity={onPress ? 0.8 : 1}
    disabled={!onPress}
  >
    <View style={s.emptyIconWrap}>
      <MaterialIcons name={icon} size={28} color="#66cc33" />
    </View>
    <Text style={s.emptyLabel}>{label}</Text>
    {sublabel ? <Text style={s.emptySub}>{sublabel}</Text> : null}
    {onPress && (
      <View style={s.emptyCtaRow}>
        <Text style={s.emptyCtaText}>Get Started</Text>
        <MaterialIcons name="arrow-forward" size={13} color="#66cc33" />
      </View>
    )}
  </TouchableOpacity>
);

const QUICK_ACTIONS = [
  { icon: 'explore',       label: 'Discover', route: 'HomeSongsScreen',   color: '#047ec9', bg: 'rgba(4,126,201,0.2)' },
  { icon: 'auto-awesome',  label: 'Create',   route: 'SongCreationScreen', primary: true },
  { icon: 'emoji-events',  label: 'Leaders',  route: 'LeaderBoardScreen',  color: '#f59e0b', bg: 'rgba(245,158,11,0.2)' },
];

// ── Main screen ────────────────────────────────────────────────
const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector((st) => st.auth);

  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);

  const firstName = user?.firstName ?? 'there';

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
    useCallback(() => { loadData(); }, [loadData]),
  );

  return (
    <ImageBackground
      source={require('../assets/images/image-1.jpg')}
      style={s.background}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Header />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero greeting card ─────────────────────────── */}
        <View style={s.heroCard}>
          <LinearGradient
            colors={['#66cc33', '#047ec9']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.heroTopLine}
          />
          <View style={s.heroBody}>
            <View style={s.heroRow}>
              <View style={s.heroTextWrap}>
                <Text style={s.heroHi}>{getGreeting()},</Text>
                <Text style={s.heroName}>{firstName}!</Text>
                <Text style={s.heroTagline}>Ready to create something amazing?</Text>
              </View>
              <LinearGradient
                colors={['#66cc33', '#047ec9']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.heroAvatar}
              >
                <Text style={s.heroAvatarLetter}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>

            <View style={s.heroDivider} />

            <View style={s.heroFooter}>
              <View style={s.heroStats}>
                <HeroStat label="Songs" value={songs.length} loading={songsLoading} />
                <View style={s.heroStatSep} />
                <HeroStat label="Playlists" value={playlists.length} loading={playlistsLoading} />
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('SongCreationScreen')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#66cc33', '#047ec9']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.heroCreateBtn}
                >
                  <MaterialIcons name="auto-awesome" size={15} color="#fff" style={{paddingLeft:6}}/>
                  <Text style={s.heroCreateText}>Create</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ─────────────────────────────── */}
        <View style={s.quickActions}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.route}
              style={s.quickAction}
              onPress={() => navigation.navigate(a.route)}
              activeOpacity={0.8}
            >
              {a.primary ? (
                <LinearGradient
                  colors={['#66cc33', '#047ec9']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.qaIconWrap}
                >
                  <MaterialIcons name={a.icon} size={22} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={[s.qaIconWrap, { backgroundColor: a.bg }]}>
                  <MaterialIcons name={a.icon} size={22} color={a.color} />
                </View>
              )}
              <Text style={[s.qaLabel, a.primary && s.qaLabelPrimary]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent Songs ──────────────────────────────── */}
        <SectionHeader
          title="Recent Songs"
          onSeeAll={() => navigation.navigate('HomeSongsScreen')}
        />

        {songsLoading ? (
          <ActivityIndicator color="#66cc33" size="large" style={s.loader} />
        ) : songs.length === 0 ? (
          <View style={s.emptyWrap}>
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
            keyExtractor={(item) => String(item.id)}
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

        {/* ── My Playlists ──────────────────────────────── */}
        <SectionHeader
          title="My Playlists"
          onSeeAll={() => navigation.navigate('LibraryHomeScreen')}
        />

        {playlistsLoading ? (
          <ActivityIndicator color="#66cc33" size="large" style={s.loader} />
        ) : playlists.length === 0 ? (
          <View style={s.emptyWrap}>
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
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <PlaylistCard item={item} />}
            contentContainerStyle={s.hList}
            showsHorizontalScrollIndicator={false}
          />
        )}

      </ScrollView>
    </ImageBackground>
  );
};

export default HomeScreen;

// ── Styles ─────────────────────────────────────────────────────
const SONG_W = 178;
const PLAYLIST_W = 155;

const s = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  scroll: {
    paddingBottom: 120,
  },

  loader: { marginVertical: 28 },

  emptyWrap: { paddingHorizontal: 20 },

  // ── Hero card ──────────────────────────────────────────────
  heroCard: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroTopLine: {
    height: 2,
  },
  heroBody: {
    padding: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 14,
  },
  heroHi: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroName: {
    color: '#fff',
    fontSize: 30,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
    lineHeight: 34,
  },
  heroTagline: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    marginTop: 5,
  },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  heroAvatarLetter: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Oswald-Bold',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 14,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroStat: {
    alignItems: 'flex-start',
  },
  heroStatNum: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroStatSep: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    // paddingHorizontal: 18,
    // paddingVertical: 11,
    borderRadius: 12,
  },
  heroCreateText: {
    color: '#fff',
    fontFamily: 'Oswald-Bold',
    fontSize: 14,
    letterSpacing: 0.5,
    padding:8
  },

  // ── Quick Actions ──────────────────────────────────────────
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 28,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16,
    gap: 8,
  },
  qaIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qaLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  qaLabelPrimary: {
    color: '#66cc33',
  },

  // ── Section header ─────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionAccent: {
    width: 3,
    height: 20,
    borderRadius: 2,
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
  },

  // ── Horizontal list ────────────────────────────────────────
  hList: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 4,
    marginBottom: 28,
  },

  // ── Song card ──────────────────────────────────────────────
  songCard: {
    width: SONG_W,
    height: 215,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  songCover: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  genreTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  genreTagText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 1,
  },
  songOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // paddingHorizontal: 12,
    // paddingBottom: 12,
    // paddingTop: 52,
  },
  songPlayRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    paddingHorizontal:11
  },
  songPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#66cc33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.2,
    paddingLeft:6
  },
  songCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal:11,
    paddingVertical:6,
   
  },
  metaText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
  },

  // ── Playlist card ──────────────────────────────────────────
  playlistCard: {
    width: PLAYLIST_W,
    height: 185,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  playlistCover: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  playlistBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  playlistBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Oswald-Bold',
  },
  playlistOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 52,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  playlistCount: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
  },

  // ── Empty slot ─────────────────────────────────────────────
  emptySlot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderStyle: 'dashed',
    paddingVertical: 32,
    marginBottom: 28,
    gap: 8,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(102,204,51,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Oswald-Bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  emptySub: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: 'Oswald-Regular',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptyCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  emptyCtaText: {
    color: '#66cc33',
    fontFamily: 'Oswald-Bold',
    fontSize: 13,
  },
});
