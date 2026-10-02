import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from './Header';
import { useSubscription } from '../hooks/useSubscription';
import {
  getCurrentCompetition,
  getCompetitionEntries,
  submitCompetitionEntry,
  toggleCompetitionVote,
} from '../api/competitionsService';
import { getMySongs } from '../api/songsService';
import { getErrorMessage } from '../utils/errorHandler';
import { SERVER_URL as FILE_BASE } from '../config/api';

const unwrap = (res) => (Array.isArray(res) ? res : res?.data ?? res ?? null);

const formatCountdown = (endsAt) => {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return 'Ended';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

// ── Ranked entry row ─────────────────────────────────────────
const EntryRow = ({ entry, rankIndex, isActive, onVote, onPress, onPressCreator }) => {
  const medalColor = rankIndex === 0 ? '#FFD700' : rankIndex === 1 ? '#C0C0C0' : rankIndex === 2 ? '#CD7F32' : null;

  return (
    <TouchableOpacity style={s.entryRow} activeOpacity={0.85} onPress={onPress}>
      <Text style={[s.entryRank, medalColor && { color: medalColor }]}>
        {String(entry.rank).padStart(2, '0')}
      </Text>

      {entry.imagePath ? (
        <Image source={{ uri: `${FILE_BASE}${entry.imagePath}` }} style={s.entryArt} />
      ) : (
        <LinearGradient colors={['#66cc33', '#047ec9']} style={s.entryArt}>
          <MaterialIcons name="music-note" size={16} color="#fff" />
        </LinearGradient>
      )}

      <View style={s.entryInfo}>
        <Text style={s.entryTitle} numberOfLines={1}>{entry.title}</Text>
        <TouchableOpacity onPress={onPressCreator} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
          <Text style={s.entryCreator} numberOfLines={1}>
            {entry.firstName} {entry.lastName}{entry.isOwnEntry ? ' · You' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {isActive && !entry.isOwnEntry ? (
        <TouchableOpacity onPress={() => onVote(entry.entryId)} style={s.voteBtn} activeOpacity={0.7}>
          <MaterialIcons
            name={entry.hasVotedByMe ? 'favorite' : 'favorite-border'}
            size={18}
            color={entry.hasVotedByMe ? '#66cc33' : 'rgba(255,255,255,0.5)'}
          />
          <Text style={[s.voteCount, entry.hasVotedByMe && { color: '#66cc33' }]}>{entry.votesCount}</Text>
        </TouchableOpacity>
      ) : (
        <View style={s.voteBtn}>
          <MaterialIcons name="favorite" size={18} color="rgba(255,255,255,0.3)" />
          <Text style={s.voteCount}>{entry.votesCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ── Submit-to-competition modal (single-select song picker) ──
const SubmitEntryModal = ({ visible, onClose, onSubmitted }) => {
  const slideAnim = useRef(new Animated.Value(600)).current;
  const [songs, setSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }).start();
      loadSongs();
    } else {
      slideAnim.setValue(600);
      setSelectedId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadSongs = async () => {
    setLoadingSongs(true);
    try {
      const res = await getMySongs();
      const list = unwrap(res) ?? [];
      setSongs((Array.isArray(list) ? list : []).filter((song) => !!song.audioPath));
    } catch {
      setSongs([]);
    } finally {
      setLoadingSongs(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedId) { Alert.alert('Pick a song', 'Select a song to enter into the competition.'); return; }
    setSubmitting(true);
    try {
      await submitCompetitionEntry(selectedId);
      onSubmitted();
      onClose();
    } catch (err) {
      Alert.alert('Could not submit', getErrorMessage(err, 'Something went wrong submitting your entry.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <Animated.View style={[s.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={s.modalHeader}>
            <MaterialIcons name="emoji-events" size={20} color="#FFD700" />
            <Text style={s.modalTitle}>Submit to Competition</Text>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
              <MaterialIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>
          <Text style={s.modalSub}>Pick one finished song to enter into this round</Text>

          {loadingSongs ? (
            <ActivityIndicator size="small" color="#66cc33" style={{ marginVertical: 24 }} />
          ) : songs.length === 0 ? (
            <View style={s.modalEmpty}>
              <MaterialIcons name="info-outline" size={20} color="rgba(255,255,255,0.35)" />
              <Text style={s.modalEmptyText}>No finished songs yet — create one first.</Text>
            </View>
          ) : (
            <FlatList
              data={songs}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isOn = selectedId === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedId(item.id)}
                    style={[s.songPickItem, isOn && s.songPickItemActive]}
                    activeOpacity={0.8}
                  >
                    {item.imagePath ? (
                      <Image source={{ uri: `${FILE_BASE}${item.imagePath}` }} style={s.songPickThumb} />
                    ) : (
                      <LinearGradient colors={['#66cc33', '#047ec9']} style={s.songPickThumb}>
                        <MaterialIcons name="music-note" size={13} color="#fff" />
                      </LinearGradient>
                    )}
                    <Text style={[s.songPickTitle, isOn && { color: '#fff' }]} numberOfLines={1}>{item.title}</Text>
                    <View style={[s.songPickCheck, isOn && s.songPickCheckActive]}>
                      {isOn && <MaterialIcons name="check" size={13} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={s.submitBtn} activeOpacity={0.85}>
            <LinearGradient colors={['#66cc33', '#047ec9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={s.submitBtnGrad}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.submitBtnText}>Submit Entry</Text>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ── Main screen ────────────────────────────────────────────────
const CompetitionsScreen = () => {
  const navigation = useNavigation();
  const { plan } = useSubscription();
  const isSparkPlan = !plan || plan.tier === 'spark';

  const [competition, setCompetition] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [, forceTick] = useState(0);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const currentRes = await getCurrentCompetition();
      const current = unwrap(currentRes);
      setCompetition(current);

      if (current?.id) {
        const entriesRes = await getCompetitionEntries(current.id, { limit: 50 });
        const list = unwrap(entriesRes);
        setEntries(Array.isArray(list) ? list : []);
      }
    } catch {
      setCompetition(null);
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Re-render every 30s so the countdown stays roughly live without a heavy timer.
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = competition?.status === 'active';

  const handleVote = async (entryId) => {
    try {
      const res = await toggleCompetitionVote(entryId);
      const result = unwrap(res);
      setEntries((prev) => {
        const updated = prev.map((e) =>
          e.entryId === entryId
            ? { ...e, hasVotedByMe: result?.voted ?? !e.hasVotedByMe, votesCount: result?.votesCount ?? e.votesCount }
            : e,
        );
        const sorted = [...updated].sort((a, b) => b.votesCount - a.votesCount || new Date(a.submittedAt) - new Date(b.submittedAt));
        return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
      });
    } catch (err) {
      Alert.alert('Could not vote', getErrorMessage(err, 'Something went wrong casting your vote.'));
    }
  };

  const handleSubmitPress = () => {
    if (isSparkPlan) {
      navigation.navigate('PricingScreen');
      return;
    }
    setShowSubmitModal(true);
  };

  const hasEntered = !!competition?.myEntry;

  return (
    <ImageBackground source={require('../assets/images/image-1.jpg')} style={s.background} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Header />

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#66cc33" />
          <Text style={s.loadingText}>Loading competition...</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.entryId}
          renderItem={({ item, index }) => (
            <EntryRow
              entry={item}
              rankIndex={index}
              isActive={isActive}
              onVote={handleVote}
              onPress={() => navigation.navigate('SongDetailScreen', {
                song: {
                  id: item.songId,
                  title: item.title,
                  imagePath: item.imagePath,
                  audioPath: item.audioPath,
                },
              })}
              onPressCreator={() => navigation.navigate('UserProfileScreen', { userId: item.userId, firstName: item.firstName, lastName: item.lastName })}
            />
          )}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#66cc33" />}
          ListHeaderComponent={
            <>
              <View style={s.banner}>
                <LinearGradient
                  colors={isActive ? ['#66cc33', '#FFD700', '#047ec9'] : ['#666', '#999']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.bannerTopLine}
                />
                <LinearGradient
                  colors={['rgba(255,215,0,0.12)', 'rgba(4,126,201,0.08)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <View style={s.bannerGrad}>
                    <View style={s.bannerIconWrap}>
                      <MaterialIcons name="emoji-events" size={32} color="#FFD700" />
                    </View>
                    <View style={s.bannerText}>
                      <Text style={s.bannerTitle}>{isActive ? 'COMPETITION' : 'FINAL RESULTS'}</Text>
                      <Text style={s.bannerSub}>
                        {competition ? `Round #${competition.roundNumber} · ${isActive ? formatCountdown(competition.endsAt) : 'Round ended'}` : ''}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {isActive && (
                hasEntered ? (
                  <View style={s.enteredNote}>
                    <MaterialIcons name="check-circle" size={16} color="#66cc33" />
                    <Text style={s.enteredNoteText}>You're entered in this round</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handleSubmitPress} style={s.submitCta} activeOpacity={0.85}>
                    <LinearGradient colors={['#66cc33', '#047ec9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <View style={s.submitCtaGrad}>
                        <MaterialIcons name="add-circle-outline" size={16} color="#fff" />
                        <Text style={s.submitCtaText}>
                          {isSparkPlan ? 'Upgrade to Enter' : 'Submit to Competition'}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                )
              )}

              {entries.length > 0 && (
                <View style={s.dividerRow}>
                  <View style={s.dividerChip}>
                    <MaterialIcons name="format-list-numbered" size={12} color="#66cc33" />
                    <Text style={s.dividerLabel}>RANKINGS</Text>
                  </View>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <View style={s.centered}>
              <MaterialIcons name="emoji-events" size={40} color="rgba(255,215,0,0.4)" />
              <Text style={s.emptyTitle}>No entries yet</Text>
              <Text style={s.emptySub}>Be the first to submit a song to this round!</Text>
            </View>
          }
        />
      )}

      <SubmitEntryModal
        visible={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmitted={() => load(true)}
      />
    </ImageBackground>
  );
};

export default CompetitionsScreen;

const s = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%', backgroundColor: '#0d1117' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 60 },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 14 },
  emptyTitle: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Oswald-Bold', fontSize: 16, marginTop: 8 },
  emptySub: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 12, textAlign: 'center', paddingHorizontal: 40 },
  listContent: { paddingBottom: 100 },

  banner: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 14, borderRadius: 20, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
  },
  bannerTopLine: { height: 2 },
  bannerGrad: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  bannerIconWrap: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,215,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)', justifyContent: 'center', alignItems: 'center',
  },
  bannerText: { flex: 1 },
  bannerTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 20, letterSpacing: 1.5, marginBottom: 3 },
  bannerSub: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 12 },

  submitCta: { marginHorizontal: 16, marginBottom: 14, borderRadius: 14, overflow: 'hidden' },
  submitCtaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
  submitCtaText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 13, letterSpacing: 0.5 },

  enteredNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 14,
    backgroundColor: 'rgba(102,204,51,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(102,204,51,0.25)',
    paddingVertical: 12, paddingHorizontal: 14,
  },
  enteredNoteText: { color: '#66cc33', fontFamily: 'Oswald-Regular', fontSize: 12 },

  dividerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  dividerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(102,204,51,0.1)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(102,204,51,0.2)',
  },
  dividerLabel: { color: '#66cc33', fontFamily: 'Oswald-Bold', fontSize: 10, letterSpacing: 1.5 },

  entryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 16, marginBottom: 8, padding: 10,
  },
  entryRank: { width: 24, fontFamily: 'Oswald-Bold', fontSize: 13, color: 'rgba(255,255,255,0.35)' },
  entryArt: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  entryInfo: { flex: 1 },
  entryTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 13 },
  entryCreator: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 11, marginTop: 2 },
  voteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  voteCount: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Bold', fontSize: 13 },

  // Submit modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#0d1117', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  modalTitle: { flex: 1, color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 17 },
  modalCloseBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalSub: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 12, marginBottom: 16 },
  modalEmpty: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  modalEmptyText: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 12, textAlign: 'center' },

  songPickItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 10, marginBottom: 8,
  },
  songPickItemActive: { backgroundColor: 'rgba(102,204,51,0.1)', borderColor: 'rgba(102,204,51,0.4)' },
  songPickThumb: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  songPickTitle: { flex: 1, color: 'rgba(255,255,255,0.75)', fontFamily: 'Oswald-Regular', fontSize: 13 },
  songPickCheck: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  songPickCheckActive: { backgroundColor: '#66cc33', borderColor: '#66cc33' },

  submitBtn: { marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  submitBtnGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  submitBtnText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 14, letterSpacing: 0.5 },
});
