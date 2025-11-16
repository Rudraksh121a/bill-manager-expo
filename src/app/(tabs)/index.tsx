import React, { useMemo, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../../utils/theme";

import { getAllBills, deleteBill, Bill } from "../../utils/db";
import { BillHeader } from "../../components/BillHeader";
import { BillsList } from "../../components/BillsList";
import { SessionManager } from "../../components/SessionManager";
import { sessionEvents } from "../../utils/sessionEvents";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bills from database on focus and when sessions change
  useFocusEffect(
    useCallback(() => {
      loadBills();

      // Subscribe to session change events
      const unsubscribe = sessionEvents.subscribe(() => {
        loadBills();
      });

      // Cleanup subscription when screen loses focus
      return unsubscribe;
    }, [])
  );

  const loadBills = async () => {
    setLoading(true);
    try {
      const dbBills = await getAllBills();
      setBills(dbBills);
    } catch (err) {
      console.error("Error loading bills:", err);
      Alert.alert("Error", "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = (id: string, billName: string) => {
    Alert.alert(
      "Delete Bill",
      `Are you sure you want to delete "${billName}"?`,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const success = await deleteBill(id);
            if (success) {
              await loadBills();
              Alert.alert("Success", "Bill deleted successfully!");
            } else {
              Alert.alert("Error", "Failed to delete bill");
            }
          },
          style: "destructive",
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
        (b.payer || "").toLowerCase().includes(q) ||
        (b.description || "").toLowerCase().includes(q) ||
        (b.status || "").toLowerCase().includes(q)
      );
    });
  }, [query, bills]);

  return (
    <SafeAreaView style={styles.container}>
      <SessionManager onSessionChange={loadBills} />
      <BillHeader
        query={query}
        onQueryChange={setQuery}
        itemCount={filtered.length}
        loading={loading}
      />
      <BillsList
        bills={filtered}
        loading={loading}
        onDeleteBill={handleDeleteBill}
      />
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
