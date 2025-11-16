import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "../utils/theme";

interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "decimal-pad" | "numeric" | "email-address";
  hint?: string;
  isRequired?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  hint,
  isRequired = false,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label} {isRequired && "*"}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
      />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, // Standard input padding
    paddingVertical: SPACING.md, // Standard input padding
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    minHeight: 44, // Standard input height
  },
  textArea: {
    minHeight: 100, // Smaller textarea height
    textAlignVertical: "top",
    paddingVertical: SPACING.md,
  },
  hint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
