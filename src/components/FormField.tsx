import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

interface FormFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    editable?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: 'default' | 'decimal-pad' | 'numeric' | 'email-address';
    hint?: string;
    isRequired?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    editable = true,
    multiline = false,
    numberOfLines = 1,
    keyboardType = 'default',
    hint,
    isRequired = false,
}) => {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>
                {label} {isRequired && '*'}
            </Text>
            <TextInput
                style={[styles.input, multiline && styles.textArea]}
                placeholder={placeholder}
                placeholderTextColor="#b0b0b0"
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                multiline={multiline}
                numberOfLines={numberOfLines}
                keyboardType={keyboardType}
            />
            {hint && <Text style={styles.hint}>{hint}</Text>}
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingVertical: 12,
    },
    hint: {
        fontSize: 12,
        color: '#888',
        marginTop: 6,
    },
});
