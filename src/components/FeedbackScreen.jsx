import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ImageBackground, StatusBar, Platform, TextInput, Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const CATEGORIES = [
  { id: 'ui',         label: 'UI & Design',     icon: 'palette' },
  { id: 'ai',         label: 'AI Quality',       icon: 'auto-awesome' },
  { id: 'features',   label: 'Features',         icon: 'extension' },
  { id: 'performance',label: 'Performance',      icon: 'speed' },
  { id: 'other',      label: 'Other',            icon: 'more-horiz' },
];

const FeedbackScreen = () => {
  const navigation = useNavigation();
  const [rating, setRating]         = useState(0);
  const [category, setCategory]     = useState('');
  const [feedback, setFeedback]     = useState('');
  const [submitted, setSubmitted]   = useState(false);

  const handleSubmit = () => {
    if (rating === 0) { Alert.alert('Rate us first', 'Please give a star rating before submitting.'); return; }
    if (!feedback.trim()) { Alert.alert('Add feedback', 'Please share your thoughts with us.'); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <ImageBackground source={require('../assets/images/image-1.jpg')} style={s.background} resizeMode="cover">
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={s.navBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={s.navTitle}>FEEDBACK</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.thankYouWrap}>
          <View style={s.thankIcon}>
            <MaterialIcons name="check-circle" size={52} color="#66cc33" />
          </View>
          <Text style={s.thankTitle}>Thank You! 🎉</Text>
          <Text style={s.thankSub}>Your feedback helps us make AstrataSound better for everyone. We really appreciate it.</Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={s.doneBtnText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../assets/images/image-1.jpg')} style={s.background} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={s.navBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={s.navTitle}>FEEDBACK</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={s.heroCard}>
          <View style={s.heroIconWrap}>
            <MaterialIcons name="rate-review" size={34} color="#66cc33" />
          </View>
          <View style={s.heroText}>
            <Text style={s.heroTitle}>Help Us Improve</Text>
            <Text style={s.heroSub}>Your opinion shapes the future of AstrataSound</Text>
          </View>
        </View>

        {/* Star rating */}
        <View style={s.sectionRow}>
          <View style={s.accent} />
          <Text style={s.sectionTitle}>Overall Experience</Text>
        </View>

        <View style={s.ratingCard}>
          <Text style={s.ratingHint}>
            {rating === 0 ? 'Tap a star to rate' : ['', 'Poor 😕', 'Fair 🙂', 'Good 😊', 'Great 😄', 'Amazing! 🤩'][rating]}
          </Text>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <MaterialIcons
                  name={star <= rating ? 'star' : 'star-border'}
                  size={40}
                  color={star <= rating ? '#FFD700' : 'rgba(255,255,255,0.25)'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={s.sectionRow}>
          <View style={s.accent} />
          <Text style={s.sectionTitle}>What's this about?</Text>
        </View>

        <View style={s.categoryGrid}>
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[s.catChip, active && s.catChipActive]}
                onPress={() => setCategory(c.id)}
                activeOpacity={0.8}
              >
                <MaterialIcons name={c.icon} size={16} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} />
                <Text style={[s.catLabel, active && s.catLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback text */}
        <View style={s.sectionRow}>
          <View style={s.accent} />
          <Text style={s.sectionTitle}>Your Thoughts</Text>
        </View>

        <View style={s.inputCard}>
          <TextInput
            style={s.textarea}
            placeholder="What can we improve? What do you love? Any bugs to report?..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            multiline
            maxLength={600}
            value={feedback}
            onChangeText={setFeedback}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{feedback.length} / 600</Text>
        </View>

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <MaterialIcons name="send" size={18} color="#fff" />
          <Text style={s.submitText}>Submit Feedback</Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
};

export default FeedbackScreen;

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

  thankYouWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 16 },
  thankIcon: {
    width: 90, height: 90, borderRadius: 26,
    backgroundColor: 'rgba(102,204,51,0.12)', borderWidth: 1, borderColor: 'rgba(102,204,51,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  thankTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 28, letterSpacing: 0.3 },
  thankSub: { color: 'rgba(255,255,255,0.55)', fontFamily: 'Oswald-Regular', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  doneBtn: {
    backgroundColor: '#66cc33', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  doneBtnText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 16, letterSpacing: 0.5 },

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
  heroSub: { color: 'rgba(255,255,255,0.5)', fontFamily: 'Oswald-Regular', fontSize: 12 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  accent: { width: 3, height: 20, borderRadius: 2, backgroundColor: '#66cc33' },
  sectionTitle: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 17, letterSpacing: 0.3 },

  ratingCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 20, alignItems: 'center', gap: 14, marginBottom: 24,
  },
  ratingHint: { color: 'rgba(255,255,255,0.55)', fontFamily: 'Oswald-Bold', fontSize: 14, letterSpacing: 0.3 },
  starsRow: { flexDirection: 'row', gap: 8 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14, paddingVertical: 9,
  },
  catChipActive: { backgroundColor: '#66cc33', borderColor: '#66cc33', shadowColor: '#66cc33', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  catLabel: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Oswald-Bold', fontSize: 12 },
  catLabelActive: { color: '#fff' },

  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 14, marginBottom: 20,
  },
  textarea: { color: '#fff', fontFamily: 'Oswald-Regular', fontSize: 14, minHeight: 120, textAlignVertical: 'top' },
  charCount: { color: 'rgba(255,255,255,0.3)', fontFamily: 'Oswald-Regular', fontSize: 10, textAlign: 'right', marginTop: 6 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#66cc33', borderRadius: 14, paddingVertical: 15,
    shadowColor: '#66cc33', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  submitText: { color: '#fff', fontFamily: 'Oswald-Bold', fontSize: 16, letterSpacing: 0.8 },
});
