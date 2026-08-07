import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
    ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LANGUAGES } from './constants';
import GenrePickerModal from './GenrePickerModal';
import MoodPickerModal from './MoodPickerModal';
import { tweakSongAudio } from '../../api/songsService';
import { getErrorMessage } from '../../utils/errorHandler';

const FREE_TWEAK_LIMIT = 3;

// Free, capped regeneration of a song's audio only (never the cover image) while it's
// still in draft — see songs.service.ts tweakSong() for the server-side cap/lock.
const TweakSongModal = ({ visible, onClose, song, onTweaked }) => {
    const [category, setCategory] = useState(null);
    const [styleText, setStyleText] = useState('');
    const [selectedMood, setSelectedMood] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('english');
    const [showGenrePicker, setShowGenrePicker] = useState(false);
    const [showMoodPicker, setShowMoodPicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const tweaksUsed = song?.freeTweaksUsed ?? 0;
    const tweaksLeft = Math.max(0, FREE_TWEAK_LIMIT - tweaksUsed);

    // Fresh form every time it's opened — there's nothing to prefill from (the original
    // category/mood/prompt used to generate the song aren't persisted on the Song entity).
    // Lyrics are never part of this form — the backend always reuses the song's saved lyrics.
    useEffect(() => {
        if (visible) {
            setCategory(null);
            setStyleText('');
            setSelectedMood(null);
            setSelectedLanguage('english');
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (!category) {
            Alert.alert('Genre required', 'Pick a genre for this tweak.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                category,
                language: selectedLanguage,
                ...(selectedMood ? { mood: selectedMood } : {}),
                prompt: styleText.trim() || 'A beautiful well-crafted song',
            };
            const res = await tweakSongAudio(song.id, payload);
            onTweaked?.(res?.data ?? res);
            onClose();
        } catch (e) {
            Alert.alert('Tweak Failed', getErrorMessage(e, 'Could not regenerate the song. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
                                {tweaksLeft} of {FREE_TWEAK_LIMIT} free tweaks left — lyrics and cover art stay as-is, only the music changes
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
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

                        <Text style={styles.fieldLabel}>Mood (affects tempo & energy)</Text>
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

                        <TouchableOpacity
                            style={styles.submitBtn}
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
