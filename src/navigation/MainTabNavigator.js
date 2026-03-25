import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeSongsScreen from '../components/HomeSongsScreen';
import LibraryHomeScreen from '../components/LibraryHomeScreen';
import SongCreationScreen from '../components/SongCreationScreen';
import CustomBottomTabBar from './CustomBottomTabBar';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomBottomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
            initialRouteName="HomeSongsScreen"
        >
            <Tab.Screen name="HomeSongsScreen" component={HomeSongsScreen} />
            <Tab.Screen name="LibraryHomeScreen" component={LibraryHomeScreen} />
            <Tab.Screen name="SongCreationScreen" component={SongCreationScreen} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
