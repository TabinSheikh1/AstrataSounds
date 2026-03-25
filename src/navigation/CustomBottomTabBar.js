import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// Fixed 3-tab layout: Library | Home (center, raised) | Create
const TABS = {
    LIBRARY: 'LibraryHomeScreen',
    HOME: 'HomeSongsScreen',
    CREATE: 'SongCreationScreen',
};

const CustomBottomTabBar = ({ state, navigation }) => {
    const currentRoute = state.routes[state.index].name;

    const navigateTo = (screen) => {
        navigation.navigate(screen);
    };

    const isActive = (screen) => currentRoute === screen;

    const renderSideIcon = (type, active) => {
        if (type === TABS.LIBRARY) {
            return (
                <Image
                    source={require('../assets/images/list.png')}
                    style={[styles.sideIconImage, active && styles.sideIconActive]}
                    resizeMode="contain"
                />
            );
        }
        if (type === TABS.CREATE) {
            return (
                <Image
                    source={require('../assets/images/playlist.png')}
                    style={[styles.sideIconImage, active && styles.sideIconActive]}
                    resizeMode="contain"
                />
            );
        }
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.tabBarContainer}>
                {/* Left — Library */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => navigateTo(TABS.LIBRARY)}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.sideIconCircle,
                        isActive(TABS.LIBRARY) && styles.sideIconCircleActive,
                    ]}>
                        {renderSideIcon(TABS.LIBRARY, isActive(TABS.LIBRARY))}
                    </View>
                </TouchableOpacity>

                {/* Center spacer */}
                <View style={styles.centerSpace} />

                {/* Right — Create */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => navigateTo(TABS.CREATE)}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.sideIconCircle,
                        isActive(TABS.CREATE) && styles.sideIconCircleActive,
                    ]}>
                        {renderSideIcon(TABS.CREATE, isActive(TABS.CREATE))}
                    </View>
                </TouchableOpacity>
            </View>

            {/* Floating Center — Home (always home icon) */}
            <View style={styles.homeButtonContainer}>
                <View style={[
                    styles.homeButtonRing,
                    isActive(TABS.HOME) && styles.homeButtonRingActive,
                ]} />
                <TouchableOpacity
                    onPress={() => navigateTo(TABS.HOME)}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={isActive(TABS.HOME) ? ['#2db35d', '#076585'] : ['#4caf50', '#0a7abf']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.homeButtonGradient}
                    >
                        <MaterialIcons name="home" size={34} color="#fff" />
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
        width,
        height: 110,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
    },
    tabBarContainer: {
        flexDirection: 'row',
        height: 72,
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 36,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 12,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    sideIconCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1.5,
        borderColor: '#d0d0d0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
    sideIconCircleActive: {
        borderColor: '#047ec9',
        backgroundColor: '#e8f4ff',
    },
    sideIconImage: {
        width: 22,
        height: 22,
        opacity: 0.5,
    },
    sideIconActive: {
        tintColor: '#047ec9',
        opacity: 1,
    },
    centerSpace: {
        width: 72,
    },

    // Floating Home Button
    homeButtonContainer: {
        position: 'absolute',
        alignSelf: 'center',
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeButtonRing: {
        position: 'absolute',
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 10,
        borderColor: '#3daf56',
        opacity: 0.6,
    },
    homeButtonRingActive: {
        opacity: 1,
    },
    homeButtonGradient: {
        width: 58,
        height: 58,
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2db35d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default CustomBottomTabBar;
