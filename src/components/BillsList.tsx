import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Bill, BillCard } from './BillCard';
import { COLORS, SPACING } from '../utils/theme';

interface BillsListProps {
    bills: Bill[];
    loading: boolean;
    onDeleteBill: (id: string, billName: string) => void;
}

export const BillsList: React.FC<BillsListProps> = ({ bills, loading, onDeleteBill }) => {
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading bills...</Text>
            </View>
        );
    }

    if (bills.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No bills yet</Text>
                <Text style={styles.emptyText}>Add your first bill to get started</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={bills}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <BillCard bill={item} onDelete={onDeleteBill} />}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        padding: SPACING.lg,
        paddingTop: SPACING.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textTertiary,
        fontWeight: '500',
        textAlign: 'center',
    },
});
