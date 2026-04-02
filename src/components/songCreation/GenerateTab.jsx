import React from 'react';
import {
    View, Text, ScrollView, TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MOODS, CATEGORIES } from './constants';
import { styles } from './songCreationStyles';
import SectionLabel from './SectionLabel';
import GlassBox from './GlassBox';
import CreateButton from './CreateButton';

const GenerateTab = ({
    selectedMood,
    selectedCategory,
    selectedVibeId,
    vibes,
    styleText,
    lyricsMode,
    lyricsText,
    coverMode,
    uploadedImage,
    imagePrompt,
    instrumental,
    titleText, setTitleText,
    description, setDescription,
    handleGenerate, generating, btnScale,
}) => {
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

            <CreateButton label="GENERATE SONG" icon="auto-awesome" handleGenerate={handleGenerate} generating={generating} btnScale={btnScale} />
        </ScrollView>
    );
};

export default GenerateTab;
