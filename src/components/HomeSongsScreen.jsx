import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    Animated,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from './Header';
import { getAllSongs, toggleLikeSong } from '../api/songsService';
import { getMyPlaylists } from '../api/playlistsService';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const FILE_BASE = 'http://localhost:3000';
const MAIN_TABS = ['Songs', 'Playlists', 'Genres'];
const TAB_W = (width - 48) / 3;

const genres = [
    { id: '1', tag: 'POP',  image: require('../assets/images/Rectangle-9560.png'), color: '#e91e8c' },
    { id: '2', tag: 'R&B',  image: require('../assets/images/Rectangle-9561.png'), color: '#9c27b0' },
    { id: '3', tag: 'HIP-HOP', image: require('../assets/images/Rectangle-9562.png'), color: '#ff5722' },
    { id: '4', tag: 'JAZZ', image: require('../assets/images/Rectangle-9563.png'), color: '#047ec9' },
    { id: '5', tag: 'EDM',  image: require('../assets/images/Rectangle-9564.png'), color: '#66cc33' },
    { id: '6', tag: 'ROCK', image: require('../assets/images/Rectangle-9560.png'), color: '#f44336' },
    { id: '7', tag: 'SOUL', image: require('../assets/images/Rectangle-9561.png'), color: '#ff9800' },
    { id: '8', tag: 'LATIN',image: require('../assets/images/Rectangle-9562.png'), color: '#4caf50' },
];

const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
};

