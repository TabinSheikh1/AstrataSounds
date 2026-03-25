import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
// import { setupPlayer } from 'react-native-track-player/lib/src/trackPlayer';
import { setupPlayer } from './src/player/setupPlayer';
import { Provider } from "react-redux";
import { store, persistor } from "./src/store/store";
import { PersistGate } from "redux-persist/integration/react";

const App = () => {
  useEffect(() => {
    setupPlayer();
  }, []);
  return (

    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}

      >

        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
