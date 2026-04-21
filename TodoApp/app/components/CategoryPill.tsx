import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Category } from '../types';

interface CategoryPillProps {
  category: Category;
}

const CATEGORY_STYLES: Record<Category, { backgroundColor: string; color: string }> = {
  Work: { backgroundColor: '#F5F5F5', color: '#666666' },
  Personal: { backgroundColor: '#F0F0F0', color: '#555555' },
  Health: { backgroundColor: '#EFEFEF', color: '#777777' },
};

export const CategoryPill: React.FC<CategoryPillProps> = ({ category }) => {
  const style = CATEGORY_STYLES[category];

  return (
    <View style={[styles.pill, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.color }]}>{category}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});