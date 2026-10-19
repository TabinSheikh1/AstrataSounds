import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Platform,
    ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import TrackPlayer, { usePlaybackState, useActiveTrack, State, RepeatMode } from 'react-native-track-player';
import { getPlaylistById, toggleLikePlaylist } from '../api/playlistsService';
import { getErrorMessage } from '../utils/errorHandler';
import { SERVER_URL as FILE_BASE, API_BASE_URL } from '../config/api';

const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
};

const SongRow = ({ item, onPress, isActive, isPlaying, index }) => (
    <TouchableOpacity style={[s.songCard, isActive && s.songCardActive]} onPress={onPress} activeOpacity={0.88}>
        <View style={s.songIndexWrap}>
            {isActive ? (
                <MaterialIcons name={isPlaying ? 'volume-up' : 'pause'} size={16} color="#66cc33" />
            ) : (
                <Text style={s.songIndex}>{index + 1}</Text>
            )}
        </View>
        {item.imagePath ? (
            <Image source={{ uri: `${FILE_BASE}${item.imagePath}` }} style={s.songImage} resizeMode="cover" />
        ) : (
            <LinearGradient colors={['#0d1b2a', '#1b2838', '#0d2137']} style={[s.songImage, s.noImageWrap]}>
                <MaterialIcons name="music-note" size={28} color="rgba(102,204,51,0.35)" />
            </LinearGradient>
        )}
        <View style={s.songInfo}>
            <Text style={[s.songTitle, isActive && s.songTitleActive]} numberOfLines={1}>{item.title}</Text>
            {item.description ? (
                <Text style={s.songDesc} numberOfLines={1}>{item.description}</Text>
            ) : null}
            <View style={s.songMetaRow}>
                <MaterialIcons name="favorite" size={11} color="rgba(255,255,255,0.4)" />
                <Text style={s.songMetaText}>{formatCount(item.likes)}</Text>
                <View style={s.metaDot} />
                <MaterialIcons name="headset" size={11} color="rgba(255,255,255,0.4)" />
                <Text style={s.songMetaText}>{formatCount(item.listens)}</Text>
            </View>
        </View>
        <MaterialIcons
            name={isActive && isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
            size={30}
            color={isActive ? '#66cc33' : 'rgba(102,204,51,0.75)'}
        />
    </TouchableOpacity>
);

const PlaylistDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { playlistId } = route.params ?? {};

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [likeBusy, setLikeBusy] = useState(false);
    const [playBusy, setPlayBusy] = useState(false);

    const accessToken = useSelector((state) => state.auth?.accessToken);
    const authHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

    const playbackState = usePlaybackState();
    const isPlaying = playbackState?.state === State.Playing;
    // Reactive — covers both the row highlight updating as the queue auto-advances, and
    // reflecting playback already in progress if the user returns to this screen mid-queue.
    const activeTrackId = useActiveTrack()?.id ?? null;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPlaylistById(playlistId);
            setPlaylist(Array.isArray(data) ? null : data?.data ?? data);
        } catch (e) {
            console.error('[PlaylistDetail] load error:', getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    }, [playlistId]);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    // Builds the play queue from this playlist's songs, in order, skipping any without
    // audio (shouldn't normally happen, but never queue a track with nothing to stream).
    const buildQueueTracks = (list) =>
        (list ?? [])
            .filter((song) => !!song.audioPath)
            .map((song) => ({
                id: song.id,
                url: `${API_BASE_URL}/songs/${song.id}/stream`,
                headers: authHeaders,
                title: song.title ?? 'Unknown',
                artist: 'StrataSound Music AI',
                artwork: song.imagePath ? `${FILE_BASE}${song.imagePath}` : undefined,
            }));

    // Tapping a song plays the WHOLE playlist starting from it — once that song ends,
    // TrackPlayer's own queue advances to the next one automatically, all the way through.
    const playQueueFrom = async (songId) => {
        const tracks = buildQueueTracks(playlist?.songs);
        const startIdx = tracks.findIndex((t) => t.id === songId);
        if (startIdx === -1) return; // this particular song has no audio to play

        // Already the active track — tapping it again is just a pause/resume, not a restart.
        if (activeTrackId === songId) {
            await (isPlaying ? TrackPlayer.pause() : TrackPlayer.play());
            return;
        }

        setPlayBusy(true);
        try {
            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.setRepeatMode(RepeatMode.Off);
            if (startIdx > 0) await TrackPlayer.skip(startIdx);
            await TrackPlayer.play();
            // activeTrackId updates on its own via useActiveTrack() once
            // Event.PlaybackActiveTrackChanged fires — no manual state to set here.
        } catch (e) {
            console.error('[PlaylistDetail] play error:', e);
        } finally {
            setPlayBusy(false);
        }
    };

    // Acts as the big play/pause toggle for "this playlist" as a whole: if something from
    // it is already loaded (anywhere in the queue, not just the first song), toggle
    // play/pause in place rather than restarting from song 1 every tap.
    const handlePlayAll = async () => {
        const tracks = buildQueueTracks(playlist?.songs);
        if (!tracks.length) return;
        if (activeTrackId && tracks.some((t) => t.id === activeTrackId)) {
            await (isPlaying ? TrackPlayer.pause() : TrackPlayer.play());
            return;
        }
        playQueueFrom(tracks[0].id);
    };

    const handleLike = async () => {
        if (!playlist || likeBusy) return;
        setLikeBusy(true);
        const prevLiked = playlist.liked ?? false;
        const prevLikes = playlist.likes ?? 0;

        setPlaylist((p) => ({
            ...p,
            liked: !prevLiked,
            likes: prevLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1,
        }));

        try {
            const res = await toggleLikePlaylist(playlistId);
            const result = res?.data ?? res;
            setPlaylist((p) => ({ ...p, liked: result.liked, likes: result.likes }));
        } catch (e) {
            setPlaylist((p) => ({ ...p, liked: prevLiked, likes: prevLikes }));
        } finally {
            setLikeBusy(false);
        }
    };

    const songs = playlist?.songs ?? [];
    const ownerName = playlist?.user
        ? `${playlist.user.firstName ?? ''} ${playlist.user.lastName ?? ''}`.trim()
        : null;
    const hasPlayableSongs = songs.some((song) => !!song.audioPath);
    const isThisPlaylistActive = !!activeTrackId && songs.some((song) => song.id === activeTrackId);
    const isThisPlaylistPlaying = isThisPlaylistActive && isPlaying;

    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={s.background}
            resizeMode="cover"
        >
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <View style={s.topBar}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={s.screenTitle} numberOfLines={1}>{playlist?.name ?? 'Playlist'}</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={s.centered}>
                    <ActivityIndicator size="large" color="#66cc33" />
                </View>
            ) : !playlist ? (
                <View style={s.centered}>
                    <MaterialIcons name="error-outline" size={36} color="rgba(255,255,255,0.25)" />
                    <Text style={s.emptyText}>Couldn't load this playlist.</Text>
                </View>
            ) : (
                <FlatList
                    data={songs}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={s.hero}>
                            <View style={s.bannerWrap}>
                                {playlist.bannerImage ? (
                                    <Image
                                        source={{ uri: `${FILE_BASE}${playlist.bannerImage}` }}
                                        style={s.bannerImg}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={['#0d1b2a', '#16213e', '#0f3460']}
                                        style={[s.bannerImg, s.noImageWrap]}
                                    >
                                        <MaterialIcons name="library-music" size={40} color="rgba(4,126,201,0.5)" />
                                    </LinearGradient>
                                )}
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                                    style={s.bannerOverlay}
                                />
                            </View>

                            <Text style={s.playlistName}>{playlist.name}</Text>
                            <View style={s.metaRow}>
                                {ownerName ? <Text style={s.metaText}>by {ownerName}</Text> : null}
                                {ownerName ? <View style={s.metaDot} /> : null}
                                <Text style={s.metaText}>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</Text>
                            </View>

                            <View style={s.actionsRow}>
                                {hasPlayableSongs && (
                                    <TouchableOpacity
                                        onPress={handlePlayAll}
                                        activeOpacity={0.85}
                                        disabled={playBusy}
                                    >
                                        <LinearGradient
                                            colors={playBusy ? ['#555', '#444'] : ['#66cc33', '#047ec9']}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={s.playAllBtn}
                                        >
                                            <View style={s.playAllContent}>
                                                {playBusy ? (
                                                    <ActivityIndicator size="small" color="#fff" />
                                                ) : (
                                                    <MaterialIcons
                                                        name={isThisPlaylistPlaying ? 'pause' : 'play-arrow'}
                                                        size={18}
                                                        color="#fff"
                                                    />
                                                )}
                                                <Text style={s.playAllText}>
                                                    {isThisPlaylistPlaying ? 'Playing' : 'Play All'}
                                                </Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={s.likeBtn}
                                    onPress={handleLike}
                                    activeOpacity={0.85}
                                    disabled={likeBusy}
                                >
                                    <MaterialIcons
                                        name={playlist.liked ? 'favorite' : 'favorite-border'}
                                        size={18}
                                        color={playlist.liked ? '#ff4d6d' : '#fff'}
                                    />
                                    <Text style={[s.likeBtnText, playlist.liked && s.likeBtnTextActive]}>
                                        {formatCount(playlist.likes)} {playlist.likes === 1 ? 'Like' : 'Likes'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={s.sectionRow}>
                                <LinearGradient
                                    colors={['#66cc33', '#047ec9']}
                                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                    style={s.sectionAccent}
                                />
                                <Text style={s.sectionTitle}>Songs</Text>
                            </View>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <SongRow
                            item={item}
                            index={index}
                            isActive={item.id === activeTrackId}
                            isPlaying={isPlaying}
                            onPress={() => playQueueFrom(item.id)}
                        />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    ListEmptyComponent={
                        <View style={s.emptyWrap}>
                            <MaterialIcons name="music-off" size={32} color="rgba(255,255,255,0.25)" />
                            <Text style={s.emptyText}>No songs in this playlist yet.</Text>
                        </View>
                    }
                />
            )}
        </ImageBackground>
    );
};

