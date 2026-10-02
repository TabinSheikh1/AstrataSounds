import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../components/HomeScreen';
import HomeSongsScreen from '../components/HomeSongsScreen';
import SongCreationScreen from '../components/SongCreationScreen';
import LibraryHomeScreen from '../components/LibraryHomeScreen';

const Tab = createBottomTabNavigator();

// Its own tab bar is hidden — GlobalTabBar (rendered once in AppNavigator)
// is the single persistent bar shown across every screen, not just these 4.
const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
            initialRouteName="HomeScreen"
        >
            <Tab.Screen name="HomeScreen" component={HomeScreen} />
            <Tab.Screen name="HomeSongsScreen" component={HomeSongsScreen} />
            <Tab.Screen name="SongCreationScreen" component={SongCreationScreen} />
            <Tab.Screen name="LibraryHomeScreen" component={LibraryHomeScreen} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
