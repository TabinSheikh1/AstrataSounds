import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
// import { setupPlayer } from 'react-native-track-player/lib/src/trackPlayer';
import { setupPlayer } from './src/player/setupPlayer';
const App = () => {
  useEffect(() => {
    setupPlayer();
  }, []);
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