export default PlaylistDetailScreen;

const s = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%', backgroundColor: '#0d1117' },

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
        flex: 1,
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.5,
        marginHorizontal: 8,
    },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingBottom: 80 },

    list: { paddingHorizontal: 16, paddingBottom: 110 },

    // ── Hero ───────────────────────────────────────────────────
    hero: { marginBottom: 8 },
    bannerWrap: {
        width: '100%',
        height: 170,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 16,
    },
    bannerImg: { width: '100%', height: '100%' },
    noImageWrap: { justifyContent: 'center', alignItems: 'center' },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '60%',
    },
    playlistName: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.3,
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    metaText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontFamily: 'Oswald-Regular',
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
    },
    playAllBtn: {
        borderRadius: 12,
        shadowColor: '#66cc33',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    playAllContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    playAllText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.3,
    },
    likeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    likeBtnText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.3,
    },
    likeBtnTextActive: { color: '#ff4d6d' },

    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    sectionAccent: { width: 3, height: 18, borderRadius: 2 },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.3,
    },

    // ── Song row ───────────────────────────────────────────────
    songCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        padding: 10,
        gap: 12,
    },
    songCardActive: {
        backgroundColor: 'rgba(102,204,51,0.1)',
        borderColor: 'rgba(102,204,51,0.4)',
    },
    songIndexWrap: { width: 18, alignItems: 'center' },
    songIndex: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 12 },
    songImage: { width: 56, height: 56, borderRadius: 10 },
    songInfo: { flex: 1, gap: 3 },
    songTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 14, letterSpacing: 0.2 },
    songTitleActive: { color: '#66cc33' },
    songDesc: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 11 },
    songMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    songMetaText: { color: 'rgba(255,255,255,0.45)', fontFamily: 'Oswald-Regular', fontSize: 11 },

    // ── Empty ──────────────────────────────────────────────────
    emptyWrap: { alignItems: 'center', gap: 10, paddingTop: 24, paddingBottom: 40 },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Oswald-Regular',
        fontSize: 13,
        textAlign: 'center',
    },
});
