import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../utils/theme";
import {
  getAllBills,
  Bill,
  getAllSessions,
  Session,
  getBillsBySession,
} from "../../utils/db";
import { SessionManager } from "../../components/SessionManager";
import { sessionEvents } from "../../utils/sessionEvents";

function getPeriodTotals(bills: Bill[]) {
  const now = new Date();
  // Week: ISO week (Monday-Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  // Month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Quarter: Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec
  const quarter = Math.floor(now.getMonth() / 3);
  const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
  // Year
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let weekTotal = 0,
    monthTotal = 0,
    quarterTotal = 0,
    yearTotal = 0;
  for (const bill of bills) {
    const d = new Date(bill.date);
    if (!isNaN(d.getTime())) {
      if (d >= startOfWeek && d <= now) weekTotal += bill.amount;
      if (d >= startOfMonth && d <= now) monthTotal += bill.amount;
      if (d >= startOfQuarter && d <= now) quarterTotal += bill.amount;
      if (d >= startOfYear && d <= now) yearTotal += bill.amount;
    }
  }
  return { weekTotal, monthTotal, quarterTotal, yearTotal };
}

async function getSessionAnalysis(sessions: Session[]) {
  const analysis: Record<
    string,
    {
      weekTotal: number;
      monthTotal: number;
      quarterTotal: number;
      totalCount: number;
      overallTotal: number;
    }
  > = {};

  for (const session of sessions) {
    try {
      const bills = await getBillsBySession(session.id);
      const { weekTotal, monthTotal, quarterTotal } = getPeriodTotals(bills);
      const overallTotal = bills.reduce((sum, bill) => sum + bill.amount, 0);

      analysis[session.id] = {
        weekTotal,
        monthTotal,
        quarterTotal,
        totalCount: bills.length,
        overallTotal,
      };
    } catch (error) {
      console.error(`Error loading bills for session ${session.id}:`, error);
      analysis[session.id] = {
        weekTotal: 0,
        monthTotal: 0,
        quarterTotal: 0,
        totalCount: 0,
        overallTotal: 0,
      };
    }
  }

  return analysis;
}

