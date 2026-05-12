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
    const moodObj  = MOODS.find((m) => m.value === selectedMood);
    const catObj   = CATEGORIES.find((c) => c.value === selectedCategory);
    const vibeObj  = vibes.find((v) => v.id === selectedVibeId);

    const summaryRows = [
        {
            icon: 'queue-music',
            label: 'Genre',
            value: catObj?.label ?? selectedCategory,
            done: true,
        },
        {
            icon: 'graphic-eq',
            label: 'Style',
            value: vibeObj
                ? `Vibe: ${vibeObj.name}`
                : (styleText.trim() ? styleText.slice(0, 38) + (styleText.length > 38 ? '…' : '') : 'Not set'),
            done: !!(vibeObj || styleText.trim()),
        },
        {
            icon: 'lyrics',
            label: 'Lyrics',
            value: lyricsMode === 'ai'
                ? (moodObj ? `AI · ${moodObj.label} ${moodObj.emoji}` : 'AI (mood not set)')
                : (lyricsText.trim() ? 'Manual lyrics' : 'AI (auto)'),
            done: lyricsMode === 'ai' ? !!moodObj : !!lyricsText.trim(),
        },
        {
            icon: 'image',
            label: 'Cover',
            value: coverMode === 'upload'
                ? (uploadedImage ? 'Uploaded image' : 'No image')
                : (imagePrompt.trim() ? 'AI generated' : 'No cover'),
            done: !!(imagePrompt.trim() || uploadedImage),
        },
        {
            icon: instrumental ? 'music-off' : 'mic',
            label: 'Vocals',
            value: instrumental ? 'Instrumental only' : 'With vocals',
            done: true,
        },
    ];

    const completedCount = summaryRows.filter(r => r.done).length;

    return (
        <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.tabContentInner}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Hero card */}
            <View style={styles.genHeroCard}>
                <LinearGradient
                    colors={['rgba(102,204,51,0.13)', 'rgba(4,126,201,0.10)']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.genHeroGrad}
                >
                    <View style={styles.genHeroIconWrap}>
                        <MaterialIcons name="auto-awesome" size={26} color="#66cc33" />
                    </View>
                    <Text style={styles.genHeroTitle}>Ready to Create</Text>
                    <Text style={styles.genHeroSub}>
                        {completedCount} of {summaryRows.length} options configured · Add a title and generate!
                    </Text>
                </LinearGradient>
            </View>

            {/* Song Title */}
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
            <SectionLabel icon="summarize" title="Configuration Summary" />
            <View style={styles.summaryCard}>
                {summaryRows.map(({ icon, label, value, done }, i, arr) => (
                    <View key={label}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryIcon}>
                                <MaterialIcons name={icon} size={13} color="#66cc33" />
                            </View>
                            <Text style={styles.summaryLabel}>{label}</Text>
                            <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
                            <View style={[
                                styles.summaryStatusDot,
                                { backgroundColor: done ? '#66cc33' : 'rgba(255,255,255,0.2)' },
                            ]} />
                        </View>
                        {i < arr.length - 1 && <View style={styles.summaryDivider} />}
                    </View>
                ))}
            </View>

            <CreateButton
                label="GENERATE SONG"
                icon="auto-awesome"
                handleGenerate={handleGenerate}
                generating={generating}
                btnScale={btnScale}
            />
        </ScrollView>
    );
};

export default GenerateTab;
