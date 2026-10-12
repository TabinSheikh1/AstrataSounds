import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
    ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LANGUAGES } from './constants';
import GenrePickerModal from './GenrePickerModal';
import MoodPickerModal from './MoodPickerModal';
import { tweakSongAudio } from '../../api/songsService';
import { waitForSongGeneration } from '../../utils/waitForSongGeneration';
import { getErrorMessage } from '../../utils/errorHandler';
import { getTweakState } from '../../utils/tweakState';

const MIN_BPM = 40;
const MAX_BPM = 220;
const DEFAULT_BPM = 100;

// Free, capped regeneration of a song's audio only (never the cover image) while it's
// still in draft — see songs.service.ts tweakSong() for the server-side cap/lock.
// The sheet opens pre-filled with the settings saved with the song (genre, style, mood,
// language, tempo), so a tweak changes only what the user edits and everything else carries
// over to the new version. Songs from before settings were saved open blank and need a genre.
const TweakSongModal = ({ visible, onClose, song, onTweaked }) => {
    const [category, setCategory] = useState(null);
    const [styleText, setStyleText] = useState('');
    const [selectedMood, setSelectedMood] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('english');
    const [tempoOn, setTempoOn] = useState(false);
    const [bpm, setBpm] = useState(DEFAULT_BPM);
    const [showGenrePicker, setShowGenrePicker] = useState(false);
    const [showMoodPicker, setShowMoodPicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Lyrics: prefilled with the song's current lyrics so the user can edit them directly.
    // Toggling "Improve with AI" hands the lyrics over to the AI instead (using the mood
    // below + these instructions) rather than saving the edited text as-is.
    const [lyricsText, setLyricsText] = useState('');
    const [aiRewriteLyrics, setAiRewriteLyrics] = useState(false);
    const [lyricsPrompt, setLyricsPrompt] = useState('');

    const tweak = getTweakState(song);
    const saved = song?.generationSettings ?? null;

    // Pre-fill from the song's saved settings every time the sheet opens, and the lyrics
    // straight from the song so they're ready to edit.
    useEffect(() => {
        if (visible) {
            setCategory(saved?.category ?? null);
            setStyleText(saved?.prompt ?? '');
            setSelectedMood(saved?.mood ?? null);
            setSelectedLanguage(saved?.language ?? 'english');
            setTempoOn(!!saved?.tempoBpm);
            setBpm(saved?.tempoBpm ?? DEFAULT_BPM);
            setLyricsText(song?.lyrics ?? '');
            setAiRewriteLyrics(false);
            setLyricsPrompt('');
        }
        // Only when the sheet opens — a background refresh of `song` must not wipe edits.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const handleSubmit = async () => {
        if (tweak.left <= 0) {
            Alert.alert('No free tweaks left', 'Finalize this song to keep this version, or create a new song.');
            return;
        }
        if (!category) {
            Alert.alert('Genre required', 'Pick a genre for this tweak.');
            return;
        }
        if (aiRewriteLyrics && !selectedMood) {
            Alert.alert('Mood required', 'Pick a mood below so the AI knows how to rewrite the lyrics.');
            return;
        }
        if (!aiRewriteLyrics && !lyricsText.trim()) {
            Alert.alert('Lyrics required', 'Lyrics cannot be empty — write something or use "Improve with AI".');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                category,
                language: selectedLanguage,
                // null (not omitted) tells the server to clear a saved mood / tempo
                mood: selectedMood ?? null,
                tempoBpm: tempoOn ? bpm : null,
                // A blank style is left out so the song keeps its saved style instead of
                // being overwritten with a generic placeholder.
                ...(styleText.trim() ? { prompt: styleText.trim() } : {}),
                ...(aiRewriteLyrics
                    ? { lyricsMode: 'ai', ...(lyricsPrompt.trim() ? { lyricsPrompt: lyricsPrompt.trim() } : {}) }
                    : { lyricsMode: 'manual', lyrics: lyricsText.trim() }),
            };
            // The server accepts the job and keeps working even if the phone locks; we watch
            // the SAME song until its new version is ready (a tweak never creates a new song).
            await tweakSongAudio(song.id, payload);
            const updated = await waitForSongGeneration(song.id);
            onTweaked?.(updated);
            onClose();
        } catch (e) {
            Alert.alert('Tweak Failed', getErrorMessage(e, 'Could not regenerate the song. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    // Can't dismiss while the tweak is running.
    const guardedClose = () => { if (!submitting) onClose(); };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={guardedClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.backdrop}
            >
                <View style={styles.sheet}>
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Tweak Song</Text>
                            <Text style={styles.subtitle}>
                                {tweak.left} of {tweak.limit} free tweaks left — cover art stays as-is; edit the lyrics below or let AI rewrite them
                                {saved ? '. Starting from your song\'s current settings: change only what you want.' : ''}
                            </Text>
                        </View>
                        <TouchableOpacity style={[styles.closeBtn, submitting && { opacity: 0.3 }]} onPress={guardedClose} disabled={submitting}>
                            <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <TouchableOpacity style={styles.selectBtn} onPress={() => setShowGenrePicker(true)} activeOpacity={0.8}>
                            <MaterialIcons name="queue-music" size={18} color="#66cc33" />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.selectLabel}>Genre</Text>
                                <Text style={styles.selectValue}>{category ?? 'Choose a genre'}</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-down" size={20} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>

                        <Text style={styles.fieldLabel}>Style / Description</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe the sound, mood, tempo..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            multiline
                            maxLength={500}
                            value={styleText}
                            onChangeText={setStyleText}
                        />

                        <View style={styles.lyricsHeaderRow}>
                            <Text style={styles.fieldLabel}>Lyrics</Text>
                            <TouchableOpacity onPress={() => setAiRewriteLyrics((v) => !v)} style={styles.aiToggleBtn} activeOpacity={0.8}>
                                <MaterialIcons name="auto-awesome" size={13} color={aiRewriteLyrics ? '#66cc33' : 'rgba(255,255,255,0.4)'} />
                                <Text style={[styles.aiToggleBtnText, aiRewriteLyrics && styles.aiToggleBtnTextActive]}>
                                    {aiRewriteLyrics ? 'Improving with AI' : 'Improve with AI'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.textArea, { minHeight: 110 }, aiRewriteLyrics && styles.textAreaDisabled]}
                            placeholder="Song lyrics..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            multiline
                            maxLength={3500}
                            value={lyricsText}
                            onChangeText={setLyricsText}
                            editable={!aiRewriteLyrics}
                        />
                        {aiRewriteLyrics && (
                            <>
                                <Text style={styles.aiRewriteHint}>
                                    AI will rewrite the lyrics above using the mood you pick below.
                                </Text>
                                <TextInput
                                    style={[styles.textArea, { minHeight: 70, marginTop: 8 }]}
                                    placeholder="Describe how you'd like the lyrics improved (optional)..."
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    multiline
                                    maxLength={500}
                                    value={lyricsPrompt}
                                    onChangeText={setLyricsPrompt}
                                />
                            </>
                        )}

                        <Text style={styles.fieldLabel}>
                            Mood ({aiRewriteLyrics ? 'shapes the rewritten lyrics + ' : ''}affects tempo & energy)
                        </Text>
                        {selectedMood ? (
                            <View style={styles.moodSelected}>
                                <MaterialIcons name="mood" size={16} color="#66cc33" />
                                <Text style={styles.moodSelectedText}>{selectedMood}</Text>
                                <TouchableOpacity onPress={() => setSelectedMood(null)}>
                                    <MaterialIcons name="close" size={14} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.moodBtn} onPress={() => setShowMoodPicker(true)}>
                                <LinearGradient
                                    colors={['rgba(102,204,51,0.25)', 'rgba(4,126,201,0.25)']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.moodBtnGradient}
                                >
                                    <View style={styles.moodBtnContent}>
                                        <Text style={styles.moodBtnText}>Choose a Mood</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.fieldLabel}>Language</Text>
                        <View style={styles.langRow}>
                            {LANGUAGES.map((lang) => {
                                const isSelected = selectedLanguage === lang.value;
                                return (
                                    <TouchableOpacity
                                        key={lang.value}
                                        onPress={() => setSelectedLanguage(lang.value)}
                                        style={[styles.langBtn, isSelected && styles.langBtnActive]}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.langFlag}>{lang.flag}</Text>
                                        <Text style={[styles.langText, isSelected && styles.langTextActive]}>{lang.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.tempoRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>Tempo</Text>
                                <Text style={styles.tempoNote}>
                                    {tempoOn ? 'Keep the song at about this tempo.' : 'No fixed tempo — the music model decides.'}
                                </Text>
                            </View>
                            <Switch
                                testID="tweak-tempo-switch"
                                value={tempoOn}
                                onValueChange={setTempoOn}
                                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#66cc33' }}
                                thumbColor="#fff"
                            />
                        </View>
                        {tempoOn && (
                            <View style={styles.bpmRow}>
                                <TouchableOpacity testID="tweak-bpm-down" style={styles.bpmBtn} onPress={() => setBpm((b) => Math.max(MIN_BPM, b - 5))}>
                                    <MaterialIcons name="remove" size={20} color="#fff" />
                                </TouchableOpacity>
                                <Text testID="tweak-bpm" style={styles.bpmValue}>{bpm}<Text style={styles.bpmUnit}> BPM</Text></Text>
                                <TouchableOpacity testID="tweak-bpm-up" style={styles.bpmBtn} onPress={() => setBpm((b) => Math.min(MAX_BPM, b + 5))}>
                                    <MaterialIcons name="add" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            testID="tweak-submit"
                            style={[styles.submitBtn, tweak.left <= 0 && { opacity: 0.4 }]}
                            onPress={handleSubmit}
                            activeOpacity={0.85}
                            disabled={submitting}
                        >
                            <LinearGradient
                                colors={['#66cc33', '#047ec9']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.submitBtnGradient}
                            >
                                <View style={styles.submitBtnContent}>
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <MaterialIcons name="auto-awesome" size={16} color="#fff" />
                                            <Text style={styles.submitBtnText}>Regenerate Song</Text>
                                        </>
                                    )}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            <GenrePickerModal
                visible={showGenrePicker}
                selectedCategory={category}
                onSelect={setCategory}
                onClose={() => setShowGenrePicker(false)}
            />
            <MoodPickerModal
                visible={showMoodPicker}
                onSelect={(m) => { setSelectedMood(m); setShowMoodPicker(false); }}
                onClose={() => setShowMoodPicker(false)}
            />
        </Modal>
    );
};

export default TweakSongModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#111827',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 12,
        maxHeight: '88%',
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    handle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 10,
    },
    title: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 20,
        letterSpacing: 0.3,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'Oswald-Regular',
        fontSize: 11,
        marginTop: 4,
    },
    closeBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center', alignItems: 'center',
    },
    fieldLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Oswald-Regular',
        fontSize: 11,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginTop: 16,
        marginBottom: 8,
    },
    selectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    selectLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Oswald-Regular',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    selectValue: {
        color: '#fff',
        fontFamily: 'Oswald-Regular',
        fontSize: 14,
        marginTop: 2,
    },
    textArea: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 12,
        color: '#fff',
        fontFamily: 'Oswald-Regular',
        fontSize: 13,
        minHeight: 70,
        textAlignVertical: 'top',
    },
    textAreaDisabled: {
        opacity: 0.4,
    },
    lyricsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 8,
    },
    aiToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    aiToggleBtnText: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Oswald-Regular',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    aiToggleBtnTextActive: {
        color: '#66cc33',
    },
    tempoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 10 },
    tempoNote: { color: 'rgba(255,255,255,0.5)', fontSize: 11.5, lineHeight: 16 },
    bpmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 12 },
    bpmBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    bpmValue: { color: '#fff', fontSize: 30, fontWeight: '700', minWidth: 120, textAlign: 'center' },
    bpmUnit: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '500' },
    aiRewriteHint: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Oswald-Regular',
        fontSize: 10,
        marginTop: 6,
    },
    moodSelected: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(102,204,51,0.1)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(102,204,51,0.25)',
        padding: 14,
    },
    moodSelectedText: {
        flex: 1,
        color: '#fff',
        fontFamily: 'Oswald-Regular',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    moodBtn: {},
    moodBtnGradient: {
        borderRadius: 12,
    },
    moodBtnContent: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    moodBtnText: {
        color: '#fff',
        fontFamily: 'Oswald-Regular',
        fontSize: 12,
    },
    langRow: {
        flexDirection: 'row',
        gap: 8,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    langBtnActive: {
        backgroundColor: 'rgba(102,204,51,0.12)',
        borderColor: 'rgba(102,204,51,0.4)',
    },
    langFlag: { fontSize: 13 },
    langText: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Oswald-Regular',
        fontSize: 12,
    },
    langTextActive: { color: '#66cc33' },
    submitBtn: {
        marginTop: 24,
    },
    submitBtnGradient: {
        borderRadius: 16,
    },
    submitBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    submitBtnText: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 14,
        letterSpacing: 0.5,
    },
});
