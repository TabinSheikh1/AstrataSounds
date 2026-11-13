import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subscription: null,  // data from GET /subscriptions/me
  tokens: null,        // data from GET /subscriptions/tokens
  plans: [],           // data from GET /subscriptions/plans
  isLoading: false,
  tokensLoading: false,
  error: null,
  purchaseStatus: 'idle', // 'idle' | 'pending' | 'success'
  purchaseResult: null,   // { title, message } shown on success
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscription(state, action) {
      state.subscription = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setTokens(state, action) {
      state.tokens = action.payload;
      state.tokensLoading = false;
    },
    setPlans(state, action) {
      state.plans = action.payload;
    },
    subscriptionLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    subscriptionTokensLoading(state) {
      state.tokensLoading = true;
    },
    subscriptionError(state, action) {
      state.isLoading = false;
      state.tokensLoading = false;
      state.error = action.payload;
    },
    clearSubscription(state) {
      state.subscription = null;
      state.tokens = null;
      state.error = null;
      state.isLoading = false;
      state.tokensLoading = false;
    },
    purchaseStarted(state) {
      state.purchaseStatus = 'pending';
      state.purchaseResult = null;
    },
    purchaseSucceeded(state, action) {
      state.purchaseStatus = 'success';
      state.purchaseResult = action.payload;
    },
    purchaseDismissed(state) {
      state.purchaseStatus = 'idle';
      state.purchaseResult = null;
    },
  },
});

export const {
  setSubscription,
  setTokens,
  setPlans,
  subscriptionLoading,
  subscriptionTokensLoading,
  subscriptionError,
  clearSubscription,
  purchaseStarted,
  purchaseSucceeded,
  purchaseDismissed,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
