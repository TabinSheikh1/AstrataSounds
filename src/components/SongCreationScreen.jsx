import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  TextInput,
} from 'react-native';
import Header from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Search, Plus, HelpCircle, Music2, Mic, CloudUpload } from 'lucide-react-native';
import TrackPlayer from 'react-native-track-player';
import { generateSong } from '../service/index';

// ⚠️ CHANGE THIS BASE URL ACCORDING TO DEVICE
// Android Emulator → http://10.0.2.2:3000
// iOS Simulator → http://localhost:3000
// Real Device → http://YOUR_LAN_IP:3000
const BASE_URL = 'http://localhost:3000';

const SongCreationScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Lyrics');
  const [loading, setLoading] = useState(false);

  // ---------------- FORM STATES ----------------
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [gender, setGender] = useState('Male');
  const [styleText, setStyleText] = useState('');
  const [lyricsText, setLyricsText] = useState('');
  const [titleText, setTitleText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Pop');

  // ---------------- AUDIO ----------------
  async function playSong(url, title) {
    try {
      await TrackPlayer.reset();

      await TrackPlayer.add({
        id: 'generated-song',
        url,
        title: title || 'StrataSound AI',
        artist: 'StrataSound AI',
      });

      await TrackPlayer.play();
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }

  const playAudio = async (result) => {
    const fileUrl =
      result.songUrl ||
      result.music?.url ||
      result.vocals?.url;

    if (!fileUrl) {
      console.error('No audio URL returned');
      return;
    }

    await playSong(`${BASE_URL}${fileUrl}`, result.title);
  };

  // ---------------- CREATE ----------------
  const handleCreate = async () => {
    try {
      setLoading(true);

      const payload = {
        title: titleText,
        stylePrompt: styleText,
        category: selectedStyle.toLowerCase(),
        gender: gender.toLowerCase(),
        description: styleText,
        lyrics: lyricsText.trim() ? lyricsText : undefined,
        music: true,
        vocals: true,
      };

      const result = await generateSong(payload);
      await playAudio(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  const renderContent = () => {
    if (selectedTab === 'Lyrics') {
      return (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.row}>
              <Text style={styles.label}>Style Of Music</Text>
              <HelpCircle size={18} color="white" style={styles.helpIcon} />
            </View>
          </View>

          <View style={styles.inputBox}>
            <TextInput
              style={styles.textArea}
              placeholder="Enter style of your music"
              placeholderTextColor="rgba(255, 255, 255, 1)"
              multiline
              onChangeText={setStyleText}
            />
            <Text style={styles.charCount}>{styleText.length}/200</Text>

            <View style={styles.tagRow}>
              {['Pop', 'Rop', 'Hip Hop', 'More'].map((tag) => {
                const isSelected = selectedStyle === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => setSelectedStyle(tag)}
                    style={[
                      styles.tag,
                      isSelected && { backgroundColor: '#4CAF50' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        isSelected && { color: '#fff' },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.row}>
              <Text style={styles.label}>Lyrics</Text>
              <HelpCircle size={18} color="white" style={styles.helpIcon} />
            </View>
          </View>

          <View style={styles.inputBox}>
            <TextInput
              style={[styles.textArea, { height: 100 }]}
              placeholder="Enter lyrics of your music or try to get inspired"
              placeholderTextColor="rgba(255, 255, 255, 1).6)"
              multiline
              onChangeText={setLyricsText}
            />
            <Text style={styles.charCount}>{lyricsText.length}/3000</Text>

            <View style={styles.tagRow}>
              <TouchableOpacity style={styles.tag}>
                <Text style={styles.tagText}>Write Lyrics For Me</Text>
              </TouchableOpacity>
              <Music2 size={18} color="white" style={{ marginLeft: 10 }} />
            </View>
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Random'].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                style={[
                  styles.genderBtn,
                  gender === g && styles.activeGenderBtn,
                ]}
              >
                <Text
                  style={[
                    styles.genderBtnText,
                    gender === g && { color: '#fff' },
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Title</Text>
          <View style={[styles.inputBox, { height: 90 }]}>
            <TextInput
              style={styles.textArea}
              placeholder="Enter Your Title"
              placeholderTextColor="rgba(255,255,255,0.6)"
              onChangeText={setTitleText}
            />
            <Text style={{ color: 'rgba(255,255,255,0.6)', bottom: 50, left: 320, fontSize: 12 }}>
              {titleText.length}/80
            </Text>
          </View>
        </ScrollView>
      );
    }

    if (selectedTab === 'Description') {
      return (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.row}>
              <Text style={styles.label}>Style Of Description</Text>
              <HelpCircle size={18} color="white" style={styles.helpIcon} />
            </View>
          </View>

          <View style={[styles.inputBox, { height: 220 }]}>
            <TextInput
              style={styles.textArea}
              placeholder="Enter style of your music or try to get inspired"
              placeholderTextColor="rgba(255, 255, 255, 1)"
              multiline
              onChangeText={setStyleText}
            />
            <Text style={[styles.charCount, { marginTop: 70, top: 20 }]}>
              {styleText.length}/200
            </Text>
            <TouchableOpacity style={styles.getInsBtn}>
              <Text style={styles.getInsBtnTxt}>Get Inspired</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.createBtnText}>
              {loading ? 'CREATING...' : 'CREATE NOW'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    if (selectedTab === 'Audio') {
      return (
        <View style={styles.audioContainer}>
          <Text style={styles.audioTitleText}>
            Use reference audio to create songs/vibe
          </Text>
          <Text style={styles.audioSubtitleText}>
            (6s to 8min supported. For best results, use{'\n'}
            2minor longer. Maximum 40MB.)
          </Text>

          <TouchableOpacity style={styles.outlineButton}>
            <CloudUpload color="white" size={20} style={styles.buttonIcon} />
            <Text style={styles.outlineButtonText}>Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineButton}>
            <Mic color="white" size={20} style={styles.buttonIcon} />
            <Text style={styles.outlineButtonText}>Record</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <ImageBackground
      source={require('../assets/images/image-1.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header title="STRATASOUND MUSIC" coins={25} onMenuPress={() => console.log('Menu')} />

        <View style={{ height: 50 }}>
          <ScrollView horizontal style={styles.tabs} showsHorizontalScrollIndicator={false}>
            {['Lyrics', 'Description', 'Audio'].map((tab, index) => {
              const isSelected = selectedTab === tab;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedTab(tab)}
                  style={[styles.tabItem, isSelected && styles.activeTab]}
                >
                  <Text style={[styles.tabText, { color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)' }]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {renderContent()}
      </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  getInsBtn: {
    backgroundColor: 'white',
    width: 80,
    borderRadius: 5,
    alignItems: 'center',

  },
  getInsBtnTxt: {
    fontFamily: 'Oswald-Bold',
    fontSize: 12,
    textAlign: 'center'
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },

  // --- TOP NAVIGATION TABS ---
  tabs: {
    paddingHorizontal: 12,
    marginTop: 10,
    marginLeft: 15,
  },
  tabItem: {
    marginRight: 40,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginBottom: 12,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Oswald-Bold',
  },

  // --- SECTION HEADERS & LABELS ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Oswald-SemiBold',
    marginBottom: 10,
  },
  helpIcon: {
    marginLeft: 5,
    marginBottom: 5,
  },
  instrumentalLabel: {
    color: 'white',
    marginRight: 10,
    fontSize: 14,
    marginBottom: 4,
  },

  // --- INPUT BOXES & TEXT AREAS ---
  inputBox: {
    backgroundColor: 'rgba(212, 187, 187, 0.15)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)', // Solid white border as per your request
    marginBottom: 20,
  },
  textArea: {
    color: 'white',
    fontSize: 14,
    textAlignVertical: 'top',
    height: 90,
  },
  charCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 15,
  },

  // --- TAGS (STYLE OF MUSIC) ---
  tagRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  activeTag: {
    backgroundColor: '#4CAF50', // Green on press
  },
  tagText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTagText: {
    color: '#fff', // White text when green
  },

  // --- GENDER SELECTION ---
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  activeGenderBtn: {
    backgroundColor: '#4CAF50',
  },
  genderBtnText: {
    fontWeight: 'bold',
    fontSize: 13,
  },

  // --- VIBE & ACTION BUTTONS ---
  addVibeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    marginBottom: 20,

  },
  addVibeText: {
    color: 'white',
    fontFamily: 'Oswald-Bold'
  },
  createBtn: {
    backgroundColor: '#047ec9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 120,
    width: '92%',
    height: 55,
    alignSelf: 'center'
  },
  createBtnText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Oswald-Bold'
  },
  // --- AUDIO TAB STYLES ---
  audioContainer: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  audioTitleText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Oswald-SemiBold', // Using your Oswald font
    textAlign: 'center',
    marginBottom: 8,
  },
  audioSubtitleText: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    opacity: 0.9,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 1)', // White outline
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 15,
    height: 58,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Very subtle glass effect
  },
  outlineButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
  },
  buttonIcon: {
    marginRight: 12,
    marginTop: 5
  },
});

export default SongCreationScreen;