// ── Song card ──────────────────────────────────────────────────
const SongCard = ({ item, likeData, onPress, onLike }) => {
    const imageUri = item.imagePath
        ? { uri: `${FILE_BASE}${item.imagePath}` }
        : require('../assets/images/Rectangle-9560.png');

    return (
        <View style={s.songCard}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
                <View style={s.songThumbWrap}>
                    <Image source={imageUri} style={s.songImage} />
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
};

// ── Playlist card ──────────────────────────────────────────────
const PlaylistCard = ({ item }) => {
    const imageUri = item.bannerUrl
        ? { uri: `${FILE_BASE}${item.bannerUrl}` }
        : require('../assets/images/Rectangle-9560.png');
    const count = item.songs?.length ?? 0;

    return (
        <TouchableOpacity style={s.playlistCard} activeOpacity={0.88}>
            <Image source={imageUri} style={s.playlistCover} />
            <View style={s.playlistCountBadge}>
                <MaterialIcons name="music-note" size={9} color="#fff" />
                <Text style={s.playlistCountText}>{count}</Text>
            </View>
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.92)']}
                style={s.playlistOverlay}
            >
                <Text style={s.playlistName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.playlistSongCount}>{count} {count === 1 ? 'song' : 'songs'}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

// ── Genre card ─────────────────────────────────────────────────
const GenreCard = ({ item }) => (
    <TouchableOpacity style={s.genreCard} activeOpacity={0.88}>
        <ImageBackground
            source={item.image}
            style={s.genreInner}
            imageStyle={s.genreImageStyle}
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.25)', 'transparent', 'rgba(0,0,0,0.75)']}
                style={s.genreOverlay}
            >
                <View style={[s.genreTagPill, { backgroundColor: item.color }]}>
                    <Text style={s.genreTagText}>{item.tag}</Text>
                </View>
            </LinearGradient>
        </ImageBackground>
    </TouchableOpacity>
);

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

// ── Main screen ────────────────────────────────────────────────
const HomeSongsScreen = () => {
    const [selectedTab, setSelectedTab] = useState('Songs');
    const navigation = useNavigation();
    const tabIndicator = useRef(new Animated.Value(0)).current;

    const [songs, setSongs] = useState([]);
    const [songsLoading, setSongsLoading] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [likeState, setLikeState] = useState({});

    const handleTabPress = (tab, index) => {
        setSelectedTab(tab);
        Animated.spring(tabIndicator, { toValue: index, tension: 60, friction: 8, useNativeDriver: true }).start();
    };

    const loadSongs = async () => {
        setSongsLoading(true);
        try {
            const data = await getAllSongs();
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setSongs(list);
            const seed = {};
            list.forEach((item) => {
                seed[item.id] = { liked: item.isLiked ?? false, count: item.likesCount ?? 0 };
            });
            setLikeState(seed);
        } catch (e) {
            console.error('[HomeSongs] load songs error:', e?.message);
        } finally {
            setSongsLoading(false);
        }
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

    const loadPlaylists = async () => {
        setPlaylistsLoading(true);
        try {
            const data = await getMyPlaylists();
            setPlaylists(Array.isArray(data) ? data : data?.data ?? []);
        } catch (e) {
            console.error('[HomeSongs] load playlists error:', e?.message);
        } finally {
            setPlaylistsLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadSongs(); }, []));

    useEffect(() => {
        if (selectedTab === 'Playlists') loadPlaylists();
    }, [selectedTab]);

    const renderContent = () => {
        if (selectedTab === 'Songs') {
            if (songsLoading) return <Loader />;
            if (!songs.length) return <Empty icon="music-note" message="No songs found yet." />;
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
            if (playlistsLoading) return <Loader />;
            if (!playlists.length) return <Empty icon="library-music" message="No playlists yet. Create one in Library." />;
            return (
                <FlatList
                    key="playlists"
                    data={playlists}
                    renderItem={({ item }) => <PlaylistCard item={item} />}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={2}
                    contentContainerStyle={s.gridList}
                    showsVerticalScrollIndicator={false}
                />
            );
        }

        if (selectedTab === 'Genres') {
            return (
                <FlatList
                    key="genres"
                    data={genres}
                    renderItem={({ item }) => <GenreCard item={item} />}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={s.gridList}
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
                    <View style={s.tabsContainer}>
                        <Animated.View
                            style={[
                                s.tabPill,
                                {
                                    width: TAB_W,
                                    transform: [{
                                        translateX: tabIndicator.interpolate({
                                            inputRange: [0, 1, 2],
                                            outputRange: [2, TAB_W + 2, TAB_W * 2 + 2],
                                        }),
                                    }],
                                },
                            ]}
                        />
                        {MAIN_TABS.map((tab, i) => (
                            <TouchableOpacity
                                key={tab}
                                style={s.tabItem}
                                onPress={() => handleTabPress(tab, i)}
                                activeOpacity={0.8}
                            >
                                <Text style={[s.tabText, selectedTab === tab && s.tabTextActive]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {renderContent()}
            </View>
        </ImageBackground>
    );
};

export default HomeSongsScreen;

// ── Styles ─────────────────────────────────────────────────────
const PLAYLIST_CARD_W = (width - 48) / 2;
const GENRE_CARD_W = (width - 48) / 2;

const s = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
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
        backgroundColor: '#fff',
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 4,
    },
    tabItem: { flex: 1, alignItems: 'center', paddingVertical: 9, zIndex: 1 },
    tabText: {
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.5,
    },
    tabTextActive: { color: '#0d1117' },

    // ── Song list ──────────────────────────────────────────────
    songList: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 110,
        gap: 10,
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

    // ── Grid (playlists + genres) ──────────────────────────────
    gridList: {
        paddingHorizontal: 12,
        paddingTop: 6,
        paddingBottom: 110,
    },

    // ── Playlist card ──────────────────────────────────────────
    playlistCard: {
        flex: 1,
        margin: 6,
        height: 170,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
    },
    playlistCover: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    playlistCountBadge: {
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
    playlistCountText: {
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
        paddingTop: 48,
    },
    playlistName: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.2,
        marginBottom: 2,
    },
    playlistSongCount: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontFamily: 'Oswald-Regular',
    },

    // ── Genre card ─────────────────────────────────────────────
    genreCard: {
        flex: 1,
        margin: 6,
        height: 155,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    genreInner: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    genreImageStyle: {
        borderRadius: 16,
    },
    genreOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 12,
    },
    genreTagPill: {
        alignSelf: 'flex-start',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    genreTagText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 1.2,
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
