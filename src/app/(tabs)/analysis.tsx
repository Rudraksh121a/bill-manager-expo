import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { getAllBills } from '../../utils/db';

type Bill = {
    id: string;
    billName: string;
    amount: number;
    date: string;
    status?: string;
    payer?: string;
    description?: string;
};

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

    let weekTotal = 0, monthTotal = 0, quarterTotal = 0, yearTotal = 0;
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

export default function AnalysisScreen() {
    const [weekTotal, setWeekTotal] = useState(0);
    const [monthTotal, setMonthTotal] = useState(0);
    const [quarterTotal, setQuarterTotal] = useState(0);
    const [yearTotal, setYearTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            loadAnalysis();
        }, [])
    );

    const loadAnalysis = async () => {
        setLoading(true);
        try {
            const bills: Bill[] = await getAllBills();
            const { weekTotal: w, monthTotal: m, quarterTotal: q, yearTotal: y } = getPeriodTotals(bills);
            setWeekTotal(w);
            setMonthTotal(m);
            setQuarterTotal(q);
            setYearTotal(y);
        } catch (err) {
            console.error('Error loading analysis:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Bill Analysis</Text>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading analysis...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total (This Year):</Text>
                            <Text style={styles.summaryValue}>₹{yearTotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.cardsWrap}>
                            <View style={[styles.section, styles.cardShadow, { borderLeftColor: '#4f8cff', borderLeftWidth: 6 }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.sectionTitle, { color: '#4f8cff' }]}>This Week</Text>
                                </View>
                                <Text style={styles.amount}>₹{weekTotal.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.section, styles.cardShadow, { borderLeftColor: '#ff6b9d', borderLeftWidth: 6 }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.sectionTitle, { color: '#ff6b9d' }]}>This Month</Text>
                                </View>
                                <Text style={styles.amount}>₹{monthTotal.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.section, styles.cardShadow, { borderLeftColor: '#00c6ae', borderLeftWidth: 6 }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.sectionTitle, { color: '#00c6ae' }]}>This Quarter</Text>
                                </View>
                                <Text style={styles.amount}>₹{quarterTotal.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.section, styles.cardShadow, { borderLeftColor: '#ffb300', borderLeftWidth: 6 }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.sectionTitle, { color: '#ffb300' }]}>This Year</Text>
                                </View>
                                <Text style={styles.amount}>₹{yearTotal.toFixed(2)}</Text>
                            </View>
                        </View>
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
        fontWeight: '700',
        marginBottom: SPACING.md,
        textAlign: 'left',
        color: COLORS.dark,
        letterSpacing: 0.3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xxxl,
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#eaf1fb',
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '700',
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
        alignItems: 'flex-start',
        minHeight: 90,
        borderLeftWidth: 6,
    },
    cardShadow: SHADOWS.md,
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    icon: {
        fontSize: 28,
        marginRight: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 0,
        letterSpacing: 0.2,
    },
    amount: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: SPACING.sm,
        color: COLORS.dark,
        letterSpacing: 0.3,
    },
});