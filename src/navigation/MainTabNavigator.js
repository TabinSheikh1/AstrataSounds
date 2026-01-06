import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeSongsScreen from '../components/HomeSongsScreen';
import CustomBottomTabBar from './CustomBottomTabBar';
import LibraryHomeScreen from '../components/LibraryHomeScreen'
import SongCreationScreen from '../components/SongCreationScreen'
import MenuScreen from '../components/MenuScreen'
import LeaderBoardScreen from '../components/LeaderBoardScreen';
import SingersScreen from '../components/SingersScreen';

const Tab = createBottomTabNavigator();

// This line was the error - it should be a proper function name
const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            // This links to your custom notched bar design
            tabBar={(props) => <CustomBottomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="HomeSongsScreen" component={HomeSongsScreen} />
            <Tab.Screen name="LibraryHomeScreen" component={LibraryHomeScreen} />
            <Tab.Screen name="SongCreationScreen" component={SongCreationScreen} />
            <Tab.Screen name="MenuScreen" component={MenuScreen} />
            <Tab.Screen name="LeaderBoardScreen" component={LeaderBoardScreen} />
            <Tab.Screen name="SingersScreen" component={SingersScreen} />

        </Tab.Navigator>
    );
};

export default MainTabNavigator;