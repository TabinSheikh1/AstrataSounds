import API from './axiosInstance';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Public — no auth required
export const getPlans = () => axios.get(`${API_BASE_URL}/subscriptions/plans`);

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

// Credit packs: packSize is 5 | 15 | 50
export const creditPackCheckout = (payload) =>
  API.post('/subscriptions/credit-packs/checkout', payload);

// Cover art: style is 'standard' ($0.99) | 'premium' ($1.99), songId is UUID
export const coverArtCheckout = (payload) =>
  API.post('/subscriptions/cover-art/checkout', payload);
