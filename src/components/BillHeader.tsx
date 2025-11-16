import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  ICON_SIZES,
} from "../utils/theme";

interface BillHeaderProps {
  query: string;
  onQueryChange: (text: string) => void;
  itemCount: number;
  loading: boolean;
  onClearQuery?: () => void;
}

export const BillHeader: React.FC<BillHeaderProps> = ({
  query,
  onQueryChange,
  itemCount,
  loading,
  onClearQuery,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bills</Text>
        <Text style={styles.countText}>
          {itemCount} bill{itemCount !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Modern Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons
          name="search"
          size={ICON_SIZES.md}
          color={COLORS.textTertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search bills..."
          placeholderTextColor={COLORS.textTertiary}
          editable={!loading}
        />
        {query.length > 0 && (
          <Pressable onPress={onClearQuery} style={styles.clearButton}>
            <Ionicons
              name="close-circle"
              size={ICON_SIZES.md}
              color={COLORS.textSecondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.cardBg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 40,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 2,
  },
  clearButton: {
    padding: 4,
    marginLeft: SPACING.sm,
  },
  countText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
});
