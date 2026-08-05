import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  showWelcomeModal: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;

      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    updateTokens: (state, action) => {
      const { accessToken, refreshToken } = action.payload;

      state.accessToken = accessToken;
      state.refreshToken = refreshToken ?? state.refreshToken;
      state.isAuthenticated = true;
    },

    authFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Something went wrong";
    },

    clearAuthError: (state) => {
      state.error = null;
      state.isLoading = false;
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },

    // Shown once, right after a brand-new account finishes email verification
    // and its free Spark subscription (500 trial tokens) is provisioned.
    triggerWelcomeModal: (state) => {
      state.showWelcomeModal = true;
    },

    dismissWelcomeModal: (state) => {
      state.showWelcomeModal = false;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.showWelcomeModal = false;
    },
  },
});

export const {
  authStart,
  loginSuccess,
  updateTokens,
  updateUser,
  authFailure,
  clearAuthError,
  triggerWelcomeModal,
  dismissWelcomeModal,
  logout,
} = authSlice.actions;

export default authSlice.reducer;