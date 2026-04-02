import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CATEGORIES } from './constants';
import { styles } from './songCreationStyles';
import SectionLabel from './SectionLabel';
import GlassBox from './GlassBox';

const LyricsTab = ({
    instrumental, setInstrumental,
    styleMode, setStyleMode,
    styleText, setStyleText,
    selectedCategory, setSelectedCategory,
    lyricsText, setLyricsText,
    lyricsMode, setLyricsMode,
    selectedMood, setSelectedMood,
    setShowMoodPicker,
    gender, setGender,
    vibes, selectedVibeId, setSelectedVibeId, vibesLoading,
}) => (
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

        {/* <CreateButton label="GENERATE SONG" icon="auto-awesome" /> */}
    </ScrollView>
);

export default LyricsTab;
