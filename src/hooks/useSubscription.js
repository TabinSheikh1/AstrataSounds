import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSubscription,
  setTokens,
  setPlans,
  subscriptionLoading,
  subscriptionTokensLoading,
  subscriptionError,
} from '../store/slices/subscriptionSlice';
import {
  getMySubscription,
  getTokenBalance,
  getPlans,
} from '../api/subscriptionsService';

const TOKEN_COST_PER_SONG = 70;

export const useSubscription = () => {
  const dispatch = useDispatch();
  const { subscription, tokens, plans, isLoading, tokensLoading } = useSelector(
    (state) => state.subscription,
  );

  const fetchSubscription = useCallback(async () => {
    dispatch(subscriptionLoading());
    try {
      const res = await getMySubscription();
   
      
      dispatch(setSubscription(res.data?.data ?? res.data));
    } catch (e) {
      dispatch(subscriptionError(e?.response?.data?.message ?? 'Failed to load subscription'));
    }
  }, [dispatch]);

  const fetchTokens = useCallback(async () => {
    dispatch(subscriptionTokensLoading());
    try {
      const res = await getTokenBalance();
      dispatch(setTokens(res.data?.data ?? res.data));
    } catch (e) {
      dispatch(subscriptionError(e?.response?.data?.message ?? 'Failed to load tokens'));
    }
  }, [dispatch]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await getPlans();
      dispatch(setPlans(res.data?.data ?? res.data ?? []));
    } catch (e) {
      // silently fail for public endpoint
    }
  }, [dispatch]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSubscription(), fetchTokens()]);
  }, [fetchSubscription, fetchTokens]);

  // ── Limit helpers ──────────────────────────────────────────
  const plan = subscription?.plan ?? null;
  const status = subscription?.status ?? 'free';

  const tokenBalance = tokens?.balance ?? 0;
  const tokenGranted = tokens?.granted ?? 500;
  const downloadsUsed = tokens?.downloadsUsedThisPeriod ?? 0;

  const downloadLimit = plan?.monthlyDownloadLimit ?? 5;
  const maxVibes = plan?.maxVibes ?? 5;
  const maxPlaylists = plan?.maxPlaylists ?? 10;

  const isActive = status === 'active' || status === 'free' || status === 'trialing';
  const isPastDue = status === 'past_due';
  const isBlocked = status === 'canceled' || status === 'unpaid';

  const canGenerate =
    !isBlocked && tokenBalance >= TOKEN_COST_PER_SONG;

  const canDownload =
    !isBlocked &&
    (downloadLimit === -1 || downloadsUsed < downloadLimit);

  const canCreateVibe = (vibeCount) =>
    !isBlocked && (maxVibes === -1 || vibeCount < maxVibes);

  const canCreatePlaylist = (playlistCount) =>
    !isBlocked && (maxPlaylists === -1 || playlistCount < maxPlaylists);

  const tokenPct = tokenGranted > 0 ? tokenBalance / tokenGranted : 0;
  const tokenColor =
    tokenPct === 0
      ? '#EF4444'
      : tokenPct <= 0.2
      ? '#FBBF24'
      : '#66cc33';

  return {
    subscription,
    tokens,
    plans,
    plan,
    status,
    isLoading,
    tokensLoading,
    tokenBalance,
    tokenGranted,
    tokenPct,
    tokenColor,
    downloadsUsed,
    downloadLimit,
    isActive,
    isPastDue,
    isBlocked,
    canGenerate,
    canDownload,
    canCreateVibe,
    canCreatePlaylist,
    fetchSubscription,
    fetchTokens,
    fetchPlans,
    refreshAll,
  };
};
