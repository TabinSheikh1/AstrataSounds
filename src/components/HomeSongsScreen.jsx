import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
    StatusBar,
    ImageBackground,
    TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from './Header';
import { getAllSongs, toggleLikeSong } from '../api/songsService';
import { getAllPlaylists } from '../api/playlistsService';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SEARCH_DEBOUNCE_MS = 400;

import { SERVER_URL as FILE_BASE } from '../config/api';
const MAIN_TABS = ['Songs', 'Playlists'];
const TAB_ICONS = { Songs: 'music-note', Playlists: 'library-music' };

const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
};

// ── Song card ──────────────────────────────────────────────────
const SongCard = ({ item, likeData, onPress, onLike }) => (
    <View style={s.songCard}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
            <View style={s.songThumbWrap}>
                {item.imagePath ? (
                    <Image key={item.imagePath} source={{ uri: `${FILE_BASE}${item.imagePath}` }} style={s.songImage} resizeMode="cover" />
                ) : (
                    <LinearGradient
                        colors={['#0d1b2a', '#1b2838', '#0d2137']}
                        style={[s.songImage, s.noImageWrap]}
                    >
                        <MaterialIcons name="music-note" size={32} color="rgba(102,204,51,0.35)" />
                    </LinearGradient>
                )}
                    <View style={s.songPlayBadge}>
                        <MaterialIcons name="play-arrow" size={16} color="#fff" />
                    </View>
                </View>
            </TouchableOpacity>

            <View style={s.songInfo}>
                <Text style={s.songTitle} numberOfLines={1}>{item.title}</Text>
                {item.description ? (
                    <Text style={s.songDesc} numberOfLines={2}>{item.description}</Text>
                ) : null}

                <View style={s.songActions}>
                    <TouchableOpacity style={s.actionChip} onPress={onLike} activeOpacity={0.7}>
                        <MaterialIcons
                            name={likeData.liked ? 'favorite' : 'favorite-border'}
                            size={14}
                            color={likeData.liked ? '#ff4d6d' : 'rgba(255,255,255,0.6)'}
                        />
                        <Text style={[s.actionText, likeData.liked && s.actionTextLiked]}>
                            {formatCount(likeData.count)}
                        </Text>
                    </TouchableOpacity>

                    <View style={s.actionChip}>
                        <MaterialIcons name="headset" size={14} color="rgba(255,255,255,0.6)" />
                        <Text style={s.actionText}>{formatCount(item.listensCount)}</Text>
                    </View>

                    <TouchableOpacity style={s.shareBtn} activeOpacity={0.7}>
                        <MaterialIcons name="ios-share" size={14} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
);

// ── Playlist card ──────────────────────────────────────────────
// Row layout — matches SongCard so both tabs read as one consistent design instead of a
// row list next to an unrelated grid.
const PlaylistCard = ({ item, onPress }) => {
    const count = item.songs?.length ?? 0;
    const creator = item.user?.firstName
        ? `${item.user.firstName}${item.user.lastName ? ` ${item.user.lastName}` : ''}`
        : null;

    return (
        <TouchableOpacity style={s.playlistCard} activeOpacity={0.88} onPress={onPress}>
            <View style={s.playlistThumbWrap}>
                {item.bannerImage ? (
                    <Image key={item.bannerImage} source={{ uri: `${FILE_BASE}${item.bannerImage}` }} style={s.playlistCover} resizeMode="cover" />
                ) : (
                    <LinearGradient
                        colors={['#0d1b2a', '#16213e', '#0f3460']}
                        style={[s.playlistCover, s.noImageWrap]}
                    >
                        <MaterialIcons name="library-music" size={28} color="rgba(4,126,201,0.5)" />
                    </LinearGradient>
                )}
                <View style={s.playlistPlayBadge}>
                    <MaterialIcons name="playlist-play" size={16} color="#fff" />
                </View>
            </View>

            <View style={s.playlistInfo}>
                <Text style={s.playlistName} numberOfLines={1}>{item.name}</Text>
                {creator ? (
                    <Text style={s.playlistCreator} numberOfLines={1}>by {creator}</Text>
                ) : null}

                <View style={s.playlistMetaRow}>
                    <View style={s.actionChip}>
                        <MaterialIcons name="music-note" size={13} color="rgba(255,255,255,0.6)" />
                        <Text style={s.actionText}>{count} {count === 1 ? 'song' : 'songs'}</Text>
                    </View>
                    {item.likes > 0 && (
                        <View style={s.actionChip}>
                            <MaterialIcons name="favorite" size={12} color="rgba(255,255,255,0.6)" />
                            <Text style={s.actionText}>{formatCount(item.likes)}</Text>
                        </View>
                    )}
                </View>
            </View>

            <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
    );
};

