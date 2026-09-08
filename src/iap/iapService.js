import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  restorePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from 'react-native-iap';
import { ALL_SUBSCRIPTION_SKUS, ALL_CONSUMABLE_SKUS } from './products';
import { verifyPurchase } from '../api/billingService';
import { getMySubscription, getTokenBalance } from '../api/subscriptionsService';
import { store } from '../store/store';
import { setSubscription, setTokens } from '../store/slices/subscriptionSlice';

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
    try {
      // The backend verifies the receipt/token directly with Apple/Google and
      // grants tokens or plan access — only finish the transaction (clearing it
      // from the store's queue) once that's confirmed, so a network failure here
      // leaves the purchase pending for retry instead of silently losing it.
      await verifyPurchase(purchase);

      const isConsumable = ALL_CONSUMABLE_SKUS.includes(
        purchase.productId ?? purchase.id,
      );
      await finishTransaction({ purchase, isConsumable });

      if (!isConsumable) {
        await refreshSubscriptionState();
      }
    } catch (err) {
      console.error('[IAP] Failed to verify/finish purchase', err);
    }
  });

  purchaseErrorSub = purchaseErrorListener((error) => {
    if (error?.code !== 'E_USER_CANCELLED') {
      console.error('[IAP] Purchase error', error);
    }
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

// Result arrives via the purchaseUpdatedListener set up in initIAP(), not this
// call's return value.
export async function purchaseSubscription(sku) {
  return requestPurchase({
    request: { apple: { sku }, google: { skus: [sku] } },
    type: 'subs',
  });
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
