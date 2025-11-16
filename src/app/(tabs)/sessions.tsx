import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  Session,
  Bill,
  getAllSessions,
  getActiveSession,
  setActiveSession,
  addSession,
  deleteSession,
  getBillsBySession,
} from "../../utils/db";
import { sessionEvents } from "../../utils/sessionEvents";
import { Toast } from "../../utils/toast";

export default function SessionsScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSessionState] = useState<Session | null>(null);
  const [sessionStats, setSessionStats] = useState<
    Record<string, { count: number; total: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [switchingSessionId, setSwitchingSessionId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionDescription, setNewSessionDescription] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadSessionsData();

      // Subscribe to session change events
      const unsubscribe = sessionEvents.subscribe(() => {
        loadSessionsData();
      });

      // Cleanup subscription when screen loses focus
      return unsubscribe;
    }, [])
  );

  const loadSessionsData = async () => {
    setLoading(true);
    try {
      const [allSessions, currentActive] = await Promise.all([
        getAllSessions(),
        getActiveSession(),
      ]);
      setSessions(allSessions);
      setActiveSessionState(currentActive);

      // Calculate stats for each session
      const stats: Record<string, { count: number; total: number }> = {};
      for (const session of allSessions) {
        const bills = await getBillsBySession(session.id);
        stats[session.id] = {
          count: bills.length,
          total: bills.reduce((sum, bill) => sum + bill.amount, 0),
        };
      }
      setSessionStats(stats);
    } catch (error) {
      console.error("Error loading sessions data:", error);
      Alert.alert("Error", "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSwitch = async (session: Session) => {
    if (session.isActive || switchingSessionId === session.id) return;

    setSwitchingSessionId(session.id);

    try {
      const success = await setActiveSession(session.id);
      if (success) {
        await loadSessionsData();
        // Navigate to home tab after successful session switch
        router.push("/(tabs)/");
        // Show success message
        Toast.success(`Switched to "${session.name}" session`);
      } else {
        Toast.error("Failed to switch session");
      }
    } catch (error) {
      console.error("Error switching session:", error);
      Toast.error("Failed to switch session");
    } finally {
      setSwitchingSessionId(null);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      Alert.alert("Error", "Session name is required");
      return;
    }

    try {
      const newSession: Session = {
        id: "session-" + Date.now(),
        name: newSessionName.trim(),
        description: newSessionDescription.trim(),
        createdAt: new Date().toISOString(),
        isActive: false,
      };

      const success = await addSession(newSession);
      if (success) {
        setModalVisible(false);
        setNewSessionName("");
        setNewSessionDescription("");
        await loadSessionsData();
        Alert.alert("Success", "Session created successfully!");
      } else {
        Alert.alert("Error", "Failed to create session");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      Alert.alert("Error", "Failed to create session");
    }
  };

  const handleDeleteSession = (session: Session) => {
    if (sessions.length <= 1) {
      Alert.alert("Error", "Cannot delete the last remaining session");
      return;
    }

    Alert.alert(
      "Delete Session",
      `Are you sure you want to delete "${
        session.name
      }"?\n\nThis will permanently delete all ${
        sessionStats[session.id]?.count || 0
      } bills in this session.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteSession(session.id);
              if (success) {
                // If we deleted the active session, switch to the first available session
                if (session.isActive && sessions.length > 1) {
                  const remainingSessions = sessions.filter(
                    (s) => s.id !== session.id
                  );
                  if (remainingSessions.length > 0) {
                    await setActiveSession(remainingSessions[0].id);
                  }
                }
                await loadSessionsData();
                Alert.alert("Success", "Session deleted successfully!");
              } else {
                Alert.alert("Error", "Failed to delete session");
              }
            } catch (error) {
              console.error("Error deleting session:", error);
              Alert.alert("Error", "Failed to delete session");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bill Sessions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ New Session</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading sessions...</Text>
          </View>
        ) : (
          sessions.map((session) => {
            const stats = sessionStats[session.id] || { count: 0, total: 0 };
            return (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.sessionCard,
                  session.isActive && styles.activeSessionCard,
                ]}
                onPress={() => handleSessionSwitch(session)}
                disabled={switchingSessionId === session.id || session.isActive}
                activeOpacity={session.isActive ? 0.5 : 0.8}
              >
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionTitleContainer}>
                    <Text
                      style={[
                        styles.sessionName,
                        session.isActive && styles.activeSessionName,
                      ]}
                    >
                      {session.name}
                    </Text>
                    {session.isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                      </View>
                    )}
                    {switchingSessionId === session.id && (
                      <View style={styles.switchingIndicator}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.switchingText}>Switching...</Text>
                      </View>
                    )}
                  </View>
                  {sessions.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteSession(session)}
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {session.description && (
                  <Text style={styles.sessionDescription}>
                    {session.description}
                  </Text>
                )}

                <View style={styles.sessionStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.count}</Text>
                    <Text style={styles.statLabel}>Bills</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      ₹{stats.total.toFixed(2)}
                    </Text>
                    <Text style={styles.statLabel}>Total Amount</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatDate(session.createdAt)}
                    </Text>
                    <Text style={styles.statLabel}>Created</Text>
                  </View>
                </View>
                
                {!session.isActive && switchingSessionId !== session.id && (
                  <View style={styles.switchPrompt}>
                    <Ionicons name="hand-left" size={14} color={COLORS.primary} />
                    <Text style={styles.switchPromptText}>
                      Tap to switch & go to Home
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Session</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.inputLabel}>Session Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Business Bills, Family Expenses"
                value={newSessionName}
                onChangeText={setNewSessionName}
                maxLength={50}
              />

              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Brief description of this session"
                value={newSessionDescription}
                onChangeText={setNewSessionDescription}
                maxLength={200}
                multiline
              />

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateSession}
              >
                <Text style={styles.createButtonText}>Create Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  activeSessionCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + "10",
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  sessionTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  activeSessionName: {
    color: COLORS.primary,
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  activeBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.danger + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 20,
    fontWeight: "600",
  },
  sessionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  sessionStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: SPACING.xxl,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgLight,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 20,
    fontWeight: "600",
  },
  form: {
    padding: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  switchingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.sm,
  },
  switchingText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  switchPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  switchPromptText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
});
