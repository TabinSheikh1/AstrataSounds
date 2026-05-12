import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ImageBackground, StatusBar, Platform, TextInput, Alert, Linking,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const CONTACTS = [
  { icon: 'email',    label: 'Email Us',       value: 'support@astratasounds.com', action: 'mailto:support@astratasounds.com', color: '#66cc33' },
  { icon: 'discord',  label: 'Join Discord',    value: 'discord.gg/astratasounds',   action: 'https://discord.gg/astratasounds',  color: '#5865F2' },
  { icon: 'language', label: 'Visit Website',   value: 'www.astratasounds.com',      action: 'https://www.astratasounds.com',     color: '#047ec9' },
];

const ContactScreen = () => {
  const navigation = useNavigation();
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields before sending.');
      return;
    }
    const subject = encodeURIComponent(`Message from ${name.trim()}`);
    const body    = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`
    );
    Linking.openURL(`mailto:support@astratasounds.com?subject=${subject}&body=${body}`)
      .then(() => {
        setName(''); setEmail(''); setMessage('');
      })
      .catch(() =>
        Alert.alert('Could not open email app', 'Please email us directly at support@astratasounds.com')
      );
  };

  return (
    <ImageBackground
      source={require('../assets/images/image-1.jpg')}
      style={s.background}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Nav bar */}
      <View style={s.navBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={s.navTitle}>CONTACT US</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={s.heroCard}>
          <View style={s.heroIconWrap}>
            <MaterialIcons name="support-agent" size={34} color="#66cc33" />
          </View>
          <View style={s.heroText}>
            <Text style={s.heroTitle}>We're here to help</Text>
            <Text style={s.heroSub}>Reach out anytime — we respond within 24 hours</Text>
          </View>
        </View>

        {/* Contact options */}
        <View style={s.sectionRow}>
          <View style={s.accent} />
          <Text style={s.sectionTitle}>Reach Us Directly</Text>
        </View>

        {CONTACTS.map((c) => (
          <TouchableOpacity
            key={c.label}
            style={s.contactCard}
            onPress={() => Linking.openURL(c.action).catch(() => {})}
            activeOpacity={0.8}
          >
            <View style={[s.contactIcon, { backgroundColor: c.color + '22', borderColor: c.color + '44' }]}>
              <MaterialIcons name={c.icon} size={22} color={c.color} />
            </View>
            <View style={s.contactInfo}>
              <Text style={s.contactLabel}>{c.label}</Text>
              <Text style={s.contactValue}>{c.value}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>
        ))}

        {/* Send message form */}
        <View style={s.sectionRow}>
          <View style={s.accent} />
          <Text style={s.sectionTitle}>Send a Message</Text>
        </View>

        <View style={s.inputCard}>
          <Text style={s.inputLabel}>Your Name</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Alex Carter"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={s.inputCard}>
          <Text style={s.inputLabel}>Email Address</Text>
          <TextInput
            style={s.input}
            placeholder="your@email.com"
            placeholderTextColor="rgba(255,255,255,0.35)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={s.inputCard}>
          <Text style={s.inputLabel}>Message</Text>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="Tell us how we can help..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            multiline
            maxLength={500}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{message.length} / 500</Text>
        </View>

        <TouchableOpacity style={s.sendBtn} onPress={handleSend} activeOpacity={0.85}>
          <MaterialIcons name="send" size={18} color="#fff" />
          <Text style={s.sendBtnText}>Send Message</Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
};

export default ContactScreen;

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

  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    padding: 16, marginBottom: 24,
  },
  heroIconWrap: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: 'rgba(102,204,51,0.12)', borderWidth: 1, borderColor: 'rgba(102,204,51,0.2)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  heroText: { flex: 1 },
  heroTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 18, marginBottom: 4 },
  heroSub: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 12, lineHeight: 18 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 4 },
  accent: { width: 3, height: 20, borderRadius: 2, backgroundColor: '#66cc33' },
  sectionTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 17, letterSpacing: 0.3 },

  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 14, marginBottom: 10,
  },
  contactIcon: { width: 46, height: 46, borderRadius: 13, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1 },
  contactLabel: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 14, marginBottom: 2 },
  contactValue: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 12 },

  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 14, marginBottom: 10,
  },
  inputLabel: { color: 'rgba(255,255,255,0.55)', fontFamily: 'Oswald-Bold', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  input: { color: '#fff', fontFamily: 'Oswald-Regular', fontSize: 14 },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { color: 'rgba(255,255,255,0.3)', fontFamily: 'Oswald-Regular', fontSize: 10, textAlign: 'right', marginTop: 6 },

  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#66cc33', borderRadius: 14, paddingVertical: 15,
    marginTop: 8,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  sendBtnText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 16, letterSpacing: 0.8 },
});
