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

// Normalizes any NestJS/Axios error into a plain string
const extractMessage = (error, fallback) => {
  const raw = error?.response?.data?.message ?? error?.message;
  if (!raw) return fallback;
  if (Array.isArray(raw)) {
    return raw
      .map((m) => {
        if (typeof m === "string") return m;
        // NestJS class-validator constraint object: { property, constraints: { rule: "message" } }
        if (m?.constraints) return Object.values(m.constraints).join(", ");
        if (m?.message) return m.message;
        return JSON.stringify(m);
      })
      .join("\n");
  }
  if (typeof raw === "object") return error?.response?.data?.error ?? error?.message ?? fallback;
  return raw;
};

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
    const message = extractMessage(error, "Reset password failed");
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