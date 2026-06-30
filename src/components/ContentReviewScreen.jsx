import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const REVIEW_STEPS = [
  { key: 'submitted', label: 'Submitted', done: true },
  { key: 'review', label: 'In Review', done: true, active: true },
  { key: 'decision', label: 'Decision', done: false },
];

const ContentReviewScreen = ({ onContinue }) => {
  return (
    <LinearGradient
      colors={['#04111f', '#0a2540', '#0d3b66']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.root}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="apple" size={30} color="#0a2540" />
          </View>

          <Text style={styles.eyebrow}>ASTRATASOUNDS TRUST &amp; SAFETY</Text>
          <Text style={styles.title}>Your Content Is Under Review</Text>

          <Text style={styles.body}>
            We detected AI-generated music associated with your account. As
            part of our standard compliance process, our Trust &amp; Safety
            team is reviewing this content to ensure it meets App Store and
            platform guidelines.
          </Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={18} color="rgba(255,255,255,0.55)" />
            <Text style={styles.infoText}>
              Estimated review time: <Text style={styles.infoStrong}>24–48 hours</Text>
            </Text>
          </View>



          <Text style={styles.footnote}>
            No action is needed from you right now. We&apos;ll notify you by
            email as soon as this review is complete. If we find anything
            that requires changes, we&apos;ll walk you through next steps.
          </Text>


        </View>

        <Text style={styles.signature}>
          AstrataSounds Trust &amp; Safety Team
        </Text>
      </View>
    </LinearGradient>
  );
};

export default ContentReviewScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 14,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 28,
  },
  body: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13.5,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  infoText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
  },
  infoStrong: {
    color: '#fff',
    fontFamily: 'Oswald-Bold',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 18,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    width: 78,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepDotDone: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  stepDotActive: {
    backgroundColor: '#d0a93a',
    borderColor: '#d0a93a',
  },
  stepLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 0.3,
  },
  stepLabelActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  stepLine: {
    height: 1,
    flex: 1,
    maxWidth: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 16,
  },
  footnote: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11.5,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 22,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#0a2540',
    fontSize: 14.5,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  signature: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    marginTop: 18,
    letterSpacing: 0.3,
  },
});
