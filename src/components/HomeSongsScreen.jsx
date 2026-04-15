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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from './Header';
import { getAllSongs, toggleLikeSong } from '../api/songsService';
import { getMyPlaylists } from '../api/playlistsService';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const FILE_BASE = 'http://localhost:3000';

const MAIN_TABS = ['Songs', 'Playlists', 'Genres'];

const genres = [
    { id: '1', tag: 'POP',  image: require('../assets/images/Rectangle-9560.png') },
    { id: '2', tag: 'ROP',  image: require('../assets/images/Rectangle-9561.png') },
    { id: '3', tag: 'POP',  image: require('../assets/images/Rectangle-9562.png') },
    { id: '4', tag: 'ROP',  image: require('../assets/images/Rectangle-9563.png') },
    { id: '5', tag: 'POP',  image: require('../assets/images/Rectangle-9564.png') },
    { id: '6', tag: 'R&B',  image: require('../assets/images/Rectangle-9560.png') },
    { id: '7', tag: 'EDM',  image: require('../assets/images/Rectangle-9561.png') },
    { id: '8', tag: 'ROCK', image: require('../assets/images/Rectangle-9562.png') },
];

const HomeSongsScreen = () => {
    const [selectedTab, setSelectedTab] = useState('Songs');
    const navigation = useNavigation();
    const tabIndicator = useRef(new Animated.Value(0)).current;

    // Songs state
    const [songs, setSongs] = useState([]);
    const [songsLoading, setSongsLoading] = useState(false);

    // Playlists state
    const [playlists, setPlaylists] = useState([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);

    // Like state: { [songId]: { liked: bool, count: number } }
    const [likeState, setLikeState] = useState({});

    const handleMainTabPress = (tab, index) => {
        setSelectedTab(tab);
        Animated.spring(tabIndicator, {
            toValue: index,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const loadSongs = async () => {
        setSongsLoading(true);
        try {
            const data = await getAllSongs();
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setSongs(list);
            // Seed like state from API response
            const seed = {};
            list.forEach((s) => {
                seed[s.id] = { liked: s.isLiked ?? false, count: s.likesCount ?? 0 };
            });
            setLikeState(seed);
        } catch (e) {
            console.error('[HomeSongs] load songs error:', e?.message);
        } finally {
            setSongsLoading(false);
        }
    };

    const handleLike = async (song) => {
        const prev = likeState[song.id] ?? { liked: song.isLiked ?? false, count: song.likesCount ?? 0 };
        // Optimistic update
        setLikeState((s) => ({
            ...s,
            [song.id]: { liked: !prev.liked, count: prev.liked ? Math.max(0, prev.count - 1) : prev.count + 1 },
        }));
        try {
            await toggleLikeSong(song.id);
        } catch {
            // Revert on failure
            setLikeState((s) => ({ ...s, [song.id]: prev }));
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

    // Load songs on focus
    useFocusEffect(
        useCallback(() => {
            loadSongs();
        }, [])
    );

    // Load playlists when tab switches to Playlists
    useEffect(() => {
        if (selectedTab === 'Playlists') loadPlaylists();
    }, [selectedTab]);

    // ── Render: Song Card ──────────────────────────────────────
    const renderSong = ({ item }) => {
        const imageUri = item.imagePath ? { uri: `${FILE_BASE}${item.imagePath}` } : require('../assets/images/Rectangle-9560.png');
        const like = likeState[item.id] ?? { liked: item.isLiked ?? false, count: item.likesCount ?? 0 };
        return (
            <View style={styles.songCard}>
                <TouchableOpacity onPress={() => navigation.navigate('SongDetailScreen', { song: item })}>
                    <Image source={imageUri} style={styles.songImage} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.songDesc} numberOfLines={2}>{item.description ?? ''}</Text>
                    <View style={styles.songActions}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => handleLike(item)} activeOpacity={0.7}>
                            <MaterialIcons
                                name={like.liked ? 'favorite' : 'favorite-border'}
                                size={16}
                                color={like.liked ? '#ff4d6d' : 'rgba(255,255,255,0.7)'}
                            />
                            <Text style={[styles.actionText, like.liked && styles.actionTextLiked]}>
                                {formatCount(like.count)}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.actionItem}>
                            <Image source={require('../assets/images/headphone.png')} style={{ marginTop: 1 }} />
                            <Text style={styles.actionText}>{formatCount(item.listensCount)}</Text>
                        </View>
                        <TouchableOpacity style={{ marginLeft: 15 }}>
                            <Image source={require('../assets/images/share.png')} style={{ marginTop: 1 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    // ── Render: Playlist Card ──────────────────────────────────
    const renderPlaylistItem = ({ item }) => {
        const imageUri = item.bannerUrl ? { uri: `${FILE_BASE}${item.bannerUrl}` } : require('../assets/images/Rectangle-9560.png');
        const songCount = item.songs?.length ?? 0;
        return (
            <TouchableOpacity style={styles.playlistCard}>
                <Image source={imageUri} style={styles.playlistImage} />
                <View style={styles.playlistInfoRow}>
                    <Text style={styles.playlistTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.playlistSongCount}>{songCount} {songCount === 1 ? 'Song' : 'Songs'}</Text>
                </View>
                <View style={styles.userRow}>
                    <Image source={require('../assets/images/Rectangle-9560.png')} style={styles.userAvatar} />
                    <Text style={styles.userName}>My Playlist</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // ── Render: Genre Card ─────────────────────────────────────
    const renderGenreItem = ({ item }) => (
        <TouchableOpacity style={styles.genreCard}>
            <ImageBackground
                source={item.image}
                style={styles.genreImage}
                imageStyle={{ borderRadius: 4 }}
            >
                <View style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{item.tag}</Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

    // ── Loader ─────────────────────────────────────────────────
    const Loader = () => (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#66cc33" />
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );

    // ── Empty ──────────────────────────────────────────────────
    const Empty = ({ message }) => (
        <View style={styles.centered}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={styles.emptyText}>{message}</Text>
        </View>
    );

    const renderContent = () => {
        if (selectedTab === 'Songs') {
            if (songsLoading) return <Loader />;
            if (!songs.length) return <Empty message="No songs found yet." />;
            return (
                <FlatList
                    key="songs"
                    data={songs}
                    renderItem={renderSong}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            );
        }

        if (selectedTab === 'Playlists') {
            if (playlistsLoading) return <Loader />;
            if (!playlists.length) return <Empty message="No playlists yet. Create one in Library." />;
            return (
                <FlatList
                    key="playlists"
                    data={playlists}
                    renderItem={renderPlaylistItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.playlistGrid}
                    showsVerticalScrollIndicator={false}
                />
            );
        }

        if (selectedTab === 'Genres') {
            return (
                <FlatList
                    key="genres"
                    data={genres}
                    renderItem={renderGenreItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.genreGrid}
                    showsVerticalScrollIndicator={false}
                />
            );
        }
    };

    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={{ flex: 1, width: '100%', height: '100%' }}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Header title="STRATASOUND MUSIC" coins={25} onMenuPress={() => {}} />

                {/* Main tabs */}
                <View style={styles.tabsWrapper}>
                    <View style={styles.tabsContainer}>
                        <Animated.View
                            style={[
                                styles.tabActivePill,
                                {
                                    transform: [{
                                        translateX: tabIndicator.interpolate({
                                            inputRange: [0, 1, 2],
                                            outputRange: [2, (width - 48) / 3 + 2, ((width - 48) / 3) * 2 + 2],
                                        }),
                                    }],
                                    width: (width - 50) / 2.8,
                                },
                            ]}
                        />
                        {MAIN_TABS.map((tab, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.tabItem}
                                onPress={() => handleMainTabPress(tab, index)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
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

// ── Helpers ────────────────────────────────────────────────────
const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
};

const styles = StyleSheet.create({
    container: { flex: 1 },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 80,
        gap: 10,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Oswald-Bold',
        fontSize: 13,
        marginTop: 8,
    },
    emptyIcon: { fontSize: 40 },
    emptyText: {
        color: 'rgba(255,255,255,0.55)',
        fontFamily: 'Oswald-Bold',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },

    // Main tabs
    tabsWrapper: { paddingHorizontal: 16, paddingVertical: 10 },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 2,
        position: 'relative',
    },
    tabActivePill: {
        position: 'absolute',
        top: 2,
        bottom: 2,
        backgroundColor: '#fff',
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    tabItem: { flex: 1, alignItems: 'center', paddingVertical: 9, zIndex: 1 },
    tabText: { fontSize: 14, fontFamily: 'Oswald-Bold', color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5 },
    tabTextActive: { color: '#1a1a2e' },

    // Song card
    songCard: { flexDirection: 'row', marginBottom: 12, borderRadius: 12, paddingHorizontal: 25, marginTop: 10 },
    songImage: { width: 110, height: 100, borderRadius: 5 },
    songTitle: { color: '#fff', fontFamily: 'Oswald-Bold', marginBottom: 2 },
    songArtist: { color: '#fff', fontFamily: 'Oswald-Bold', marginBottom: 2, fontSize: 12 },
    songDesc: { color: '#fff', fontSize: 10 },
    songActions: { flexDirection: 'row', marginTop: 6, alignItems: 'center' },
    actionItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
    actionText: { color: '#fff', marginLeft: 4, fontFamily: 'Oswald-Bold' },
    actionTextLiked: { color: '#ff4d6d' },

    // Playlist grid
    playlistGrid: { paddingHorizontal: 10, paddingBottom: 100 },
    playlistCard: { flex: 1, margin: 8, maxWidth: (width / 2) - 20 },
    playlistImage: { width: '100%', height: 160, borderRadius: 4 },
    playlistInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    playlistTitle: { color: '#fff', fontSize: 13, fontFamily: 'Oswald-Bold', flex: 1 },
    playlistSongCount: { color: '#fff', fontSize: 9, marginLeft: 5, opacity: 0.8 },
    userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    userAvatar: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#444' },
    userName: { color: '#fff', fontSize: 12, marginLeft: 6, opacity: 0.9, fontFamily: 'Oswald-Bold' },

    // Genre grid
    genreGrid: { paddingHorizontal: 10, paddingBottom: 100, paddingTop: 10 },
    genreCard: { flex: 1, margin: 8, height: 160, maxWidth: (width / 2) - 20 },
    genreImage: { width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'flex-end' },
    genreBadge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, borderRadius: 10, marginTop: 5, marginRight: 8 },
    genreBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Oswald-Bold' },
});

export default HomeSongsScreen;
