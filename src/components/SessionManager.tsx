import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Vibration,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, SHADOWS } from "../utils/theme";
import {
  Session,
  getAllSessions,
  getActiveSession,
  setActiveSession,
  deleteSession,
} from "../utils/db";
import { Toast } from "../utils/toast";
import { sessionEvents } from "../utils/sessionEvents";
import { useRouter } from "expo-router";
import { showDoubleConfirmation } from "../utils/confirmationHelpers";

interface SessionManagerProps {
  onSessionChange?: () => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  onSessionChange,
}) => {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSessionState] = useState<Session | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [billCount, setBillCount] = useState(0);
  const [billTotal, setBillTotal] = useState(0);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    loadSessions();

    // Subscribe to session change events
    const unsubscribe = sessionEvents.subscribe(() => {
      loadSessions(true);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Refresh sessions when modal becomes visible
  useEffect(() => {
    if (modalVisible) {
      loadSessions(true);
    }
  }, [modalVisible]);

  const loadSessions = async (forceReload = false) => {
    if (!forceReload && !loading) {
      setLoading(true);
    }

    try {
      const [allSessions, currentActive] = await Promise.all([
        getAllSessions(),
        getActiveSession(),
      ]);

      // Update sessions state
      setSessions(allSessions);
      setActiveSessionState(currentActive);

      // Load bill count and total for active session
      if (currentActive) {
        try {
          const { getAllBills } = await import("../utils/db");
          const bills = await getAllBills();
          setBillCount(bills.length);
          const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
          setBillTotal(total);
        } catch (error) {
          setBillCount(0);
          setBillTotal(0);
        }
      } else {
        setBillCount(0);
        setBillTotal(0);
      }

      // Notify parent component about session changes
      if (onSessionChange) {
        onSessionChange();
      }
    } catch (error) {
      // Don't show alert for loading errors, just log them
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSwitch = async (sessionId: string) => {
    if (switching === sessionId) return; // Prevent multiple simultaneous switches of the same session

    setSwitching(sessionId);
    Vibration.vibrate(50); // Haptic feedback

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const success = await setActiveSession(sessionId);
      if (success) {
        setModalVisible(false); // Auto-close modal on successful switch
        Toast.success("Session switched successfully!");
        // Note: loadSessions will be called automatically via the event system
      } else {
        Toast.error("Failed to switch session");
      }
    } catch (error) {
      Toast.error("Failed to switch session");
    } finally {
      setSwitching(null);
    }
  };

  const handleDeleteSession = (session: Session) => {
    if (sessions.length <= 1) {
      Alert.alert("Error", "Cannot delete the last remaining session");
      return;
    }

    showDoubleConfirmation({
      title: "Delete Session",
      message: `Are you sure you want to delete "${session.name}"?\n\nThis will permanently delete all bills in this session.`,
      onConfirm: async () => {
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

            Toast.success(`"${session.name}" session deleted successfully!`);
            // Note: loadSessions will be called automatically via the event system
          } else {
            Toast.error("Failed to delete session");
          }
        } catch (error) {
          Toast.error("Failed to delete session");
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => {
          Vibration.vibrate(50);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.activeSessionInfo}>
          <View style={styles.sessionIcon}>
            <Ionicons name="folder" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.sessionTextInfo}>
            <Text style={styles.activeSessionName}>
              {activeSession?.name || "No Session"}
            </Text>
            <Text style={styles.billCountText}>
              {billCount} {billCount === 1 ? "bill" : "bills"} • ₹
              {billTotal.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.manageButton}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalTitleIcon}>
                  <Ionicons name="layers" size={20} color={COLORS.white} />
                </View>
                <Text style={styles.modalTitle}>Session Management</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Current Session Info */}
            <View style={styles.currentSessionCard}>
              <View style={styles.currentSessionHeader}>
                <View style={styles.sessionIconWrapper}>
                  <View style={styles.currentSessionIcon}>
                    <Ionicons name="folder" size={20} color={COLORS.white} />
                  </View>
                  <View style={styles.activeIndicatorDot} />
                </View>

                <View style={styles.currentSessionInfo}>
                  <Text style={styles.currentSessionName}>
                    {activeSession?.name || "No Session Selected"}
                  </Text>
                  <Text style={styles.currentSessionSubtext}>
                    Active Session • {billCount}{" "}
                    {billCount === 1 ? "bill" : "bills"} • ₹
                    {billTotal.toFixed(2)}
                  </Text>
                  {activeSession?.description && (
                    <Text style={styles.currentSessionDescription}>
                      {activeSession.description}
                    </Text>
                  )}
                </View>

                <View style={styles.sessionActions}>
                  <View style={styles.billTotalDisplay}>
                    <Text style={styles.billTotalAmount}>
                      ₹{billTotal.toFixed(0)}
                    </Text>
                    <Text style={styles.billTotalLabel}>Total</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Available Sessions */}
            <View style={styles.sessionsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Switch to Another Session
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {sessions.length > 1
                    ? `${sessions.length} sessions available • Tap to switch`
                    : sessions.length === 1
                    ? "Only one session available"
                    : "No sessions found"}
                </Text>
              </View>

              <ScrollView
                style={styles.sessionsList}
                showsVerticalScrollIndicator={false}
              >
                {sessions.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons
                      name="folder-outline"
                      size={48}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.emptyStateText}>
                      No sessions available
                    </Text>
                  </View>
                ) : (
                  sessions.map((session, index) => (
                    <View key={session.id} style={styles.sessionItem}>
                      <Animated.View
                        style={[
                          {
                            transform: [
                              { scale: switching === session.id ? 0.95 : 1 },
                            ],
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.sessionButton,
                            session.isActive && styles.activeSessionButton,
                          ]}
                          onPress={() => handleSessionSwitch(session.id)}
                          activeOpacity={0.8}
                          disabled={
                            switching === session.id || session.isActive
                          }
                        >
                          <View style={styles.sessionItemLeft}>
                            <View
                              style={[
                                styles.sessionItemIcon,
                                session.isActive &&
                                  styles.sessionItemIconActive,
                              ]}
                            >
                              <Ionicons
                                name="folder"
                                size={18}
                                color={
                                  session.isActive
                                    ? COLORS.white
                                    : COLORS.primary
                                }
                              />
                            </View>
                            <View style={styles.sessionInfo}>
                              <Text
                                style={[
                                  styles.sessionName,
                                  session.isActive && styles.activeSessionText,
                                ]}
                              >
                                {session.name}
                                {session.isActive && " (Current)"}
                              </Text>
                              {session.description && (
                                <Text style={styles.sessionDescription}>
                                  {session.description}
                                </Text>
                              )}
                            </View>
                          </View>

                          <View style={styles.sessionItemRight}>
                            {switching === session.id && (
                              <ActivityIndicator
                                size="small"
                                color={COLORS.primary}
                              />
                            )}
                            {!switching && !session.isActive && (
                              <Text style={styles.tapToSwitchText}>
                                Tap to switch
                              </Text>
                            )}
                            {sessions.length > 1 && (
                              <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteSession(session)}
                                activeOpacity={0.7}
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={16}
                                  color={COLORS.danger}
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>

            {/* Quick Action Footer */}
            <View style={styles.footerActions}>
              <TouchableOpacity
                style={styles.manageSessionsButton}
                onPress={() => {
                  setModalVisible(false);
                  router.push("/sessions");
                }}
                activeOpacity={0.8}
              >
                <View style={styles.manageButtonIcon}>
                  <Ionicons name="add" size={20} color={COLORS.white} />
                </View>
                <View style={styles.manageButtonContent}>
                  <Text style={styles.manageSessionsText}>
                    Create New Session
                  </Text>
                  <Text style={styles.manageSessionsSubtext}>
                    Manage and organize your sessions
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  loadingContainer: {
    padding: SPACING.sm,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: SPACING.md,
    elevation: 1,
    shadowColor: COLORS.textPrimaryPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  activeSessionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  sessionTextInfo: {
    flex: 1,
  },
  activeSessionName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  billCountText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  manageButton: {
    padding: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: SPACING.xl,
    elevation: 3,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalTitleIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.bgLight,
  },
  currentSessionCard: {
    margin: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
    elevation: 1,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  currentSessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
  },
  sessionIconWrapper: {
    position: "relative",
    marginRight: SPACING.md,
  },
  currentSessionIcon: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicatorDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  currentSessionInfo: {
    flex: 1,
  },
  currentSessionName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  currentSessionSubtext: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
    marginBottom: SPACING.xs,
  },
  currentSessionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
  sessionActions: {
    alignItems: "center",
  },
  billCountDisplay: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary + "15",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
  },
  billCountNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  billTotalDisplay: {
    minWidth: 60,
    height: 50,
    backgroundColor: COLORS.primary + "15",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
    paddingHorizontal: SPACING.sm,
  },
  billTotalAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  billTotalLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: COLORS.primary,
    marginTop: 2,
  },
  sessionsSection: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.bgLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sessionsList: {
    maxHeight: 280,
    paddingHorizontal: SPACING.lg,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  sessionItem: {
    marginBottom: SPACING.sm,
  },
  sessionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
  },
  activeSessionButton: {
    backgroundColor: COLORS.bgLight,
    borderColor: COLORS.textSecondary,
    opacity: 0.7,
  },
  sessionItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sessionItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  sessionItemIconActive: {
    backgroundColor: COLORS.textSecondary,
  },
  tapToSwitchText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    marginRight: SPACING.sm,
  },
  sessionItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  activeSessionText: {
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  sessionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  deleteButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.danger + "10",
    borderRadius: 20,
    marginLeft: SPACING.xs,
  },
  footerActions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.bgLight,
  },
  manageSessionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
  },
  manageSessionsText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  manageButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  manageButtonContent: {
    flex: 1,
  },
  manageSessionsSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
});
