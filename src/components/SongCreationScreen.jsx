import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground,
    TextInput, Switch, Animated, Easing, KeyboardAvoidingView, Platform,
    Dimensions, Modal, ActivityIndicator, Alert, Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { HelpCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createSong, generateSongAudio, generateSongImage, uploadSongImage } from '../api/songsService';
import { getMyVibes } from '../api/vibesService';

const { width } = Dimensions.get('window');

// ── Category map: frontend label → backend enum value ───────
const CATEGORIES = [
    { label: 'Pop',      value: 'Pop'      },
    { label: 'Lo-Fi',    value: 'Lo-fi'    },
    { label: 'Hip Hop',  value: 'Hip-Hop'  },
    { label: 'Cinematic',value: 'Cinematic'},
    { label: 'Acoustic', value: 'Acoustic' },
    { label: 'Ambient',  value: 'Ambient'  },
    { label: 'EDM',      value: 'EDM'      },
];

const TABS = ['Lyrics', 'Cover', 'Generate'];

const MOODS = [
    { value: 'happy',      label: 'Happy',      emoji: '😊', color: '#FFD700' },
    { value: 'sad',        label: 'Sad',         emoji: '😢', color: '#4fc3f7' },
    { value: 'energetic',  label: 'Energetic',   emoji: '⚡', color: '#ff9800' },
    { value: 'romantic',   label: 'Romantic',    emoji: '❤️', color: '#ff4d6d' },
    { value: 'melancholic',label: 'Melancholic', emoji: '🌧️', color: '#9575cd' },
    { value: 'peaceful',   label: 'Peaceful',    emoji: '🍃', color: '#66cc33' },
    { value: 'nostalgic',  label: 'Nostalgic',   emoji: '🌅', color: '#ff7043' },
    { value: 'rebellious', label: 'Rebellious',  emoji: '🔥', color: '#e53935' },
];

// ── Helpers ──────────────────────────────────────────────────
const SectionLabel = ({ icon, title, hint }) => (
    <View style={styles.sectionLabelRow}>
        <View style={styles.sectionLabelLeft}>
            <View style={styles.sectionIconWrap}>
                <MaterialIcons name={icon} size={14} color="#66cc33" />
            </View>
            <Text style={styles.sectionLabelText}>{title}</Text>
        </View>
        {hint && (
            <TouchableOpacity style={styles.hintBtn}>
                <HelpCircle size={15} color="rgba(255,255,255,0.45)" />
            </TouchableOpacity>
        )}
    </View>
);

const GlassBox = ({ children, style }) => (
    <View style={[styles.glassBox, style]}>{children}</View>
);

