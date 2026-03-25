import {
  authStart,
  loginSuccess,
  authFailure,
  logout,
  clearAuthError,
} from "../slices/authSlice";
import {
  loginRequest,
  logoutRequest,
  registerRequest,
  verifyEmailRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  resendOtpRequest,
} from "../../api/authService";

export const loginUser = (payload) => async (dispatch) => {
  try {
    dispatch(authStart());

    const data = await loginRequest(payload);

    dispatch(
      loginSuccess({
        user: data.user,
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      })
    );

    return { success: true, data };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Login failed";

    dispatch(authFailure(message));

    return { success: false, message };
  }
};

export const registerUser = (payload) => async (dispatch) => {
  try {
    dispatch(authStart());

    const data = await registerRequest(payload);

    dispatch(clearAuthError());

    return { success: true, data };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Registration failed";

    dispatch(authFailure(message));

    return { success: false, message };
  }
};

export const verifyEmailOtp = (payload) => async (dispatch) => {
  try {
    dispatch(authStart());

    const data = await verifyEmailRequest(payload);

    dispatch(
      loginSuccess({
        user: data.user,
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      })
    );

    return { success: true, data };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "OTP verification failed";

    dispatch(authFailure(message));

    return { success: false, message };
  }
};

export const forgotPassword = (payload) => async (dispatch) => {
  try {
    dispatch(authStart());

    const data = await forgotPasswordRequest(payload);

    dispatch(clearAuthError());

    return { success: true, data };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Forgot password failed";

    dispatch(authFailure(message));

    return { success: false, message };
  }
};

export const resetPassword = (payload) => async (dispatch) => {
  try {
    dispatch(authStart());

    const data = await resetPasswordRequest(payload);

    dispatch(
      loginSuccess({
        user: data.user,
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      })
    );

    return { success: true, data };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Reset password failed";

    dispatch(authFailure(message));

    return { success: false, message };
  }
};

export const resendOtp = (payload) => async (dispatch) => {
  try {
    dispatch(authStart());

    const data = await resendOtpRequest(payload);

    dispatch(clearAuthError());

    return { success: true, data };
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Resend OTP failed";

    dispatch(authFailure(message));

    return { success: false, message };
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await logoutRequest();
  } catch (_error) {
    // even if backend logout fails, frontend should still logout
  } finally {
    dispatch(logout());
  }
};