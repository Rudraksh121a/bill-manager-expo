import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AddBillHeaderProps {
    title?: string;
}

export const AddBillHeader: React.FC<AddBillHeaderProps> = ({
    title = '➕ Add New Bill',
}) => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e3e8ee',
        marginBottom: 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0b7bff',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
});
