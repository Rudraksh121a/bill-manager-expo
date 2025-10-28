import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

interface BillHeaderProps {
  query: string;
  onQueryChange: (text: string) => void;
  itemCount: number;
  loading: boolean;
  onClearQuery?: () => void;
}

export const BillHeader: React.FC<BillHeaderProps> = ({
  query,
  onQueryChange,
  itemCount,
  loading,
  onClearQuery,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color={COLORS.textTertiary} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search bills..."
          placeholderTextColor={COLORS.textTertiary}
          editable={!loading}
        />
        {query.length > 0 && (
          <Pressable onPress={onClearQuery}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Status / Count */}
      <Text style={styles.countText}>
        {itemCount} bill{itemCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'transparent',   // ✅ No header block bg
  },
  searchWrapper: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '500',
    paddingLeft: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  countText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: SPACING.sm,
    marginLeft: SPACING.xs,
  },
});
