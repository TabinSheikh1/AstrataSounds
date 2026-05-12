import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ImageBackground, StatusBar, Platform, ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const APP_VERSION  = '1.0.0';
const BUILD_NUMBER = '100';

const CHANGELOG = [
  {
    version: '1.0.0',
    date: 'May 2025',
    tag: 'Current',
    tagColor: '#66cc33',
    changes: [
      { type: 'new',  text: 'AI song generation with 40+ genre support' },
      { type: 'new',  text: 'AI-generated cover art using DALL-E 3' },
      { type: 'new',  text: 'Vibe system — save and reuse style presets' },
      { type: 'new',  text: 'Playlist creation and management' },
      { type: 'new',  text: 'Community leaderboard with points system' },
      { type: 'new',  text: 'Token-based subscription with 3 plan tiers' },
    ],
  },
  {
    version: '0.9.0',
    date: 'March 2025',
    tag: 'Beta',
    tagColor: '#047ec9',
    changes: [
      { type: 'new',  text: 'Beta launch with core song generation' },
      { type: 'new',  text: 'User profiles and authentication' },
      { type: 'fix',  text: 'Audio playback improvements on Android' },
      { type: 'fix',  text: 'Reduced generation failure rate by 60%' },
    ],
  },
];

const TYPE_META = {
  new: { icon: 'add-circle-outline', color: '#66cc33' },
  fix: { icon: 'build-circle',       color: '#047ec9' },
  imp: { icon: 'trending-up',        color: '#f59e0b' },
};

const UpdatesScreen = () => {
  const navigation = useNavigation();
  const [checking, setChecking] = useState(false);
  const [checked, setChecked]   = useState(false);

  const handleCheck = () => {
    setChecking(true);
    setChecked(false);
    setTimeout(() => { setChecking(false); setChecked(true); }, 1800);
  };

  return (
    <ImageBackground source={require('../assets/images/image-1.jpg')} style={s.background} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={s.navBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={s.navTitle}>APP UPDATES</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Version card */}
        <View style={s.versionCard}>
          <View style={s.versionIconWrap}>
            <MaterialIcons name="system-update" size={32} color="#66cc33" />
          </View>
          <View style={s.versionInfo}>
            <Text style={s.versionTitle}>AstrataSound</Text>
            <Text style={s.versionNum}>Version {APP_VERSION} (Build {BUILD_NUMBER})</Text>
          </View>
          <View style={s.upToDateBadge}>
            <MaterialIcons name="check-circle" size={13} color="#66cc33" />
            <Text style={s.upToDateText}>Latest</Text>
          </View>
        </View>

        {/* Check for updates button */}
        <TouchableOpacity
          style={[s.checkBtn, (checking || checked) && s.checkBtnChecked]}
          onPress={handleCheck}
          activeOpacity={0.85}
          disabled={checking}
        >
          {checking ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={s.checkBtnText}>Checking...</Text>
            </>
          ) : checked ? (
            <>
              <MaterialIcons name="check-circle" size={18} color="#fff" />
              <Text style={s.checkBtnText}>You're up to date!</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="refresh" size={18} color="#fff" />
              <Text style={s.checkBtnText}>Check for Updates</Text>
            </>
          )}
        </TouchableOpacity>

        {/* What's new section */}
        <View style={s.sectionRow}>
          <View style={s.accent} />
          <Text style={s.sectionTitle}>What's New</Text>
        </View>

        {CHANGELOG.map((release) => (
          <View key={release.version} style={s.releaseCard}>
            {/* Release header */}
            <View style={s.releaseHeader}>
              <Text style={s.releaseVersion}>v{release.version}</Text>
              <View style={[s.releaseTag, { backgroundColor: release.tagColor + '22', borderColor: release.tagColor + '44' }]}>
                <Text style={[s.releaseTagText, { color: release.tagColor }]}>{release.tag}</Text>
              </View>
              <Text style={s.releaseDate}>{release.date}</Text>
            </View>

            <View style={s.releaseDivider} />

            {release.changes.map((c, i) => {
              const meta = TYPE_META[c.type] ?? TYPE_META.new;
              return (
                <View key={i} style={s.changeRow}>
                  <MaterialIcons name={meta.icon} size={15} color={meta.color} style={{ marginTop: 1 }} />
                  <Text style={s.changeText}>{c.text}</Text>
                </View>
              );
            })}
          </View>
        ))}

      </ScrollView>
    </ImageBackground>
  );
};

export default UpdatesScreen;

const s = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 58 : (StatusBar.currentHeight ?? 24) + 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  navTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 17, letterSpacing: 1.5 },

  scroll: { paddingHorizontal: 16, paddingBottom: 80, paddingTop: 4 },

  versionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    padding: 16, marginBottom: 14,
  },
  versionIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(102,204,51,0.12)', borderWidth: 1, borderColor: 'rgba(102,204,51,0.2)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  versionInfo: { flex: 1 },
  versionTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 18, marginBottom: 3 },
  versionNum: { color: 'rgba(255,255,255,0.45)', fontFamily: 'Oswald-Regular', fontSize: 12 },
  upToDateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(102,204,51,0.12)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(102,204,51,0.22)',
    paddingHorizontal: 9, paddingVertical: 5,
  },
  upToDateText: { color: '#66cc33', fontFamily: 'Oswald-Bold', fontSize: 11 },

  checkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#66cc33', borderRadius: 14, paddingVertical: 14,
    marginBottom: 24,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  checkBtnChecked: { backgroundColor: '#047ec9', shadowColor: '#047ec9' },
  checkBtnText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 15, letterSpacing: 0.5 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  accent: { width: 3, height: 20, borderRadius: 2, backgroundColor: '#66cc33' },
  sectionTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 17, letterSpacing: 0.3 },

  releaseCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 16, marginBottom: 14,
  },
  releaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  releaseVersion: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 16 },
  releaseTag: {
    borderRadius: 7, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  releaseTagText: { fontFamily: 'Oswald-Bold', fontSize: 10, letterSpacing: 0.5 },
  releaseDate: { color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald-Regular', fontSize: 12, marginLeft: 'auto' },
  releaseDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 12 },
  changeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  changeText: { flex: 1, color: 'rgba(255,255,255,0.7)', fontFamily: 'Oswald-Regular', fontSize: 13, lineHeight: 19 },
});
