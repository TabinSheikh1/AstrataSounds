import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';


const { width } = Dimensions.get('window');

const CustomBottomTabBar = ({ state, navigation }) => {
    const currentRoute = state.routes[state.index].name;

    const activeTab =
        currentRoute === 'LibraryHomeScreen'
            ? 'Library'
            : currentRoute === 'HomeSongsScreen'
                ? 'Home'
                : 'Playlist';

    const renderIcon = (type, isActive = false) => {
        // ACTIVE = WHITE, INACTIVE = ORIGINAL
        const tintStyle = isActive ? { tintColor: '#fff' } : null;

        if (type === 'Library') {
            return (
                <Image
                    source={require('../assets/images/list.png')}
                    style={[{ width: 24, height: 24 }, tintStyle]}
                    resizeMode="contain"
                />
            );
        }

        if (type === 'Playlist') {
            return (
                <Image
                    source={require('../assets/images/playlist.png')}
                    style={[{ width: 24, height: 24 }, tintStyle]}
                    resizeMode="contain"
                />
            );
        }

        if (type === 'Home') {
            return (
                <MaterialIcons
                    name="home"
                    size={35}
                    color={isActive ? '#fff' : '#000'}
                />
            );
        }
    };

    const leftTab = () => {
        if (activeTab === 'Library') return 'Home';
        if (activeTab === 'Home') return 'Library';
        if (activeTab === 'Playlist') return 'Library';
    };

    const rightTab = () => {
        if (activeTab === 'Playlist') return 'Home';
        if (activeTab === 'Home') return 'Playlist';
        if (activeTab === 'Library') return 'Playlist';
    };



    return (
        <View style={styles.mainContainer}>
            <View style={styles.tabBarContainer}>
                {/* Left Button - Playlist/List Icon */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => {
                        const tab = leftTab();
                        if (tab === 'Library') navigation.navigate('LibraryHomeScreen');
                        if (tab === 'Home') navigation.navigate('HomeSongsScreen');
                        if (tab === 'Playlist') navigation.navigate('SongCreationScreen');
                    }}
                >
                    <View style={styles.sideIconCircle}>
                        {renderIcon(leftTab())}
                    </View>
                </TouchableOpacity>


                <View style={styles.centerSpace} />

                {/* Right Button - Library/Music Icon */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => {
                        const tab = rightTab();
                        if (tab === 'Playlist') navigation.navigate('SongCreationScreen');
                        if (tab === 'Home') navigation.navigate('HomeSongsScreen');
                        if (tab === 'Library') navigation.navigate('LibraryHomeScreen');
                    }}
                >
                    <View style={styles.sideIconCircle}>
                        {renderIcon(rightTab())}
                    </View>
                </TouchableOpacity>



            </View>

            {/* Floating Center Home Button */}
            <View style={styles.homeButtonContainer}>
                <View style={styles.homebtnbg} />
                <TouchableOpacity activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#2db35d', '#076585']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.homeButtonGradient}
                    >
                        {renderIcon(activeTab, true)}  {/* WHITE when active */}
                    </LinearGradient>

                </TouchableOpacity>
            </View>



        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        bottom: 0,
        width: width,
        height: 110,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end'
    },
    tabBarContainer: {
        flexDirection: 'row',
        height: 85,
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,

    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    sideIconCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        borderWidth: 1,
        borderColor: '#66cc33',
        justifyContent: 'center',
        alignItems: 'center'
    },
    centerSpace: {
        width: 70
    },
    homeButtonContainer: {
        position: 'absolute',
        alignSelf: 'center',
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',

    },

    homeButtonGradient: {
        width: 60,
        height: 60,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',

    },

    homebtnbg: {
        borderWidth: 11,
        height: 80,
        width: 80,
        position: 'absolute',
        borderRadius: 80,
        borderColor: '#3daf56'
    }
});

export default CustomBottomTabBar;