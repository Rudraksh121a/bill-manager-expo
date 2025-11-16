import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { BillCard } from "./BillCard";
import { EmptyState } from "./EmptyState";
import { Bill } from "../utils/db";
import { COLORS, SPACING, TYPOGRAPHY } from "../utils/theme";

interface BillsListProps {
  bills: Bill[];
  loading: boolean;
  onDeleteBill: (id: string, billName: string) => void;
}

export const BillsList: React.FC<BillsListProps> = ({
  bills,
  loading,
  onDeleteBill,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bills...</Text>
      </View>
    );
  }

  if (bills.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      data={bills}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <BillCard bill={item} onDelete={onDeleteBill} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
