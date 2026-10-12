import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Switch,
    ScrollView, ActivityIndicator, Alert, Platform, PermissionsAndroid,
    KeyboardAvoidingView, AppState, Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNBlobUtil from 'react-native-blob-util';
import TrackPlayer from 'react-native-track-player';
import { transcribeVoice } from '../../api/songsService';
import { getErrorMessage } from '../../utils/errorHandler';
import { LANGUAGES } from './constants';
import { toFsPath, toFileUri } from '../../utils/filePath';

export const MAX_SECONDS = 90;
export const MIN_SECONDS = 2;
const MIN_BPM = 40;
const MAX_BPM = 220;
const MIN_FILE_BYTES = 2000; // a real 2s AAC clip is far larger; ~0 bytes means the mic gave us nothing

const fmt = (ms) => {
    const total = Math.floor(ms / 1000);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

// The recorder library answers some calls with a status STRING instead of throwing
// ('Already recording', 'Already stopped'). Only treat a real file location as a path.
const looksLikePath = (p) => typeof p === 'string' && /^(file:\/\/|\/)/.test(p);

const isCanceled = (e) => e?.code === 'ERR_CANCELED' || e?.name === 'CanceledError' || e?.name === 'AbortError';

const openSettingsAlert = (title, message) =>
    Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings().catch(() => {}) },
    ]);

