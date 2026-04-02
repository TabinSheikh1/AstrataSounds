import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getTokenHistory } from '../api/subscriptionsService';
import { useSubscription } from '../hooks/useSubscription';

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const TYPE_LABELS = {
  grant: 'Monthly Grant',
  bonus: 'Bonus Tokens',
  debit: 'Song Generation',
  purchase: 'Token Purchase',
};

const TransactionRow = ({ item }) => {
  const isCredit = item.amount > 0;
  return (
    <View style={styles.txRow}>
      <View
        style={[
          styles.txIconWrap,
          { backgroundColor: isCredit ? 'rgba(102,204,51,0.12)' : 'rgba(239,68,68,0.12)' },
        ]}
      >
        <MaterialIcons
          name={isCredit ? 'add-circle' : 'remove-circle'}
          size={18}
          color={isCredit ? '#66cc33' : '#EF4444'}
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txType}>
          {TYPE_LABELS[item.type] ?? item.type ?? 'Transaction'}
        </Text>
        <Text style={styles.txDate}>{fmt(item.createdAt)}</Text>
      </View>
      <View style={styles.txAmountWrap}>
        <Text style={[styles.txAmount, { color: isCredit ? '#66cc33' : '#EF4444' }]}>
          {isCredit ? '+' : ''}{item.amount}
        </Text>
        <Text style={styles.txBalance}>bal: {item.balanceAfter ?? '—'}</Text>
      </View>
    </View>
  );
};

const TokenHistoryDrawer = ({ visible, onClose }) => {
  const { tokenBalance, tokenGranted, tokenColor, tokenPct, tokens } = useSubscription();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
      loadHistory();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTokenHistory();
      setHistory(res.data?.data ?? res.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const periodEnd = tokens?.periodEnd
    ? new Date(tokens.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Token Balance</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={22} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        {/* Balance card */}
        <LinearGradient
          colors={['rgba(0,102,204,0.2)', 'rgba(102,204,51,0.1)']}
          style={styles.balanceCard}
        >
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>REMAINING</Text>
              <Text style={[styles.balanceValue, { color: tokenColor }]}>
                {tokenBalance}
              </Text>
              <Text style={styles.balanceOf}>of {tokenGranted} tokens</Text>
            </View>
            <View style={styles.balanceRight}>
              <Text style={styles.costNote}>70 tokens / song</Text>
              {periodEnd && (
                <Text style={styles.resetNote}>Resets {periodEnd}</Text>
              )}
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min(tokenPct * 100, 100)}%`,
                  backgroundColor: tokenColor,
                },
              ]}
            />
          </View>
        </LinearGradient>

        {/* History list */}
        <Text style={styles.historyTitle}>Recent Transactions</Text>

        {loading ? (
          <ActivityIndicator color="#66cc33" style={{ marginTop: 24 }} />
        ) : error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadHistory} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item, i) => item.id ?? String(i)}
            renderItem={({ item }) => <TransactionRow item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No transactions yet.</Text>
            }
          />
        )}
      </Animated.View>
    </Modal>
  );
};

export default TokenHistoryDrawer;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d1117',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.3,
  },
  closeBtn: { padding: 4 },
  balanceCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    // padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding:16
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 36,
    fontFamily: 'Oswald-Bold',
    letterSpacing: 0.5,
  },
  balanceOf: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
    marginTop: 2,
  },
  balanceRight: { alignItems: 'flex-end' },
  costNote: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Oswald-Regular',
  },
  resetNote: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    marginTop: 4,
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  historyTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txType: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
  },
  txDate: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontFamily: 'Oswald-Regular',
    marginTop: 2,
  },
  txAmountWrap: { alignItems: 'flex-end' },
  txAmount: {
    fontSize: 16,
    fontFamily: 'Oswald-Bold',
  },
  txBalance: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontFamily: 'Oswald-Regular',
    marginTop: 2,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    marginTop: 24,
  },
  errorWrap: { alignItems: 'center', marginTop: 24 },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Oswald-Regular',
  },
});
