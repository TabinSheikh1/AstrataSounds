import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './songCreationStyles';
import SectionLabel from './SectionLabel';
import GlassBox from './GlassBox';

const CoverTab = ({ coverMode, setCoverMode, imagePrompt, setImagePrompt, uploadedImage, pickImage }) => (
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


    </ScrollView>
);

export default CoverTab;
