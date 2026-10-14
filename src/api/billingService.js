import { Platform } from 'react-native';
import API from './axiosInstance';

// Client side of native in-app-purchase verification (subscriptions and credit packs).
// The backend verifies `purchase` with the App Store Server API (iOS) / Google Play
// Developer API (Android) before granting anything.
export const verifyPurchase = (purchase) =>
  API.post('/billing/verify-purchase', {
    platform: Platform.OS,
    purchase,
  });
