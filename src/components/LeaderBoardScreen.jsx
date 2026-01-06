import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    StatusBar,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from './Header'; // Your existing Header import
const { width } = Dimensions.get('window');

// Mock Data for the Leaderboard
const leaderData = [
    { id: '1', rank: '01', name: 'SINGER NAME', likes: '500k', listens: '70k', songs: '600 Songs', points: '5115', image: require('../assets/images/Rectangle-9560.png') },
    { id: '2', rank: '02', name: 'SINGER NAME', likes: '300k', listens: '61k', songs: '520 Songs', points: '5000', image: require('../assets/images/Rectangle-9561.png') },
    { id: '3', rank: '03', name: 'SINGER NAME', likes: '280k', listens: '51k', songs: '400 Songs', points: '4968', image: require('../assets/images/Rectangle-9562.png') },
    { id: '4', rank: '04', name: 'SINGER NAME', likes: '220k', listens: '43k', songs: '380 Songs', points: '4915', image: require('../assets/images/Rectangle-9563.png') },
    { id: '5', rank: '05', name: 'SINGER NAME', likes: '190k', listens: '35k', songs: '300 Songs', points: '4810', image: require('../assets/images/Rectangle-9564.png') },
    { id: '6', rank: '06', name: 'SINGER NAME', likes: '120k', listens: '30k', songs: '280 Songs', points: '4315', image: require('../assets/images/Rectangle-9560.png') },
    { id: '7', rank: '07', name: 'SINGER NAME', likes: '100k', listens: '18k', songs: '220 Songs', points: '4015', image: require('../assets/images/Rectangle-9561.png') },
      { id: '8', rank: '08', name: 'SINGER NAME', likes: '190k', listens: '35k', songs: '300 Songs', points: '4810', image: require('../assets/images/Rectangle-9564.png') },
    { id: '9', rank: '09', name: 'SINGER NAME', likes: '120k', listens: '30k', songs: '280 Songs', points: '4315', image: require('../assets/images/Rectangle-9560.png') },
    { id: '10', rank: '10', name: 'SINGER NAME', likes: '100k', listens: '18k', songs: '220 Songs', points: '4015', image: require('../assets/images/Rectangle-9561.png') },
];

const App = () => {
    // Render function for each row
    const renderLeaderItem = ({ item }) => (
        <View style={styles.leaderRow}>
            <Text style={styles.rankText}>{item.rank}</Text>

            <View style={styles.avatarContainer}>
                <Image source={item.image} style={styles.avatar} />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.singerName}>{item.name}</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statDetail}>
                        <Image source={require('../assets/images/like.png')}/>
                        <Text style={styles.statValue}>{item.likes}</Text>
                    </View>
                    <View style={styles.statDetail}>
                        <Image source={require('../assets/images/headphone.png')}/>
                        <Text style={styles.statValue}>{item.listens}</Text>
                    </View>
                    <Text style={styles.songCount}>{item.songs}</Text>
                </View>
            </View>

            <View style={styles.pointsWrapper}>
                <Image source={require('../assets/images/gem-1.png')} style={styles.gemIcon} />
                <Text style={styles.pointsValue}>{item.points}</Text>
            </View>
        </View>
        
    );

    return (
            <ImageBackground
            source={require('../assets/images/image-1.jpg')}
            style={styles.background}
            resizeMode="cover">

            <View style={styles.headerWrapper}>
                <Header title="STRATASOUND MUSIC" />
            </View>

            {/* 2. Page Title */}
            <Text style={styles.pageTitle}>Leaderboard</Text>

            {/* 3. Leaderboard List */}
            <FlatList
                data={leaderData}
                renderItem={renderLeaderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.lineSeparator} />}
                showsVerticalScrollIndicator={false}
            />
        </ImageBackground>
    );
};

export default App;

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    headerWrapper: {
        paddingTop: 40,
    },
    pageTitle: {
        fontSize: 24,
        color: 'white',
        fontFamily: 'Oswald-Bold',
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal:25,
        paddingBottom: 100,
    },
    leaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    rankText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Oswald-Bold',
        width: 30,
    },
    avatarContainer: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    infoContainer: {
        flex: 1,
    },
    singerName: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Oswald-Bold',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    statValue: {
        color: 'white',
        fontSize: 11,
        marginLeft: 3,
    },
    songCount: {
        color: 'white',
        fontSize: 11,
    },
    pointsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gemIcon: {
        width: 16,
        height: 16,
        marginRight: 5,
    },
    pointsValue: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Oswald-Bold',
    },
    lineSeparator: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});