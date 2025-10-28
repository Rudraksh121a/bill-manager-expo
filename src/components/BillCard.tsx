import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../utils/theme';

export type Bill = {
    id: string;
    billName: string;
    amount: number;
    date: string;
    status?: string;
    payer?: string;
    description?: string;
};

interface BillCardProps {
    bill: Bill;
    onDelete: (id: string, billName: string) => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onDelete }) => {
    return (
        <View style={styles.cardWrap}>
            <View style={styles.cardAccent} />
            <View style={styles.cardContent}>
                <View style={styles.header}>
                    <View style={styles.titleSection}>
                        <Text style={styles.billName} numberOfLines={2}>{bill.billName}</Text>
                        <Text style={styles.date}>{bill.date}</Text>
                    </View>
                    <Text style={styles.amount}>₹{bill.amount.toFixed(2)}</Text>
                </View>

                {bill.description ? (
                    <View style={styles.descriptionSection}>
                        <Text style={styles.description} numberOfLines={2}>{bill.description}</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDelete(bill.id, bill.billName)}
                >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardWrap: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: SPACING.lg,
    },
    cardAccent: {
        width: 5,
        borderTopLeftRadius: RADIUS.lg,
        borderBottomLeftRadius: RADIUS.lg,
        backgroundColor: COLORS.primary,
        marginRight: 0,
    },
    cardContent: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderTopRightRadius: RADIUS.lg,
        borderBottomRightRadius: RADIUS.lg,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        ...SHADOWS.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleSection: {
        flex: 1,
        marginRight: SPACING.md,
    },
    billName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.dark,
        marginBottom: SPACING.sm,
    },
    date: {
        fontSize: 13,
        color: COLORS.textTertiary,
        fontWeight: '500',
        marginTop: SPACING.xs,
    },
    amount: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: SPACING.sm,
    },
    descriptionSection: {
        marginTop: SPACING.md,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.bgLight,
        borderRadius: RADIUS.md,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.accent2,
    },
    description: {
        fontSize: 14,
        color: COLORS.darkGray,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    deleteBtn: {
        marginTop: SPACING.lg,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        backgroundColor: '#fee2e2',
        borderRadius: RADIUS.md,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    deleteBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.danger,
    },
});

export default BillCard;
