import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FormStatusSelectorProps {
    value: string;
    onChange: (status: string) => void;
    disabled?: boolean;
}

const STATUS_OPTIONS = ['due', 'paid', 'pending'];

export const FormStatusSelector: React.FC<FormStatusSelectorProps> = ({
    value,
    onChange,
    disabled = false,
}) => {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
                {STATUS_OPTIONS.map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.statusBtn,
                            value === status && styles.statusBtnActive,
                        ]}
                        onPress={() => onChange(status)}
                        disabled={disabled}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                value === status && styles.statusTextActive,
                            ]}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
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
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusBtn: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 6,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    statusBtnActive: {
        backgroundColor: '#0b7bff',
        borderColor: '#0b7bff',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    statusTextActive: {
        color: '#fff',
    },
});
