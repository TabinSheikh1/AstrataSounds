import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

const SINGERS = [
    { id: '1', name: 'Aria Luna',    genre: 'Pop · R&B',   songs: 24, image: require('../assets/images/Rectangle-9560.png') },
    { id: '2', name: 'Marcus Reed',  genre: 'Rock · Blues', songs: 18, image: require('../assets/images/Rectangle-9561.png') },
    { id: '3', name: 'Sofia Vega',   genre: 'EDM · Dance',  songs: 31, image: require('../assets/images/Rectangle-9562.png') },
    { id: '4', name: 'James Cole',   genre: 'Hip Hop',      songs: 12, image: require('../assets/images/Rectangle-9563.png') },
    { id: '5', name: 'Nadia Frost',  genre: 'Indie · Folk', songs: 9,  image: require('../assets/images/Rectangle-9562.png') },
    { id: '6', name: 'Tyler Banks',  genre: 'R&B · Soul',   songs: 27, image: require('../assets/images/Rectangle-9563.png') },
    { id: '7', name: 'Zara Nile',    genre: 'Afrobeats',    songs: 15, image: require('../assets/images/Rectangle-9560.png') },
    { id: '8', name: 'Evan Stone',   genre: 'Country',      songs: 20, image: require('../assets/images/Rectangle-9561.png') },
];

const SingersScreen = () => {
    const navigation = useNavigation();
    const [query, setQuery] = useState('');

    const filtered = query.trim()
        ? SINGERS.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
        : SINGERS;

    const renderSinger = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
            <Image source={item.image} style={styles.cardImage} />

            {/* Gradient overlay bottom */}
            <View style={styles.cardOverlay} />

            {/* Song count badge */}
            <View style={styles.badge}>
                <MaterialIcons name="music-note" size={11} color="#fff" />
                <Text style={styles.badgeText}>{item.songs}</Text>
            </View>

            <View style={styles.cardInfo}>
                <Text style={styles.singerName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.singerGenre} numberOfLines={1}>{item.genre}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <Header title="STRATASOUND MUSIC" />

            {/* Page title */}
            <View style={styles.titleRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Singers</Text>
                <View style={styles.backBtn} />
            </View>

            {/* Search bar */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#aaa" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search singers..."
                    placeholderTextColor="#aaa"
                    value={query}
                    onChangeText={setQuery}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                        <MaterialIcons name="close" size={18} color="#aaa" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Grid */}
            <FlatList
                data={filtered}
                renderItem={renderSinger}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialIcons name="mic-off" size={48} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.emptyText}>No singers found</Text>
                    </View>
                }
            />
        </ImageBackground>
    );
};

export default SingersScreen;

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },

    // Title row
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    backBtn: {
        width: 36,
        alignItems: 'center',
    },
    pageTitle: {
        color: '#fff',
        fontSize: 22,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontFamily: 'Oswald-Regular',
        fontSize: 14,
        height: '100%',
    },

    // Grid
    grid: {
        paddingHorizontal: 12,
        paddingBottom: 120,
    },

    // Card
    card: {
        width: CARD_SIZE,
        margin: 6,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    cardImage: {
        width: '100%',
        height: CARD_SIZE,
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '55%',
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(4,126,201,0.85)',
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 3,
        gap: 2,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Oswald-Medium',
    },
    cardInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
    },
    singerName: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Oswald-Bold',
        letterSpacing: 0.5,
    },
    singerGenre: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 11,
        fontFamily: 'Oswald-Regular',
        marginTop: 2,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        marginTop: 80,
        gap: 12,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Oswald-Regular',
        fontSize: 16,
    },
});
