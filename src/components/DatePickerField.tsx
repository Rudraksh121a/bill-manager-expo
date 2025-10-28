import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

interface DatePickerFieldProps {
    label: string;
    value: string;
    onDateChange: (date: string) => void;
    editable?: boolean;
    isRequired?: boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
    label,
    value,
    onDateChange,
    editable = true,
    isRequired = false,
}) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDayPress = (day: number) => {
        const monthStr = String(selectedMonth + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;
        onDateChange(dateStr);
        setShowCalendar(false);
    };

    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => null);
    const calendarDays = [...emptyDays, ...days];

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const parseDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return { year: parseInt(year), month: parseInt(month), day: parseInt(day) };
    };

    const currentDate = parseDate(value);

    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>
                {label}
                {isRequired && <Text style={styles.required}>*</Text>}
            </Text>

            <TouchableOpacity
                style={[styles.dateInput, !editable && styles.dateInputDisabled]}
                onPress={() => editable && setShowCalendar(true)}
                disabled={!editable}
            >
                <Ionicons name="calendar" size={20} color={COLORS.primary} style={styles.icon} />
                <Text style={styles.dateText}>{value || 'Select a date'}</Text>
            </TouchableOpacity>

            <Modal
                visible={showCalendar}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCalendar(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.calendarHeader}>
                        <Text style={styles.calendarTitle}>Select Date</Text>
                        <TouchableOpacity onPress={() => setShowCalendar(false)}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.monthYearSelector}>
                        <TouchableOpacity
                            onPress={() => {
                                if (selectedMonth === 0) {
                                    setSelectedMonth(11);
                                    setSelectedYear(selectedYear - 1);
                                } else {
                                    setSelectedMonth(selectedMonth - 1);
                                }
                            }}
                            style={styles.navButton}
                        >
                            <Text style={styles.navButtonText}>← Prev</Text>
                        </TouchableOpacity>

                        <Text style={styles.monthYearText}>
                            {monthNames[selectedMonth]} {selectedYear}
                        </Text>

                        <TouchableOpacity
                            onPress={() => {
                                if (selectedMonth === 11) {
                                    setSelectedMonth(0);
                                    setSelectedYear(selectedYear + 1);
                                } else {
                                    setSelectedMonth(selectedMonth + 1);
                                }
                            }}
                            style={styles.navButton}
                        >
                            <Text style={styles.navButtonText}>Next →</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekDaysContainer}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <Text key={day} style={styles.weekDay}>
                                {day}
                            </Text>
                        ))}
                    </View>

                    <View style={styles.daysContainer}>
                        {calendarDays.map((day, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dayButton,
                                    !day && styles.emptyDay,
                                    day === currentDate.day &&
                                    selectedMonth === currentDate.month - 1 &&
                                    selectedYear === currentDate.year &&
                                    styles.selectedDay,
                                ]}
                                onPress={() => day && handleDayPress(day)}
                                disabled={!day}
                            >
                                {day && <Text style={styles.dayText}>{day}</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => setShowCalendar(false)}
                    >
                        <Text style={styles.confirmButtonText}>Done</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
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
    required: {
        color: '#e74c3c',
    },
    dateInput: {
        height: 44,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e7ef',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateInputDisabled: {
        opacity: 0.6,
        backgroundColor: '#f5f5f5',
    },
    dateText: {
        fontSize: 16,
        color: '#222',
        flex: 1,
    },
    icon: {
        marginRight: 12,
    },
    calendarIcon: {
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    calendarHeader: {
        backgroundColor: '#0b7bff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    calendarTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    closeButton: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    monthYearSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e7ef',
    },
    navButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f0f4fa',
        borderRadius: 6,
    },
    navButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0b7bff',
    },
    monthYearText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
        minWidth: 120,
        textAlign: 'center',
    },
    weekDaysContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e7ef',
    },
    weekDay: {
        flex: 1,
        textAlign: 'center',
        paddingVertical: 10,
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    daysContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayButton: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 4,
    },
    emptyDay: {
        backgroundColor: 'transparent',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#222',
    },
    selectedDay: {
        backgroundColor: '#0b7bff',
    },
    selectedDay_Text: {
        color: '#fff',
    },
    confirmButton: {
        margin: 16,
        paddingVertical: 12,
        backgroundColor: '#0b7bff',
        borderRadius: 10,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default DatePickerField;
