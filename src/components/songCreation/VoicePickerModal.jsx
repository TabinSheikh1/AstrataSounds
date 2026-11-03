import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Modal, View, Text, TouchableOpacity, FlatList, Image,
    ActivityIndicator, StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { getSingerVoices } from '../../api/songsService';
import { styles as shared } from './songCreationStyles';

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'female', label: 'Female' },
    { key: 'male', label: 'Male' },
];

// Lets the user optionally pick a singer for the song. Each voice has a short demo clip they
// can play before choosing. "Default AI voice" (selected = null) keeps today's behaviour.
const VoicePickerModal = ({ visible, selectedVoiceId, onSelect, onClose }) => {
    const [voices, setVoices] = useState(null); // null = not loaded yet
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [filter, setFilter] = useState('all');
    const [playingId, setPlayingId] = useState(null);
    const [loadingPreviewId, setLoadingPreviewId] = useState(null);
    const playerRef = useRef(null);
    // Ignores the result of a preview that was superseded or stopped before it started playing.
    const previewToken = useRef(0);

    const getPlayer = () => {
        if (!playerRef.current) playerRef.current = new AudioRecorderPlayer();
        return playerRef.current;
    };

    const stopPreview = useCallback(async () => {
        previewToken.current += 1;
        const player = playerRef.current;
        setPlayingId(null);
        setLoadingPreviewId(null);
        if (!player) return;
        try { player.removePlayBackListener(); } catch (_) {}
        try { await player.stopPlayer(); } catch (_) {}
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            setVoices(await getSingerVoices());
        } catch (_) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // `error` keeps a failed load from retrying in a loop; the Try again button calls load().
        if (visible && voices === null && !loading && !error) load();
        if (!visible) stopPreview();
    }, [visible, voices, loading, error, load, stopPreview]);

    useEffect(() => () => { stopPreview(); }, [stopPreview]);

    const togglePreview = async (voice) => {
        if (playingId === voice.id) return stopPreview();
        await stopPreview();
        const token = previewToken.current;
        const player = getPlayer();
        setLoadingPreviewId(voice.id);
        try {
            player.addPlayBackListener((e) => {
                if (token !== previewToken.current) return;
                if (e.isFinished || (e.duration > 0 && e.currentPosition >= e.duration)) {
                    player.removePlayBackListener();
                    setPlayingId(null);
                }
            });
            await player.startPlayer(voice.demoUrl);
            if (token !== previewToken.current) {
                // Stopped or replaced while the clip was loading.
                try { player.removePlayBackListener(); await player.stopPlayer(); } catch (_) {}
                return;
            }
            setPlayingId(voice.id);
        } catch (_) {
            try { player.removePlayBackListener(); } catch (__) {}
            if (token === previewToken.current) setPlayingId(null);
        } finally {
            if (token === previewToken.current) setLoadingPreviewId(null);
        }
    };

    const choose = async (voice) => {
        await stopPreview();
        onSelect(voice);
    };

    const close = async () => {
        await stopPreview();
        onClose();
    };

    const shown = (voices ?? []).filter((v) => filter === 'all' || v.gender === filter);

    const renderVoice = ({ item }) => {
        const isSelected = item.id === selectedVoiceId;
        const isPlaying = playingId === item.id;
        const isLoadingPreview = loadingPreviewId === item.id;
        return (
            <TouchableOpacity
                style={[local.row, isSelected && local.rowActive]}
                onPress={() => choose(item)}
                activeOpacity={0.8}
                testID={`voice-option-${item.id}`}
            >
                {item.imageUrl
                    ? <Image source={{ uri: item.imageUrl }} style={local.avatar} />
                    : <View style={[local.avatar, local.avatarFallback]}><MaterialIcons name="person" size={22} color="rgba(255,255,255,0.5)" /></View>}
                <View style={local.rowText}>
                    <Text style={local.name} numberOfLines={1}>{item.name}</Text>
                    {!!item.style && <Text style={local.style} numberOfLines={1}>{item.style}</Text>}
                </View>
                <TouchableOpacity
                    style={local.playBtn}
                    onPress={() => togglePreview(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    testID={`voice-preview-${item.id}`}
                >
                    {isLoadingPreview
                        ? <ActivityIndicator size="small" color="#66cc33" />
                        : <MaterialIcons name={isPlaying ? 'stop' : 'play-arrow'} size={22} color="#66cc33" />}
                </TouchableOpacity>
                {isSelected && <MaterialIcons name="check-circle" size={20} color="#66cc33" />}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
            <View style={shared.moodOverlay}>
                <View style={[shared.moodSheet, local.sheet]}>
                    <View style={shared.moodHeader}>
                        <MaterialIcons name="record-voice-over" size={20} color="#66cc33" />
                        <Text style={shared.moodHeaderTitle}>Choose a Singer</Text>
                        <TouchableOpacity onPress={close} style={shared.moodCloseBtn}>
                            <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>
                    <Text style={shared.moodHeaderSub}>Tap play to hear a singer. Optional — your song is sung in that voice.</Text>

                    <TouchableOpacity
                        style={[local.row, selectedVoiceId == null && local.rowActive]}
                        onPress={() => choose(null)}
                        activeOpacity={0.8}
                        testID="voice-option-default"
                    >
                        <View style={[local.avatar, local.avatarFallback]}>
                            <MaterialIcons name="auto-awesome" size={20} color="#66cc33" />
                        </View>
                        <View style={local.rowText}>
                            <Text style={local.name}>Default AI voice</Text>
                            <Text style={local.style}>Let the AI choose the singer</Text>
                        </View>
                        {selectedVoiceId == null && <MaterialIcons name="check-circle" size={20} color="#66cc33" />}
                    </TouchableOpacity>

                    <View style={local.filters}>
                        {FILTERS.map((f) => (
                            <TouchableOpacity
                                key={f.key}
                                style={[local.chip, filter === f.key && local.chipActive]}
                                onPress={() => setFilter(f.key)}
                            >
                                <Text style={[local.chipText, filter === f.key && local.chipTextActive]}>{f.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loading && <ActivityIndicator style={local.state} color="#66cc33" />}
                    {error && !loading && (
                        <View style={local.state}>
                            <Text style={local.stateText}>Couldn't load singers.</Text>
                            <TouchableOpacity onPress={load} style={local.retry}>
                                <Text style={local.retryText}>Try again</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {!loading && !error && voices !== null && (
                        <FlatList
                            data={shown}
                            keyExtractor={(v) => String(v.id)}
                            renderItem={renderVoice}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={<Text style={[local.stateText, local.state]}>No singers found.</Text>}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const local = StyleSheet.create({
    sheet: { maxHeight: '85%' },
    row: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 10, borderRadius: 14, marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'transparent',
    },
    rowActive: { borderColor: '#66cc33', backgroundColor: 'rgba(102,204,51,0.08)' },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    avatarFallback: { backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    rowText: { flex: 1 },
    name: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 15 },
    style: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 12 },
    playBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(102,204,51,0.12)', justifyContent: 'center', alignItems: 'center',
    },
    filters: { flexDirection: 'row', gap: 8, marginVertical: 10 },
    chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)' },
    chipActive: { backgroundColor: '#66cc33' },
    chipText: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Oswald-Regular', fontSize: 13 },
    chipTextActive: { color: '#0d1117' },
    state: { marginVertical: 24, alignItems: 'center' },
    stateText: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 14, textAlign: 'center' },
    retry: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)' },
    retryText: { color: '#66cc33', fontFamily: 'Oswald-Bold', fontSize: 13 },
});

export default VoicePickerModal;
