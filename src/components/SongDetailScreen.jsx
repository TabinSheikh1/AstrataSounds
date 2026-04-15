import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    Animated,
    StatusBar,
    Platform,
    ScrollView,
    Alert,
    Linking,
    Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import TrackPlayer, { useProgress, State, usePlaybackState } from 'react-native-track-player';
import { useSubscription } from '../hooks/useSubscription';
import UpgradePromptModal from './UpgradePromptModal';
import { toggleLikeSong } from '../api/songsService';

const { width, height } = Dimensions.get('window');
const ALBUM_SIZE = width - 64;
const SPEEDS = ['0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '2.0x'];
const FILE_BASE = 'http://localhost:3000';

const fmt = (secs) => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const SongDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const song = route.params?.song ?? {};

    const hasAudio = !!song.audioPath;
    const audioUrl = hasAudio ? `${FILE_BASE}${song.audioPath}` : null;
    const artworkUrl = song.imagePath ? `${FILE_BASE}${song.imagePath}` : null;

    const playbackState = usePlaybackState();
    const isPlaying = playbackState?.state === State.Playing;
    const progress = useProgress(500);

    const { canDownload, downloadsUsed, downloadLimit, plan, isBlocked, refreshAll } = useSubscription();

    const [isLiked, setIsLiked] = useState(song.isLiked ?? false);
    const [likesCount, setLikesCount] = useState(song.likesCount ?? song.likes ?? 0);
    const [isRepeat, setIsRepeat] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [speedIdx, setSpeedIdx] = useState(2);
    const [playerReady, setPlayerReady] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

    // Animations
    const playScale  = useRef(new Animated.Value(1)).current;
    const likeScale  = useRef(new Animated.Value(1)).current;
    const albumScale = useRef(new Animated.Value(0.88)).current;
    const albumGlow  = useRef(new Animated.Value(0)).current;
    const waveAnims  = useRef([...Array(28)].map(() => new Animated.Value(0.2))).current;
    const waveLoop   = useRef(null);

    // Entrance animation
    useEffect(() => {
        Animated.spring(albumScale, { toValue: 1, tension: 48, friction: 7, useNativeDriver: true }).start();
    }, []);

    // Load track into player
    useEffect(() => {
        if (!hasAudio) return;
        let active = true;
        (async () => {
            try {
                await TrackPlayer.reset();
                await TrackPlayer.add({
                    id: song.id ?? 'current',
                    url: audioUrl,
                    title: song.title ?? 'Unknown',
                    artist: 'StrataSound AI',
                    artwork: artworkUrl ?? undefined,
                });
                if (active) setPlayerReady(true);
            } catch (e) {
                console.error('[Player] load error:', e);
            }
        })();
        return () => {
            active = false;
            TrackPlayer.pause().catch(() => {});
        };
    }, [song.id]);

    // Waveform animation
    useEffect(() => {
        if (isPlaying) {
            const loops = waveAnims.map((bar) =>
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(bar, { toValue: 0.25 + Math.random() * 0.75, duration: 250 + Math.random() * 350, useNativeDriver: true }),
                        Animated.timing(bar, { toValue: 0.1 + Math.random() * 0.25, duration: 200 + Math.random() * 250, useNativeDriver: true }),
                    ])
                )
            );
            waveLoop.current = Animated.stagger(40, loops);
            waveLoop.current.start();
        } else {
            waveLoop.current?.stop();
            waveAnims.forEach((bar) =>
                Animated.timing(bar, { toValue: 0.2, duration: 300, useNativeDriver: true }).start()
            );
        }
        return () => waveLoop.current?.stop();
    }, [isPlaying]);

    // Glow + album scale tracks play state
    useEffect(() => {
        Animated.spring(albumScale, { toValue: isPlaying ? 1.04 : 1, tension: 50, friction: 7, useNativeDriver: true }).start();
        Animated.timing(albumGlow, { toValue: isPlaying ? 1 : 0, duration: 400, useNativeDriver: true }).start();
    }, [isPlaying]);

    const handlePlayPress = async () => {
        Animated.sequence([
            Animated.timing(playScale, { toValue: 0.86, duration: 75, useNativeDriver: true }),
            Animated.spring(playScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        ]).start();
        if (!hasAudio || !playerReady) return;
        if (isPlaying) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    };

    const handleLikePress = async () => {
        Animated.sequence([
            Animated.timing(likeScale, { toValue: 1.45, duration: 130, useNativeDriver: true }),
            Animated.spring(likeScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        ]).start();
        // Optimistic update
        const wasLiked = isLiked;
        setIsLiked(!wasLiked);
        setLikesCount((c) => wasLiked ? Math.max(0, c - 1) : c + 1);
        try {
            await toggleLikeSong(song.id);
        } catch {
            // Revert on failure
            setIsLiked(wasLiked);
            setLikesCount((c) => wasLiked ? c + 1 : Math.max(0, c - 1));
        }
    };

    const handleDownload = async () => {
        if (!hasAudio) {
            Alert.alert('No Audio', 'This song has no audio generated yet.');
            return;
        }
        if (isBlocked) {
            setUpgradeModalVisible(true);
            return;
        }
        if (!canDownload) {
            const limitLabel = downloadLimit === -1 ? 'unlimited' : String(downloadLimit);
            Alert.alert(
                'Download Limit Reached',
                `Monthly download limit reached (${downloadsUsed}/${limitLabel} downloads). Upgrade your plan for more downloads.`,
                [
                    { text: 'See Plans', onPress: () => navigation.navigate('PricingScreen') },
                    { text: 'OK', style: 'cancel' },
                ],
            );
            return;
        }
        setIsDownloading(true);
        try {
            const canOpen = await Linking.canOpenURL(audioUrl);
            if (canOpen) {
                await Linking.openURL(audioUrl);
                // Refresh token/download counts after download
                await refreshAll();
            } else {
                Alert.alert('Error', 'Cannot open audio file URL.');
            }
        } catch (e) {
            const apiMsg = e?.response?.data?.message;
            if (e?.response?.status === 403 && apiMsg) {
                Alert.alert('Download Blocked', apiMsg);
            } else {
                Alert.alert('Download Failed', 'Could not download the file. Please try again.');
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: song.title ?? 'Check out this song',
                message: hasAudio
                    ? `Listen to "${song.title ?? 'this song'}" — ${audioUrl}`
                    : `Check out "${song.title ?? 'this song'}" on Astrata Music`,
            });
        } catch (_) {}
    };

    const duration = progress.duration || 0;
    const position = progress.position || 0;
    const progressPct = duration > 0 ? `${Math.min((position / duration) * 100, 100)}%` : '0%';
    const playedBars = duration > 0 ? Math.floor((position / duration) * 28) : 0;

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Background: album art blurred or gradient */}
            {artworkUrl ? (
                <Image source={{ uri: artworkUrl }} style={styles.bgBlur} blurRadius={22} />
            ) : (
                <View style={[styles.bgBlur, { backgroundColor: '#0d1117' }]} />
            )}
            <LinearGradient
                colors={['rgba(0,102,204,0.75)', 'rgba(0,140,140,0.7)', 'rgba(80,180,50,0.65)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.bgOverlay}
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="keyboard-arrow-down" size={32} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.topCenter}>
                        <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
                        <Text style={styles.albumLabel} numberOfLines={1}>{song.title ?? 'Unknown'}</Text>
                    </View>
                    <TouchableOpacity style={styles.topBtn}>
                        <MaterialIcons name="more-vert" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Album Art */}
                <View style={styles.albumWrapper}>
                    <Animated.View style={[styles.albumGlowRing, { opacity: albumGlow }]} />
                    <Animated.View style={[styles.albumShadowWrap, { transform: [{ scale: albumScale }] }]}>
                        {artworkUrl ? (
                            <Image source={{ uri: artworkUrl }} style={styles.albumArt} resizeMode="cover" />
                        ) : (
                            <LinearGradient
                                colors={['#1a1a2e', '#16213e', '#0f3460']}
                                style={styles.albumArt}
                            >
                                <MaterialIcons name="music-note" size={80} color="rgba(255,255,255,0.15)" />
                            </LinearGradient>
                        )}
                        <View style={styles.vinylRing} />
                        <View style={styles.vinylCenter} />
                    </Animated.View>
                </View>

                {/* Song Info + Like */}
                <View style={styles.songInfoRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.songTitle} numberOfLines={1}>{song.title ?? 'Unknown'}</Text>
                        <Text style={styles.songArtist}>
                            {song.description ? song.description : 'StrataSound AI'}
                        </Text>
                    </View>
                    <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                        <TouchableOpacity onPress={handleLikePress} style={styles.likeBtn}>
                            <MaterialIcons
                                name={isLiked ? 'favorite' : 'favorite-border'}
                                size={28}
                                color={isLiked ? '#ff4d6d' : 'rgba(255,255,255,0.6)'}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* No audio banner */}
                {!hasAudio && (
                    <View style={styles.noAudioBanner}>
                        <MaterialIcons name="music-off" size={16} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.noAudioText}>No audio generated yet — go to Song Creation to generate.</Text>
                    </View>
                )}

                {/* Waveform */}
                <View style={styles.waveform}>
                    {waveAnims.map((anim, i) => (
                        <Animated.View
                            key={i}
                            style={[
                                styles.waveBar,
                                i < playedBars && styles.waveBarPlayed,
                                { transform: [{ scaleY: anim }] },
                            ]}
                        />
                    ))}
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                    <View style={styles.progressTrack}>
                        <LinearGradient
                            colors={['#66cc33', '#047ec9']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: progressPct }]}
                        >
                            <View style={styles.progressThumb} />
                        </LinearGradient>
                    </View>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{fmt(position)}</Text>
                        <Text style={styles.timeText}>{fmt(duration)}</Text>
                    </View>
                </View>

                {/* Main Controls */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        style={[styles.iconBtn, isShuffle && styles.iconBtnOn]}
                        onPress={() => setIsShuffle((p) => !p)}
                    >
                        <MaterialIcons name="shuffle" size={22} color={isShuffle ? '#66cc33' : 'rgba(255,255,255,0.6)'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipBtn} onPress={() => TrackPlayer.seekTo(Math.max(0, position - 10))}>
                        <MaterialIcons name="replay-10" size={36} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>

                    <Animated.View style={{ transform: [{ scale: playScale }] }}>
                        <TouchableOpacity onPress={handlePlayPress} activeOpacity={0.9} disabled={!hasAudio}>
                            <LinearGradient
                                colors={hasAudio ? ['#66cc33', '#047ec9'] : ['#555', '#444']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.playBtn}
                            >
                                <FontAwesome
                                    name={isPlaying ? 'pause' : 'play'}
                                    size={30}
                                    color="#fff"
                                    style={{ marginLeft: isPlaying ? 0 : 4 }}
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity style={styles.skipBtn} onPress={() => TrackPlayer.seekTo(Math.min(duration, position + 10))}>
                        <MaterialIcons name="forward-10" size={36} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.iconBtn, isRepeat && styles.iconBtnOn]}
                        onPress={() => setIsRepeat((p) => !p)}
                    >
                        <MaterialIcons name="repeat" size={22} color={isRepeat ? '#66cc33' : 'rgba(255,255,255,0.6)'} />
                    </TouchableOpacity>
                </View>

                {/* Secondary Controls */}
                <View style={styles.secondaryRow}>
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
                    >
                        <Text style={styles.speedText}>{SPEEDS[speedIdx]}</Text>
                    </TouchableOpacity>

                    {/* Download button — gated by subscription */}
                    <TouchableOpacity
                        style={[
                            styles.secondaryBtn,
                            !canDownload && styles.secondaryBtnDisabled,
                        ]}
                        onPress={handleDownload}
                        disabled={isDownloading}
                    >
                        <MaterialIcons
                            name={isDownloading ? 'hourglass-empty' : 'file-download'}
                            size={20}
                            color={canDownload ? '#66cc33' : 'rgba(255,255,255,0.25)'}
                        />
                    </TouchableOpacity>

                    {/* Share button */}
                    <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
                        <MaterialIcons name="share" size={20} color="rgba(255,255,255,0.65)" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn}>
                        <MaterialIcons name="playlist-add" size={22} color="rgba(255,255,255,0.65)" />
                    </TouchableOpacity>
                </View>

                {/* Download limit note */}
                {!canDownload && hasAudio && (
                    <TouchableOpacity
                        style={styles.downloadLimitNote}
                        onPress={() => navigation.navigate('PricingScreen')}
                        activeOpacity={0.75}
                    >
                        <MaterialIcons name="info-outline" size={13} color="#FBBF24" />
                        <Text style={styles.downloadLimitText}>
                            Monthly download limit reached · Upgrade for more
                        </Text>
                        <MaterialIcons name="chevron-right" size={13} color="#FBBF24" />
                    </TouchableOpacity>
                )}

                {/* Info Card */}
                <View style={styles.infoCard}>
                    {[
                        { icon: 'event',        label: 'Created',  value: formatDate(song.createdAt) },
                        { icon: 'thumb-up',     label: 'Likes',    value: String(likesCount) },
                        { icon: 'headphones',   label: 'Listens',  value: String(song.listens ?? 0) },
                        { icon: 'surround-sound', label: 'Audio',  value: hasAudio ? 'Ready' : 'Not generated' },
                    ].map(({ icon, label, value }, i, arr) => (
                        <View key={label}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIconWrap}>
                                    <MaterialIcons name={icon} size={16} color="#66cc33" />
                                </View>
                                <View>
                                    <Text style={styles.infoLabel}>{label}</Text>
                                    <Text style={styles.infoValue}>{value}</Text>
                                </View>
                            </View>
                            {i < arr.length - 1 && <View style={styles.infoDivider} />}
                        </View>
                    ))}
                </View>
            </ScrollView>

            <UpgradePromptModal
                visible={upgradeModalVisible}
                onClose={() => setUpgradeModalVisible(false)}
                currentPlanName={plan?.name ?? 'Harmony'}
                blockedFeature="Downloading songs"
            />
        </View>
    );
};

