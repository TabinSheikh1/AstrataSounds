import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSubscription } from '../hooks/useSubscription';

import SplashScreen from '../components/SplashScreen';
import LoginScreen from '../components/LoginScreen';
import SignUpScreen from '../components/SignUpScreen';
import ForgotPasswordScreen from '../components/forgotPasswordScreen';
import VerificationScreen from '../components/VerificationScreen';
import ResetPasswordScreen from '../components/ResetPasswordScreen';
import SongDetailScreen from '../components/SongDetailScreen';
import MenuScreen from '../components/MenuScreen';
import LeaderBoardScreen from '../components/LeaderBoardScreen';
import SingersScreen from '../components/SingersScreen';
import PricingScreen from '../components/PricingScreen';
import BillingScreen from '../components/BillingScreen';
import SubscriptionSuccessScreen from '../components/SubscriptionSuccessScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
    <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
    <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
    <Stack.Screen name="PricingScreen" component={PricingScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainApp" component={MainTabNavigator} />
    <Stack.Screen name="SongDetailScreen" component={SongDetailScreen} />
    <Stack.Screen name="MenuScreen" component={MenuScreen} />
    <Stack.Screen name="LeaderBoardScreen" component={LeaderBoardScreen} />
    <Stack.Screen name="SingersScreen" component={SingersScreen} />
    <Stack.Screen name="PricingScreen" component={PricingScreen} />
    <Stack.Screen name="BillingScreen" component={BillingScreen} />
    <Stack.Screen name="SubscriptionSuccessScreen" component={SubscriptionSuccessScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { refreshAll, fetchPlans } = useSubscription();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch subscription data whenever auth state is confirmed
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
    // Always load plans (public endpoint)
    fetchPlans();
  }, [isAuthenticated]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
};

export default AppNavigator;