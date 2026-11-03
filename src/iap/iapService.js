import { Platform, Alert } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  restorePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ErrorCode,
} from 'react-native-iap';
import { ALL_SUBSCRIPTION_SKUS, ALL_CONSUMABLE_SKUS, CREDIT_PACK_SKUS, CREDIT_PACKS } from './products';
import { verifyPurchase } from '../api/billingService';
import { getMySubscription, getTokenBalance } from '../api/subscriptionsService';
import { store } from '../store/store';
import { setSubscription, setTokens } from '../store/slices/subscriptionSlice';
import { getErrorMessage } from '../utils/errorHandler';
import { navigate } from '../navigation/navigationRef';

// Set right before dispatching a subscription purchase, consumed by the next event the
// listener below handles. purchaseUpdatedListener fires for more than just "the purchase
// you just made" — it also redelivers any unfinished transaction on initConnection()/
// restorePurchases() (e.g. a previous purchase whose verify-purchase call failed). Without
// this guard, that redelivery landing on an unrelated app launch would yank the user to
// SubscriptionSuccessScreen out of nowhere. Only a purchase requested in this session, via
// purchaseSubscription() below, should trigger that navigation.
let pendingSubscriptionPurchase = false;

// Mirrors useSubscription()'s refreshAll() — duplicated rather than imported
// because hooks can't be called outside a component, and this listener fires
// from native events, not React render.
async function refreshSubscriptionState() {
  try {
    const [subRes, tokensRes] = await Promise.all([getMySubscription(), getTokenBalance()]);
    store.dispatch(setSubscription(subRes.data?.data ?? subRes.data));
    store.dispatch(setTokens(tokensRes.data?.data ?? tokensRes.data));
  } catch (err) {
    console.error('[IAP] Failed to refresh subscription state after purchase', err);
  }
}

let purchaseUpdateSub = null;
let purchaseErrorSub = null;

// Call once at app start (mirrors src/player/setupPlayer.js). Opens the store
// connection and wires the event-based purchase result handling — requestPurchase()
// itself does NOT resolve with the purchase outcome, everything comes through here.
export async function initIAP() {
  const connected = await initConnection();
  if (!connected) {
    console.warn('[IAP] Store connection failed to initialize');
    return false;
  }

  purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
    // Consume the flag now — this event is the one result for whatever request set it
    // (or it's an unrelated redelivery, in which case it was already false).
    const wasRequestedThisSession = pendingSubscriptionPurchase;
    pendingSubscriptionPurchase = false;

    try {
      // The backend verifies the receipt/token directly with Apple/Google and
      // grants tokens or plan access — only finish the transaction (clearing it
      // from the store's queue) once that's confirmed, so a network failure here
      // leaves the purchase pending for retry instead of silently losing it.
      await verifyPurchase(purchase);

      const productId = purchase.productId ?? purchase.id;
      const isConsumable = ALL_CONSUMABLE_SKUS.includes(productId);
      // The backend already granted the purchase at this point, so a failure while
      // finishing it (e.g. Android's acknowledge, which the backend also does) must not
      // stop the subscription state from refreshing.
      try {
        await finishTransaction({ purchase, isConsumable });
      } catch (finishErr) {
        console.warn('[IAP] finishTransaction failed after a verified purchase', finishErr);
      }

      // Token balance can change from either kind of purchase — a subscription grants its
      // monthly tokens, a credit pack adds to purchasedBalance — so refresh for both,
      // not just subscriptions (this used to only happen for !isConsumable, which meant a
      // credit pack purchase never updated the wallet shown in the app without a manual
      // pull-to-refresh elsewhere).
      await refreshSubscriptionState();

      if (!isConsumable) {
        // Only jump the user over for a subscription they just bought in this session —
        // not for a renewal/restore/old-pending-transaction redelivery landing on some
        // unrelated screen. SubscriptionSuccessScreen itself re-confirms (it polls
        // getMySubscription) and its "Start Creating" button lands on Home.
        if (wasRequestedThisSession) {
          navigate('SubscriptionSuccessScreen');
        }
      } else {
        const pack = CREDIT_PACKS.find((p) => p.sku === productId);
        if (pack) {
          Alert.alert(
            'Credits Added! 🎉',
            `${pack.tokenAmount.toLocaleString()} tokens (${pack.songs} songs) have been added to your wallet.`,
          );
        }
      }
    } catch (err) {
      // Money has already moved (the store sheet succeeded) but our server didn't grant
      // anything — this must never fail silently. The transaction is left unfinished, so
      // StoreKit/Play Billing will redeliver it to this same listener on next launch/restore.
      console.error('[IAP] Failed to verify/finish purchase', err);
      Alert.alert(
        'Purchase Not Confirmed',
        getErrorMessage(
          err,
          "Your payment went through, but we couldn't confirm it with our server yet. " +
            "We'll keep retrying — please reopen the app in a few minutes, or contact support if this persists.",
        ),
      );
    }
  });

  purchaseErrorSub = purchaseErrorListener((error) => {
    pendingSubscriptionPurchase = false;

    // This is where a cancel actually surfaces — requestPurchase()'s own promise does NOT
    // reject for it (store outcomes are event-based), so CheckoutConfirmModal's try/catch
    // never sees it. Note the code value: react-native-iap v16 normalizes every platform's
    // raw cancel code (e.g. native Android's "E_USER_CANCELLED") to ErrorCode.UserCancelled
    // ('user-cancelled') before it gets here — comparing against the old 'E_USER_CANCELLED'
    // string never matched, so cancellations were being logged as errors below instead of
    // recognized as a cancel.
    if (error?.code === ErrorCode.UserCancelled) {
      Alert.alert('Purchase Cancelled', 'You cancelled the purchase. No charge was made.');
      return;
    }
    console.error('[IAP] Purchase error', error);
  });

  return true;
}

