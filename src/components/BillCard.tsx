import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  ICON_SIZES,
} from "../utils/theme";
import { Bill } from "../utils/db";

interface BillCardProps {
  bill: Bill;
  onDelete: (id: string, billName: string) => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onDelete }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="receipt-outline"
            size={ICON_SIZES.lg}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.billName} numberOfLines={2}>
            {bill.billName}
          </Text>
          <Text style={styles.date}>{bill.date}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.amount}>{bill.amount.toFixed(2)}</Text>
        </View>
      </View>

      {bill.description ? (
        <View style={styles.descriptionSection}>
          <Text style={styles.description} numberOfLines={2}>
            {bill.description}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(bill.id, bill.billName)}
        >
          <Ionicons
            name="trash-outline"
            size={ICON_SIZES.sm}
            color={COLORS.danger}
          />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  titleSection: {
    flex: 1,
    marginRight: 10,
  },
  billName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  descriptionSection: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: COLORS.bgLight,
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.dangerBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.danger + "30",
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.danger,
    marginLeft: 4,
  },
});

export default BillCard;