// idle -> recording -> recorded -> transcribing -> review
//
// Why it's built this defensively:
//  - A FRESH recorder instance per recording: the library keeps a JS-side "is recording" flag
//    that can get stuck true if the native recorder dies (call, interruption), after which
//    startRecorder silently does nothing.
//  - Elapsed time comes from the wall clock, not native callbacks, so a device that never
//    fires them can't make a good recording look "too short" or run past the limit.
//  - Every async step checks a session token, so a slow result arriving after the sheet was
//    closed (or reopened) can never touch the new session's state.
//  - Failures always return to a state the user can act on, keeping the recording for retry.
// The recording only yields lyrics + a tempo hint: the music model can't reuse the user's
// voice or melody, so the sheet says so up front.
const VoiceRecorderModal = ({ visible, onClose, onUse, language }) => {
    const [phase, setPhase] = useState('idle');
    const [elapsedMs, setElapsedMs] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [lyrics, setLyrics] = useState('');
    const [bpm, setBpm] = useState(100);
    const [useTempo, setUseTempo] = useState(true);
    const [spokenLanguage, setSpokenLanguage] = useState(language || 'english');
    const [notice, setNotice] = useState('');

    const sessionRef = useRef(0);
    const recorderRef = useRef(null);
    const pathRef = useRef(null);
    const startedAtRef = useRef(0);
    const timerRef = useRef(null);
    const startingRef = useRef(false);
    const stoppingRef = useRef(false);
    const abortRef = useRef(null);
    const phaseRef = useRef('idle');
    phaseRef.current = phase;

    const isCurrent = (session) => session === sessionRef.current;

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const deleteRecording = useCallback(() => {
        if (pathRef.current) {
            RNBlobUtil.fs.unlink(toFsPath(pathRef.current)).catch(() => {});
            pathRef.current = null;
        }
    }, []);

    // Releases the mic/speaker and anything in flight. Safe to call at any time, any number of times.
    const stopEverything = useCallback(async () => {
        clearTimer();
        const rec = recorderRef.current;
        if (rec) {
            try { rec.removeRecordBackListener(); } catch (_) {}
            try { rec.removePlayBackListener(); } catch (_) {}
            try { await rec.stopPlayer(); } catch (_) {}
            try { await rec.stopRecorder(); } catch (_) {}
        }
    }, []);

    const resetState = useCallback((lang) => {
        setPhase('idle'); setElapsedMs(0); setPlaying(false); setNotice('');
        setLyrics(''); setBpm(100); setUseTempo(true);
        setSpokenLanguage(lang || 'english');
    }, []);

    // Open = new session with clean state. Close = invalidate the session, abort any upload,
    // release the mic and delete the recording.
    useEffect(() => {
        sessionRef.current += 1;
        if (visible) {
            resetState(language);
        } else {
            if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
            stopEverything();
            deleteRecording();
            startingRef.current = false;
            stoppingRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    useEffect(() => () => {
        sessionRef.current += 1;
        if (abortRef.current) abortRef.current.abort();
        stopEverything();
        deleteRecording();
    }, [stopEverything, deleteRecording]);

    const ensureMicPermission = async () => {
        if (Platform.OS !== 'android') return true; // iOS asks on first use and rejects if denied
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
            title: 'Microphone access',
            message: 'StrataSound Music needs the microphone to record your voice for lyrics.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
        });
        if (res === PermissionsAndroid.RESULTS.GRANTED) return true;
        if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            openSettingsAlert('Microphone blocked', 'Turn on the microphone for StrataSound Music in Settings to record your voice.');
        }
        return false;
    };

    // A song playing in the app would be picked up by the mic (and fights for the audio session)
    const pauseMusic = async () => {
        try { await TrackPlayer.pause(); } catch (_) { /* player not set up — nothing to pause */ }
    };

    const finishRecording = useCallback(async (reason) => {
        if (stoppingRef.current || phaseRef.current !== 'recording') return;
        stoppingRef.current = true;
        const session = sessionRef.current;
        clearTimer();
        const elapsed = Math.min(Date.now() - startedAtRef.current, MAX_SECONDS * 1000);
        try {
            let stoppedPath = null;
            try { stoppedPath = await recorderRef.current?.stopRecorder(); } catch (_) {}
            if (!isCurrent(session)) return;
            if (looksLikePath(stoppedPath)) pathRef.current = stoppedPath;

            if (!looksLikePath(pathRef.current) || elapsed < MIN_SECONDS * 1000) {
                deleteRecording();
                setPhase('idle');
                setElapsedMs(0);
                Alert.alert('Too short', 'Record at least a few seconds so we can hear the words.');
                return;
            }
            setElapsedMs(elapsed);
            if (reason === 'background') {
                setNotice('Recording stopped when the app went to the background. We kept what you recorded so far.');
            } else if (reason === 'limit') {
                setNotice(`Recordings are limited to ${MAX_SECONDS} seconds.`);
            } else {
                setNotice('');
            }
            setPhase('recorded');
        } finally {
            stoppingRef.current = false;
        }
    }, [deleteRecording]);

    const startRecording = async () => {
        if (startingRef.current || phaseRef.current !== 'idle') return;
        startingRef.current = true;
        const session = sessionRef.current;
        try {
            if (!(await ensureMicPermission())) return;
            await pauseMusic();
            deleteRecording();
            setNotice('');

            recorderRef.current = new AudioRecorderPlayer();
            const path = await recorderRef.current.startRecorder();
            if (!isCurrent(session)) {
                // Sheet was closed while the permission prompt / mic start was pending
                try { await recorderRef.current.stopRecorder(); } catch (_) {}
                return;
            }
            if (!looksLikePath(path)) throw new Error(`Recorder did not start: ${String(path)}`);

            pathRef.current = path;
            startedAtRef.current = Date.now();
            setElapsedMs(0);
            setPhase('recording');
            phaseRef.current = 'recording';

            clearTimer();
            timerRef.current = setInterval(() => {
                const ms = Date.now() - startedAtRef.current;
                setElapsedMs(Math.min(ms, MAX_SECONDS * 1000));
                if (ms >= MAX_SECONDS * 1000) finishRecording('limit');
            }, 200);
        } catch (e) {
            if (!isCurrent(session)) return;
            try { await recorderRef.current?.stopRecorder(); } catch (_) {}
            setPhase('idle');
            if (Platform.OS === 'ios') {
                openSettingsAlert('Could not start recording', 'Make sure StrataSound Music is allowed to use the microphone in Settings, and that no call or other app is using it.');
            } else {
                Alert.alert('Could not start recording', 'The microphone could not be started. Close other apps that use it and try again.');
            }
        } finally {
            startingRef.current = false;
        }
    };

    // The mic is unavailable to a backgrounded app (Android 11+) / stopped by iOS: end the
    // recording cleanly and keep what we have, instead of silently saving a dead file.
    // Only 'background' counts: iOS reports 'inactive' for the permission prompt itself.
    useEffect(() => {
        if (phase !== 'recording') return undefined;
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'background') finishRecording('background');
        });
        return () => sub.remove();
    }, [phase, finishRecording]);

    const togglePlayback = async () => {
        const rec = recorderRef.current;
        if (!rec || !pathRef.current) return;
        if (playing) {
            try { rec.removePlayBackListener(); await rec.stopPlayer(); } catch (_) {}
            setPlaying(false);
            return;
        }
        const session = sessionRef.current;
        try {
            rec.addPlayBackListener((e) => {
                if (e.isFinished || (e.duration > 0 && e.currentPosition >= e.duration)) {
                    rec.removePlayBackListener();
                    if (isCurrent(session)) setPlaying(false);
                }
            });
            await rec.startPlayer(toFileUri(pathRef.current));
            if (isCurrent(session)) setPlaying(true);
        } catch (_) {
            try { rec.removePlayBackListener(); } catch (__) {}
            if (isCurrent(session)) setPlaying(false);
            Alert.alert('Could not play the recording', 'You can still continue, or record again.');
        }
    };

    const reRecord = async () => {
        await stopEverything();
        deleteRecording();
        setPlaying(false); setElapsedMs(0); setNotice(''); setPhase('idle');
    };

    const extractLyrics = async () => {
        if (phaseRef.current !== 'recorded' || !looksLikePath(pathRef.current)) return;
        const session = sessionRef.current;

        // A dead/empty file (mic taken by another app or a call) would only waste an upload
        try {
            const stat = await RNBlobUtil.fs.stat(toFsPath(pathRef.current));
            if (Number(stat.size) < MIN_FILE_BYTES) {
                Alert.alert('Nothing was recorded', 'The microphone did not capture any sound. Check that nothing else is using it and record again.');
                return;
            }
        } catch (_) {
            deleteRecording();
            setPhase('idle'); setElapsedMs(0);
            Alert.alert('Recording missing', 'We could not find the recording. Please record again.');
            return;
        }

        await stopEverything();
        setPlaying(false);
        setPhase('transcribing');
        phaseRef.current = 'transcribing';
        const controller = new AbortController();
        abortRef.current = controller;
        try {
            const result = await transcribeVoice(toFileUri(pathRef.current), spokenLanguage, controller.signal);
            if (!isCurrent(session)) return;
            const text = (result?.text || '').trim();
            if (!text) throw new Error('empty');
            setLyrics(text);
            if (result.suggestedBpm) setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, result.suggestedBpm)));
            deleteRecording(); // text is all we need from here on
            setPhase('review');
        } catch (e) {
            if (!isCurrent(session)) return;
            setPhase('recorded'); // the recording is kept, so retrying is one tap
            if (isCanceled(e)) return;
            Alert.alert('Could not read the recording', getErrorMessage(e, 'Please try again.'));
        } finally {
            if (abortRef.current === controller) abortRef.current = null;
        }
    };

    const cancelTranscribing = () => {
        if (abortRef.current) abortRef.current.abort();
    };

    const useLyrics = () => {
        if (!lyrics.trim()) {
            Alert.alert('No lyrics', 'Add or record some lyrics first.');
            return;
        }
        onUse({ lyrics: lyrics.trim(), tempoBpm: useTempo ? bpm : null, language: spokenLanguage });
        onClose();
    };

    // Mid-upload the user uses Cancel instead; any other time closing just discards the recording
    const guardedClose = () => { if (phaseRef.current !== 'transcribing') onClose(); };

    const adjustBpm = (delta) => setBpm((b) => Math.min(MAX_BPM, Math.max(MIN_BPM, b + delta)));

    const showLanguagePicker = phase === 'idle' || phase === 'recorded';

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={guardedClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Record Your Voice</Text>
                            <Text style={styles.subtitle}>
                                Say or sing your lyrics. We'll turn them into text and pick a tempo, then AI creates the
                                song. The finished track uses an AI voice and its own melody, not yours.
                            </Text>
                        </View>
                        <TouchableOpacity testID="voice-close" style={[styles.closeBtn, phase === 'transcribing' && { opacity: 0.3 }]}
                            onPress={guardedClose} disabled={phase === 'transcribing'}>
                            <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>

                    {showLanguagePicker && (
                        <View style={styles.langRow}>
                            {LANGUAGES.map((l) => {
                                const on = spokenLanguage === l.value;
                                return (
                                    <TouchableOpacity key={l.value} testID={`voice-lang-${l.value}`}
                                        style={[styles.langChip, on && styles.langChipOn]}
                                        onPress={() => setSpokenLanguage(l.value)} activeOpacity={0.8}>
                                        <Text style={[styles.langText, on && styles.langTextOn]}>{l.flag} {l.native}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {(phase === 'idle' || phase === 'recording' || phase === 'recorded') && (
                        <View style={styles.recorderBox}>
                            <Text testID="voice-timer" style={styles.timer}>{fmt(elapsedMs)}<Text style={styles.timerMax}>  / {fmt(MAX_SECONDS * 1000)}</Text></Text>

                            {phase === 'idle' && (
                                <TouchableOpacity testID="voice-start" activeOpacity={0.85} onPress={startRecording}>
                                    <LinearGradient colors={['#ef4444', '#b91c1c']} style={styles.bigBtnGradient}>
                                        <View style={styles.bigBtn}>
                                            <MaterialIcons name="mic" size={38} color="#fff" />
                                        </View>
                                    </LinearGradient>
                                    <Text style={styles.hint}>Tap to start recording</Text>
                                </TouchableOpacity>
                            )}

                            {phase === 'recording' && (
                                <TouchableOpacity testID="voice-stop" activeOpacity={0.85} onPress={() => finishRecording('user')}>
                                    <LinearGradient colors={['#374151', '#111827']} style={[styles.bigBtnGradient, styles.recordingRing]}>
                                        <View style={styles.bigBtn}>
                                            <MaterialIcons name="stop" size={38} color="#ef4444" />
                                        </View>
                                    </LinearGradient>
                                    <Text style={styles.hint}>Recording… tap to stop</Text>
                                </TouchableOpacity>
                            )}

                            {phase === 'recorded' && (
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    {!!notice && <Text testID="voice-notice" style={styles.notice}>{notice}</Text>}
                                    <View style={styles.row}>
                                        <TouchableOpacity testID="voice-play" style={styles.secondaryBtn} onPress={togglePlayback}>
                                            <MaterialIcons name={playing ? 'stop' : 'play-arrow'} size={18} color="#66cc33" />
                                            <Text style={styles.secondaryText}>{playing ? 'Stop' : 'Listen'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity testID="voice-rerecord" style={styles.secondaryBtn} onPress={reRecord}>
                                            <MaterialIcons name="refresh" size={18} color="#66cc33" />
                                            <Text style={styles.secondaryText}>Re-record</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity testID="voice-get-lyrics" activeOpacity={0.85} onPress={extractLyrics} style={{ width: '100%', marginTop: 14 }}>
                                        <LinearGradient colors={['#66cc33', '#047ec9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryGradient}>
                                            <View style={styles.primaryBtn}>
                                                <MaterialIcons name="lyrics" size={18} color="#fff" />
                                                <Text style={styles.primaryText}>Get Lyrics</Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {phase === 'transcribing' && (
                        <View style={styles.recorderBox}>
                            <ActivityIndicator size="large" color="#66cc33" />
                            <Text style={[styles.hint, { marginTop: 16 }]}>Listening to your recording…</Text>
                            <TouchableOpacity testID="voice-cancel" style={[styles.secondaryBtn, { marginTop: 18 }]} onPress={cancelTranscribing}>
                                <MaterialIcons name="close" size={18} color="#66cc33" />
                                <Text style={styles.secondaryText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {phase === 'review' && (
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <Text style={styles.fieldLabel}>Lyrics (edit anything we got wrong)</Text>
                            <TextInput
                                testID="voice-lyrics-input"
                                style={styles.textArea}
                                multiline
                                maxLength={3000}
                                value={lyrics}
                                onChangeText={setLyrics}
                                placeholderTextColor="rgba(255,255,255,0.4)"
                            />
                            <View style={styles.tempoRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fieldLabel}>Use suggested tempo</Text>
                                    <Text style={styles.tempoNote}>Estimated from how fast you spoke. It's a guess, so adjust it.</Text>
                                </View>
                                <Switch testID="voice-tempo-switch" value={useTempo} onValueChange={setUseTempo}
                                    trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#66cc33' }} thumbColor="#fff" />
                            </View>
                            {useTempo && (
                                <View style={styles.bpmRow}>
                                    <TouchableOpacity testID="voice-bpm-down" style={styles.bpmBtn} onPress={() => adjustBpm(-5)}>
                                        <MaterialIcons name="remove" size={20} color="#fff" />
                                    </TouchableOpacity>
                                    <Text testID="voice-bpm" style={styles.bpmValue}>{bpm}<Text style={styles.bpmUnit}> BPM</Text></Text>
                                    <TouchableOpacity testID="voice-bpm-up" style={styles.bpmBtn} onPress={() => adjustBpm(5)}>
                                        <MaterialIcons name="add" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={[styles.row, { marginTop: 18 }]}>
                                <TouchableOpacity testID="voice-record-again" style={styles.secondaryBtn} onPress={reRecord}>
                                    <MaterialIcons name="mic" size={18} color="#66cc33" />
                                    <Text style={styles.secondaryText}>Record again</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity testID="voice-use" activeOpacity={0.85} onPress={useLyrics} style={{ marginTop: 14 }}>
                                <LinearGradient colors={['#66cc33', '#047ec9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryGradient}>
                                    <View style={styles.primaryBtn}>
                                        <MaterialIcons name="check" size={18} color="#fff" />
                                        <Text style={styles.primaryText}>Use These Lyrics</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default VoiceRecorderModal;

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12, maxHeight: '90%',
        borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 16 },
    header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
    title: { color: '#fff', fontSize: 20, fontWeight: '700' },
    subtitle: { color: 'rgba(255,255,255,0.55)', fontSize: 12.5, marginTop: 4, lineHeight: 18 },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
    langRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 4 },
    langChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    langChipOn: { borderColor: '#66cc33', backgroundColor: 'rgba(102,204,51,0.15)' },
    langText: { color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: '600' },
    langTextOn: { color: '#66cc33' },
    recorderBox: { alignItems: 'center', paddingVertical: 18 },
    timer: { color: '#fff', fontSize: 40, fontWeight: '300', marginBottom: 22, fontVariant: ['tabular-nums'] },
    timerMax: { color: 'rgba(255,255,255,0.35)', fontSize: 16 },
    // Gradients carry visuals only; sizing/spacing lives on their inner Views
    bigBtnGradient: { borderRadius: 44, alignSelf: 'center' },
    bigBtn: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
    recordingRing: { borderWidth: 3, borderColor: '#ef4444' },
    hint: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginTop: 12 },
    notice: { color: '#fbbf24', fontSize: 12.5, textAlign: 'center', marginBottom: 12, lineHeight: 18 },
    row: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
    secondaryBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(102,204,51,0.35)',
    },
    secondaryText: { color: '#66cc33', fontSize: 13, fontWeight: '600' },
    primaryGradient: { borderRadius: 14 },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    fieldLabel: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 8 },
    textArea: {
        minHeight: 150, maxHeight: 240, borderRadius: 14, padding: 14, color: '#fff', fontSize: 14,
        backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', textAlignVertical: 'top',
    },
    tempoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 10 },
    tempoNote: { color: 'rgba(255,255,255,0.5)', fontSize: 11.5, lineHeight: 16 },
    bpmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 12 },
    bpmBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    bpmValue: { color: '#fff', fontSize: 30, fontWeight: '700', minWidth: 120, textAlign: 'center' },
    bpmUnit: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '500' },
});
