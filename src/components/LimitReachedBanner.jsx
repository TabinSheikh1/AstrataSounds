import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Shown when a plan limit (vibes, playlists, downloads, ...) has been reached.
// Tapping it sends the user to the pricing screen to upgrade.
const LimitReachedBanner = ({ message, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient
            colors={['rgba(251,191,36,0.22)', 'rgba(239,68,68,0.14)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.gradient}
        >
            <View style={styles.content}>
                <MaterialIcons name="info-outline" size={14} color="#FBBF24" />
                <Text style={styles.text}>{message}</Text>
                <MaterialIcons name="chevron-right" size={14} color="#FBBF24" />
            </View>
        </LinearGradient>
    </TouchableOpacity>
);

export default LimitReachedBanner;

const styles = StyleSheet.create({
    gradient: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(251,191,36,0.3)',
        marginHorizontal: 16,
        marginTop: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    text: {
        flex: 1,
        color: '#FBBF24',
        fontFamily: 'Oswald-Regular',
        fontSize: 12,
    },
});
