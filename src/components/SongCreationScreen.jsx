import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ImageBackground,
    Animated, Easing, KeyboardAvoidingView, Platform,
    Dimensions, Alert,
} from 'react-native';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createSong, generateSongAudio, generateSongImage, uploadSongImage } from '../api/songsService';
import { getMyVibes } from '../api/vibesService';
import { TABS } from './songCreation/constants';
import { styles } from './songCreation/songCreationStyles';
import MoodPickerModal from './songCreation/MoodPickerModal';
import GeneratingOverlay from './songCreation/GeneratingOverlay';
import LyricsTab from './songCreation/LyricsTab';
import CoverTab from './songCreation/CoverTab';
import GenerateTab from './songCreation/GenerateTab';

const { width } = Dimensions.get('window');

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

    const renderContent = () => {
        const animStyle = { opacity: contentFade, transform: [{ translateY: contentSlide }], flex: 1 };
        if (selectedTab === 'Lyrics') return (
            <Animated.View style={animStyle}>
                <LyricsTab
                    instrumental={instrumental} setInstrumental={setInstrumental}
                    styleMode={styleMode} setStyleMode={setStyleMode}
                    styleText={styleText} setStyleText={setStyleText}
                    selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                    lyricsText={lyricsText} setLyricsText={setLyricsText}
                    lyricsMode={lyricsMode} setLyricsMode={setLyricsMode}
                    selectedMood={selectedMood} setSelectedMood={setSelectedMood}
                    setShowMoodPicker={setShowMoodPicker}
                    gender={gender} setGender={setGender}
                    vibes={vibes} selectedVibeId={selectedVibeId} setSelectedVibeId={setSelectedVibeId}
                    vibesLoading={vibesLoading}
                />
            </Animated.View>
        );
        if (selectedTab === 'Cover') return (
            <Animated.View style={animStyle}>
                <CoverTab
                    coverMode={coverMode} setCoverMode={setCoverMode}
                    imagePrompt={imagePrompt} setImagePrompt={setImagePrompt}
                    uploadedImage={uploadedImage}
                    pickImage={pickImage}
                />
            </Animated.View>
        );
        if (selectedTab === 'Generate') return (
            <Animated.View style={animStyle}>
                <GenerateTab
                    selectedMood={selectedMood}
                    selectedCategory={selectedCategory}
                    selectedVibeId={selectedVibeId}
                    vibes={vibes}
                    styleText={styleText}
                    lyricsMode={lyricsMode}
                    lyricsText={lyricsText}
                    coverMode={coverMode}
                    uploadedImage={uploadedImage}
                    imagePrompt={imagePrompt}
                    instrumental={instrumental}
                    titleText={titleText} setTitleText={setTitleText}
                    description={description} setDescription={setDescription}
                    handleGenerate={handleGenerate}
                    generating={generating}
                    btnScale={btnScale}
                />
            </Animated.View>
        );
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
