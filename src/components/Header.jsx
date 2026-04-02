import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSubscription } from '../hooks/useSubscription';
import TokenHistoryDrawer from './TokenHistoryDrawer';

const Header = () => {
    const navigation = useNavigation();
    const {
        tokenBalance,
        tokenGranted,
        tokenColor,
        tokenPct,
        isPastDue,
        isBlocked,
        refreshAll,
    } = useSubscription();

    const [drawerVisible, setDrawerVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshAll();
        }, [refreshAll]),
    );

    return (
        <View>
            {/* Past-due / blocked global banner */}
            {(isPastDue || isBlocked) && (
                <TouchableOpacity
                    style={[
                        styles.globalBanner,
                        isBlocked ? styles.blockedBanner : styles.pastDueBanner,
                    ]}
                    onPress={() => navigation.navigate('BillingScreen')}
                    activeOpacity={0.85}
                >
                    <MaterialIcons
                        name="warning"
                        size={14}
                        color={isBlocked ? '#EF4444' : '#FBBF24'}
                    />
                    <Text
                        style={[
                            styles.bannerText,
                            { color: isBlocked ? '#EF4444' : '#FBBF24' },
                        ]}
                        numberOfLines={1}
                    >
                        {isBlocked
                            ? 'Subscription ended — tap to upgrade'
                            : 'Payment failed — update payment method'}
                    </Text>
                    <MaterialIcons
                        name="chevron-right"
                        size={14}
                        color={isBlocked ? '#EF4444' : '#FBBF24'}
                    />
                </TouchableOpacity>
            )}

            <View style={styles.header}>
                {/* Left — menu button */}
                <TouchableOpacity
                    style={styles.side}
                    onPress={() => navigation.navigate('MenuScreen')}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="menu" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Center — logo */}
                <View style={styles.logoWrap} pointerEvents="none">
                    <Image
                        source={require('../assets/images/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Right — token balance pill */}
                <TouchableOpacity
                    style={[styles.side, styles.sideRight]}
                    onPress={() => setDrawerVisible(true)}
                    activeOpacity={0.75}
                >
                    <View style={styles.tokenPill}>
                        {/* Mini bar */}
                        <View style={styles.tokenBarTrack}>
                            <View
                                style={[
                                    styles.tokenBarFill,
                                    {
                                        width: `${Math.min(tokenPct * 100, 100)}%`,
                                        backgroundColor: tokenColor,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.tokenText, { color: tokenColor }]}>
                            {tokenBalance}
                        </Text>
                        <MaterialIcons name="bolt" size={13} color={tokenColor} />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <TokenHistoryDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
            />
        </View>
    );
};

const SIDE_WIDTH = 72;

const styles = StyleSheet.create({
    globalBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    pastDueBanner: {
        backgroundColor: 'rgba(251,191,36,0.12)',
    },
    blockedBanner: {
        backgroundColor: 'rgba(239,68,68,0.12)',
    },
    bannerText: {
        flex: 1,
        fontSize: 11,
        fontFamily: 'Oswald-Regular',
        letterSpacing: 0.3,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight + 12,
        paddingBottom: 12,
        justifyContent: 'space-between',
    },

    side: {
        width: SIDE_WIDTH,
        justifyContent: 'center',
    },
    sideRight: {
        alignItems: 'flex-end',
    },

    logoWrap: {
        alignItems: 'center',
    },
    logo: {
        width: 220,
        height: 72,
    },

    // Token pill
    tokenPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 14,
        paddingHorizontal: 8,
        paddingVertical: 5,
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        minWidth: 62,
    },
    tokenBarTrack: {
        width: 28,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    tokenBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    tokenText: {
        fontFamily: 'Oswald-Bold',
        fontSize: 16,
    },

    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 0,
        marginTop: 7,
    },
});

export default Header;
