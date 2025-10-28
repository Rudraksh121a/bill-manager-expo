import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Alert,
    SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { addBill } from '../../utils/db';
import { FormField } from '../../components/FormField';
import { FormAmountField } from '../../components/FormAmountField';
import DatePickerField from '../../components/DatePickerField';
import { SubmitButton } from '../../components/SubmitButton';
import { AddBillHeader } from '../../components/AddBillHeader';

const AddItemScreen = () => {
    const [billName, setBillName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const generateId = () => Math.random().toString(36).substring(2, 11);

    const handleAddBill = async () => {
        // Validation
        if (!billName.trim()) {
            Alert.alert('Error', 'Please enter a bill name');
            return;
        }
        if (!amount.trim() || isNaN(parseFloat(amount))) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }
        if (!date.trim()) {
            Alert.alert('Error', 'Please select a date');
            return;
        }

        setLoading(true);
        try {
            const newBill = {
                id: generateId(),
                billName: billName.trim(),
                amount: parseFloat(amount),
                date,
                description: description.trim(),
            };

            const success = await addBill(newBill);
            if (success) {
                Alert.alert('Success', 'Bill added successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setBillName('');
                            setAmount('');
                            setDate(new Date().toISOString().split('T')[0]);
                            setDescription('');
                        },
                    },
                ]);
            } else {
                Alert.alert('Error', 'Failed to add bill');
            }
        } catch (err) {
            Alert.alert('Error', 'An error occurred: ' + (err as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* <AddBillHeader /> */}

                <View style={styles.form}>
                    <FormField
                        label="Bill Name"
                        placeholder="e.g., Electricity Bill"
                        value={billName}
                        onChangeText={setBillName}
                        editable={!loading}
                        isRequired
                    />

                    <FormAmountField
                        value={amount}
                        onChangeText={setAmount}
                        editable={!loading}
                    />

                    <DatePickerField
                        label="Date"
                        value={date}
                        onDateChange={setDate}
                        editable={!loading}
                        isRequired
                    />

                    <FormField
                        label="Description"
                        placeholder="Optional notes"
                        value={description}
                        onChangeText={setDescription}
                        editable={!loading}
                        multiline
                        numberOfLines={4}
                    />

                    <SubmitButton
                        onPress={handleAddBill}
                        disabled={loading}
                        loading={loading}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgLight,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    form: {
        padding: SPACING.lg,
    },
});

export default AddItemScreen;