// ── Mood Picker Modal ────────────────────────────────────────
const MoodPickerModal = ({ visible, onSelect, onClose }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.moodOverlay}>
            <View style={styles.moodSheet}>
                <View style={styles.moodHeader}>
                    <MaterialIcons name="mood" size={20} color="#66cc33" />
                    <Text style={styles.moodHeaderTitle}>Choose a Mood</Text>
                    <TouchableOpacity onPress={onClose} style={styles.moodCloseBtn}>
                        <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.moodHeaderSub}>The AI will write lyrics matching this feeling</Text>
                <View style={styles.moodGrid}>
                    {MOODS.map((m) => (
                        <TouchableOpacity
                            key={m.value}
                            style={styles.moodCard}
                            onPress={() => onSelect(m.value)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[`${m.color}22`, `${m.color}11`]}
                                style={styles.moodCardGrad}
                            >
                                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                                <Text style={[styles.moodLabel, { color: m.color }]}>{m.label}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    </Modal>
);

// ── Generation Progress Overlay ──────────────────────────────
const GeneratingOverlay = ({ visible, step }) => {
    const pulse = useRef(new Animated.Value(0.6)).current;
    useEffect(() => {
        if (!visible) return;
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.6, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, [visible]);

    if (!visible) return null;
    return (
        <View style={styles.genOverlay}>
            <LinearGradient colors={['rgba(10,10,26,0.96)', 'rgba(0,50,100,0.96)']} style={styles.genOverlayInner}>
                <Animated.View style={[styles.genSpinWrap, { opacity: pulse }]}>
                    <LinearGradient colors={['#66cc33', '#047ec9']} style={styles.genSpinGrad}>
                        <MaterialIcons name="auto-awesome" size={32} color="#fff" />
                    </LinearGradient>
                </Animated.View>
                <Text style={styles.genTitle}>Generating Your Song</Text>
                <Text style={styles.genStep}>{step || 'Starting up...'}</Text>
                <View style={styles.genDots}>
                    {[0, 1, 2].map((i) => (
                        <Animated.View key={i} style={[styles.genDot, { opacity: pulse }]} />
                    ))}
                </View>
            </LinearGradient>
        </View>
    );
};

// ────────────────────────────────────────────────────────────
const SongCreationScreen = () => {
    const navigation = useNavigation();

    // Tab
    const [selectedTab, setSelectedTab] = useState('Lyrics');

    // Lyrics tab state
    const [instrumental, setInstrumental] = useState(false);
    const [styleMode, setStyleMode] = useState('prompt');   // 'prompt' | 'vibe'
    const [styleText, setStyleText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Pop');
    const [lyricsText, setLyricsText] = useState('');
    const [lyricsMode, setLyricsMode] = useState('manual'); // 'manual' | 'ai'
    const [selectedMood, setSelectedMood] = useState(null);
    const [showMoodPicker, setShowMoodPicker] = useState(false);
    const [gender, setGender] = useState('Male');
    const [vibes, setVibes] = useState([]);
    const [selectedVibeId, setSelectedVibeId] = useState(null);
    const [vibesLoading, setVibesLoading] = useState(false);

    // Cover tab state
    const [coverMode, setCoverMode] = useState('ai');       // 'ai' | 'upload'
    const [imagePrompt, setImagePrompt] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);

    // Generate tab state
    const [titleText, setTitleText] = useState('');
    const [description, setDescription] = useState('');

    // Generation
    const [generating, setGenerating] = useState(false);
    const [genStep, setGenStep] = useState('');

    // Animations
    const tabIndicator = useRef(new Animated.Value(0)).current;
    const contentFade  = useRef(new Animated.Value(1)).current;
    const contentSlide = useRef(new Animated.Value(0)).current;
    const btnScale     = useRef(new Animated.Value(1)).current;
    const TAB_W = (width - 32) / TABS.length;

    // Load vibes when switching to vibe mode
    useEffect(() => {
        if (styleMode === 'vibe' && vibes.length === 0) loadVibes();
    }, [styleMode]);

    const loadVibes = async () => {
        setVibesLoading(true);
        try {
            const data = await getMyVibes();
            setVibes(Array.isArray(data) ? data : data?.data ?? []);
        } catch (e) { console.error(e); }
        finally { setVibesLoading(false); }
    };

    const animateTab = (index) => {
        contentFade.setValue(0);
        contentSlide.setValue(18);
        Animated.parallel([
            Animated.timing(contentFade,  { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(contentSlide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
        Animated.spring(tabIndicator, { toValue: index, tension: 60, friction: 8, useNativeDriver: true }).start();
    };

    const handleTabPress = (tab, index) => {
        setSelectedTab(tab);
        animateTab(index);
    };

    const handleMoodSelect = (mood) => {
        setSelectedMood(mood);
        setLyricsMode('ai');
        setLyricsText('');
        setShowMoodPicker(false);
    };

    const pickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.85, selectionLimit: 1 });
        if (!result.didCancel && result.assets?.[0]) setUploadedImage(result.assets[0]);
    };

    const resetForm = () => {
        setSelectedTab('Lyrics');
        animateTab(0);
        setInstrumental(false);
        setStyleMode('prompt');
        setStyleText('');
        setSelectedCategory('Pop');
        setLyricsText('');
        setLyricsMode('manual');
        setSelectedMood(null);
        setGender('Male');
        setSelectedVibeId(null);
        setCoverMode('ai');
        setImagePrompt('');
        setUploadedImage(null);
        setTitleText('');
        setDescription('');
    };

    // ── MAIN GENERATE HANDLER ─────────────────────────────────
    const handleGenerate = async () => {
        if (!titleText.trim()) {
            Alert.alert('Title required', 'Go to the Generate tab and add a song title.');
            handleTabPress('Generate', 2);
            return;
        }

        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.spring(btnScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        ]).start();

        setGenerating(true);
        try {
            // Step 1 — create song record
            setGenStep('Creating song...');
            const raw = await createSong({ title: titleText.trim(), description: description.trim() || undefined });
            const song = raw?.data ?? raw;
            if (!song?.id) throw new Error('Song creation failed');

            // Step 2 — cover image
            if (coverMode === 'upload' && uploadedImage) {
                setGenStep('Uploading cover image...');
                const fd = new FormData();
                fd.append('image', { uri: uploadedImage.uri, name: uploadedImage.fileName ?? 'cover.jpg', type: uploadedImage.type ?? 'image/jpeg' });
                await uploadSongImage(song.id, fd);
            } else if (coverMode === 'ai' && imagePrompt.trim()) {
                setGenStep('Generating AI cover art...');
                await generateSongImage(song.id, { prompt: imagePrompt.trim() });
            }

            // Step 3 — build GenerateSongDto
            setGenStep('Preparing generation payload...');
            const isManualLyrics = lyricsMode === 'manual' && lyricsText.trim().length > 0;
            const promptValue = instrumental
                ? `${styleText.trim()} INSTRUMENTAL ONLY - absolutely no vocals, no singing, pure instrumental music throughout`
                : styleText.trim();

            const generatePayload = {
                category: selectedCategory,
                lyricsMode: isManualLyrics ? 'manual' : 'ai',
                ...(isManualLyrics ? { lyrics: lyricsText.trim() } : {}),
                ...(!isManualLyrics && selectedMood && !selectedVibeId ? { mood: selectedMood } : {}),
                ...(selectedVibeId ? { vibeId: selectedVibeId } : { prompt: promptValue || 'A beautiful well-crafted song' }),
            };

            // Step 4 — generate audio (long running)
            setGenStep('Generating song with AI (this may take a few minutes)...');
            const updatedRaw = await generateSongAudio(song.id, generatePayload);
            const updatedSong = updatedRaw?.data ?? updatedRaw ?? song;

            // Step 5 — navigate
            setGenerating(false);
            resetForm();
            navigation.navigate('SongDetailScreen', { song: { ...song, ...updatedSong } });

        } catch (err) {
            setGenerating(false);
            console.error('[Generate]', err?.response?.data ?? err?.message);
            const msg = err?.response?.data?.message ?? err?.message ?? 'Generation failed.';
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
        }
    };

    // ── CREATE BUTTON ─────────────────────────────────────────
    const CreateButton = ({ label = 'GENERATE NOW', icon = 'auto-awesome' }) => (
        <Animated.View style={[styles.createBtnWrap, { transform: [{ scale: btnScale }] }]}>
            <TouchableOpacity onPress={handleGenerate} activeOpacity={0.88} disabled={generating}>
                <LinearGradient
                    colors={['#66cc33', '#047ec9']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.createBtn}
                >
                    <MaterialIcons name={icon} size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.createBtnText}>{label}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );

    // ────────────────────────────────────────────────────────
    // TAB: LYRICS
    // ────────────────────────────────────────────────────────
    const LyricsTab = () => (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Style of Music header */}
            <View style={styles.sectionHeaderRow}>
                <SectionLabel icon="queue-music" title="Style of Music" hint />
                <View style={styles.instrumentalRow}>
                    <Text style={styles.instrumentalLabel}>Instrumental</Text>
                    <Switch
                        value={instrumental}
                        onValueChange={setInstrumental}
                        trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#66cc33' }}
                        thumbColor="#fff"
                        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                    />
                </View>
            </View>

            {/* Prompt vs Vibe toggle */}
            <View style={styles.styleModeRow}>
                <TouchableOpacity
                    style={[styles.styleModeBtn, styleMode === 'prompt' && styles.styleModeBtnActive]}
                    onPress={() => setStyleMode('prompt')}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="edit" size={13} color={styleMode === 'prompt' ? '#66cc33' : 'rgba(255,255,255,0.4)'} />
                    <Text style={[styles.styleModeBtnText, styleMode === 'prompt' && styles.styleModeBtnTextActive]}>Write Prompt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.styleModeBtn, styleMode === 'vibe' && styles.styleModeVibeActive]}
                    onPress={() => setStyleMode('vibe')}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="graphic-eq" size={13} color={styleMode === 'vibe' ? '#047ec9' : 'rgba(255,255,255,0.4)'} />
                    <Text style={[styles.styleModeBtnText, styleMode === 'vibe' && styles.styleModeBtnTextVibe]}>Use Saved Vibe</Text>
                </TouchableOpacity>
            </View>

            {/* Prompt mode */}
            {styleMode === 'prompt' && (
                <GlassBox>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Describe the style, mood, tempo, emotion..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        multiline
                        maxLength={500}
                        value={styleText}
                        onChangeText={setStyleText}
                    />
                    <Text style={styles.charCount}>{styleText.length} / 500</Text>
                    <View style={styles.tagRow}>
                        {CATEGORIES.map((cat) => {
                            const isSel = selectedCategory === cat.value;
                            return (
                                <TouchableOpacity
                                    key={cat.value}
                                    onPress={() => setSelectedCategory(cat.value)}
                                    style={[styles.tag, isSel && styles.tagActive]}
                                >
                                    <Text style={[styles.tagText, isSel && styles.tagTextActive]}>{cat.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </GlassBox>
            )}

            {/* Vibe mode */}
            {styleMode === 'vibe' && (
                <View>
                    {/* Still show category */}
                    <View style={styles.tagRow}>
                        {CATEGORIES.map((cat) => {
                            const isSel = selectedCategory === cat.value;
                            return (
                                <TouchableOpacity key={cat.value} onPress={() => setSelectedCategory(cat.value)} style={[styles.tag, isSel && styles.tagActive]}>
                                    <Text style={[styles.tagText, isSel && styles.tagTextActive]}>{cat.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View style={{ height: 10 }} />
                    {vibesLoading ? (
                        <View style={styles.vibeLoadingRow}>
                            <ActivityIndicator size="small" color="#66cc33" />
                            <Text style={styles.vibeLoadingText}>Loading vibes...</Text>
                        </View>
                    ) : vibes.length === 0 ? (
                        <View style={styles.vibeEmptyBox}>
                            <MaterialIcons name="graphic-eq" size={28} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.vibeEmptyText}>No vibes yet — create one in the Library tab.</Text>
                        </View>
                    ) : (
                        vibes.map((v) => {
                            const isOn = selectedVibeId === v.id;
                            return (
                                <TouchableOpacity
                                    key={v.id}
                                    onPress={() => setSelectedVibeId(isOn ? null : v.id)}
                                    style={[styles.vibePickCard, isOn && styles.vibePickCardActive]}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.vibePickDot, { backgroundColor: isOn ? '#047ec9' : 'rgba(255,255,255,0.2)' }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.vibePickName, isOn && { color: '#fff' }]}>{v.name}</Text>
                                        <Text style={styles.vibePickMeta}>
                                            {v.energy} · {v.moods?.slice(0, 2).join(', ')}
                                        </Text>
                                    </View>
                                    {isOn && <MaterialIcons name="check-circle" size={18} color="#047ec9" />}
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            )}

            {/* Lyrics */}
            <SectionLabel icon="lyrics" title="Lyrics" hint />
            <GlassBox>
                {lyricsMode === 'ai' && selectedMood ? (
                    <View style={styles.aiLyricsSelected}>
                        <MaterialIcons name="auto-awesome" size={16} color="#66cc33" />
                        <Text style={styles.aiLyricsSelectedText}>
                            AI will write {selectedMood} lyrics for you
                        </Text>
                        <TouchableOpacity onPress={() => { setLyricsMode('manual'); setSelectedMood(null); }} style={styles.aiLyricsClear}>
                            <MaterialIcons name="close" size={14} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <TextInput
                            style={[styles.textArea, { minHeight: 110 }]}
                            placeholder="Write your lyrics or let AI write for you..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            multiline
                            maxLength={3000}
                            value={lyricsText}
                            onChangeText={(t) => { setLyricsText(t); if (t) setLyricsMode('manual'); }}
                        />
                        <Text style={styles.charCount}>{lyricsText.length} / 3000</Text>
                    </>
                )}
                <TouchableOpacity style={styles.aiBtn} onPress={() => setShowMoodPicker(true)}>
                    <LinearGradient
                        colors={['rgba(102,204,51,0.25)', 'rgba(4,126,201,0.25)']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.aiBtnGradient}
                    >
                     
                        <Text style={styles.aiBtnText}>Write Lyrics For Me</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </GlassBox>

            {/* Voice Gender */}
            <SectionLabel icon="person" title="Voice Gender" />
            <View style={styles.genderRow}>
                {['Male', 'Female', 'Random'].map((g) => (
                    <TouchableOpacity
                        key={g}
                        onPress={() => setGender(g)}
                        style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons
                            name={g === 'Male' ? 'face' : g === 'Female' ? 'face-3' : 'shuffle'}
                            size={14}
                            color={gender === g ? '#fff' : 'rgba(255,255,255,0.6)'}
                            style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>{g}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <CreateButton label="GENERATE SONG" icon="auto-awesome" />
        </ScrollView>
    );

    // ────────────────────────────────────────────────────────
    // TAB: COVER
    // ────────────────────────────────────────────────────────
    const CoverTab = () => (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            <View style={styles.coverHeaderCard}>
                <LinearGradient colors={['rgba(102,204,51,0.12)', 'rgba(4,126,201,0.12)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.coverHeaderGrad}>
                    <MaterialIcons name="image" size={32} color="#66cc33" />
                    <Text style={styles.coverHeaderTitle}>Song Cover Art</Text>
                    <Text style={styles.coverHeaderSub}>Add a cover image — upload your own or let AI paint one for you.</Text>
                </LinearGradient>
            </View>

            {/* Mode toggle */}
            <View style={styles.styleModeRow}>
                <TouchableOpacity
                    style={[styles.styleModeBtn, coverMode === 'ai' && styles.styleModeBtnActive]}
                    onPress={() => setCoverMode('ai')}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="auto-awesome" size={13} color={coverMode === 'ai' ? '#66cc33' : 'rgba(255,255,255,0.4)'} />
                    <Text style={[styles.styleModeBtnText, coverMode === 'ai' && styles.styleModeBtnTextActive]}>AI Generate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.styleModeBtn, coverMode === 'upload' && styles.styleModeVibeActive]}
                    onPress={() => setCoverMode('upload')}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="upload" size={13} color={coverMode === 'upload' ? '#047ec9' : 'rgba(255,255,255,0.4)'} />
                    <Text style={[styles.styleModeBtnText, coverMode === 'upload' && styles.styleModeBtnTextVibe]}>Upload Image</Text>
                </TouchableOpacity>
            </View>

            {/* AI generate prompt */}
            {coverMode === 'ai' && (
                <>
                    <SectionLabel icon="brush" title="Describe the Cover Art" hint />
                    <GlassBox>
                        <TextInput
                            style={[styles.textArea, { minHeight: 90 }]}
                            placeholder="e.g. cosmic nebula with glowing soundwaves, neon purple and blue..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            multiline
                            maxLength={400}
                            value={imagePrompt}
                            onChangeText={setImagePrompt}
                        />
                        <Text style={styles.charCount}>{imagePrompt.length} / 400</Text>
                    </GlassBox>
                    <View style={styles.aiCoverNote}>
                        <MaterialIcons name="info-outline" size={14} color="rgba(255,255,255,0.35)" />
                        <Text style={styles.aiCoverNoteText}>Cover is generated after song creation using DALL-E 3 · 1024×1024</Text>
                    </View>
                </>
            )}

            {/* Upload picker */}
            {coverMode === 'upload' && (
                <>
                    <SectionLabel icon="add-photo-alternate" title="Pick from Gallery" />
                    <TouchableOpacity onPress={pickImage} style={styles.uploadCoverBtn} activeOpacity={0.8}>
                        {uploadedImage ? (
                            <>
                                <Image source={{ uri: uploadedImage.uri }} style={styles.uploadCoverPreview} resizeMode="cover" />
                                <View style={styles.uploadCoverChangeOverlay}>
                                    <MaterialIcons name="edit" size={18} color="#fff" />
                                    <Text style={styles.uploadCoverChangeText}>Change Image</Text>
                                </View>
                            </>
                        ) : (
                            <LinearGradient colors={['rgba(4,126,201,0.1)', 'rgba(4,126,201,0.05)']} style={styles.uploadCoverEmpty}>
                                <MaterialIcons name="add-photo-alternate" size={38} color="#047ec9" />
                                <Text style={styles.uploadCoverEmptyText}>Tap to pick from gallery</Text>
                                <Text style={styles.uploadCoverEmptySub}>JPG, PNG · Square recommended</Text>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                </>
            )}

            <CreateButton label="GENERATE SONG" icon="auto-awesome" />
        </ScrollView>
    );

    // ────────────────────────────────────────────────────────
    // TAB: GENERATE
    // ────────────────────────────────────────────────────────
    const GenerateTab = () => {
        const moodObj = MOODS.find((m) => m.value === selectedMood);
        const catObj  = CATEGORIES.find((c) => c.value === selectedCategory);
        const vibeObj = vibes.find((v) => v.id === selectedVibeId);

        return (
            <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Hero card */}
                <LinearGradient colors={['rgba(102,204,51,0.13)', 'rgba(4,126,201,0.13)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.genHeroCard}>
                    <MaterialIcons name="auto-awesome" size={36} color="#66cc33" />
                    <Text style={styles.genHeroTitle}>Ready to Create</Text>
                    <Text style={styles.genHeroSub}>Fill in the title below and hit generate.</Text>
                </LinearGradient>

                {/* Title */}
                <SectionLabel icon="title" title="Song Title" />
                <GlassBox>
                    <TextInput
                        style={[styles.textArea, { minHeight: 44 }]}
                        placeholder="Give your song a name  (required)"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        maxLength={80}
                        value={titleText}
                        onChangeText={setTitleText}
                    />
                    <Text style={styles.charCount}>{titleText.length} / 80</Text>
                </GlassBox>

                {/* Description */}
                <SectionLabel icon="description" title="Song Description" />
                <GlassBox>
                    <TextInput
                        style={[styles.textArea, { minHeight: 80 }]}
                        placeholder="Optional — mood, story, feel..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        multiline
                        maxLength={300}
                        value={description}
                        onChangeText={setDescription}
                    />
                    <Text style={styles.charCount}>{description.length} / 300</Text>
                </GlassBox>

                {/* Summary */}
                <SectionLabel icon="summarize" title="Generation Summary" />
                <View style={styles.summaryCard}>
                    {[
                        { icon: 'queue-music',   label: 'Genre',       value: catObj?.label ?? selectedCategory },
                        { icon: 'graphic-eq',    label: 'Style',       value: vibeObj ? `Vibe: ${vibeObj.name}` : (styleText.trim() ? styleText.slice(0, 40) + '…' : '—') },
                        { icon: 'lyrics',        label: 'Lyrics',      value: lyricsMode === 'ai' ? `AI · ${moodObj?.label ?? 'mood not set'} ${moodObj?.emoji ?? ''}` : (lyricsText.trim() ? 'Manual lyrics' : 'AI (no mood set)') },
                        { icon: 'image',         label: 'Cover',       value: coverMode === 'upload' ? (uploadedImage ? 'Uploaded image' : 'None') : (imagePrompt.trim() ? 'AI generated' : 'No cover') },
                        { icon: 'music-off',     label: 'Instrumental',value: instrumental ? 'Yes — no vocals' : 'No — with vocals' },
                    ].map(({ icon, label, value }, i, arr) => (
                        <View key={label}>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryIcon}>
                                    <MaterialIcons name={icon} size={13} color="#66cc33" />
                                </View>
                                <Text style={styles.summaryLabel}>{label}</Text>
                                <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
                            </View>
                            {i < arr.length - 1 && <View style={styles.summaryDivider} />}
                        </View>
                    ))}
                </View>

                <CreateButton label="GENERATE SONG" icon="auto-awesome" />
            </ScrollView>
        );
    };

    const renderContent = () => {
        const animStyle = { opacity: contentFade, transform: [{ translateY: contentSlide }], flex: 1 };
        if (selectedTab === 'Lyrics')   return <Animated.View style={animStyle}><LyricsTab /></Animated.View>;
        if (selectedTab === 'Cover')    return <Animated.View style={animStyle}><CoverTab /></Animated.View>;
        if (selectedTab === 'Generate') return <Animated.View style={animStyle}><GenerateTab /></Animated.View>;
        return null;
    };

    return (
        <ImageBackground source={require('../assets/images/image-1.jpg')} style={styles.background}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                <View style={styles.container}>
                    <Header coins={25} />

                    {/* Tab bar */}
                    <View style={styles.tabBarWrap}>
                        <View style={styles.tabBarContainer}>
                            <Animated.View
                                style={[styles.tabPill, {
                                    width: TAB_W - 4,
                                    transform: [{
                                        translateX: tabIndicator.interpolate({
                                            inputRange: [0, 1, 2],
                                            outputRange: [2, TAB_W + 2, TAB_W * 2 + 2],
                                        }),
                                    }],
                                }]}
                            />
                            {TABS.map((tab, i) => (
                                <TouchableOpacity key={tab} style={styles.tabBtn} onPress={() => handleTabPress(tab, i)} activeOpacity={0.8}>
                                    <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {renderContent()}
                </View>
            </KeyboardAvoidingView>

            <MoodPickerModal
                visible={showMoodPicker}
                onSelect={handleMoodSelect}
                onClose={() => setShowMoodPicker(false)}
            />
            <GeneratingOverlay visible={generating} step={genStep} />
        </ImageBackground>
    );
};

export default SongCreationScreen;

const styles = StyleSheet.create({
    background: { flex: 1 },
    container: { flex: 1 },

    // Tab bar
    tabBarWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    tabBarContainer: {
        flex: 1, flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
        padding: 2, position: 'relative',
    },
    tabPill: {
        position: 'absolute', top: 2, bottom: 2,
        backgroundColor: '#fff', borderRadius: 28,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12, shadowRadius: 5, elevation: 3,
    },
    tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, zIndex: 1 },
    tabText: { fontSize: 13, fontFamily: 'Oswald-Bold', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
    tabTextActive: { color: '#1a1a2e' },

    // Tab content
    tabContent: { flex: 1 },
    tabContentInner: { paddingHorizontal: 16, paddingBottom: 100 },

    // Section labels
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 6 },
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 14 },
    sectionLabelLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionIconWrap: { width: 24, height: 24, borderRadius: 7, backgroundColor: 'rgba(102,204,51,0.15)', justifyContent: 'center', alignItems: 'center' },
    sectionLabelText: { color: '#fff', fontSize: 14, fontFamily: 'Oswald-Bold', letterSpacing: 0.5 },
    hintBtn: { padding: 4 },
    instrumentalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    instrumentalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Oswald-Regular' },

    // Glass box
    glassBox: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', padding: 14, marginBottom: 4 },
    textArea: { color: '#fff', fontSize: 14, fontFamily: 'Oswald-Regular', textAlignVertical: 'top', minHeight: 70 },
    charCount: { color: 'rgba(255,255,255,0.35)', fontSize: 10, textAlign: 'right', marginTop: 6, fontFamily: 'Oswald-Regular' },

    // Style mode toggle
    styleModeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    styleModeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingVertical: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    },
    styleModeBtnActive:      { backgroundColor: 'rgba(102,204,51,0.12)', borderColor: 'rgba(102,204,51,0.4)' },
    styleModeVibeActive:     { backgroundColor: 'rgba(4,126,201,0.12)',  borderColor: 'rgba(4,126,201,0.4)'  },
    styleModeBtnText:        { color: 'rgba(255,255,255,0.45)', fontFamily: 'Oswald-Bold', fontSize: 12 },
    styleModeBtnTextActive:  { color: '#66cc33' },
    styleModeBtnTextVibe:    { color: '#047ec9' },

    // Genre tags
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    tag:       { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
    tagActive: { backgroundColor: '#66cc33', borderColor: '#66cc33', shadowColor: '#66cc33', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.45, shadowRadius: 6, elevation: 4 },
    tagText:       { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'Oswald-Bold' },
    tagTextActive: { color: '#fff' },

    // Vibe picker
    vibeLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
    vibeLoadingText: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 13 },
    vibeEmptyBox: { alignItems: 'center', gap: 8, paddingVertical: 24, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' },
    vibeEmptyText: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
    vibePickCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 8,
    },
    vibePickCardActive: { backgroundColor: 'rgba(4,126,201,0.12)', borderColor: 'rgba(4,126,201,0.4)' },
    vibePickDot: { width: 10, height: 10, borderRadius: 5 },
    vibePickName: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Oswald-Bold', fontSize: 14 },
    vibePickMeta: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 11, marginTop: 2 },

    // Lyrics AI mode
    aiLyricsSelected: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(102,204,51,0.1)', borderRadius: 10, padding: 10, marginBottom: 8 },
    aiLyricsSelectedText: { flex: 1, color: '#66cc33', fontFamily: 'Oswald-Bold', fontSize: 13 },
    aiLyricsClear: { padding: 4 },

    // AI button
    aiBtn: { marginTop: 10, alignSelf: 'flex-start', borderRadius: 20, overflow: 'hidden' },
    aiBtnGradient: { flexDirection: 'row', alignItems: 'center',  gap: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(102,204,51,0.35)' },
    aiBtnText: { color: '#66cc33', fontSize: 12, fontFamily: 'Oswald-Bold', letterSpacing: 0.5 , padding:10},

    // Gender
    genderRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    genderBtnActive: { backgroundColor: '#66cc33', borderColor: '#66cc33', shadowColor: '#66cc33', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
    genderBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'Oswald-Bold' },
    genderBtnTextActive: { color: '#fff' },

    // Cover tab
    coverHeaderCard: { marginBottom: 14, marginTop: 6, borderRadius: 16, overflow: 'hidden', },
    coverHeaderGrad: {paddingVertical:10, alignItems: 'center', gap: 8, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    coverHeaderTitle: { color: '#fff', fontSize: 18, fontFamily: 'Oswald-Bold', letterSpacing: 0.5, },
    coverHeaderSub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'Oswald-Regular', textAlign: 'center', marginBottom:20, marginHorizontal:20 },
    aiCoverNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 4 },
    aiCoverNoteText: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 11, flex: 1 },
    uploadCoverBtn: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(4,126,201,0.3)', height: 180, position: 'relative' },
    uploadCoverPreview: { width: '100%', height: '100%' },
    uploadCoverEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
    uploadCoverEmptyText: { color: '#047ec9', fontFamily: 'Oswald-Bold', fontSize: 14 },
    uploadCoverEmptySub: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 11 },
    uploadCoverChangeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 8 },
    uploadCoverChangeText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 12 },

    // Generate tab
    genHeroCard: { borderRadius: 18,  alignItems: 'center', gap: 8, marginBottom: 6, marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    genHeroTitle: { color: '#fff', fontSize: 20, fontFamily: 'Oswald-Bold', letterSpacing: 0.5 },
    genHeroSub: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 13, textAlign: 'center', marginBottom:20 },
    summaryCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16, marginBottom: 4 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    summaryIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(102,204,51,0.12)', justifyContent: 'center', alignItems: 'center' },
    summaryLabel: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 12, width: 80 },
    summaryValue: { flex: 1, color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 13 },
    summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 10 },

    // Create button
    createBtnWrap: { marginTop: 24, marginBottom: 20 },
    createBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#66cc33', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10 },
    createBtnText: { color: '#fff', fontSize: 18, fontFamily: 'Oswald-Bold', letterSpacing: 2 },

    // Mood picker modal
    moodOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
    moodSheet: { backgroundColor: '#0d1117', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    moodHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
    moodHeaderTitle: { flex: 1, color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 18 },
    moodCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    moodHeaderSub: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 12, marginBottom: 18 },
    moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    moodCard: { width: (width - 48 - 30) / 4, borderRadius: 14, overflow: 'hidden' },
    moodCardGrad: {  alignItems: 'center', gap: 6, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    moodEmoji: { fontSize: 22, marginTop:5 },
    moodLabel: { fontFamily: 'Oswald-Bold', fontSize: 10, letterSpacing: 0.5 , marginBottom:5},

    // Generating overlay
    genOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
    genOverlayInner: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16,  },
    genSpinWrap: { marginBottom: 8 },
    genSpinGrad: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', shadowColor: '#66cc33', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 12 },
    genTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 22, letterSpacing: 0.5 },
    genStep: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Oswald-Regular', fontSize: 14, textAlign: 'center', lineHeight: 20 },
    genDots: { flexDirection: 'row', gap: 8, marginTop: 8 },
    genDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#66cc33' },
});
