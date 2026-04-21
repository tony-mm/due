import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#BBBBBB',
  medium: '#D97706',
  high: '#2D2D2D',
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: PRIORITY_COLORS[priority] },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    width: 3,
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
});