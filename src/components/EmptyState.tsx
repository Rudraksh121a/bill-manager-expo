import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  ICON_SIZES,
} from "../utils/theme";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No bills yet",
  subtitle = "Start by adding your first bill to track your expenses",
  actionText = "Add Bill",
  onActionPress,
  iconName = "document-outline",
}) => {
  const router = useRouter();

  const handleActionPress = () => {
    if (onActionPress) {
      onActionPress();
    } else {
      router.push("/addItem");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={iconName}
          size={ICON_SIZES.xxl * 2}
          color={COLORS.textMuted}
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <TouchableOpacity style={styles.actionButton} onPress={handleActionPress}>
        <Ionicons
          name="add-outline"
          size={ICON_SIZES.md}
          color={COLORS.white}
        />
        <Text style={styles.actionText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.xxxxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.bgLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xxxl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: SPACING.xxxl,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.button,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxxl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
});
