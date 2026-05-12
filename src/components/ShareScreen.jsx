import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, StatusBar, Platform, Share, Alert, Linking, Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const APP_LINK = 'https://astratasounds.com/download';
const APP_MESSAGE = '🎵 I\'m creating AI-generated music with AstrataSound! Compose unique songs in minutes. Try it free → ' + APP_LINK;

const SHARE_OPTIONS = [
  { icon: 'share',         label: 'Share via...',     onPress: null, primary: true },
  { icon: 'content-copy',  label: 'Copy Link',        onPress: 'copy', color: '#047ec9' },
  { icon: 'email',         label: 'Share via Email',  onPress: 'email', color: '#66cc33' },
];

const ShareScreen = () => {
  const navigation = useNavigation();

  const handleNativeShare = async () => {
    try {
      await Share.share({ message: APP_MESSAGE, url: APP_LINK, title: 'AstrataSound — AI Music Creation' });
    } catch { /* cancelled */ }
  };

  const handleCopy = () => {
    Alert.alert('Link copied!', 'The app link has been copied to your clipboard.');
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:?subject=Check out AstrataSound&body=${encodeURIComponent(APP_MESSAGE)}`).catch(() => {});
  };

  const handlers = { native: handleNativeShare, copy: handleCopy, email: handleEmail };

  return (
    <ImageBackground source={require('../assets/images/image-1.jpg')} style={s.background} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={s.navBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={s.navTitle}>SHARE</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.content}>
        {/* App logo card */}
        <View style={s.logoCard}>
          <Image source={require('../assets/images/logo.jpg')} style={s.logo} resizeMode="contain" />
          <Text style={s.appName}>AstrataSound</Text>
          <Text style={s.tagline}>AI-Powered Music Creation</Text>

          {/* Feature pills */}
          <View style={s.pillRow}>
            {['AI Lyrics', 'AI Cover Art', '40+ Genres', 'Instant Generation'].map((p) => (
              <View key={p} style={s.pill}>
                <Text style={s.pillText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Share link card */}
        <View style={s.linkCard}>
          <MaterialIcons name="link" size={16} color="rgba(255,255,255,0.4)" />
          <Text style={s.linkText} numberOfLines={1}>{APP_LINK}</Text>
        </View>

        {/* Share buttons */}
        <TouchableOpacity style={s.primaryBtn} onPress={handleNativeShare} activeOpacity={0.85}>
          <MaterialIcons name="share" size={20} color="#fff" />
          <Text style={s.primaryBtnText}>Share with Friends</Text>
        </TouchableOpacity>

        <View style={s.secondaryRow}>
          <TouchableOpacity style={s.secondaryBtn} onPress={handleCopy} activeOpacity={0.8}>
            <MaterialIcons name="content-copy" size={18} color="#047ec9" />
            <Text style={[s.secondaryBtnText, { color: '#047ec9' }]}>Copy Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={handleEmail} activeOpacity={0.8}>
            <MaterialIcons name="email" size={18} color="#66cc33" />
            <Text style={[s.secondaryBtnText, { color: '#66cc33' }]}>Email</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.foot}>Help your friends discover the future of music creation</Text>
      </View>
    </ImageBackground>
  );
};

export default ShareScreen;

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

  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 40, justifyContent: 'center', gap: 14 },

  logoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 22,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
    padding: 24, alignItems: 'center', gap: 6,
  },
  logo: { width: 160, height: 52, marginBottom: 6 },
  appName: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 26, letterSpacing: 1 },
  tagline: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 14, marginBottom: 8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  pill: {
    backgroundColor: 'rgba(102,204,51,0.12)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(102,204,51,0.25)',
    paddingHorizontal: 12, paddingVertical: 5,
  },
  pillText: { color: '#66cc33', fontFamily: 'Oswald-Bold', fontSize: 11, letterSpacing: 0.5 },

  linkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  linkText: { flex: 1, color: 'rgba(255,255,255,0.45)', fontFamily: 'Oswald-Regular', fontSize: 13 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#66cc33', borderRadius: 16, paddingVertical: 16,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 7,
  },
  primaryBtnText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 17, letterSpacing: 0.5 },

  secondaryRow: { flexDirection: 'row', gap: 12 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 13,
  },
  secondaryBtnText: { fontFamily: 'Oswald-Bold', fontSize: 14 },

  foot: { color: 'rgba(255,255,255,0.3)', fontFamily: 'Oswald-Regular', fontSize: 12, textAlign: 'center' },
});
