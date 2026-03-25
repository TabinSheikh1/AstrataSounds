import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Animated,
  Easing,
  Dimensions,
  FlatList,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getMySongs, deleteSong, toggleLikeSong } from '../api/songsService';
import { getMyVibes, createVibe, deleteVibe } from '../api/vibesService';
import { getMyPlaylists, createPlaylist, deletePlaylist, addSongToPlaylist, generatePlaylistBanner, uploadPlaylistBanner } from '../api/playlistsService';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');
const MAIN_TABS = ['Songs', 'Vibe', 'Playlist'];
const FILE_BASE = 'http://localhost:3000';

// ── Enum option sets ────────────────────────────────────────
const ENERGY_OPTIONS = [
  { label: 'Low', value: 'low', color: '#4fc3f7' },
  { label: 'Medium', value: 'medium', color: '#66cc33' },
  { label: 'High', value: 'high', color: '#ff9800' },
  { label: 'Ultra', value: 'ultra', color: '#e53935' },
];

const TEMPO_OPTIONS = [
  { label: 'Slow', value: 'slow' },
  { label: 'Mid', value: 'mid' },
  { label: 'Fast', value: 'fast' },
  { label: 'Very Fast', value: 'very_fast' },
];

const VOCAL_OPTIONS = [
  { label: 'Instrumental', value: 'instrumental_only', icon: 'piano' },
  { label: 'Soft', value: 'soft', icon: 'mic' },
  { label: 'Powerful', value: 'powerful', icon: 'graphic-eq' },
  { label: 'Rap', value: 'rap', icon: 'record-voice-over' },
  { label: 'Melodic', value: 'melodic', icon: 'queue-music' },
];

const MOOD_OPTIONS = [
  { label: 'Happy', value: 'happy', emoji: '😊' },
  { label: 'Sad', value: 'sad', emoji: '😢' },
  { label: 'Energetic', value: 'energetic', emoji: '⚡' },
  { label: 'Romantic', value: 'romantic', emoji: '❤️' },
  { label: 'Melancholic', value: 'melancholic', emoji: '🌧️' },
  { label: 'Peaceful', value: 'peaceful', emoji: '🍃' },
  { label: 'Nostalgic', value: 'nostalgic', emoji: '🌅' },
  { label: 'Rebellious', value: 'rebellious', emoji: '🔥' },
];

const INSTRUMENT_OPTIONS = [
  { label: 'Guitar', value: 'acoustic_guitar' },
  { label: 'Elec. Guitar', value: 'electric_guitar' },
  { label: 'Piano', value: 'piano' },
  { label: 'Synth', value: 'synth' },
  { label: 'Violin', value: 'violin' },
  { label: 'Cello', value: 'cello' },
  { label: 'Drums', value: 'drums' },
  { label: 'Bass', value: 'bass' },
  { label: 'Trumpet', value: 'trumpet' },
  { label: 'Saxophone', value: 'saxophone' },
  { label: 'Flute', value: 'flute' },
  { label: 'Harp', value: 'harp' },
];

const SETTING_OPTIONS = [
  { label: 'Night Drive', value: 'night_drive', icon: '🌃' },
  { label: 'Beach', value: 'beach', icon: '🏖️' },
  { label: 'Gym', value: 'gym', icon: '💪' },
  { label: 'Study', value: 'study', icon: '📚' },
  { label: 'Party', value: 'party', icon: '🎉' },
  { label: 'Rain', value: 'rain', icon: '🌧️' },
  { label: 'Forest', value: 'forest', icon: '🌲' },
  { label: 'City', value: 'city', icon: '🌆' },
  { label: 'Late Night', value: 'late_night', icon: '🌙' },
  { label: 'Sunrise', value: 'sunrise', icon: '🌄' },
];

const KEYWORD_OPTIONS = [
  { label: 'Chill', value: 'chill' },
  { label: 'Dark', value: 'dark' },
  { label: 'Euphoric', value: 'euphoric' },
  { label: 'Dreamy', value: 'dreamy' },
  { label: 'Aggressive', value: 'aggressive' },
  { label: 'Romantic', value: 'romantic' },
  { label: 'Epic', value: 'epic' },
  { label: 'Mysterious', value: 'mysterious' },
  { label: 'Playful', value: 'playful' },
  { label: 'Haunting', value: 'haunting' },
  { label: 'Uplifting', value: 'uplifting' },
];

const ENERGY_COLORS = {
  low: '#4fc3f7',
  medium: '#66cc33',
  high: '#ff9800',
  ultra: '#e53935',
};

