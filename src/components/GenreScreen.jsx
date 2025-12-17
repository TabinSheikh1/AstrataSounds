import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    ImageBackground
} from 'react-native';
import Header from './Header';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const BackgroundScreen = () => {
    const [selectedTab, setSelectedTab] = useState('Genres');
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/image-1.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                {/* Header on top */}
                <Header
                    title="STRATASOUND MUSIC"
                    coins={25}
                    onMenuPress={() => console.log("Menu pressed")}
                />

                <View style={styles.tabsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabs}
                    >
                        {['Songs', 'Playlists', 'Genres'].map((tab) => {
                            const isSelected = selectedTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => {
                                    if (tab === 'Songs') {
                                        navigation.navigate('HomeSongsScreen');
                                    } else if (tab === 'Playlists') {
                                        navigation.navigate('PlaylistsScreen');
                                    } else {
                                        setSelectedTab(tab);
                                    }
                                }}
                                    style={[
                                        styles.tabItem,
                                        isSelected && styles.activeTab
                                    ]}
                                >
                                    <Text style={styles.tabText}>{tab}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    background: {
        flex: 1,
        paddingTop: 40,
    },
    tabsContainer: {
        marginTop: 10,        // keeps tabs near header
    },

    tabs: {
        paddingHorizontal: 12,
    },

    tabItem: {
        marginRight: 20,
    },

    activeTab: {
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
    },

    tabText: {
        fontSize: 15,
        fontFamily: 'Oswald-Bold',
        color: '#fff',
    },
});


export default BackgroundScreen;