// ── Loader / Empty ─────────────────────────────────────────────
const Loader = () => (
    <View style={s.centered}>
        <ActivityIndicator size="large" color="#66cc33" />
        <Text style={s.loadingText}>Loading...</Text>
    </View>
);

const Empty = ({ icon, message }) => (
    <View style={s.centered}>
        <View style={s.emptyIconWrap}>
            <MaterialIcons name={icon ?? 'music-note'} size={30} color="#66cc33" />
        </View>
        <Text style={s.emptyText}>{message}</Text>
    </View>
);

// ── Search bar ─────────────────────────────────────────────────
// Backend-driven: every keystroke (debounced) hits GET /songs or /playlists with
// ?search=, never a client-side filter over an already-fetched list.
const SearchBar = ({ value, onChangeText, onClear, placeholder, searching, focused, onFocus, onBlur }) => (
    <View style={[s.searchWrap, focused && s.searchWrapFocused]}>
        <MaterialIcons name="search" size={19} color={focused ? '#66cc33' : 'rgba(255,255,255,0.4)'} />
        <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={s.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
        />
        {searching ? (
            <ActivityIndicator size="small" color="#66cc33" />
        ) : value.length > 0 ? (
            <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <View style={s.searchClearBtn}>
                    <MaterialIcons name="close" size={13} color="#0d1117" />
                </View>
            </TouchableOpacity>
        ) : null}
    </View>
);

// ── Main screen ────────────────────────────────────────────────
const HomeSongsScreen = () => {
    const [selectedTab, setSelectedTab] = useState('Songs');
    const navigation = useNavigation();
    const tabIndicator = useRef(new Animated.Value(0)).current;
    // Measured from the actual rendered container rather than hand-calculated from screen
    // width minus guessed padding — a fixed formula here previously drifted from the real
    // padding stack (tabsWrapper's horizontal padding + tabsContainer's own padding) and
    // left a gap on the right edge of the pill when "Playlists" was active.
    const [tabContainerWidth, setTabContainerWidth] = useState(0);
    const TAB_PADDING = 2; // tabsContainer's `padding` — pill insets by this on each side
    const tabW = tabContainerWidth > 0 ? (tabContainerWidth - TAB_PADDING * 2) / 2 : 0;

    const [songs, setSongs] = useState([]);
    const [songsLoading, setSongsLoading] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [likeState, setLikeState] = useState({});

    // One search box, scoped to whichever tab is active — searches that tab's content
    // through the backend (GET /songs or /playlists with ?search=), never a filter over
    // an already-fetched list.
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const searchDebounceRef = useRef(null);
    // The initial load already happens via useFocusEffect below — without this guard the
    // debounce effect would *also* fire once on mount (searchQuery starts at '') and
    // double-fetch.
    const skipNextDebounceRef = useRef(true);
    // useFocusEffect's callback must stay referentially stable ([] deps) — React Navigation
    // re-invokes it immediately on any reference change *while already focused*, not just on
    // a real focus/blur, so putting selectedTab/searchQuery in its deps would fire a request
    // on every keystroke/tab-tap and blow past the debounce above. Tracking the latest values
    // in a ref instead keeps the callback stable while still reading current state when an
    // actual refocus happens.
    const latestRef = useRef({ selectedTab: 'Songs', searchQuery: '' });

    const loadSongs = async (search) => {
        setSongsLoading(true);
        try {
            const data = await getAllSongs(search);
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setSongs(list);
            const seed = {};
            list.forEach((item) => {
                seed[item.id] = { liked: item.isLiked ?? false, count: item.likesCount ?? 0 };
            });
            setLikeState((prev) => ({ ...prev, ...seed }));
        } catch (e) {
            console.error('[HomeSongs] load songs error:', e?.message);
        } finally {
            setSongsLoading(false);
        }
    };

    const loadPlaylists = async (search) => {
        setPlaylistsLoading(true);
        try {
            const data = await getAllPlaylists(search);
            setPlaylists(Array.isArray(data) ? data : data?.data ?? []);
        } catch (e) {
            console.error('[HomeSongs] load playlists error:', e?.message);
        } finally {
            setPlaylistsLoading(false);
        }
    };

    const runSearch = (tab, search) => {
        if (tab === 'Songs') loadSongs(search);
        else loadPlaylists(search);
    };

    const handleTabPress = (tab, index) => {
        setSelectedTab(tab);
        Animated.spring(tabIndicator, { toValue: index, tension: 60, friction: 8, useNativeDriver: true }).start();
        // Instant, no debounce — a tap isn't rapid typing, and the other tab's data for
        // the current query (if any) hasn't been fetched yet.
        runSearch(tab, searchQuery.trim() || undefined);
    };

    const handleLike = async (song) => {
        const prev = likeState[song.id] ?? { liked: false, count: song.likesCount ?? 0 };
        setLikeState((st) => ({
            ...st,
            [song.id]: { liked: !prev.liked, count: prev.liked ? Math.max(0, prev.count - 1) : prev.count + 1 },
        }));
        try {
            await toggleLikeSong(song.id);
        } catch {
            setLikeState((st) => ({ ...st, [song.id]: prev }));
        }
    };

    // Keep latestRef current every render so the stable useFocusEffect callback below
    // never reads stale state.
    useEffect(() => {
        latestRef.current = { selectedTab, searchQuery };
    });

    // Debounced search-as-you-type against whichever tab is currently active.
    useEffect(() => {
        if (skipNextDebounceRef.current) {
            skipNextDebounceRef.current = false;
            return undefined;
        }
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            runSearch(selectedTab, searchQuery.trim() || undefined);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(searchDebounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Refresh the active tab (respecting any in-progress search) whenever the screen
    // regains focus, instead of unconditionally reloading the unfiltered list and
    // silently dropping the user's search. Reads latestRef rather than closing over
    // selectedTab/searchQuery directly — see latestRef's declaration for why.
    useFocusEffect(
        useCallback(() => {
            const { selectedTab: tab, searchQuery: query } = latestRef.current;
            runSearch(tab, query.trim() || undefined);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []),
    );

    const handleClearSearch = () => setSearchQuery('');

    const trimmedQuery = searchQuery.trim();
    const isSearching = trimmedQuery.length > 0;

    const renderContent = () => {
        if (selectedTab === 'Songs') {
            // Only the very first load (nothing on screen yet) gets the full-screen loader —
            // once there are results, a new search just updates the inline spinner in the
            // search bar so the list doesn't blank out on every keystroke.
            if (songsLoading && !songs.length) return <Loader />;
            if (!songs.length) {
                return isSearching
                    ? <Empty icon="search-off" message={`No songs match "${trimmedQuery}".`} />
                    : <Empty icon="music-note" message="No songs found yet." />;
            }
            return (
                <FlatList
                    key="songs"
                    data={songs}
                    renderItem={({ item }) => (
                        <SongCard
                            item={item}
                            likeData={likeState[item.id] ?? { liked: false, count: item.likesCount ?? 0 }}
                            onPress={() => navigation.navigate('SongDetailScreen', { song: item })}
                            onLike={() => handleLike(item)}
                        />
                    )}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={s.songList}
                    showsVerticalScrollIndicator={false}
                />
            );
        }

        if (selectedTab === 'Playlists') {
            if (playlistsLoading && !playlists.length) return <Loader />;
            if (!playlists.length) {
                return isSearching
                    ? <Empty icon="search-off" message={`No playlists match "${trimmedQuery}".`} />
                    : <Empty icon="library-music" message="No playlists yet. Create one in Library." />;
            }
            return (
                <FlatList
                    key="playlists"
                    data={playlists}
                    renderItem={({ item }) => (
                        <PlaylistCard
                            item={item}
                            onPress={() => navigation.navigate('PlaylistDetailScreen', { playlistId: item.id })}
                        />
                    )}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={s.songList}
                    showsVerticalScrollIndicator={false}
                />
            );
        }

    };

    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={s.background}
            resizeMode="cover"
        >
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <View style={s.container}>
                <Header />

                {/* ── Page label ── */}
                <View style={s.pageHeader}>
                    <LinearGradient
                        colors={['#66cc33', '#047ec9']}
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        style={s.pageAccent}
                    />
                    <Text style={s.pageTitle}>Discover</Text>
                </View>

                {/* ── Tabs ── */}
                <View style={s.tabsWrapper}>
                    <View
                        style={s.tabsContainer}
                        onLayout={(e) => setTabContainerWidth(e.nativeEvent.layout.width)}
                    >
                        <Animated.View
                            style={[
                                s.tabPill,
                                {
                                    width: tabW,
                                    opacity: tabW > 0 ? 1 : 0,
                                    transform: [{
                                        translateX: tabIndicator.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [TAB_PADDING, tabW + TAB_PADDING],
                                        }),
                                    }],
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={['#66cc33', '#047ec9']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={s.tabPillGradient}
                            />
                        </Animated.View>
                        {MAIN_TABS.map((tab, i) => {
                            const active = selectedTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    style={s.tabItem}
                                    onPress={() => handleTabPress(tab, i)}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons
                                        name={TAB_ICONS[tab]}
                                        size={15}
                                        color={active ? '#fff' : 'rgba(255,255,255,0.55)'}
                                        style={s.tabIcon}
                                    />
                                    <Text style={[s.tabText, active && s.tabTextActive]}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── Search ── */}
                <View style={s.searchOuter}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onClear={handleClearSearch}
                        placeholder={selectedTab === 'Songs' ? 'Search songs...' : 'Search playlists...'}
                        searching={selectedTab === 'Songs' ? songsLoading : playlistsLoading}
                        focused={searchFocused}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                </View>

                {renderContent()}
            </View>
        </ImageBackground>
    );
};

export default HomeSongsScreen;

// ── Styles ─────────────────────────────────────────────────────

const s = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%', backgroundColor: '#0d1117' },
    container: { flex: 1 },

    // ── Page header ────────────────────────────────────────────
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 4,
    },
    pageAccent: {
        width: 3,
        height: 22,
        borderRadius: 2,
    },
    pageTitle: {
        color: '#fff',
        fontSize: 22,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.3,
    },

    // ── Tabs ───────────────────────────────────────────────────
    tabsWrapper: { paddingHorizontal: 16, paddingVertical: 10 },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        padding: 2,
        position: 'relative',
    },
    tabPill: {
        position: 'absolute',
        top: 2,
        bottom: 2,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#047ec9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 5,
    },
    tabPillGradient: { flex: 1 },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 9,
        zIndex: 1,
    },
    tabIcon: { marginTop: -1 },
    tabText: {
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.5,
    },
    tabTextActive: { color: '#fff' },

    // ── Search ─────────────────────────────────────────────────
    searchOuter: { paddingHorizontal: 16, paddingBottom: 10 },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        paddingHorizontal: 14,
        height: 46,
    },
    searchWrapFocused: {
        borderColor: 'rgba(102,204,51,0.5)',
        backgroundColor: 'rgba(102,204,51,0.07)',
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Oswald-Regular',
        padding: 0,
        height: '100%',
    },
    searchClearBtn: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Song list ──────────────────────────────────────────────
    songList: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 110,
        gap: 10,
    },

    // ── No-image placeholder ───────────────────────────────────
    noImageWrap: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Song card ──────────────────────────────────────────────
    songCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        padding: 12,
        alignItems: 'center',
        gap: 12,
    },
    songThumbWrap: {
        position: 'relative',
    },
    songImage: {
        width: 88,
        height: 88,
        borderRadius: 12,
    },
    songPlayBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#66cc33',
        justifyContent: 'center',
        alignItems: 'center',
    },
    songInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    songTitle: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 15,
        letterSpacing: 0.2,
    },
    songDesc: {
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'Oswald-Regular',
        fontSize: 11,
        lineHeight: 15,
    },
    songActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 8,
    },
    actionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    actionText: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 11,
        fontFamily: 'Oswald-Bold',
    },
    actionTextLiked: { color: '#ff4d6d' },
    shareBtn: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
    },

    // ── Playlist card (row — mirrors the song card above) ───────
    playlistCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        padding: 12,
        alignItems: 'center',
        gap: 12,
    },
    playlistThumbWrap: {
        position: 'relative',
    },
    playlistCover: {
        width: 72,
        height: 72,
        borderRadius: 12,
    },
    playlistPlayBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#047ec9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0d1117',
    },
    playlistInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    playlistName: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.2,
    },
    playlistCreator: {
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'Oswald-Regular',
        fontSize: 11,
    },
    playlistMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },

    // ── Loader / Empty ─────────────────────────────────────────
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
        gap: 12,
    },
    emptyIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: 'rgba(102,204,51,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(102,204,51,0.2)',
    },
    loadingText: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Oswald-Regular',
        fontSize: 13,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Oswald-Bold',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
