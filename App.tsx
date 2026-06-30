import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { setupPlayer } from './src/player/setupPlayer';
import { Provider } from 'react-redux';
import { store, persistor } from './src/store/store';
import { PersistGate } from 'redux-persist/integration/react';

export const navigationRef = createNavigationContainerRef<any>();

const navigate = (name: string, params?: object) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};

const resolveDeepLink = (url: string | null) => {
  if (!url) return;

  // strataSounds://subscription/success  →  SubscriptionSuccessScreen
  if (url.includes('subscription/success')) {
    navigate('SubscriptionSuccessScreen');
    return;
  }

  // strataSounds://subscription/cancel  →  do nothing (stay on current screen)
  if (url.includes('subscription/cancel')) {
    return;
  }

  // strataSounds://billing  /  strataSounds://billing?tokenPurchase=success
  // strataSounds://settings/billing
  if (url.includes('billing')) {
    navigate('BillingScreen');
    return;
  }
};

const App = () => {
  const pendingUrl = useRef<string | null>(null);

  useEffect(() => {
    setupPlayer();
  }, []);

  useEffect(() => {
    // Cold start — app was not running when the deep link fired
    Linking.getInitialURL().then((url) => {
      if (url) {
        if (navigationRef.isReady()) {
          resolveDeepLink(url);
        } else {
          pendingUrl.current = url;
        }
      }
    });

    // Warm start — app was already running in the background
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (navigationRef.isReady()) {
        resolveDeepLink(url);
      } else {
        pendingUrl.current = url;
      }
    });

    return () => sub.remove();
  }, []);

  const handleNavReady = () => {
    if (pendingUrl.current) {
      resolveDeepLink(pendingUrl.current);
      pendingUrl.current = null;
    }
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer ref={navigationRef} onReady={handleNavReady}>
          <AppNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