export default SongDetailScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0066CC' },

    bgBlur: { position: 'absolute', width, height },
    bgOverlay: { position: 'absolute', width, height },

    scroll: {
        paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 12,
        paddingHorizontal: 24,
        paddingBottom: 48,
    },

    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
    topBtn: { width: 40, alignItems: 'center' },
    topCenter: { flex: 1, alignItems: 'center' },
    nowPlayingLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Oswald-Regular', letterSpacing: 2.5 },
    albumLabel: { color: '#fff', fontSize: 13, fontFamily: 'Oswald-Bold', letterSpacing: 0.5, marginTop: 2 },

    albumWrapper: { alignItems: 'center', marginBottom: 28 },
    albumGlowRing: {
        position: 'absolute',
        width: ALBUM_SIZE + 32, height: ALBUM_SIZE + 32,
        borderRadius: (ALBUM_SIZE + 32) / 2,
        shadowColor: '#66cc33', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, shadowRadius: 28, elevation: 20,
    },
    albumShadowWrap: {
        shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.55, shadowRadius: 24, elevation: 18, borderRadius: 20,
    },
    albumArt: {
        width: ALBUM_SIZE, height: ALBUM_SIZE, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
    vinylRing: {
        position: 'absolute',
        top: ALBUM_SIZE / 2 - 48, left: ALBUM_SIZE / 2 - 48,
        width: 96, height: 96, borderRadius: 48,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)',
    },
    vinylCenter: {
        position: 'absolute',
        top: ALBUM_SIZE / 2 - 10, left: ALBUM_SIZE / 2 - 10,
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },

    songInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
    songTitle: { color: '#fff', fontSize: 22, fontFamily: 'Oswald-Bold', letterSpacing: 0.3 },
    songArtist: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontFamily: 'Oswald-Regular', marginTop: 4 },
    likeBtn: { padding: 8 },

    noAudioBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
        padding: 12, marginBottom: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    noAudioText: { flex: 1, color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 12, lineHeight: 17 },

    waveform: { flexDirection: 'row', alignItems: 'center', height: 44, gap: 2.5, marginBottom: 14 },
    waveBar: { flex: 1, height: 36, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
    waveBarPlayed: { backgroundColor: '#66cc33' },

    progressSection: { marginBottom: 32 },
    progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, marginBottom: 10 },
    progressFill: { height: '100%', borderRadius: 3, justifyContent: 'center', alignItems: 'flex-end' },
    progressThumb: {
        width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff', marginRight: -7,
        shadowColor: '#66cc33', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 6,
    },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    timeText: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontFamily: 'Oswald-Regular' },

    controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 4 },
    iconBtn: {
        width: 42, height: 42, borderRadius: 21,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    iconBtnOn: { backgroundColor: 'rgba(102,204,51,0.14)', borderColor: 'rgba(102,204,51,0.4)' },
    skipBtn: { padding: 6 },
    playBtn: {
        width: 76, height: 76, borderRadius: 38,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#66cc33', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.55, shadowRadius: 16, elevation: 12,
    },

    secondaryRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 28 },
    secondaryBtn: {
        width: 46, height: 46, borderRadius: 23,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    speedText: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Oswald-Bold', fontSize: 12, letterSpacing: 0.5 },

    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20,
        padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    infoIconWrap: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: 'rgba(102,204,51,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    infoDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 14 },
    infoLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Oswald-Regular', letterSpacing: 1.2, textTransform: 'uppercase' },
    infoValue: { color: '#fff', fontSize: 14, fontFamily: 'Oswald-Regular', marginTop: 2 },

    secondaryBtnDisabled: { opacity: 0.45 },
    downloadLimitNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(251,191,36,0.08)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(251,191,36,0.2)',
    },
    downloadLimitText: {
        flex: 1,
        color: '#FBBF24',
        fontSize: 11,
        fontFamily: 'Oswald-Regular',
    },
});
