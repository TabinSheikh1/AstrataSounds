import {
  authStart,
  loginSuccess,
  authFailure,
  logout,
  clearAuthError,
  triggerWelcomeModal,
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
import { getErrorMessage } from "../../utils/errorHandler";

const extractMessage = getErrorMessage;

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
    const message = extractMessage(error, "Login failed");
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
    const message = extractMessage(error, "Registration failed");
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

    // Email verification is a one-time event per account — this is always
    // the moment the free Spark trial (500 tokens) gets provisioned.
    dispatch(triggerWelcomeModal());

    return { success: true, data };
  } catch (error) {
    const message = extractMessage(error, "OTP verification failed");
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
    const message = extractMessage(error, "Forgot password failed");
    dispatch(authFailure(message));
    return { success: false, message };
  }
};

// Does not log the user in immediately — the reset-password screen shows a
// success modal first, then dispatches loginSuccess once the user dismisses it
// (see confirmPasswordReset below). Auto-logging in here would swap the app's
// navigator out from under the modal before it could ever be seen.
export const resetPassword = (payload) => async (dispatch) => {
  try {
    dispatch(authStart());

    const data = await resetPasswordRequest(payload);

    dispatch(clearAuthError());

    return { success: true, data };
  } catch (error) {
    const message = extractMessage(error, "Reset password failed");
    dispatch(authFailure(message));
    return { success: false, message };
  }
};

export const confirmPasswordReset = (data) => (dispatch) => {
  dispatch(
    loginSuccess({
      user: data.user,
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    })
  );
};

export const resendOtp = (payload) => async (dispatch) => {
  try {
    dispatch(authStart());

    const data = await resendOtpRequest(payload);

    dispatch(clearAuthError());

    return { success: true, data };
  } catch (error) {
    const message = extractMessage(error, "Resend OTP failed");
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