import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    Dimensions, PanResponder, Animated, ActivityIndicator, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createReel } from '../api/songsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_PADDING = 48;
const TRACK_WIDTH = SCREEN_WIDTH - TRACK_PADDING * 2;

const fmt = (secs) => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
};

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

const ReelCreatorModal = ({ visible, onClose, song, onReelCreated }) => {
    const songDuration = song?.duration ?? 0; // passed from player
    const [reelDuration, setReelDuration] = useState(30);
    const [creating, setCreating] = useState(false);

    // Window position as Animated value for smooth drag
    const windowAnim = useRef(new Animated.Value(0)).current;
    const windowXRef = useRef(0); // tracks committed position

    // Window width = fraction of track
    const windowWidth = songDuration > 0
        ? (reelDuration / songDuration) * TRACK_WIDTH
        : TRACK_WIDTH * 0.25;

    const maxWindowX = TRACK_WIDTH - windowWidth;

    // Derived start time from window position
    const getStartTime = useCallback((xPos) => {
        if (songDuration <= 0) return 0;
        return (xPos / TRACK_WIDTH) * songDuration;
    }, [songDuration, TRACK_WIDTH]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                // Stop any in-flight animation and read current value
                windowAnim.stopAnimation((val) => { windowXRef.current = val; });
            },
            onPanResponderMove: (_, { dx }) => {
                const next = clamp(windowXRef.current + dx, 0, maxWindowX);
                windowAnim.setValue(next);
            },
            onPanResponderRelease: (_, { dx }) => {
                const next = clamp(windowXRef.current + dx, 0, maxWindowX);
                windowXRef.current = next;
                windowAnim.setValue(next);
            },
        })
    ).current;

    // When duration changes, clamp window so it doesn't overflow
    const handleDurationChange = (d) => {
        setReelDuration(d);
        const newWindowWidth = songDuration > 0 ? (d / songDuration) * TRACK_WIDTH : TRACK_WIDTH * 0.25;
        const newMax = TRACK_WIDTH - newWindowWidth;
        const clamped = clamp(windowXRef.current, 0, newMax);
        windowXRef.current = clamped;
        windowAnim.setValue(clamped);
    };

    const handleCreate = async () => {
        if (!song?.id) return;

        const startTime = getStartTime(windowXRef.current);

        if (songDuration > 0 && startTime + reelDuration > songDuration) {
            Alert.alert(
                'Selection Out of Range',
                `The selected clip extends beyond the end of the song (${fmt(songDuration)}). Drag the window left.`
            );
            return;
        }

        setCreating(true);
        try {
            const res = await createReel(song.id, {
                startTime: Math.round(startTime * 10) / 10,
                duration: reelDuration,
            });
            onReelCreated?.(res?.data ?? res);
            onClose();
        } catch (e) {
            const msg = e?.response?.data?.message ?? 'Failed to create reel. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setCreating(false);
        }
    };

    // Reset window when modal opens
    const handleShow = () => {
        windowXRef.current = 0;
        windowAnim.setValue(0);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            onShow={handleShow}
        >
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Create a Reel</Text>
                            <Text style={styles.subtitle}>
                                Drag the window to pick your clip
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    </View>

                    {/* Duration selector */}
                    <Text style={styles.sectionLabel}>REEL DURATION</Text>
                    <View style={styles.durationRow}>
                        {[15, 30].map((d) => (
                            <TouchableOpacity
                                key={d}
                                style={[styles.durationChip, reelDuration === d && styles.durationChipActive]}
                                onPress={() => handleDurationChange(d)}
                                activeOpacity={0.8}
                            >
                                {reelDuration === d ? (
                                    <View style={styles.durationChipInnerActive}>
                                        <LinearGradient
                                            colors={['#66cc33', '#047ec9']}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={StyleSheet.absoluteFill}
                                        />
                                        <MaterialIcons name="bolt" size={14} color="#fff" />
                                        <Text style={styles.durationChipTextActive}>{d}s</Text>
                                    </View>
                                ) : (
                                    <View style={styles.durationChipInner}>
                                        <MaterialIcons name="timer" size={14} color="rgba(255,255,255,0.45)" />
                                        <Text style={styles.durationChipText}>{d}s</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Timeline scrubber */}
                    <Text style={styles.sectionLabel}>SELECT CLIP</Text>
                    <View style={styles.scrubberContainer}>
                        {/* Track bar */}
                        <View style={styles.track}>
                            {/* Background fill */}
                            <View style={styles.trackBg} />

                            {/* Draggable selection window */}
                            <Animated.View
                                style={[
                                    styles.selectionWindow,
                                    { width: windowWidth, transform: [{ translateX: windowAnim }] },
                                ]}
                                {...panResponder.panHandlers}
                            >
                                <LinearGradient
                                    colors={['rgba(102,204,51,0.55)', 'rgba(4,126,201,0.45)']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.selectionGrad}
                                />
                                {/* Left handle */}
                                <View style={[styles.handle, styles.handleLeft]}>
                                    <View style={styles.handleBar} />
                                    <View style={styles.handleBar} />
                                </View>
                                {/* Right handle */}
                                <View style={[styles.handle, styles.handleRight]}>
                                    <View style={styles.handleBar} />
                                    <View style={styles.handleBar} />
                                </View>
                            </Animated.View>
                        </View>

                        {/* Time labels */}
                        <View style={styles.timeLabels}>
                            <Text style={styles.timeLabel}>{fmt(0)}</Text>
                            {songDuration > 0 && (
                                <Text style={styles.timeLabel}>{fmt(songDuration / 2)}</Text>
                            )}
                            <Text style={styles.timeLabel}>
                                {songDuration > 0 ? fmt(songDuration) : '--:--'}
                            </Text>
                        </View>
                    </View>

                    {/* Selected range display */}
                    <Animated.View style={styles.rangeDisplay}>
                        <View style={styles.rangeItem}>
                            <MaterialIcons name="play-arrow" size={14} color="#66cc33" />
                            <Animated.Text style={styles.rangeText}>
                                {/* We re-compute on each render since windowAnim drives UI */}
                                {fmt(getStartTime(windowXRef.current))}
                            </Animated.Text>
                            <Text style={styles.rangeUnit}>start</Text>
                        </View>
                        <View style={styles.rangeDash} />
                        <View style={styles.rangeItem}>
                            <MaterialIcons name="stop" size={14} color="#047ec9" />
                            <Animated.Text style={styles.rangeText}>
                                {fmt(getStartTime(windowXRef.current) + reelDuration)}
                            </Animated.Text>
                            <Text style={styles.rangeUnit}>end</Text>
                        </View>
                        <View style={styles.rangeSep} />
                        <View style={styles.rangeItem}>
                            <MaterialIcons name="timer" size={14} color="rgba(255,255,255,0.4)" />
                            <Text style={[styles.rangeText, { color: 'rgba(255,255,255,0.5)' }]}>
                                {reelDuration}s
                            </Text>
                        </View>
                    </Animated.View>

                    {songDuration === 0 && (
                        <View style={styles.noDurationWarning}>
                            <MaterialIcons name="info-outline" size={13} color="#FBBF24" />
                            <Text style={styles.noDurationText}>
                                Open the song in the player before creating a reel so the duration can be detected.
                            </Text>
                        </View>
                    )}

                    {/* Create button */}
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={creating}
                        activeOpacity={0.85}
                        style={styles.createBtnWrap}
                    >
                        <LinearGradient
                            colors={creating ? ['#444', '#333'] : ['#66cc33', '#047ec9']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.createBtnContent}>
                            {creating ? (
                                <>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.createBtnText}>Creating Reel…</Text>
                                </>
                            ) : (
                                <>
                                    <MaterialIcons name="content-cut" size={18} color="#fff" />
                                    <Text style={styles.createBtnText}>Create Reel</Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default ReelCreatorModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#111827',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 20,
        paddingHorizontal: TRACK_PADDING,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.3,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: 'Oswald-Regular',
        marginTop: 3,
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    sectionLabel: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 10,
        fontFamily: 'Oswald-Regular',
        letterSpacing: 2,
        marginBottom: 10,
    },

    durationRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
    },
    durationChip: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    durationChipActive: {
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    durationChipInnerActive: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 18,
        paddingVertical: 10,
        overflow: 'hidden',
    },
    durationChipInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    durationChipText: {
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'Oswald-Bold',
        fontSize: 14,
    },
    durationChipTextActive: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 14,
    },

    scrubberContainer: {
        marginBottom: 16,
    },
    track: {
        height: 52,
        justifyContent: 'center',
        marginBottom: 6,
    },
    trackBg: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
    },
    selectionWindow: {
        height: 52,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#66cc33',
        justifyContent: 'center',
    },
    selectionGrad: {
        ...StyleSheet.absoluteFillObject,
    },
    handle: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
    },
    handleLeft: { left: 0 },
    handleRight: { right: 0 },
    handleBar: {
        width: 2,
        height: 14,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 1,
    },

    timeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontFamily: 'Oswald-Regular',
    },

    rangeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        gap: 8,
    },
    rangeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    rangeText: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 15,
    },
    rangeUnit: {
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'Oswald-Regular',
        fontSize: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    rangeDash: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    rangeSep: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 4,
    },

    noDurationWarning: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: 'rgba(251,191,36,0.08)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(251,191,36,0.2)',
    },
    noDurationText: {
        flex: 1,
        color: '#FBBF24',
        fontSize: 11,
        fontFamily: 'Oswald-Regular',
        lineHeight: 16,
    },

    createBtnWrap: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    createBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    createBtnText: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 15,
        letterSpacing: 1,
    },
});
