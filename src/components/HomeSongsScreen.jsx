import React from 'react';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GradientBackground from './GradientBackground';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';

const { width } = Dimensions.get('window');

const songs = [
    {
        id: '1',
        title: 'Forever Starts now',
        artist: 'Dummy Song',
        description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.',
        image: require('../assets/images/Rectangle-9560.png')
    },
    {
        id: '2',
        title: 'Dummy Song Name',
        artist: 'Dummy Song',
        description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.',
        image: require('../assets/images/Rectangle-9561.png')
    },
    {
        id: '3',
        title: 'Dummy Song Name',
        artist: 'Dummy Song',
        description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.',
        image: require('../assets/images/Rectangle-9562.png')
    },
    {
        id: '4',
        title: 'Dummy Song Name',
        artist: 'Dummy Song',
        description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.',
        image: require('../assets/images/Rectangle-9563.png')
    },
    {
        id: '5',
        title: 'Dummy Song Name',
        artist: 'Dummy Song',
        description: 'It Is A Long Established Fact That A Reader Will Be Distracted When Looking At Its Layout.',
        image: require('../assets/images/Rectangle-9564.png')
    },
];

const App = () => {
    const [selectedTab, setSelectedTab] = useState('Songs'); // Tabs state
    const [selectedSubTab, setSelectedSubTab] = useState('Staff Picks');
    const navigation = useNavigation()

    const renderSong = ({ item }) => (
        <View style={styles.songCard}>
            <Image source={item.image} style={styles.songImage} />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.songTitle}>{item.title}</Text>
                <Text style={styles.songArtist}>{item.artist}</Text>
                <Text style={styles.songDesc}>{item.description}</Text>
                <View style={styles.songActions}>
                    <View style={styles.actionItem}>
                        <Image
                            source={require('../assets/images/like.png')}
                            style={{ marginTop: 1 }}
                        />
                        <Text style={styles.actionText}>50k</Text>
                    </View>
                    <View style={styles.actionItem}>
                        <Image
                            source={require('../assets/images/headphone.png')}
                            style={{ marginTop: 1 }}
                        />
                        <Text style={styles.actionText}>50k</Text>
                    </View>
                    <TouchableOpacity style={{ marginLeft: 15 }}>
                        <Image
                            source={require('../assets/images/share.png')}
                            style={{ marginTop: 1 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={{ flex: 1, width: '100%', height: '100%' }}
            resizeMode="cover"
        >
            <View style={styles.container}>

                {/* Header */}
                <Header
                    title="STRATASOUND MUSIC"
                    coins={25}
                    onMenuPress={() => console.log("Menu pressed")}
                />
                {/* Tabs */}
                <ScrollView horizontal style={styles.tabs} showsHorizontalScrollIndicator={false}>
                    {['Songs', 'Playlists', 'Genres'].map((tab, index) => {
                        const isSelected = selectedTab === tab;
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    if (tab === 'Playlists') {
                                        navigation.navigate('PlaylistsScreen');
                                    } else if (tab === 'Genres') {
                                        navigation.navigate('GenreScreen');
                                    } else {
                                        setSelectedTab(tab);
                                    }
                                }}
                                style={[
                                    styles.tabItem,
                                    {
                                        borderBottomWidth: isSelected ? 1 : 0,
                                        borderBottomColor: isSelected  ? '#ffffffff' : 'transparent',
                                        paddingHorizontal: 4,
                                        paddingVertical: 3,
                                        marginTop: 10,
                                    }
                                ]}
                            >
                                <Text style={styles.tabText}>{tab}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Sub Tabs */}
                <ScrollView horizontal style={styles.subTabs} showsHorizontalScrollIndicator={false}>
                    {['Staff Picks', 'Today', 'Week', 'Month', 'All', 'New'].map((tab, index) => {
                        const isSelected = selectedSubTab === tab;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.subTabItem,
                                    { backgroundColor: isSelected ? '#66cc33' : '#ffffffff' }
                                ]}
                                onPress={() => setSelectedSubTab(tab)}
                            >
                                <Text style={[styles.subTabText, { color: isSelected ? '#fff' : '#66cc33' }]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Song List */}
                <FlatList
                    data={songs}
                    renderItem={renderSong}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 40,

    },

    // Tabs
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        gap: 10,
        marginBottom: 10,
    },
    tabItem: {
        marginRight: 20,
        alignItems: 'center', // center underline under text
    },
    tabText: {
        fontSize: 15,
        fontFamily: 'Oswald-Bold',
        color: 'white'
    },

    // Sub-tabs
    subTabs: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        marginBottom: 15,
        marginTop: 10,
    },
    subTabItem: {
        marginRight: 10,
        backgroundColor: '#12db00',
        paddingHorizontal: 10,
        borderRadius: 5,
        paddingVertical: 2,

    },
    subTabText: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        fontSize: 13,
        textAlign: 'center'

    },

    // Song Card
    songCard: {
        flexDirection: 'row',
        marginBottom: 10,
        borderRadius: 12,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    songImage: {
        width: 110,
        height: 100,
        borderRadius: 5,
    },
    songTitle: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        marginBottom: 2,
    },
    songArtist: {
        color: '#fff',
        fontFamily: 'Oswald-Bold',
        marginBottom: 2,
        fontSize: 12
    },
    songDesc: {
        color: '#fff',
        fontSize: 10,
    },
    songActions: {
        flexDirection: 'row',
        marginTop: 6,
        alignItems: 'center',
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    actionText: {
        color: '#fff',
        marginLeft: 4,
        fontFamily: 'Oswald-Bold'
    },

    // Bottom Navigation
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 70,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    homeButton: {
        backgroundColor: '#71B8F4',
        borderRadius: 35,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});


export default App;
