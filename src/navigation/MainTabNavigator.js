import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../components/HomeScreen';
import HomeSongsScreen from '../components/HomeSongsScreen';
import SongCreationScreen from '../components/SongCreationScreen';
import LibraryHomeScreen from '../components/LibraryHomeScreen';
import CustomBottomTabBar from './CustomBottomTabBar';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomBottomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
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