// ── Helpers ─────────────────────────────────────────────────
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Song Card ───────────────────────────────────────────────
const SongCard = ({ song, onDelete, onLike }) => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start(() => navigation.navigate('SongDetailScreen', { song }));
  };

  const confirmDelete = () => {
    Alert.alert('Delete Song', `Delete "${song.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(song.id) },
    ]);
  };

  const hasAudio = !!song.audioPath;
  const hasImage = !!song.imagePath;

  return (
    <Animated.View style={[styles.songCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress} style={{ flex: 1 }}>
        <LinearGradient
          colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.04)']}
          style={styles.songCardInner}
        >
          {/* Album Art */}
          <View style={styles.albumArtWrap}>
            {hasImage ? (
              <Image
                source={{ uri: `${FILE_BASE}${song.imagePath}` }}
                style={styles.albumArt}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#66cc33', '#047ec9']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.albumArtFallback}
              >
                <MaterialIcons name="music-note" size={22} color="#fff" />
              </LinearGradient>
            )}
            {hasAudio && (
              <View style={styles.audioIndicator}>
                <MaterialIcons name="surround-sound" size={8} color="#66cc33" />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
            {song.description ? (
              <Text style={styles.songDesc} numberOfLines={1}>{song.description}</Text>
            ) : (
              <Text style={styles.songDate}>{formatDate(song.createdAt)}</Text>
            )}
            <View style={styles.songStats}>
              <View style={styles.statChip}>
                <MaterialIcons name="thumb-up" size={10} color="rgba(255,255,255,0.5)" />
                <Text style={styles.statText}>{song.likes}</Text>
              </View>
              <View style={styles.statChip}>
                <MaterialIcons name="headphones" size={10} color="rgba(255,255,255,0.5)" />
                <Text style={styles.statText}>{song.listens}</Text>
              </View>
              {hasAudio && (
                <View style={[styles.statChip, styles.statChipGreen]}>
                  <Text style={styles.statTextGreen}>Ready</Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.songActions}>
            <TouchableOpacity onPress={() => onLike(song.id)} style={styles.actionIconBtn}>
              <MaterialIcons name="favorite-border" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} style={styles.actionIconBtn}>
              <MaterialIcons name="delete-outline" size={18} color="rgba(220,53,69,0.7)" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Vibe Card ───────────────────────────────────────────────
const VibeCard = ({ vibe, onDelete }) => {
  const energyColor = ENERGY_COLORS[vibe.energy] ?? '#66cc33';

  const confirmDelete = () => {
    Alert.alert('Delete Vibe', `Delete "${vibe.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(vibe.id) },
    ]);
  };

  return (
    <View style={styles.vibeCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.04)']}
        style={styles.vibeCardInner}
      >
        {/* Header row */}
        <View style={styles.vibeCardHeader}>
          <View style={styles.vibeNameRow}>
            <View style={[styles.vibeEnergyDot, { backgroundColor: energyColor }]} />
            <Text style={styles.vibeName}>{vibe.name}</Text>
          </View>
          <View style={styles.vibeHeaderRight}>
            <View style={[styles.vibeEnergyBadge, { borderColor: energyColor }]}>
              <Text style={[styles.vibeEnergyText, { color: energyColor }]}>
                {vibe.energy?.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity onPress={confirmDelete} style={styles.vibeDeleteBtn}>
              <MaterialIcons name="delete-outline" size={16} color="rgba(220,53,69,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Moods */}
        {vibe.moods?.length > 0 && (
          <View style={styles.vibeChipRow}>
            {vibe.moods.map((m) => {
              const opt = MOOD_OPTIONS.find((o) => o.value === m);
              return (
                <View key={m} style={styles.moodChip}>
                  <Text style={styles.moodChipText}>{opt?.emoji} {opt?.label ?? m}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Meta row */}
        <View style={styles.vibeMeta}>
          {vibe.tempo && (
            <View style={styles.vibeMetaItem}>
              <MaterialIcons name="speed" size={11} color="rgba(255,255,255,0.4)" />
              <Text style={styles.vibeMetaText}>{vibe.tempo.replace('_', ' ')}</Text>
            </View>
          )}
          {vibe.vocalStyle && (
            <View style={styles.vibeMetaItem}>
              <MaterialIcons name="mic" size={11} color="rgba(255,255,255,0.4)" />
              <Text style={styles.vibeMetaText}>{vibe.vocalStyle.replace('_', ' ')}</Text>
            </View>
          )}
          {vibe.instruments?.length > 0 && (
            <View style={styles.vibeMetaItem}>
              <MaterialIcons name="piano" size={11} color="rgba(255,255,255,0.4)" />
              <Text style={styles.vibeMetaText}>{vibe.instruments.slice(0, 3).join(', ')}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

// ── Multi-select chip row ────────────────────────────────────
const ChipSelect = ({ options, selected, onToggle, multi = true }) => (
  <View style={styles.chipSelectRow}>
    {options.map((opt) => {
      const isOn = multi ? selected.includes(opt.value) : selected === opt.value;
      return (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onToggle(opt.value)}
          style={[styles.selectChip, isOn && styles.selectChipActive]}
          activeOpacity={0.75}
        >

          <Text style={[styles.selectChipText, isOn && styles.selectChipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ── Create Vibe Modal ────────────────────────────────────────
const CreateVibeModal = ({ visible, onClose, onCreate }) => {
  const slideAnim = useRef(new Animated.Value(800)).current;

  const [name, setName] = useState('');
  const [energy, setEnergy] = useState(null);
  const [tempo, setTempo] = useState(null);
  const [vocalStyle, setVocalStyle] = useState(null);
  const [moods, setMoods] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [settings, setSettings] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }).start();
    } else {
      slideAnim.setValue(800);
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setName(''); setEnergy(null); setTempo(null); setVocalStyle(null);
    setMoods([]); setInstruments([]); setSettings([]); setKeywords([]);
  };

  const toggleMulti = (setArr, val) => {
    setArr((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter a vibe name.'); return; }
    if (!energy) { Alert.alert('Missing field', 'Please select an energy level.'); return; }
    if (!tempo) { Alert.alert('Missing field', 'Please select a tempo.'); return; }
    if (!vocalStyle) { Alert.alert('Missing field', 'Please select a vocal style.'); return; }
    if (moods.length === 0) { Alert.alert('Missing field', 'Select at least one mood.'); return; }
    if (instruments.length === 0) { Alert.alert('Missing field', 'Select at least one instrument.'); return; }
    if (settings.length === 0) { Alert.alert('Missing field', 'Select at least one setting.'); return; }
    if (keywords.length === 0) { Alert.alert('Missing field', 'Select at least one keyword.'); return; }

    setLoading(true);
    try {
      await onCreate({ name: name.trim(), energy, tempo, vocalStyle, moods, instruments, settings, keywords });
      onClose();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not create vibe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <LinearGradient
              colors={['rgba(102,204,51,0.2)', 'rgba(4,126,201,0.2)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.modalHeaderGrad}
            >
              <View style={styles.modalHeaderLeft}>
                <MaterialIcons name="graphic-eq" size={20} color="#66cc33" />
                <Text style={styles.modalTitle}>Create Vibe</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Vibe Name */}
              <Text style={styles.fieldLabel}>Vibe Name</Text>
              <View style={styles.textInputWrap}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Midnight Euphoria"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={name}
                  onChangeText={setName}
                  maxLength={60}
                />
              </View>

              {/* Energy */}
              <Text style={styles.fieldLabel}>Energy Level</Text>
              <View style={styles.energyRow}>
                {ENERGY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setEnergy(opt.value)}
                    style={[styles.energyBtn, energy === opt.value && { borderColor: opt.color, backgroundColor: `${opt.color}22` }]}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.energyDot, { backgroundColor: opt.color }]} />
                    <Text style={[styles.energyBtnText, energy === opt.value && { color: opt.color }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tempo */}
              <Text style={styles.fieldLabel}>Tempo</Text>
              <ChipSelect
                options={TEMPO_OPTIONS}
                selected={tempo}
                onToggle={(v) => setTempo(v)}
                multi={false}
              />

              {/* Vocal Style */}
              <Text style={styles.fieldLabel}>Vocal Style</Text>
              <ChipSelect
                options={VOCAL_OPTIONS}
                selected={vocalStyle}
                onToggle={(v) => setVocalStyle(v)}
                multi={false}
              />

              {/* Moods */}
              <Text style={styles.fieldLabel}>Moods <Text style={styles.fieldLabelSub}>(select multiple)</Text></Text>
              <ChipSelect
                options={MOOD_OPTIONS}
                selected={moods}
                onToggle={(v) => toggleMulti(setMoods, v)}
                multi
              />

              {/* Instruments */}
              <Text style={styles.fieldLabel}>Instruments <Text style={styles.fieldLabelSub}>(select multiple)</Text></Text>
              <ChipSelect
                options={INSTRUMENT_OPTIONS}
                selected={instruments}
                onToggle={(v) => toggleMulti(setInstruments, v)}
                multi
              />

              {/* Settings */}
              <Text style={styles.fieldLabel}>Settings / Atmosphere <Text style={styles.fieldLabelSub}>(select multiple)</Text></Text>
              <ChipSelect
                options={SETTING_OPTIONS}
                selected={settings}
                onToggle={(v) => toggleMulti(setSettings, v)}
                multi
              />

              {/* Keywords */}
              <Text style={styles.fieldLabel}>Keywords <Text style={styles.fieldLabelSub}>(select multiple)</Text></Text>
              <ChipSelect
                options={KEYWORD_OPTIONS}
                selected={keywords}
                onToggle={(v) => toggleMulti(setKeywords, v)}
                multi
              />

              {/* Create Button */}
              <TouchableOpacity
                onPress={handleCreate}
                disabled={loading}
                activeOpacity={0.85}
                style={styles.modalCreateBtnWrap}
              >
                <LinearGradient
                  colors={loading ? ['#555', '#444'] : ['#66cc33', '#047ec9']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.modalCreateBtn}
                >
                  {loading
                    ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    : <MaterialIcons name="add-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                  }
                  <Text style={styles.modalCreateBtnText}>
                    {loading ? 'CREATING...' : 'CREATE VIBE'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ── Loading skeleton ────────────────────────────────────────
const LoadingSkeleton = () => (
  <View style={{ paddingHorizontal: 16, gap: 12, marginTop: 16 }}>
    {[0, 1, 2].map((i) => (
      <View key={i} style={[styles.songCard, { opacity: 0.4 }]}>
        <View style={[styles.songCardInner, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
          <View style={[styles.albumArtFallback, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
          <View style={{ flex: 1, gap: 8, paddingHorizontal: 12 }}>
            <View style={{ height: 14, width: '70%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6 }} />
            <View style={{ height: 10, width: '45%', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 6 }} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

// ── Songs empty state ────────────────────────────────────────
const SongsEmpty = () => {
  const navigation = useNavigation();
  const btnScale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
    navigation.navigate('SongCreationScreen');
  };

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <MaterialIcons name="music-note" size={52} color="rgba(255,255,255,0.25)" />
      </View>
      <Text style={styles.emptyTitle}>No creations yet</Text>
      <Text style={styles.emptySubtitle}>Start making your first song now!</Text>
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
          <LinearGradient
            colors={['#66cc33', '#047ec9']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.createBtn}
          >
            <Text style={styles.createBtnText}>CREATE NOW</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ── Vibes empty state ────────────────────────────────────────
const VibesEmpty = ({ onCreate }) => (
  <View style={styles.emptyState}>
    <View style={[styles.emptyIconWrap, { borderColor: 'rgba(102,204,51,0.3)' }]}>
      <MaterialIcons name="graphic-eq" size={52} color="rgba(102,204,51,0.4)" />
    </View>
    <Text style={styles.emptyTitle}>No vibes yet</Text>
    <Text style={styles.emptySubtitle}>Create a vibe to define the sound, mood and energy of your next song.</Text>
    <TouchableOpacity onPress={onCreate} activeOpacity={0.85}>
      <LinearGradient
        colors={['#66cc33', '#047ec9']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.createBtn}
      >
        <Text style={styles.createBtnText}>CREATE VIBE</Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

// ── Playlist Card ────────────────────────────────────────────
const PlaylistCard = ({ playlist, onDelete, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hasBanner = !!playlist.bannerImage;
  const songCount = playlist.songs?.length ?? 0;
  const previewSongs = playlist.songs?.slice(0, 4) ?? [];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  const confirmDelete = () =>
    Alert.alert('Delete Playlist', `Delete "${playlist.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(playlist.id) },
    ]);

  return (
    <Animated.View style={[styles.playlistCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity activeOpacity={0.88} onPress={handlePress} style={{ borderRadius: 18, overflow: 'hidden' }}>
        {/* Banner */}
        <View style={styles.playlistBanner}>
          {hasBanner ? (
            <Image source={{ uri: `${FILE_BASE}${playlist.bannerImage}` }} style={styles.playlistBannerImg} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={['#1a1a2e', '#16213e', '#0f3460']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.playlistBannerImg}
            >
              <MaterialIcons name="queue-music" size={44} color="rgba(255,255,255,0.15)" />
            </LinearGradient>
          )}
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.78)']}
            style={styles.playlistBannerOverlay}
          />
          {/* AI badge */}
          {playlist.bannerType === 'ai_generated' && (
            <View style={styles.aiBadge}>
              <MaterialIcons name="auto-awesome" size={10} color="#66cc33" />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
          {/* Delete button */}
          <TouchableOpacity onPress={confirmDelete} style={styles.playlistDeleteBtn}>
            <MaterialIcons name="delete-outline" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          {/* Name and count overlay */}
          <View style={styles.playlistBannerInfo}>
            <Text style={styles.playlistName} numberOfLines={1}>{playlist.name}</Text>
            <Text style={styles.playlistSongCount}>{songCount} {songCount === 1 ? 'song' : 'songs'}</Text>
          </View>
        </View>
        {/* Songs strip */}
        {songCount > 0 && (
          <View style={styles.playlistSongsStrip}>
            {previewSongs.map((s, i) => (
              <View key={s.id ?? i} style={styles.playlistSongThumb}>
                {s.imagePath ? (
                  <Image source={{ uri: `${FILE_BASE}${s.imagePath}` }} style={styles.playlistSongThumbImg} />
                ) : (
                  <LinearGradient colors={['#66cc33', '#047ec9']} style={styles.playlistSongThumbImg}>
                    <MaterialIcons name="music-note" size={10} color="#fff" />
                  </LinearGradient>
                )}
              </View>
            ))}
            {songCount > 4 && (
              <View style={[styles.playlistSongThumb, styles.playlistSongThumbMore]}>
                <Text style={styles.playlistSongThumbMoreText}>+{songCount - 4}</Text>
              </View>
            )}
            <Text style={styles.playlistStripLabel} numberOfLines={1}>
              {playlist.songs?.map(s => s.title).slice(0, 2).join(', ')}{songCount > 2 ? '...' : ''}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Create Playlist Modal ────────────────────────────────────
const CreatePlaylistModal = ({ visible, onClose, onCreate, userSongs }) => {
  const slideAnim = useRef(new Animated.Value(900)).current;

  const [name, setName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [bannerMode, setBannerMode] = useState('ai');   // 'ai' | 'upload'
  const [bannerPrompt, setBannerPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }).start();
    } else {
      slideAnim.setValue(900);
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setName(''); setSelectedSongs([]); setBannerMode('ai');
    setBannerPrompt(''); setUploadedImage(null); setLoadingStep('');
  };

  const toggleSong = (id) =>
    setSelectedSongs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.85, selectionLimit: 1 });
    if (!result.didCancel && result.assets?.[0]) {
      setUploadedImage(result.assets[0]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Give your playlist a name.'); return; }
    if (selectedSongs.length === 0) { Alert.alert('Required', 'Select at least one song.'); return; }
    if (bannerMode === 'ai' && !bannerPrompt.trim()) { Alert.alert('Required', 'Enter a prompt for the AI banner.'); return; }
    if (bannerMode === 'upload' && !uploadedImage) { Alert.alert('Required', 'Pick a banner image.'); return; }

    setLoading(true);
    try {
      // Step 1 — create playlist
      setLoadingStep('Creating playlist...');
      const raw = await createPlaylist({ name: name.trim() });
      console.log('[Playlist] create response:', JSON.stringify(raw));
      // Handle both { data: Playlist } and plain Playlist response shapes
      const playlist = raw?.data ?? raw;
      if (!playlist?.id) throw new Error(`Playlist ID missing. Response: ${JSON.stringify(raw)}`);

      // Step 2 — add songs
      setLoadingStep('Adding songs...');
      for (const songId of selectedSongs) {
        console.log('[Playlist] adding song', songId, 'to', playlist.id);
        await addSongToPlaylist(playlist.id, songId);
      }

      // Step 3 — banner
      if (bannerMode === 'ai') {
        setLoadingStep('Generating AI banner...');
        await generatePlaylistBanner(playlist.id, { prompt: bannerPrompt.trim() });
      } else {
        setLoadingStep('Uploading banner...');
        const fd = new FormData();
        fd.append('banner', {
          uri: uploadedImage.uri,
          name: uploadedImage.fileName ?? 'banner.jpg',
          type: uploadedImage.type ?? 'image/jpeg',
        });
        await uploadPlaylistBanner(playlist.id, fd);
      }

      await onCreate();
      onClose();
    } catch (err) {
      console.error('[Playlist] creation error:', err?.response?.data ?? err?.message ?? err);
      const msg = err?.response?.data?.message
        ?? err?.message
        ?? 'Could not create playlist.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <LinearGradient
              colors={['rgba(4,126,201,0.25)', 'rgba(102,204,51,0.15)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.modalHeaderGrad}
            >
              <View style={styles.modalHeaderLeft}>
                <MaterialIcons name="playlist-add" size={20} color="#047ec9" />
                <Text style={styles.modalTitle}>Create Playlist</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Playlist Name */}
              <Text style={styles.fieldLabel}>Playlist Name</Text>
              <View style={styles.textInputWrap}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Late Night Vibes"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={name}
                  onChangeText={setName}
                  maxLength={80}
                />
              </View>

              {/* Song Selection */}
              <Text style={styles.fieldLabel}>
                Select Songs{' '}
                <Text style={styles.fieldLabelSub}>({selectedSongs.length} selected)</Text>
              </Text>

              {userSongs.length === 0 ? (
                <View style={styles.noSongsNote}>
                  <MaterialIcons name="info-outline" size={16} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.noSongsNoteText}>No songs yet — create some first.</Text>
                </View>
              ) : (
                <View style={styles.songPickList}>
                  {userSongs.map((song) => {
                    const isOn = selectedSongs.includes(song.id);
                    return (
                      <TouchableOpacity
                        key={song.id}
                        onPress={() => toggleSong(song.id)}
                        style={[styles.songPickItem, isOn && styles.songPickItemActive]}
                        activeOpacity={0.8}
                      >
                        {/* Thumb */}
                        <View style={styles.songPickThumb}>
                          {song.imagePath ? (
                            <Image source={{ uri: `${FILE_BASE}${song.imagePath}` }} style={styles.songPickThumbImg} />
                          ) : (
                            <LinearGradient colors={['#66cc33', '#047ec9']} style={styles.songPickThumbImg}>
                              <MaterialIcons name="music-note" size={13} color="#fff" />
                            </LinearGradient>
                          )}
                        </View>
                        {/* Info */}
                        <Text style={[styles.songPickTitle, isOn && { color: '#fff' }]} numberOfLines={1}>{song.title}</Text>
                        {/* Check */}
                        <View style={[styles.songPickCheck, isOn && styles.songPickCheckActive]}>
                          {isOn && <MaterialIcons name="check" size={13} color="#fff" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Banner Section */}
              <Text style={styles.fieldLabel}>Playlist Banner</Text>

              {/* Mode toggle */}
              <View style={styles.bannerModeRow}>
                <TouchableOpacity
                  onPress={() => setBannerMode('ai')}
                  style={[styles.bannerModeBtn, bannerMode === 'ai' && styles.bannerModeBtnActive]}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="auto-awesome" size={15} color={bannerMode === 'ai' ? '#66cc33' : 'rgba(255,255,255,0.45)'} />
                  <Text style={[styles.bannerModeBtnText, bannerMode === 'ai' && styles.bannerModeBtnTextActive]}>AI Generate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setBannerMode('upload')}
                  style={[styles.bannerModeBtn, bannerMode === 'upload' && styles.bannerModeBtnActiveBlue]}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="upload" size={15} color={bannerMode === 'upload' ? '#047ec9' : 'rgba(255,255,255,0.45)'} />
                  <Text style={[styles.bannerModeBtnText, bannerMode === 'upload' && styles.bannerModeBtnTextActiveBlue]}>Upload Image</Text>
                </TouchableOpacity>
              </View>

              {/* AI prompt */}
              {bannerMode === 'ai' && (
                <View>
                  <View style={[styles.textInputWrap, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                    <TextInput
                      style={[styles.textInput, { textAlignVertical: 'top' }]}
                      placeholder="Describe the banner — e.g. cosmic galaxy with neon soundwaves"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      multiline
                      maxLength={300}
                      value={bannerPrompt}
                      onChangeText={setBannerPrompt}
                    />
                  </View>
                  <Text style={styles.charCount}>{bannerPrompt.length} / 300</Text>
                </View>
              )}

              {/* Upload picker */}
              {bannerMode === 'upload' && (
                <TouchableOpacity onPress={pickImage} style={styles.uploadBannerBtn} activeOpacity={0.8}>
                  {uploadedImage ? (
                    <Image source={{ uri: uploadedImage.uri }} style={styles.uploadBannerPreview} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={['rgba(4,126,201,0.12)', 'rgba(4,126,201,0.06)']} style={styles.uploadBannerEmpty}>
                      <MaterialIcons name="add-photo-alternate" size={32} color="#047ec9" />
                      <Text style={styles.uploadBannerEmptyText}>Tap to pick from gallery</Text>
                      <Text style={styles.uploadBannerEmptySub}>JPG, PNG — landscape recommended</Text>
                    </LinearGradient>
                  )}
                  {uploadedImage && (
                    <View style={styles.uploadBannerReplaceOverlay}>
                      <MaterialIcons name="edit" size={18} color="#fff" />
                      <Text style={styles.uploadBannerReplaceText}>Change</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              {/* Create button */}
              <TouchableOpacity onPress={handleCreate} disabled={loading} activeOpacity={0.85} style={styles.modalCreateBtnWrap}>
                <LinearGradient
                  colors={loading ? ['#555', '#444'] : ['#047ec9', '#66cc33']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.modalCreateBtn}
                >
                  {loading
                    ? <>
                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.modalCreateBtnText}>{loadingStep || 'CREATING...'}</Text>
                      </>
                    : <>
                        <MaterialIcons name="playlist-add" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.modalCreateBtnText}>CREATE PLAYLIST</Text>
                      </>
                  }
                </LinearGradient>
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
const LibraryHomeScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Songs');
  const [searchQuery, setSearchQuery] = useState('');

  // Songs state
  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);

  // Vibes state
  const [vibes, setVibes] = useState([]);
  const [vibesLoading, setVibesLoading] = useState(false);
  const [showCreateVibe, setShowCreateVibe] = useState(false);

  // Playlists state
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  // Animations
  const tabIndicator = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  const contentSlide = useRef(new Animated.Value(0)).current;

  // ── Fetch ────────────────────────────────────────────────
  const fetchSongs = useCallback(async () => {
    setSongsLoading(true);
    try {
      const data = await getMySongs();
      setSongs(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      console.error('fetchSongs:', err);
    } finally {
      setSongsLoading(false);
    }
  }, []);

  const fetchVibes = useCallback(async () => {
    setVibesLoading(true);
    try {
      const data = await getMyVibes();
      setVibes(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      console.error('fetchVibes:', err);
    } finally {
      setVibesLoading(false);
    }
  }, []);

  const fetchPlaylists = useCallback(async () => {
    setPlaylistsLoading(true);
    try {
      const data = await getMyPlaylists();
      setPlaylists(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      console.error('fetchPlaylists:', err);
    } finally {
      setPlaylistsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
    fetchVibes();
    fetchPlaylists();
  }, []);

  // ── Actions ──────────────────────────────────────────────
  const handleDeleteSong = async (id) => {
    try {
      await deleteSong(id);
      setSongs((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Could not delete song.');
    }
  };

  const handleLikeSong = async (id) => {
    try {
      const res = await toggleLikeSong(id);
      setSongs((prev) => prev.map((s) => s.id === id ? { ...s, likes: res.likes } : s));
    } catch (err) {
      console.error('like:', err);
    }
  };

  const handleCreateVibe = async (payload) => {
    const newVibe = await createVibe(payload);
    setVibes((prev) => [newVibe?.data ?? newVibe, ...prev]);
  };

  const handleDeleteVibe = async (id) => {
    try {
      await deleteVibe(id);
      setVibes((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Could not delete vibe.');
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Could not delete playlist.');
    }
  };

  // ── Filtered songs ───────────────────────────────────────
  const filteredSongs = searchQuery.trim()
    ? songs.filter((s) => s.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : songs;

  // ── Tab animation ────────────────────────────────────────
  const animateContentIn = () => {
    contentFade.setValue(0);
    contentSlide.setValue(18);
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const handleTabPress = (tab, index) => {
    setSelectedTab(tab);
    animateContentIn();
    Animated.spring(tabIndicator, { toValue: index, tension: 60, friction: 8, useNativeDriver: true }).start();
  };

  // ── Tab content ──────────────────────────────────────────
  const renderSongsTab = () => (
    <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }], flex: 1 }}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.likedPill}>
          <MaterialIcons name="thumb-up-alt" size={15} color="#fff" />
          <Text style={styles.likedPillText}>Liked</Text>
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={18} color="#aaa" />
          <View style={styles.searchDivider} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={16} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchSongs}>
          <MaterialIcons name="refresh" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {songsLoading ? (
        <LoadingSkeleton />
      ) : filteredSongs.length === 0 ? (
        <SongsEmpty />
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongCard song={item} onDelete={handleDeleteSong} onLike={handleLikeSong} />
          )}
          contentContainerStyle={styles.songList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </Animated.View>
  );

  const renderVibesTab = () => (
    <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }], flex: 1 }}>
      {/* Vibes header */}
      <View style={styles.vibesHeader}>
        <Text style={styles.vibesHeaderTitle}>My Vibes</Text>
        <View style={styles.vibesHeaderRight}>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchVibes}>
            <MaterialIcons name="refresh" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreateVibe(true)} activeOpacity={0.85}>
            <LinearGradient
              colors={['#66cc33', '#047ec9']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.createVibeFab}
            >
              <Text style={styles.createVibeFabText}>New Vibe</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {vibesLoading ? (
        <LoadingSkeleton />
      ) : vibes.length === 0 ? (
        <VibesEmpty onCreate={() => setShowCreateVibe(true)} />
      ) : (
        <FlatList
          data={vibes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VibeCard vibe={item} onDelete={handleDeleteVibe} />
          )}
          contentContainerStyle={styles.songList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </Animated.View>
  );

  const renderPlaylistTab = () => (
    <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }], flex: 1 }}>
      {/* Header */}
      <View style={styles.vibesHeader}>
        <Text style={styles.vibesHeaderTitle}>My Playlists</Text>
        <View style={styles.vibesHeaderRight}>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchPlaylists}>
            <MaterialIcons name="refresh" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreatePlaylist(true)} activeOpacity={0.85}>
            <LinearGradient
              colors={['#047ec9', '#66cc33']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.createVibeFab}
            >
              <Text style={styles.createVibeFabText}>New Playlist</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {playlistsLoading ? (
        <LoadingSkeleton />
      ) : playlists.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { borderColor: 'rgba(4,126,201,0.3)' }]}>
            <MaterialIcons name="playlist-play" size={52} color="rgba(4,126,201,0.5)" />
          </View>
          <Text style={styles.emptyTitle}>No playlists yet</Text>
          <Text style={styles.emptySubtitle}>Curate your songs into playlists with AI-generated banners.</Text>
          <TouchableOpacity onPress={() => setShowCreatePlaylist(true)} activeOpacity={0.85}>
            <LinearGradient colors={['#047ec9', '#66cc33']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtn}>
              <Text style={styles.createBtnText}>CREATE PLAYLIST</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlaylistCard playlist={item} onDelete={handleDeletePlaylist} />
          )}
          contentContainerStyle={styles.songList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        />
      )}
    </Animated.View>
  );

  const renderContent = () => {
    if (selectedTab === 'Songs') return renderSongsTab();
    if (selectedTab === 'Vibe') return renderVibesTab();
    if (selectedTab === 'Playlist') return renderPlaylistTab();
    return null;
  };

  return (
    <ImageBackground
      source={require('../assets/images/image-1.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header coins={25} />

        {/* Segmented tab control */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <Animated.View
              style={[
                styles.tabActivePill,
                {
                  transform: [{
                    translateX: tabIndicator.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [2, (width - 48) / 3 + 2, ((width - 48) / 3) * 2 + 2],
                    }),
                  }],
                  width: (width - 48) / 2.8,
                },
              ]}
            />
            {MAIN_TABS.map((tab, i) => (
              <TouchableOpacity
                key={tab}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab, i)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {renderContent()}
      </View>

      <CreateVibeModal
        visible={showCreateVibe}
        onClose={() => setShowCreateVibe(false)}
        onCreate={handleCreateVibe}
      />
      <CreatePlaylistModal
        visible={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onCreate={fetchPlaylists}
        userSongs={songs}
      />
    </ImageBackground>
  );
};

export default LibraryHomeScreen;

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1 },

  // ── Tabs ───────────────────────────────────────────────────
  tabsWrapper: { paddingHorizontal: 16, paddingVertical: 10 },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 2,
    position: 'relative',
  },
  tabActivePill: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    backgroundColor: '#fff',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 9, zIndex: 1 },
  tabText: { fontSize: 14, fontFamily: 'Oswald-Bold', color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5 },
  tabTextActive: { color: '#1a1a2e' },

  // ── Toolbar ────────────────────────────────────────────────
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 14, gap: 10 },
  likedPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#66cc33', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, gap: 6,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 5,
  },
  likedPillTop: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#66cc33', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, gap: 6,
    alignSelf: 'flex-start', marginLeft: 16, marginTop: 14,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 5,
  },
  likedPillText: { fontFamily: 'Oswald-Bold', color: '#fff', fontSize: 13 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 20,
    paddingHorizontal: 12, height: 40,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', gap: 8,
  },
  searchDivider: { width: 1, height: '55%', backgroundColor: 'rgba(255,255,255,0.3)' },
  searchInput: { flex: 1, color: '#fff', fontFamily: 'Oswald-Regular', fontSize: 13, paddingVertical: 0 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },

  // ── Song list ──────────────────────────────────────────────
  songList: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120 },
  songCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  songCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    gap: 12,
  },
  albumArtWrap: { position: 'relative', },
  albumArt: { width: 56, height: 56, borderRadius: 12 },
  albumArtFallback: {
    width: 56, height: 56, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  audioIndicator: {
    position: 'absolute', bottom: -3, right: -3,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#66cc33',
  },
  songInfo: { flex: 1, gap: 4 },
  songTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 15, letterSpacing: 0.3 },
  songDesc: { color: 'rgba(255,255,255,0.45)', fontFamily: 'Oswald-Regular', fontSize: 12 },
  songDate: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 11 },
  songStats: { flexDirection: 'row', gap: 8, marginTop: 2 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  statChipGreen: { backgroundColor: 'rgba(102,204,51,0.15)', borderWidth: 1, borderColor: 'rgba(102,204,51,0.3)' },
  statText: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'Oswald-Regular' },
  statTextGreen: { color: '#66cc33', fontSize: 10, fontFamily: 'Oswald-Bold' },
  songActions: { gap: 4 },
  actionIconBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Vibes ──────────────────────────────────────────────────
  vibesHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginTop: 14,
  },
  vibesHeaderTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 18, letterSpacing: 0.5 },
  vibesHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  createVibeFab: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, gap: 6,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 5,
  },
  createVibeFabText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 13, padding:10 },

  vibeCard: {
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  vibeCardInner: { margin: 14, gap: 10 },
  vibeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16 },
  vibeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  vibeEnergyDot: { width: 8, height: 8, borderRadius: 4 },
  vibeName: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 16, flex: 1 },
  vibeHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vibeEnergyBadge: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,

  },
  vibeEnergyText: { fontFamily: 'Oswald-Bold', fontSize: 10, letterSpacing: 0.8 },
  vibeDeleteBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(220,53,69,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  vibeChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginLeft: 10 },
  moodChip: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  moodChipText: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Oswald-Regular', fontSize: 11 },
  vibeMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginLeft: 12, marginBottom:10
   },
  vibeMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vibeMetaText: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 11 },

  // ── Empty states ───────────────────────────────────────────
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyIconWrap: {
    width: 108, height: 108, borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 22,
  },
  emptyTitle: { color: '#fff', fontSize: 22, fontFamily: 'Oswald-Bold', letterSpacing: 0.5, marginBottom: 8 },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: 'Oswald-Regular',
    textAlign: 'center', lineHeight: 20, marginBottom: 32,
  },
  createBtn: {
    borderRadius: 30, shadowColor: '#66cc33',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
  },
  createBtnText: {
    color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 16,
    padding: 16, letterSpacing: 1.5,
  },

  // ── Create Vibe Modal ──────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0d1117',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    height: '92%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  modalHeaderGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',

  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  modalTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 18, letterSpacing: 0.5 },
  modalCloseBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10
  },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },

  fieldLabel: {
    color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 13,
    letterSpacing: 0.5, marginBottom: 10, marginTop: 18,
  },
  fieldLabelSub: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 11 },

  textInputWrap: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, height: 48,
    justifyContent: 'center',
  },
  textInput: { color: '#fff', fontFamily: 'Oswald-Regular', fontSize: 14 },

  energyRow: { flexDirection: 'row', gap: 8 },
  energyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
    paddingVertical: 10, gap: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  energyDot: { width: 8, height: 8, borderRadius: 4 },
  energyBtnText: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Bold', fontSize: 12 },

  chipSelectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    gap: 4,
  },
  selectChipActive: {
    backgroundColor: 'rgba(102,204,51,0.22)',
    borderColor: '#66cc33',
  },
  selectChipText: { color: 'rgba(255,255,255,0.55)', fontFamily: 'Oswald-Regular', fontSize: 12 },
  selectChipTextActive: { color: '#fff', fontFamily: 'Oswald-Bold' },
  chipEmoji: { fontSize: 13 },

  modalCreateBtnWrap: { marginTop: 28 },
  modalCreateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, borderRadius: 16,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  modalCreateBtnText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 16, letterSpacing: 1.5 },

  // ── Playlist Card ──────────────────────────────────────────
  playlistCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  playlistBanner: { height: 160, position: 'relative', justifyContent: 'flex-end' },
  playlistBannerImg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center',
  },
  playlistBannerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  aiBadge: {
    position: 'absolute', top: 10, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(102,204,51,0.4)',
  },
  aiBadgeText: { color: '#66cc33', fontFamily: 'Oswald-Bold', fontSize: 9, letterSpacing: 0.8 },
  playlistDeleteBtn: {
    position: 'absolute', top: 10, right: 12,
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  playlistBannerInfo: { paddingHorizontal: 14, paddingBottom: 12, gap: 2 },
  playlistName: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 18, letterSpacing: 0.3, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  playlistSongCount: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Oswald-Regular', fontSize: 12 },
  playlistSongsStrip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 10, gap: 6,
  },
  playlistSongThumb: {
    width: 28, height: 28, borderRadius: 8, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  playlistSongThumbImg: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  playlistSongThumbMore: { backgroundColor: 'rgba(255,255,255,0.1)' },
  playlistSongThumbMoreText: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontFamily: 'Oswald-Bold' },
  playlistStripLabel: { flex: 1, color: 'rgba(255,255,255,0.45)', fontFamily: 'Oswald-Regular', fontSize: 11 },

  // ── Create Playlist Modal extras ───────────────────────────
  noSongsNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14 },
  noSongsNoteText: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 13 },
  songPickList: { gap: 8 },
  songPickItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14,
    padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  songPickItemActive: { backgroundColor: 'rgba(102,204,51,0.12)', borderColor: 'rgba(102,204,51,0.4)' },
  songPickThumb: { width: 40, height: 40, borderRadius: 10, overflow: 'hidden' },
  songPickThumbImg: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  songPickTitle: { flex: 1, color: 'rgba(255,255,255,0.6)', fontFamily: 'Oswald-Regular', fontSize: 13 },
  songPickCheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  songPickCheckActive: { backgroundColor: '#66cc33', borderColor: '#66cc33' },

  bannerModeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  bannerModeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, paddingVertical: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  bannerModeBtnActive: { backgroundColor: 'rgba(102,204,51,0.12)', borderColor: 'rgba(102,204,51,0.4)' },
  bannerModeBtnActiveBlue: { backgroundColor: 'rgba(4,126,201,0.12)', borderColor: 'rgba(4,126,201,0.4)' },
  bannerModeBtnText: { color: 'rgba(255,255,255,0.45)', fontFamily: 'Oswald-Bold', fontSize: 13 },
  bannerModeBtnTextActive: { color: '#66cc33' },
  bannerModeBtnTextActiveBlue: { color: '#047ec9' },

  charCount: { color: 'rgba(255,255,255,0.3)', fontSize: 10, textAlign: 'right', marginTop: 4, fontFamily: 'Oswald-Regular' },

  uploadBannerBtn: {
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(4,126,201,0.3)',
    height: 150, position: 'relative',
  },
  uploadBannerPreview: { width: '100%', height: '100%' },
  uploadBannerEmpty: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  uploadBannerEmptyText: { color: '#047ec9', fontFamily: 'Oswald-Bold', fontSize: 14 },
  uploadBannerEmptySub: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 11 },
  uploadBannerReplaceOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 8,
  },
  uploadBannerReplaceText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 12 },
});
