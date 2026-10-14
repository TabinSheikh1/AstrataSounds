import API from './axiosInstance';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Public — no auth required
export const getPlans = () => axios.get(`${API_BASE_URL}/subscriptions/plans`);

// Authenticated
export const getMySubscription = () => API.get('/subscriptions/me');
export const getTokenBalance = () => API.get('/subscriptions/tokens');
export const getTokenHistory = () => API.get('/subscriptions/tokens/history');
