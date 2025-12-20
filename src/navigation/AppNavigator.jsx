import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../components/SplashScreen';
import LoginScreen from '../components/LoginScreen';
import SignUpScreen from '../components/SignUpScreen'
import ForgotPasswordScreen from '../components/forgotPasswordScreen'
import VerificationScreen from '../components/VerificationScreen'
import ResetPasswordScreen from '../components/ResetPasswordScreen'
import SuccessModal from '../components/SuccessModal'
import SongDetailScreen from '../components/SongDetailScreen'
import Header from '../components/Header'
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen}/>
      <Stack.Screen name='SignUpScreen' component={SignUpScreen}/>
      <Stack.Screen name='ForgotPasswordScreen' component={ForgotPasswordScreen}/>
      <Stack.Screen name='VerificationScreen' component={VerificationScreen}/>
      <Stack.Screen name='ResetPasswordScreen' component={ResetPasswordScreen}/>
      <Stack.Screen name='SuccessModal' component={SuccessModal}/>


      <Stack.Screen name='MainApp' component={MainTabNavigator}/>
      <Stack.Screen name='Header' component={Header}/>
      <Stack.Screen name='SongDetailScreen' component={SongDetailScreen}/>
      
      
    </Stack.Navigator>
  );
};

export default AppNavigator;
