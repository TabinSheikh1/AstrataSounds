import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ coins = 25 }) => {
    const navigation = useNavigation();

    return (
        <View>
            <View style={styles.header}>
                {/* Left — menu button, fixed width */}
                <TouchableOpacity
                    style={styles.side}
                    onPress={() => navigation.navigate('MenuScreen')}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="menu" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Center — logo, absolutely centered so it ignores side widths */}
                <View style={styles.logoWrap} pointerEvents="none">
                    <Image
                        source={require('../assets/images/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Right — coins pill, fixed width */}
                <View style={[styles.side, styles.sideRight]}>
                    <View style={styles.coinsPill}>
                        <Image
                            source={require('../assets/images/gem-1.png')}
                            style={styles.gemIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.coinText}>{coins}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />
        </View>
    );
};

const SIDE_WIDTH = 56;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight + 12,
        paddingBottom: 12,
        justifyContent:"space-between"
    },

    // Left & right sides have the same fixed width so the logo stays truly centred
    side: {
        width: SIDE_WIDTH,
        justifyContent: 'center',
    },
    sideRight: {
        alignItems: 'flex-end',
    },

    // Logo sits in an absolute overlay so it is never pushed off-centre
    logoWrap: {
    
        alignItems: 'center',
    },
    logo: {
        width: 220,
        height: 72,
    },

    // Coins
    coinsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 4,
        gap: 4,
    },
    gemIcon: {
        width: 16,
        height: 16,
    },
    coinText: {
        fontFamily: 'Oswald-Bold',
        color: '#000',
        fontSize: 13,
    },

    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 0,
        marginTop:7
    },
});

export default Header;
