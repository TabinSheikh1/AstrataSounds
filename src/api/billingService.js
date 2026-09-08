import { Platform } from 'react-native';
import API from './axiosInstance';

// TODO: backend endpoint not built yet — this is the client side of the native
// in-app-purchase verification flow that replaces Stripe checkout for anything
// bought from inside the app (subscriptions, credit packs, cover art).
// The backend must verify `purchase` server-side via the App Store Server API
// (iOS) / Google Play Developer API (Android) before granting anything — never
// trust the client-reported purchase state alone.
export const verifyPurchase = (purchase) =>
  API.post('/billing/verify-purchase', {
    platform: Platform.OS,
    purchase,
  });