export default function AnalysisScreen() {
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [quarterTotal, setQuarterTotal] = useState(0);
  const [yearTotal, setYearTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionAnalysis, setSessionAnalysis] = useState<
    Record<
      string,
      {
        weekTotal: number;
        monthTotal: number;
        quarterTotal: number;
        totalCount: number;
        overallTotal: number;
      }
    >
  >({});
  const [activeTab, setActiveTab] = useState<"bill" | "session">("bill");

  useFocusEffect(
    React.useCallback(() => {
      loadAnalysis();

      // Subscribe to session change events
      const unsubscribe = sessionEvents.subscribe(() => {
        loadAnalysis();
      });

      // Cleanup subscription when screen loses focus
      return unsubscribe;
    }, [])
  );

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const [bills, allSessions] = await Promise.all([
        getAllBills(),
        getAllSessions(),
      ]);

      const {
        weekTotal: w,
        monthTotal: m,
        quarterTotal: q,
        yearTotal: y,
      } = getPeriodTotals(bills);

      setWeekTotal(w);
      setMonthTotal(m);
      setQuarterTotal(q);
      setYearTotal(y);
      setSessions(allSessions);

      // Load session analysis
      const analysis = await getSessionAnalysis(allSessions);
      setSessionAnalysis(analysis);
    } catch (err) {
      console.error("Error loading analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderBillAnalysis = () => (
    <View style={styles.cardsWrap}>
      <View
        style={[
          styles.section,
          styles.cardShadow,
          { borderLeftColor: "#4f8cff", borderLeftWidth: 6 },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: "#4f8cff" }]}>
            This Week
          </Text>
        </View>
        <Text style={styles.amount}>₹{weekTotal.toFixed(2)}</Text>
      </View>
      <View
        style={[
          styles.section,
          styles.cardShadow,
          { borderLeftColor: "#ff6b9d", borderLeftWidth: 6 },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: "#ff6b9d" }]}>
            This Month
          </Text>
        </View>
        <Text style={styles.amount}>₹{monthTotal.toFixed(2)}</Text>
      </View>
      <View
        style={[
          styles.section,
          styles.cardShadow,
          { borderLeftColor: "#00c6ae", borderLeftWidth: 6 },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: "#00c6ae" }]}>
            This Quarter
          </Text>
        </View>
        <Text style={styles.amount}>₹{quarterTotal.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderSessionAnalysis = () => {
    // Calculate combined totals from all sessions
    const combinedAnalysis = Object.values(sessionAnalysis).reduce(
      (totals, session) => ({
        weekTotal: totals.weekTotal + session.weekTotal,
        monthTotal: totals.monthTotal + session.monthTotal,
        quarterTotal: totals.quarterTotal + session.quarterTotal,
        totalCount: totals.totalCount + session.totalCount,
        overallTotal: totals.overallTotal + session.overallTotal,
      }),
      {
        weekTotal: 0,
        monthTotal: 0,
        quarterTotal: 0,
        totalCount: 0,
        overallTotal: 0,
      }
    );

    const sessionCount = sessions.length;

    return (
      <View style={styles.sessionAnalysisContainer}>
        {sessions.length === 0 ? (
          <View style={styles.noSessionsContainer}>
            <Text style={styles.noSessionsText}>No sessions available</Text>
            <Text style={styles.noSessionsSubtext}>
              Create a session to see analysis
            </Text>
          </View>
        ) : (
          <>
            {/* Combined Session Stats Header */}
            <View style={styles.combinedStatsCard}>
              <View style={styles.combinedStatsHeader}>
                <Text style={styles.combinedStatsTitle}>
                  All Sessions Combined
                </Text>
                <Text style={styles.combinedStatsSubtitle}>
                  Data from {sessionCount}{" "}
                  {sessionCount === 1 ? "session" : "sessions"}
                </Text>
              </View>
              <View style={styles.combinedStatsRow}>
                <View style={styles.combinedStatItem}>
                  <Text style={styles.combinedStatValue}>
                    ₹{combinedAnalysis.overallTotal.toFixed(0)}
                  </Text>
                  <Text style={styles.combinedStatLabel}>Total Amount</Text>
                </View>
                <View style={styles.combinedStatItem}>
                  <Text style={styles.combinedStatValue}>
                    {combinedAnalysis.totalCount}
                  </Text>
                  <Text style={styles.combinedStatLabel}>Total Bills</Text>
                </View>
                <View style={styles.combinedStatItem}>
                  <Text style={styles.combinedStatValue}>{sessionCount}</Text>
                  <Text style={styles.combinedStatLabel}>Sessions</Text>
                </View>
              </View>
            </View>

            {/* Combined Period Analysis Cards */}
            <View style={styles.cardsWrap}>
              <View
                style={[
                  styles.section,
                  styles.cardShadow,
                  { borderLeftColor: "#4f8cff", borderLeftWidth: 6 },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.sectionTitle, { color: "#4f8cff" }]}>
                    This Week (All Sessions)
                  </Text>
                </View>
                <Text style={styles.amount}>
                  ₹{combinedAnalysis.weekTotal.toFixed(2)}
                </Text>
              </View>
              <View
                style={[
                  styles.section,
                  styles.cardShadow,
                  { borderLeftColor: "#ff6b9d", borderLeftWidth: 6 },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.sectionTitle, { color: "#ff6b9d" }]}>
                    This Month (All Sessions)
                  </Text>
                </View>
                <Text style={styles.amount}>
                  ₹{combinedAnalysis.monthTotal.toFixed(2)}
                </Text>
              </View>
              <View
                style={[
                  styles.section,
                  styles.cardShadow,
                  { borderLeftColor: "#00c6ae", borderLeftWidth: 6 },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.sectionTitle, { color: "#00c6ae" }]}>
                    This Quarter (All Sessions)
                  </Text>
                </View>
                <Text style={styles.amount}>
                  ₹{combinedAnalysis.quarterTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SessionManager onSessionChange={loadAnalysis} />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "bill" && styles.activeTab]}
          onPress={() => setActiveTab("bill")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "bill" && styles.activeTabText,
            ]}
          >
            Bill Analysis
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "session" && styles.activeTab]}
          onPress={() => setActiveTab("session")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "session" && styles.activeTabText,
            ]}
          >
            Session Analysis
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {activeTab === "bill" ? "Bill Analysis" : "Session Analysis"}
        </Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading analysis...</Text>
          </View>
        ) : (
          <>
            {activeTab === "bill"
              ? renderBillAnalysis()
              : renderSessionAnalysis()}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: SPACING.md,
    textAlign: "left",
    color: COLORS.dark,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eaf1fb",
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "700",
  },
  cardsWrap: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: "flex-start",
    minHeight: 90,
    borderLeftWidth: 6,
  },
  cardShadow: SHADOWS.md,
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 0,
    letterSpacing: 0.2,
  },
  amount: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: SPACING.sm,
    color: COLORS.dark,
    letterSpacing: 0.3,
  },

  // Tab Navigation Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
    ...SHADOWS.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },

  // Enhanced Session Analysis Styles
  sessionAnalysisContainer: {
    marginTop: SPACING.lg,
  },
  combinedStatsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  combinedStatsHeader: {
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  combinedStatsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  combinedStatsSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  combinedStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  combinedStatItem: {
    alignItems: "center",
  },
  combinedStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  combinedStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  noSessionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  noSessionsText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  noSessionsSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  sessionsList: {
    gap: SPACING.md,
  },
  sessionAnalysisCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary + "40",
  },
  activeSessionCard: {
    borderLeftColor: COLORS.success,
    backgroundColor: COLORS.success + "05",
  },
  sessionCardHeader: {
    marginBottom: SPACING.lg,
  },
  sessionInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  sessionNameContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
    flexDirection: "row",
    alignItems: "center",
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginLeft: SPACING.sm,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sessionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  overallTotalContainer: {
    alignItems: "flex-end",
  },
  overallTotalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 2,
  },
  overallTotalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  periodAnalysis: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  periodCard: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    minHeight: 70,
  },
  periodHeader: {
    marginBottom: SPACING.sm,
  },
  periodTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  periodAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
  },
});
