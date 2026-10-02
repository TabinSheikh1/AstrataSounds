import API from "./axiosInstance";

export const loginRequest = async (payload) => {
  const response = await API.post("/auth/login", payload);
  console.log(response.data.data);
  
  return response.data.data;
};

export const registerRequest = async (payload) => {
  const response = await API.post("/auth/register", payload);
  return response.data.data;
};

export const verifyEmailRequest = async (payload) => {
  const response = await API.post("/auth/verify-email", payload);
  return response.data.data;
};

export const forgotPasswordRequest = async (payload) => {
  const response = await API.post("/auth/forgot-password", payload);
  return response.data.data;
};

export const resetPasswordRequest = async (payload) => {
  const response = await API.post("/auth/reset-password", payload);
  return response.data.data;
};

export const resendOtpRequest = async (payload) => {
  const response = await API.post("/auth/resend-otp", payload);
  return response.data.data;
};

export const logoutRequest = async () => {
  const response = await API.post("/auth/logout");
  return response.data.data;
};