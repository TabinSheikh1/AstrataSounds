import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, TextInput } from 'react-native';
import Header from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { Search, Plus } from 'lucide-react-native';
const LibraryHomeScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Songs');
  const renderContent = () => {
    if (selectedTab === 'Songs') {
      return (
        <>
          {/* Songs-only buttons */}
          <View style={styles.rowBtns}>
            <View style={styles.likeBtncont}>
              <TouchableOpacity style={styles.likebtn}>
                <MaterialIcons name="thumb-up-alt" size={18} color="#fff" />
                <Text style={styles.likeBtnText}>Liked</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Search size={16} color="#666" style={styles.icon} />
              <View style={styles.divider} />
              <TextInput
                style={styles.input}
                placeholder="Search by song name, style"
                placeholderTextColor="#888"
              />
            </View>
          </View>

          {/* Songs empty state */}
          <View style={styles.cont}>
            <Text style={styles.txt}>You don't any creation yet.</Text>
            <Text style={styles.txt}>Start creating your first song now!</Text>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Create Now</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (selectedTab === 'Vibe') {
      return (

        <View style={styles.outerContainer}>
          <View style={styles.dashedCircle}>

            {/* The Action Button */}
            <TouchableOpacity
              style={styles.greenCircle}
              activeOpacity={0.7}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>

            {/* The Label */}
            <Text style={styles.text}>Create Vibes</Text>

          </View>
        </View>
      );
    }

    if (selectedTab === 'Playlist') {
      return (
        <View>
        <View style={styles.likeBtn2}>
          <TouchableOpacity style={styles.likebtn}>
                <MaterialIcons name="thumb-up-alt" size={18} color="#fff" />
                <Text style={styles.likeBtnText}>Liked</Text>
              </TouchableOpacity>
              </View>

        <View style={styles.outerContainer}>
          <View style={styles.dashedCircle}>

            {/* The Action Button */}
            <TouchableOpacity
              style={styles.greenCircle}
              activeOpacity={0.7}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>

            {/* The Label */}
            <Text style={styles.text}>Create Playlist</Text>

          </View>
        </View>
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
        {/* Header */}
        <Header title="STRATASOUND MUSIC" coins={25} />

        {/* Main Tabs */}
        <ScrollView
          horizontal
          style={styles.tabs}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {['Songs', 'Vibe', 'Playlist'].map((tab, index) => {
            const isSelected = selectedTab === tab;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.tabItem,
                  {
                    borderBottomWidth: isSelected ? 2 : 0, // underline thickness
                    borderBottomColor: isSelected ? '#fff' : 'transparent',
                  }
                ]}
              >
                <Text style={[styles.tabText, { color: isSelected ? '#fff' : '#ffffffff' }]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>



        {renderContent()}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#66cc33'
  },
  outerContainer: {
    marginTop: 20,
    marginLeft: 23,
  },
  dashedCircle: {
    width: 130,
    height: 130,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 1)', // White with slight transparency
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenCircle: {
    width: 38,
    height: 38,
    borderRadius: 32.5,
    backgroundColor: '#44bd32', // Vibrant green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    // Slight shadow to make the button pop
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  text: {
    color: 'white',
    fontFamily: 'Oswald-SemiBold',
    fontSize: 16
  },
  txt: {
    fontFamily: 'Oswald-Regular',
    color: 'white',
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 2
  },
  cont: {
    marginTop: 220,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#047ec9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    textTransform: 'uppercase',
  },
  rowBtns: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
    marginLeft: 5,
  },
  likeBtncont: {
    backgroundColor: '#66cc33',
    height: 28,              // ✅ SAME HEIGHT
    width: 78,
    marginLeft: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeBtn2:{
    backgroundColor: '#66cc33',
    height: 28,              // ✅ SAME HEIGHT
    width: 78,
    marginLeft: 23,
    borderRadius: 8,
    marginTop:15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  likebtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeBtnText: {
    fontFamily: 'Oswald-Bold',
    color: 'white'
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    paddingTop: 40,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 10,
    marginLeft: 15,
  },
  tabItem: {
    marginRight: 40,
    alignItems: 'center',

  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Oswald-Bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    height: 28,              // ✅ MATCHED
    borderRadius: 8,
    paddingHorizontal: 10,
    flex: 1,
    marginRight: 12,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#696969ff',
  },

  input: {
    position: 'absolute',
    fontSize: 12,
    color: '#333',
    fontFamily: 'Oswald-Bold',
    paddingVertical: 0,
    includeFontPadding: false, // 🔥 ANDROID FIX
    textAlignVertical: 'center',
    alignSelf: 'center',
    left: 40,
  }


});

export default LibraryHomeScreen;
