import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  ICON_SIZES,
} from "../utils/theme";

interface SubmitButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
  label = "Add Bill",
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.submitBtn,
        disabled && styles.submitBtnDisabled,
        loading && styles.submitBtnLoading,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator
            color={COLORS.white}
            size="small"
            style={styles.loadingIndicator}
          />
        ) : (
          <Ionicons
            name="add-outline"
            size={ICON_SIZES.md}
            color={COLORS.white}
            style={styles.buttonIcon}
          />
        )}
        <Text style={styles.submitText}>{loading ? "Adding..." : label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.button,
    paddingVertical: 14, // Standard button padding
    paddingHorizontal: 24, // Standard button padding
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xxl,
    ...SHADOWS.button,
  },
  submitBtnDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.gray,
  },
  submitBtnLoading: {
    backgroundColor: COLORS.primaryDark,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  loadingIndicator: {
    marginRight: SPACING.sm,
  },
  submitText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.white,
    textAlign: "center",
  },
});
