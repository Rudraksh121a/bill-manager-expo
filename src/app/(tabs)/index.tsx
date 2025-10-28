import React, { useMemo, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, SafeAreaView, Alert } from 'react-native';
import { COLORS, SPACING } from '../../utils/theme';

import { getAllBills, deleteBill } from '../../utils/db';
import { BillHeader } from '../../components/BillHeader';
import { BillsList } from '../../components/BillsList';
import { Bill } from '../../components/BillCard';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bills from database on focus
  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [])
  );

  const loadBills = async () => {
    setLoading(true);
    try {
      const dbBills = await getAllBills();
      setBills(dbBills);
    } catch (err) {
      console.error('Error loading bills:', err);
      Alert.alert('Error', 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = (id: string, billName: string) => {
    Alert.alert(
      'Delete Bill',
      `Are you sure you want to delete "${billName}"?`,
      [
        {
          text: 'Cancel',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const success = await deleteBill(id);
            if (success) {
              await loadBills();
              Alert.alert('Success', 'Bill deleted successfully!');
            } else {
              Alert.alert('Error', 'Failed to delete bill');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bills;
    return bills.filter((b) => {
      return (
        b.billName.toLowerCase().includes(q) ||
        (b.payer || '').toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q) ||
        (b.status || '').toLowerCase().includes(q)
      );
    });
  }, [query, bills]);

  return (
    <SafeAreaView style={styles.container}>
      <BillHeader
        query={query}
        onQueryChange={setQuery}
        itemCount={filtered.length}
        loading={loading}
      />
      <BillsList bills={filtered} loading={loading} onDeleteBill={handleDeleteBill} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
});

