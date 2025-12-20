import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    ImageBackground
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';

const { width } = Dimensions.get('window');

// Mock data for the Playlist Grid
const playlists = [
    { id: '1', title: 'Forever Starts now', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9560.png') },
    { id: '2', title: 'Forever Starts now', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9561.png') },
    { id: '3', title: 'Forever Starts now', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9562.png') },
    { id: '4', title: 'Forever Starts now', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9563.png') },
    { id: '5', title: 'Forever Starts now', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9564.png') },
    { id: '6', title: 'Forever Starts now', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9560.png') },
];
const genres = [
    { id: '1', tag: 'POP', image: require('../assets/images/Rectangle-9560.png') },
    { id: '2', tag: 'ROP', image: require('../assets/images/Rectangle-9561.png') },
    { id: '3', tag: 'POP', image: require('../assets/images/Rectangle-9562.png') },
    { id: '4', tag: 'ROP', image: require('../assets/images/Rectangle-9563.png') },
    { id: '5', tag: 'POP', image: require('../assets/images/Rectangle-9564.png') },
    { id: '6', tag: 'R&B', image: require('../assets/images/Rectangle-9560.png') },
    { id: '7', tag: 'EDM', image: require('../assets/images/Rectangle-9561.png') },
    { id: '8', tag: 'ROCK', image: require('../assets/images/Rectangle-9562.png') },
];


const App = () => {
    const [selectedTab, setSelectedTab] = useState('Songs');
    const [selectedSubTab, setSelectedSubTab] = useState('Staff Picks');
    const navigation = useNavigation();

    // 1. Render function for the Playlist Grid Items
    const renderPlaylistItem = ({ item }) => (
        <TouchableOpacity
            style={styles.playlistCard}
            onPress={() => navigation.navigate('SongDetailScreen', { playlistId: item.id })}
        >
            <Image source={item.image} style={styles.playlistImage} />
            <View style={styles.playlistInfoRow}>
                <Text style={styles.playlistTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.playlistSongCount}>{item.songs}</Text>
            </View>
            <View style={styles.userRow}>
                <Image source={item.image} style={styles.userAvatar} />
                <Text style={styles.userName}>{item.user}</Text>
            </View>
        </TouchableOpacity>
    );


    // Render function for Songs (Your existing code)
    const renderSong = ({ item }) => (
        <View style={styles.songCard}>
            <TouchableOpacity onPress={()=>navigation.navigate('SongDetailScreen')}>
            <Image source={item.image} style={styles.songImage} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.songTitle}>{item.title}</Text>
                <Text style={styles.songArtist}>{item.artist}</Text>
                <Text style={styles.songDesc}>{item.description}</Text>
                <View style={styles.songActions}>
                    <View style={styles.actionItem}>
                        <Image source={require('../assets/images/like.png')} style={{ marginTop: 1 }} />
                        <Text style={styles.actionText}>50k</Text>
                    </View>
                    <View style={styles.actionItem}>
                        <Image source={require('../assets/images/headphone.png')} style={{ marginTop: 1 }} />
                        <Text style={styles.actionText}>50k</Text>
                    </View>
                    <TouchableOpacity style={{ marginLeft: 15 }}>
                        <Image source={require('../assets/images/share.png')} style={{ marginTop: 1 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderGenreItem = ({ item }) => (
        <TouchableOpacity style={styles.genreCard} onPress={()=>navigation.navigate('SongDetailScreen')}>
            <ImageBackground
                source={item.image}
                style={styles.genreImage}
                imageStyle={{ borderRadius: 4 }}
            >
                {/* Genre Tag Badge */}
                <View style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{item.tag}</Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

    const songs = [
        { id: '1', title: 'Forever Starts now', artist: 'Dummy Song', description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.', image: require('../assets/images/Rectangle-9560.png') },
        { id: '2', title: 'Dummy Song Name', artist: 'Dummy Song', description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.', image: require('../assets/images/Rectangle-9561.png') },
        { id: '3', title: 'Dummy Song Name', artist: 'Dummy Song', description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.', image: require('../assets/images/Rectangle-9562.png') },
        { id: '4', title: 'Dummy Song Name', artist: 'Dummy Song', description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.', image: require('../assets/images/Rectangle-9563.png') },
        { id: '5', title: 'Dummy Song Name', artist: 'Dummy Song', description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.', image: require('../assets/images/Rectangle-9564.png') },
    ];

    const renderContent = () => {
        if (selectedTab === 'Songs') {
            return (
                <>
                    <ScrollView horizontal style={styles.subTabs} showsHorizontalScrollIndicator={false}>
                        {['Staff Picks', 'Today', 'Wek', 'Month', 'All', 'New'].map((tab, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.subTabItem, { backgroundColor: selectedSubTab === tab ? '#66cc33' : '#ffffffff' }]}
                                onPress={() => setSelectedSubTab(tab)}
                            >
                                <Text style={[styles.subTabText, { color: selectedSubTab === tab ? '#fff' : '#66cc33' }]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <FlatList
                        data={songs}
                        renderItem={renderSong}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                </>
            );
        }

        // 2. Updated Playlists Tab Logic
        if (selectedTab === 'Playlists') {
            return (

                <FlatList
                    data={playlists}
                    renderItem={renderPlaylistItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.playlistGrid}
                    showsVerticalScrollIndicator={false}
                />

            );
        }

        if (selectedTab === 'Genres') {
            return (
                <FlatList
                    data={genres}
                    renderItem={renderGenreItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.genreGrid}
                    showsVerticalScrollIndicator={false}
                />
            );
        }
    };

    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={{ flex: 1, width: '100%', height: '100%' }}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Header title="STRATASOUND MUSIC" coins={25} onMenuPress={() => console.log("Menu pressed")} />
                <View style={{ height: 50 }}>
                    <ScrollView horizontal style={styles.tabs} showsHorizontalScrollIndicator={false}>
                        {['Songs', 'Playlists', 'Genres'].map((tab, index) => {
                            const isSelected = selectedTab === tab;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedTab(tab)}
                                    style={[styles.tabItem, { borderBottomWidth: isSelected ? 1 : 0, borderBottomColor: isSelected ? '#fff' : 'transparent', marginTop: 10 }]}
                                >
                                    <Text style={styles.tabText}>{tab}</Text>
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
    container: {
        flex: 1,
        paddingTop: 40
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        marginBottom: 10,
        marginLeft:15,
    },
    tabItem: {
        marginRight: 40,
        alignItems: 'center'
    },
    tabText: {
        fontSize: 15,
        fontFamily: 'Oswald-Bold',
        color: 'white'
    },
    subTabs: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        marginBottom: 15,
        marginTop: 10,
        marginLeft:5,
    },
    subTabItem: {
        marginRight: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        paddingVertical: 2
    },
    subTabText: {
        fontFamily: 'Oswald-Bold',
        fontSize: 13,
        textAlign: 'center'
    },

    // Song Styles (Your Existing)
    songCard: {
        flexDirection: 'row',
        marginBottom: 12,
        borderRadius: 12,
        paddingHorizontal: 25,
        marginTop: 10
    },
    songImage: {
        width: 110,
        height: 100,
        borderRadius: 5
    },
    songTitle: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        marginBottom: 2
    },
    songArtist: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        marginBottom: 2,
        fontSize: 12
    },
    songDesc: {
        color: '#fff',
        fontSize: 10
    },
    songActions: {
        flexDirection: 'row',
        marginTop: 6,
        alignItems: 'center'
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12
    },
    actionText: {
        color: '#fff',
        marginLeft: 4,
        fontFamily: 'Oswald-Bold'
    },

    // 3. New Playlist Grid Styles
    playlistGrid: {
        paddingHorizontal: 10,
        paddingBottom: 100
    },
    playlistCard: {
        flex: 1,
        margin: 8,
        maxWidth: (width / 2) - 20
    },
    playlistImage: {
        width: '100%',
        height: 160,
        borderRadius: 4
    },
    playlistInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8
    },
    playlistTitle: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Oswald-Bold',
        flex: 1
    },
    playlistSongCount: {
        color: '#fff',
        fontSize: 9,
        marginLeft: 5,
        opacity: 0.8
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    userAvatar: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#444'
    },
    userName: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 6,
        opacity: 0.9,
        fontFamily: 'Oswald-Bold'
    },
    // --- Genre Specific Styles ---
    genreGrid: {
        paddingHorizontal: 10,
        paddingBottom: 100,
        paddingTop: 10
    },
    genreCard: {
        flex: 1,
        margin: 8,
        height: 160, // Set a fixed height for the grid items
        maxWidth: (width / 2) - 20
    },
    genreImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-end', // Aligns badge to the right
    },
    genreBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark semi-transparent background
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 5,
        marginRight: 8
    },
    genreBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Oswald-Bold',
    },

});

export default App;