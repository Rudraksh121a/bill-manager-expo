import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
    label = 'Add Bill',
}) => {
    return (
        <TouchableOpacity
            style={[styles.submitBtn, disabled && styles.submitBtnDisabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.submitText}>
                {loading ? 'Adding...' : label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    submitBtn: {
        height: 50,
        borderRadius: 10,
        backgroundColor: '#0b7bff',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
        shadowColor: '#0b7bff',
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
});
