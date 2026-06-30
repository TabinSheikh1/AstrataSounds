import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateProfile, uploadProfilePicture } from '../api/userService';
import { updateUser } from '../store/slices/authSlice';
import { SERVER_URL as BASE_URL } from '../config/api';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const buildAvatarUri = (profilePicture) => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith('http')) return profilePicture;
  return `${BASE_URL}${profilePicture.startsWith('/') ? '' : '/uploads/users/avatars/'}${profilePicture}`;
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [birthday, setBirthday] = useState(user?.birthday ? user.birthday.split('T')[0] : '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [age, setAge] = useState(user?.age != null ? String(user.age) : '');
  const [pendingImage, setPendingImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const avatarUri = pendingImage?.uri ?? buildAvatarUri(user?.profilePicture);

  const pickImage = useCallback(() => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.85, includeBase64: false },
      (res) => {
        if (res.didCancel || res.errorCode) return;
        const asset = res.assets?.[0];
        if (asset) setPendingImage(asset);
      },
    );
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedProfilePicture = user?.profilePicture;

      if (pendingImage) {
        const fd = new FormData();
        fd.append('avatar', {
          uri: pendingImage.uri,
          name: pendingImage.fileName ?? 'avatar.jpg',
          type: pendingImage.type ?? 'image/jpeg',
        });
        const uploadRes = await uploadProfilePicture(fd);
        updatedProfilePicture =
          uploadRes.data?.data?.profilePicture ?? uploadRes.data?.profilePicture ?? updatedProfilePicture;
      }

      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        birthday: birthday.trim() || undefined,
        gender: gender || undefined,
        age: age ? parseInt(age, 10) : undefined,
      };

      const res = await updateProfile(payload);
      const updatedUser = res.data?.data ?? res.data;

      dispatch(updateUser({ ...updatedUser, profilePicture: updatedProfilePicture }));
      Alert.alert('Profile Updated', 'Your profile has been saved.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0d1117', '#0d2a1a', '#0a1628']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={styles.root}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={saving}>
          <MaterialIcons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <LinearGradient
              colors={['#66cc33', '#047ec9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={['#66cc33', '#047ec9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarPlaceholder}
              >
                <MaterialIcons name="person" size={48} color="#fff" />
              </LinearGradient>
            )}
            <View style={styles.cameraOverlay}>
              <MaterialIcons name="camera-alt" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Name row */}
        <View style={styles.row}>
          <View style={[styles.fieldWrap, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="rgba(255,255,255,0.25)"
              returnKeyType="next"
            />
          </View>
          <View style={[styles.fieldWrap, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="rgba(255,255,255,0.25)"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Bio */}
        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={(t) => setBio(t.slice(0, 500))}
            placeholder="Tell the world about yourself..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            multiline
            maxLength={500}
            returnKeyType="done"
            blurOnSubmit
          />
        </View>

        {/* Birthday */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Birthday</Text>
          <TextInput
            style={styles.input}
            value={birthday}
            onChangeText={setBirthday}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="rgba(255,255,255,0.25)"
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            maxLength={10}
          />
        </View>

        {/* Gender */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowGenderPicker((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={gender ? styles.selectorText : styles.selectorPlaceholder}>
              {gender || 'Select gender'}
            </Text>
            <MaterialIcons
              name={showGenderPicker ? 'expand-less' : 'expand-more'}
              size={20}
              color="rgba(255,255,255,0.45)"
            />
          </TouchableOpacity>
          {showGenderPicker && (
            <View style={styles.dropdown}>
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.dropdownItem, gender === opt && styles.dropdownItemActive]}
                  onPress={() => { setGender(opt); setShowGenderPicker(false); }}
                >
                  <Text style={[styles.dropdownText, gender === opt && styles.dropdownTextActive]}>
                    {opt}
                  </Text>
                  {gender === opt && <MaterialIcons name="check" size={16} color="#66cc33" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Age */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
            placeholder="Your age"
            placeholderTextColor="rgba(255,255,255,0.25)"
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={3}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 12,
    paddingBottom: 12,
  },
  backBtn: { width: 44, alignItems: 'flex-start' },
  screenTitle: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  saveBtn: { width: 64, alignItems: 'flex-end' },
  saveBtnGradient: {
    // paddingHorizontal: 14,
    // paddingVertical: 7,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.4,
    paddingHorizontal:14,
    paddingVertical:12
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 8 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrap: { position: 'relative' },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(102,204,51,0.6)',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(102,204,51,0.4)',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#047ec9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0d1117',
  },
  avatarHint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    marginTop: 8,
  },

  // Fields
  row: { flexDirection: 'row', marginBottom: 16 },
  fieldWrap: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fieldLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  charCount: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Oswald-Regular',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Gender selector
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Oswald-Regular',
  },
  selectorPlaceholder: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 15,
    fontFamily: 'Oswald-Regular',
  },
  dropdown: {
    backgroundColor: '#0d1f2d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItemActive: { backgroundColor: 'rgba(102,204,51,0.08)' },
  dropdownText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
  },
  dropdownTextActive: { color: '#66cc33' },
});
