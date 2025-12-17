// Header.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Header = ({ title = "STRATASOUND MUSIC", coins = 25, onMenuPress }) => {
    return (
        <View>
            <View style={styles.header}>
                <TouchableOpacity onPress={onMenuPress}>
                    <MaterialIcons name="menu" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={styles.coins}>
                    <Image
                        source={require('../assets/images/gem-1.png')}
                        style={{ marginTop: 6 }}
                        resizeMode="cover"
                    />
                    <Text style={styles.coinText}>{coins}</Text>
                </View>
            </View>
            <View style={styles.line}></View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Oswald-Bold',
    },
    coins: {
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 12,
        flexDirection: 'row',
        gap: 5,
    },
    coinText: {
        fontFamily: 'Oswald-Bold',
        color: '#000',
        fontSize: 12,
    },
    line: {
        borderWidth: 0.2,
        borderColor: 'white',
        marginVertical: 5,
    },
});

export default Header;
