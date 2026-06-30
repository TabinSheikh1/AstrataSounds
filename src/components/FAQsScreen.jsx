import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ImageBackground, StatusBar, Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const FAQS = [
  {
    category: 'Getting Started',
    icon: 'rocket-launch',
    color: '#66cc33',
    items: [
      {
        q: 'How does AI song generation work?',
        a: 'AstrataSound uses advanced AI models to compose original music based on your style prompt, selected genre, mood, and lyrics. The AI processes your inputs and generates a unique song — no two songs are the same.',
      },
      {
        q: 'How long does generation take?',
        a: 'Most songs are generated within 2–5 minutes. Complex arrangements or high server load may occasionally take longer. You\'ll see a live progress indicator while your song is being created.',
      },
      {
        q: 'Can I write my own lyrics?',
        a: 'Absolutely! You can write manual lyrics in the Lyrics tab, or let the AI write them for you by selecting a mood. You can also leave lyrics empty for a fully AI-driven composition.',
      },
    ],
  },
  {
    category: 'Tokens & Plans',
    icon: 'bolt',
    color: '#047ec9',
    items: [
      {
        q: 'How many songs do I get per month?',
        a: 'Monthly song credits depend on your plan:\n• Spark (Free): 5 songs\n• Basic ($14.99/mo): 10 songs\n• Pro ($39.99/mo): 30 songs\n• Creator ($79.99/mo): 70 songs\n• Commercial ($149.99/mo): 150 songs\n\nFull songs cost 1 credit. A 30s reel costs 0.5 credits. A 15s reel costs 0.25 credits.',
      },
      {
        q: 'What happens when I run out of credits?',
        a: 'Your credits reset at the start of each billing cycle. If you run out early, you can upgrade your plan or buy a one-time credit pack (5, 15, or 50 songs). Credit pack credits never expire.',
      },
      {
        q: 'Do unused credits roll over?',
        a: 'Monthly subscription credits do not roll over. Credit pack credits (one-time purchases) never expire and carry over indefinitely.',
      },
    ],
  },
  {
    category: 'Music & Rights',
    icon: 'music-note',
    color: '#f59e0b',
    items: [
      {
        q: 'Can I use generated songs commercially?',
        a: 'Creator and Commercial plan subscribers receive a full commercial usage license for all generated songs. Free (Spark) and Basic plan songs are for personal use only. Pro plan includes advanced controls but not commercial licensing.',
      },
      {
        q: 'Do I own the songs I create?',
        a: 'Yes. Songs you generate belong to you under the terms of your plan. AstrataSound retains no ownership over your creations.',
      },
      {
        q: 'What genres and styles are supported?',
        a: 'We support 40+ genres including Pop, Hip-Hop, Rock, R&B, EDM, Jazz, Classical, Indie, Trap, Afrobeats, Bollywood, Country, Gospel, and many more.',
      },
    ],
  },
  {
    category: 'Technical',
    icon: 'settings',
    color: '#9c27b0',
    items: [
      {
        q: 'What should I do if generation fails?',
        a: 'Failed generations do not consume credits. Try again with a slightly different prompt. If the problem persists, contact us at support@astratasounds.com.',
      },
      {
        q: 'Can I download my songs?',
        a: 'Yes! All generated songs can be played in the app and downloaded in high-quality audio format from the Song Detail screen.',
      },
    ],
  },
];

const FAQsScreen = () => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <ImageBackground
      source={require('../assets/images/image-1.jpg')}
      style={s.background}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={s.navBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={s.navTitle}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.heroCard}>
          <View style={s.heroIconWrap}>
            <MaterialIcons name="help-outline" size={34} color="#66cc33" />
          </View>
          <View style={s.heroText}>
            <Text style={s.heroTitle}>Frequently Asked Questions</Text>
            <Text style={s.heroSub}>Everything you need to know about AstrataSound</Text>
          </View>
        </View>

        {FAQS.map((cat) => (
          <View key={cat.category} style={s.categoryBlock}>
            {/* Category header */}
            <View style={s.catRow}>
              <View style={[s.catIcon, { backgroundColor: cat.color + '22', borderColor: cat.color + '44' }]}>
                <MaterialIcons name={cat.icon} size={16} color={cat.color} />
              </View>
              <Text style={[s.catTitle, { color: cat.color }]}>{cat.category}</Text>
            </View>

            {cat.items.map((item, i) => {
              const key = `${cat.category}-${i}`;
              const open = !!expanded[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[s.faqCard, open && s.faqCardOpen]}
                  onPress={() => toggle(key)}
                  activeOpacity={0.85}
                >
                  <View style={s.faqHeader}>
                    <Text style={s.faqQ} numberOfLines={open ? undefined : 2}>{item.q}</Text>
                    <MaterialIcons
                      name={open ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={22}
                      color={open ? '#66cc33' : 'rgba(255,255,255,0.45)'}
                      style={{ flexShrink: 0 }}
                    />
                  </View>
                  {open && (
                    <View style={s.faqBody}>
                      <View style={s.faqDivider} />
                      <Text style={s.faqA}>{item.a}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Still have questions */}
        <View style={s.stillCard}>
          <MaterialIcons name="chat-bubble-outline" size={22} color="#66cc33" />
          <View style={{ flex: 1 }}>
            <Text style={s.stillTitle}>Still have questions?</Text>
            <Text style={s.stillSub}>Reach out to our support team anytime</Text>
          </View>
          <TouchableOpacity
            style={s.stillBtn}
            onPress={() => navigation.navigate('ContactScreen')}
            activeOpacity={0.85}
          >
            <Text style={s.stillBtnText}>Contact Us</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ImageBackground>
  );
};

export default FAQsScreen;

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
    padding: 16, marginBottom: 20,
  },
  heroIconWrap: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: 'rgba(102,204,51,0.12)', borderWidth: 1, borderColor: 'rgba(102,204,51,0.2)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  heroText: { flex: 1 },
  heroTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 16, marginBottom: 4, lineHeight: 22 },
  heroSub: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 12 },

  categoryBlock: { marginBottom: 16 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  catIcon: { width: 30, height: 30, borderRadius: 9, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  catTitle: { fontFamily: 'Oswald-Bold', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },

  faqCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 14, marginBottom: 8,
  },
  faqCardOpen: {
    backgroundColor: 'rgba(255,255,255,0.11)', borderColor: 'rgba(102,204,51,0.25)',
  },
  faqHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  faqQ: { flex: 1, color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 14, lineHeight: 20 },
  faqBody: { marginTop: 2 },
  faqDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 },
  faqA: { color: 'rgba(255,255,255,0.65)', fontFamily: 'Oswald-Regular', fontSize: 13, lineHeight: 20 },

  stillCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(102,204,51,0.08)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(102,204,51,0.2)',
    padding: 16, marginTop: 4,
  },
  stillTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 14 },
  stillSub: { color: 'rgba(255,255,255,0.45)', fontFamily: 'Oswald-Regular', fontSize: 12, marginTop: 2 },
  stillBtn: {
    backgroundColor: '#66cc33', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  stillBtnText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 13 },
});
