import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ImageBackground,
    Animated, Easing, KeyboardAvoidingView, Platform,
    Dimensions, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createSong, generateSongAudio, generateSongImage, uploadSongImage } from '../api/songsService';
import { getMyVibes } from '../api/vibesService';
import { useSubscription } from '../hooks/useSubscription';
import { TABS } from './songCreation/constants';
import { styles } from './songCreation/songCreationStyles';
import MoodPickerModal from './songCreation/MoodPickerModal';
import GeneratingOverlay from './songCreation/GeneratingOverlay';
import LyricsTab from './songCreation/LyricsTab';
import CoverTab from './songCreation/CoverTab';
import GenerateTab from './songCreation/GenerateTab';

const { width } = Dimensions.get('window');

// ── Step progress indicator ────────────────────────────────────
const STEP_META = [
    { key: 'Lyrics',   label: 'Lyrics'  },
    { key: 'Cover',    label: 'Cover'   },
    { key: 'Generate', label: 'Create'  },
];

const StepIndicator = ({ currentTab, onTabPress }) => {
    const currentIdx = TABS.indexOf(currentTab);
    return (
        <View style={styles.stepWrap}>
            {/* Circles + connecting lines */}
            <View style={styles.stepCircleRow}>
                {STEP_META.map((step, i) => {
                    const isActive = i === currentIdx;
                    const isDone   = i < currentIdx;
                    return (
                        <React.Fragment key={step.key}>
                            <TouchableOpacity onPress={() => onTabPress(step.key, i)} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={isActive || isDone ? ['#66cc33', '#047ec9'] : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.08)']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.stepCircle}
                                >
                                    {isDone
                                        ? <MaterialIcons name="check" size={14} color="#fff" />
                                        : <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>{i + 1}</Text>
                                    }
                                </LinearGradient>
                            </TouchableOpacity>
                            {i < STEP_META.length - 1 && (
                                <LinearGradient
                                    colors={isDone ? ['#66cc33', '#047ec9'] : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.12)']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.stepLine}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
            {/* Labels row */}
            <View style={styles.stepLabelRow}>
                {STEP_META.map((step, i) => {
                    const isActive = i === currentIdx;
                    return (
                        <React.Fragment key={step.key}>
                            <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                                {step.label}
                            </Text>
                            {i < STEP_META.length - 1 && <View style={styles.stepLabelSpacer} />}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
};

// ────────────────────────────────────────────────────────────
const SongCreationScreen = () => {
    const navigation = useNavigation();
    const { totalBalance, isBlocked, plan } = useSubscription();
    const isSparkPlan = !plan || plan.tier === 'spark';

    const [selectedTab, setSelectedTab] = useState('Lyrics');

    // Lyrics tab state
    const [instrumental, setInstrumental]       = useState(false);
    const [styleMode, setStyleMode]             = useState('prompt');
    const [styleText, setStyleText]             = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Pop');
    const [lyricsText, setLyricsText]           = useState('');
    const [lyricsMode, setLyricsMode]           = useState('manual');
    const [selectedMood, setSelectedMood]       = useState(null);
    const [showMoodPicker, setShowMoodPicker]   = useState(false);
    const [vibes, setVibes]                     = useState([]);
    const [selectedVibeId, setSelectedVibeId]   = useState(null);
    const [vibesLoading, setVibesLoading]       = useState(false);

    // Cover tab state
    const [coverMode, setCoverMode]       = useState('ai');
    const [imagePrompt, setImagePrompt]   = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);

    // Generate tab state
    const [titleText, setTitleText]         = useState('');
    const [description, setDescription]     = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('english');

    // Generation
    const [generating, setGenerating] = useState(false);
    const [genStep, setGenStep]       = useState('');

    // Animations
    const contentFade  = useRef(new Animated.Value(1)).current;
    const contentSlide = useRef(new Animated.Value(0)).current;
    const btnScale     = useRef(new Animated.Value(1)).current;

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

    const animateTab = () => {
        contentFade.setValue(0);
        contentSlide.setValue(16);
        Animated.parallel([
            Animated.timing(contentFade,  { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(contentSlide, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    };

    const handleTabPress = (tab) => {
        setSelectedTab(tab);
        animateTab();
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
        animateTab();
        setInstrumental(false);
        setStyleMode('prompt');
        setStyleText('');
        setSelectedCategory('Pop');
        setLyricsText('');
        setLyricsMode('manual');
        setSelectedMood(null);
        setSelectedVibeId(null);
        setCoverMode('ai');
        setImagePrompt('');
        setUploadedImage(null);
        setTitleText('');
        setDescription('');
        setSelectedLanguage('english');
    };

    const handleGenerate = async () => {
        if (!titleText.trim()) {
            Alert.alert('Title required', 'Go to the Create tab and add a song title.');
            handleTabPress('Generate');
            return;
        }

        const requiredTokens = 100;

        if (isBlocked) {
            Alert.alert('Account Blocked', 'Your subscription is inactive. Please renew your plan to generate songs.');
            return;
        }
        if (totalBalance < requiredTokens) {
            Alert.alert(
                'Not Enough Credits',
                `You need 1 credit to generate a song. You currently have ${(totalBalance / 100).toFixed(2)} credits.\n\nPurchase a credit pack or upgrade your plan.`,
            );
            return;
        }

        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.spring(btnScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        ]).start();

        setGenerating(true);
        try {
            setGenStep('Creating song...');
            const raw = await createSong({ title: titleText.trim(), description: description.trim() || undefined });
            const song = raw?.data ?? raw;
            if (!song?.id) throw new Error('Song creation failed');

            if (coverMode === 'upload' && uploadedImage) {
                setGenStep('Uploading cover image...');
                const fd = new FormData();
                fd.append('image', { uri: uploadedImage.uri, name: uploadedImage.fileName ?? 'cover.jpg', type: uploadedImage.type ?? 'image/jpeg' });
                await uploadSongImage(song.id, fd);
            } else if (coverMode === 'ai' && imagePrompt.trim()) {
                setGenStep('Generating AI cover art...');
                await generateSongImage(song.id, { prompt: imagePrompt.trim() });
            }

            setGenStep('Preparing generation payload...');
            const isManualLyrics = lyricsMode === 'manual' && lyricsText.trim().length > 0;
            const promptValue = instrumental
                ? `${styleText.trim()} INSTRUMENTAL ONLY - absolutely no vocals, no singing, pure instrumental music throughout`
                : styleText.trim();

            const generatePayload = {
                category: selectedCategory,
                lyricsMode: isManualLyrics ? 'manual' : 'ai',
                language: selectedLanguage,
                ...(isManualLyrics ? { lyrics: lyricsText.trim() } : {}),
                ...(!isManualLyrics && selectedMood && !selectedVibeId ? { mood: selectedMood } : {}),
                ...(selectedVibeId ? { vibeId: selectedVibeId } : { prompt: promptValue || 'A beautiful well-crafted song' }),
            };

            setGenStep('Generating song with AI (this may take a few minutes)...');
            const updatedRaw = await generateSongAudio(song.id, generatePayload);
            const updatedSong = updatedRaw?.data ?? updatedRaw ?? song;

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

    const currentIdx = TABS.indexOf(selectedTab);

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
                    selectedMood={selectedMood}
                    setShowMoodPicker={setShowMoodPicker}
                    selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage}
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
                    isSparkPlan={isSparkPlan}
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
                    selectedLanguage={selectedLanguage}
                    totalBalance={totalBalance}
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
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.container}>
                    <Header />

                    {/* Step progress indicator */}
                    <StepIndicator currentTab={selectedTab} onTabPress={handleTabPress} />

                    {/* Tab content */}
                    {renderContent()}

                    {/* Sticky bottom navigation — hidden on the Generate tab (has its own CTA) */}
                    {selectedTab !== 'Generate' && (
                        <View style={styles.bottomNav}>
                            {currentIdx > 0 ? (
                                <TouchableOpacity
                                    style={styles.prevBtn}
                                    onPress={() => handleTabPress(TABS[currentIdx - 1])}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons name="arrow-back-ios" size={13} color="rgba(255,255,255,0.65)" />
                                    <Text style={styles.prevBtnText}>{TABS[currentIdx - 1]}</Text>
                                </TouchableOpacity>
                            ) : null}

                            <TouchableOpacity
                                style={styles.nextBtn}
                                onPress={() => handleTabPress(TABS[currentIdx + 1])}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={['#66cc33', '#047ec9']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.nextBtnGradient}
                                >
                                    <Text style={styles.nextBtnText}>
                                        Next: {TABS[currentIdx + 1]}
                                    </Text>
                                    <MaterialIcons name="arrow-forward" size={16} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
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
