import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    ImageBackground
} from 'react-native';
import Header from './Header';

const { width } = Dimensions.get('window');

const playlists = [
    { id: '1', title: 'Dummy Name', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9560.png') },
    { id: '2', title: 'Dummy Name', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9561.png') },
    { id: '3', title: 'Dummy Name', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9562.png') },
    { id: '4', title: 'Dummy Name', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9563.png') },
    { id: '5', title: 'Dummy Name', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9562.png') },
    { id: '6', title: 'Dummy Name', songs: '18 Songs', user: 'Dummy name', image: require('../assets/images/Rectangle-9563.png') },
];

const App = () => {

    const renderPlaylistItem = ({ item }) => (
        <TouchableOpacity style={styles.playlistCard}>
            <Image source={item.image} style={styles.playlistImage} />

            <View style={styles.playlistInfoRow}>
                <Text style={styles.playlistTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.playlistSongCount}>
                    {item.songs}
                </Text>
            </View>

            <View style={styles.userRow}>
                <Image source={item.image} style={styles.userAvatar} />
                <Text style={styles.userName}>{item.user}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            {/* Header */}
            <Header title="STRATASOUND MUSIC" />
            <View>
                <Text style={styles.singertxt}>Singer Name</Text>
            </View>

            {/* Playlist Cards */}
            <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.playlistGrid}
                showsVerticalScrollIndicator={false}
            />
        </ImageBackground>
    );
};

export default App;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        paddingTop: 40
    },
    singertxt: {
        color: '#fff',
        fontSize: 22,
        fontFamily:'Oswald-Bold',
        alignSelf: 'center',
        marginTop: 10
    },
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
        marginTop: 6
    },

    playlistTitle: {
        color: '#fff',
        fontSize: 13,
        fontFamily:'Oswald-Medium',
        flex: 1
    },

    playlistSongCount: {
        color: '#fff',
        fontSize: 9,
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
        borderRadius: 9
    },

    userName: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 6,
        fontFamily:'Oswald-Regular',
    }
});
