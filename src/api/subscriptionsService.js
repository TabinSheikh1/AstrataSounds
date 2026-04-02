import API from './axiosInstance';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

// Public — no auth required
export const getPlans = () => axios.get(`${BASE_URL}/subscriptions/plans`);

// Authenticated
export const getMySubscription = () => API.get('/subscriptions/me');
export const getTokenBalance = () => API.get('/subscriptions/tokens');
export const getTokenHistory = () => API.get('/subscriptions/tokens/history');

export const createCheckoutSession = async (payload) => {
  try {
    const response = await API.post('/subscriptions/checkout', payload);
    return response.data;
  } catch (error) {
    console.error('Checkout Session Error:', error);
    throw error;
  }
};

export const openBillingPortal = (returnUrl) =>
  API.post('/subscriptions/portal', { returnUrl });

export const cancelSubscription = () => API.post('/subscriptions/cancel');
export const reactivateSubscription = () => API.post('/subscriptions/reactivate');
