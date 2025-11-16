import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  ICON_SIZES,
} from "../utils/theme";
import { getActiveSession, Session } from "../utils/db";
import { sessionEvents } from "../utils/sessionEvents";

interface SessionIndicatorProps {
  title?: string;
  subtitle?: string;
}

export const SessionIndicator: React.FC<SessionIndicatorProps> = ({
  title = "Adding to Session",
  subtitle = "Items will be added to this session",
}) => {
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const loadActiveSession = async () => {
    try {
      const session = await getActiveSession();
      setActiveSession(session);
    } catch (error) {
      setActiveSession(null);
    }
  };

  useEffect(() => {
    loadActiveSession();

    // Listen for session changes
    const unsubscribe = sessionEvents.subscribe(() => {
      loadActiveSession();
    });

    return unsubscribe;
  }, []);

  if (!activeSession) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="warning-outline"
            size={ICON_SIZES.lg}
            color={COLORS.warning}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.errorText}>No active session found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="folder-outline"
          size={ICON_SIZES.lg}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sessionName}>{activeSession.name}</Text>
        {activeSession.description && (
          <Text style={styles.sessionDescription}>
            {activeSession.description}
          </Text>
        )}
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.statusIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.card,
    padding: SPACING.cardPadding,
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.primaryBg,
  },
  iconContainer: {
    width: 40, // Standard icon container size
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  sessionName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sessionDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontStyle: "italic",
  },
  errorText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.danger,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginLeft: SPACING.sm,
  },
});