export async function endIAP() {
  purchaseUpdateSub?.remove();
  purchaseErrorSub?.remove();
  purchaseUpdateSub = null;
  purchaseErrorSub = null;
  await endConnection();
}

export async function getSubscriptionProducts() {
  return fetchProducts({ skus: ALL_SUBSCRIPTION_SKUS, type: 'subs' });
}

export async function getConsumableProducts() {
  return fetchProducts({ skus: ALL_CONSUMABLE_SKUS, type: 'in-app' });
}

// Just the 3 token packs — deliberately excludes the cover-art SKUs (part of
// ALL_CONSUMABLE_SKUS) since those have no backend handling yet (see products.js).
export async function getCreditPackProducts() {
  return fetchProducts({ skus: CREDIT_PACK_SKUS, type: 'in-app' });
}

// Result arrives via the purchaseUpdatedListener set up in initIAP(), not this
// call's return value.
export async function purchaseSubscription(sku) {
  pendingSubscriptionPurchase = true;
  try {
    if (Platform.OS === 'android') {
      // Play Billing needs the base plan's offer token to start a subscription purchase,
      // and it only comes from the product details — so fetch it right before buying.
      const products = await fetchProducts({ skus: [sku], type: 'subs' });
      const product = products?.find((p) => p.id === sku);
      const offerToken = product?.subscriptionOffers?.find((o) => o.offerTokenAndroid)?.offerTokenAndroid;
      if (!offerToken) {
        throw new Error('This plan is not available for purchase yet.');
      }
      return await requestPurchase({
        request: { google: { skus: [sku], subscriptionOffers: [{ sku, offerToken }] } },
        type: 'subs',
      });
    }

    return await requestPurchase({
      request: { apple: { sku }, google: { skus: [sku] } },
      type: 'subs',
    });
  } catch (err) {
    // Dispatch itself failed (bad sku, not connected, etc) — no purchase was ever placed,
    // so there's nothing for the listener to redeem this flag against.
    pendingSubscriptionPurchase = false;
    throw err;
  }
}

export async function purchaseConsumable(sku) {
  return requestPurchase({
    request: { apple: { sku }, google: { skus: [sku] } },
    type: 'in-app',
  });
}

// Re-syncs with the store; any active/pending purchases are redelivered through
// the same purchaseUpdatedListener rather than returned here directly.
export async function restoreAllPurchases() {
  return restorePurchases();
}
