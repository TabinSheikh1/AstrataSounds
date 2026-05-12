import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ImageBackground, StatusBar, Platform, Linking,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const LAST_UPDATED = 'May 1, 2025';

const SECTIONS = [
  {
    icon: 'storage',
    title: '1. Information We Collect',
    color: '#66cc33',
    items: [
      { label: 'Account Data', desc: 'Name, email address, and password when you register.' },
      { label: 'Profile Data', desc: 'Optional profile picture, bio, and preferences you provide.' },
      { label: 'Usage Data', desc: 'Songs generated, playlists created, genres selected, and in-app interactions.' },
      { label: 'Payment Data', desc: 'Billing information processed securely via Stripe. We never store full card numbers.' },
      { label: 'Device Data', desc: 'Device type, OS version, and app version for compatibility and debugging.' },
    ],
  },
  {
    icon: 'insights',
    title: '2. How We Use Your Data',
    color: '#047ec9',
    items: [
      { label: 'Service Delivery', desc: 'To process song generation requests and manage your subscription.' },
      { label: 'Personalization', desc: 'To improve AI suggestions based on your genre and style preferences.' },
      { label: 'Analytics', desc: 'Aggregated, anonymized usage statistics to improve the platform.' },
      { label: 'Support', desc: 'To respond to your inquiries and resolve issues.' },
      { label: 'Security', desc: 'To detect fraud, abuse, and ensure platform integrity.' },
    ],
  },
  {
    icon: 'share',
    title: '3. Third-Party Services',
    color: '#f59e0b',
    items: [
      { label: 'Stripe', desc: 'Payment processing. Subject to Stripe\'s own privacy policy.' },
      { label: 'AWS / Cloud', desc: 'Secure cloud infrastructure for data storage and processing.' },
      { label: 'OpenAI', desc: 'AI content generation. Prompts are sent to OpenAI APIs per their data policies.' },
      { label: 'Analytics', desc: 'Anonymized crash and usage reporting to improve app stability.' },
    ],
  },
  {
    icon: 'security',
    title: '4. Data Security',
    color: '#9c27b0',
    body: 'We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, and regular security audits. While we take every precaution, no system is 100% secure. Report security concerns to security@astratasounds.com.',
  },
  {
    icon: 'person',
    title: '5. Your Rights',
    color: '#e91e63',
    items: [
      { label: 'Access', desc: 'Request a copy of the personal data we hold about you.' },
      { label: 'Correction', desc: 'Update or correct inaccurate information in your profile.' },
      { label: 'Deletion', desc: 'Request deletion of your account and associated data.' },
      { label: 'Portability', desc: 'Export your generated songs and profile data.' },
      { label: 'Opt-out', desc: 'Unsubscribe from marketing communications at any time.' },
    ],
  },
  {
    icon: 'child-care',
    title: '6. Children\'s Privacy',
    color: '#ff9800',
    body: 'AstrataSound is not intended for users under 13 years of age. We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us immediately.',
  },
  {
    icon: 'update',
    title: '7. Policy Updates',
    body: 'We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use of the App after changes constitutes acceptance of the updated policy.',
  },
];

const PrivacyScreen = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground source={require('../assets/images/image-1.jpg')} style={s.background} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={s.navBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={s.navTitle}>PRIVACY POLICY</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header card */}
        <View style={s.headerCard}>
          <View style={s.headerIconWrap}>
            <MaterialIcons name="shield" size={32} color="#66cc33" />
          </View>
          <View style={s.headerText}>
            <Text style={s.headerTitle}>Privacy Policy</Text>
            <Text style={s.headerSub}>Last updated: {LAST_UPDATED}</Text>
          </View>
        </View>

        <Text style={s.intro}>
          Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we keep it safe.
        </Text>

        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.sectionCard}>
            {/* Section title */}
            <View style={s.sectionHeader}>
              <View style={[s.sectionIcon, { backgroundColor: (sec.color ?? '#66cc33') + '22' }]}>
                <MaterialIcons name={sec.icon} size={16} color={sec.color ?? '#66cc33'} />
              </View>
              <Text style={s.sectionTitle}>{sec.title}</Text>
            </View>

            {/* Body text or item list */}
            {sec.body ? (
              <Text style={s.bodyText}>{sec.body}</Text>
            ) : (
              sec.items?.map((item, i) => (
                <View key={i} style={s.itemRow}>
                  <View style={s.itemDot} />
                  <View style={s.itemContent}>
                    <Text style={s.itemLabel}>{item.label}</Text>
                    <Text style={s.itemDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        ))}

        {/* Contact row */}
        <TouchableOpacity
          style={s.contactCard}
          onPress={() => Linking.openURL('mailto:privacy@astratasounds.com').catch(() => {})}
          activeOpacity={0.8}
        >
          <MaterialIcons name="email" size={20} color="#66cc33" />
          <View style={{ flex: 1 }}>
            <Text style={s.contactTitle}>Privacy Questions?</Text>
            <Text style={s.contactEmail}>privacy@astratasounds.com</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.35)" />
        </TouchableOpacity>

        <Text style={s.footer}>© 2025 AstrataSound. All rights reserved.</Text>

      </ScrollView>
    </ImageBackground>
  );
};

export default PrivacyScreen;

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
  navTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 15, letterSpacing: 1.5, flex: 1, textAlign: 'center' },

  scroll: { paddingHorizontal: 16, paddingBottom: 80, paddingTop: 4 },

  headerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    padding: 16, marginBottom: 16,
  },
  headerIconWrap: {
    width: 58, height: 58, borderRadius: 17,
    backgroundColor: 'rgba(102,204,51,0.12)', borderWidth: 1, borderColor: 'rgba(102,204,51,0.2)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  headerText: { flex: 1 },
  headerTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 20, marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald-Regular', fontSize: 12 },

  intro: {
    color: 'rgba(255,255,255,0.55)', fontFamily: 'Oswald-Regular', fontSize: 13, lineHeight: 21,
    marginBottom: 16, paddingHorizontal: 2,
  },

  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 16, marginBottom: 10,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIcon: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  sectionTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 14, flex: 1 },
  bodyText: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Oswald-Regular', fontSize: 13, lineHeight: 20 },

  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#66cc33', marginTop: 6, flexShrink: 0 },
  itemContent: { flex: 1 },
  itemLabel: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 13, marginBottom: 2 },
  itemDesc: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 12, lineHeight: 18 },

  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(102,204,51,0.08)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(102,204,51,0.2)',
    padding: 16, marginTop: 6, marginBottom: 16,
  },
  contactTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 14 },
  contactEmail: { color: '#66cc33', fontFamily: 'Oswald-Regular', fontSize: 12, marginTop: 2 },

  footer: {
    color: 'rgba(255,255,255,0.25)', fontFamily: 'Oswald-Regular', fontSize: 12, textAlign: 'center',
  },
});
