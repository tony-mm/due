import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Subtask } from '../types';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: () => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({ subtask, onToggle }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, subtask.completed && styles.checkboxChecked]}>
        {subtask.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text
        style={[styles.title, subtask.completed && styles.titleCompleted]}
        numberOfLines={2}
      >
        {subtask.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#2D2D2D',
    borderColor: '#2D2D2D',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    color: '#111111',
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#AAAAAA',
  },
});