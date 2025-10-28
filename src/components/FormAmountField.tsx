import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

interface FormAmountFieldProps {
    value: string;
    onChangeText: (text: string) => void;
    editable?: boolean;
}

export const FormAmountField: React.FC<FormAmountFieldProps> = ({
    value,
    onChangeText,
    editable = true,
}) => {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                    style={[styles.input, styles.amountInput]}
                    placeholder="0.00"
                    placeholderTextColor="#b0b0b0"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType="decimal-pad"
                    editable={editable}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fieldGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#222',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
        color: '#0b7bff',
    },
    input: {
        height: 44,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e7ef',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#222',
    },
    amountInput: {
        flex: 1,
    },
});
