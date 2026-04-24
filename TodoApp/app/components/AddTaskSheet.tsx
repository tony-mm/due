import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { View as RNView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Task, Category, Priority, Subtask } from '../types';
import { CategoryPill } from './CategoryPill';

// Conditionally load DateTimePicker only on native platforms
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (e) {
    console.warn('DateTimePicker not available:', e);
  }
}

interface AddTaskSheetProps {
  visible: boolean;
  task?: Task;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    notes?: string;
    dueDate?: string;
    category: Category;
    priority: Priority;
    subtasks?: Subtask[];
  }) => void;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Health'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export const AddTaskSheet: React.FC<AddTaskSheetProps> = ({
  visible,
  task,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<Category>('Work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || '');
      setCategory(task.category);
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setSubtasks(task.subtasks);
    } else {
      setTitle('');
      setNotes('');
      setCategory('Work');
      setPriority('medium');
      setDueDate(undefined);
      setSubtasks([]);
    }
    setNewSubtask('');
  }, [task, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave({
      title: title.trim(),
      notes: notes.trim() || undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      category,
      priority,
      subtasks,
    });
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtask: Subtask = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      title: newSubtask.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, subtask]);
    setNewSubtask('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <RNView style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <RNView style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView>
              <Text style={styles.sheetTitle}>
                {task ? 'Edit Task' : 'New Task'}
              </Text>

              <TextInput
                style={styles.titleInput}
                placeholder="What needs to be done?"
                placeholderTextColor="#AAAAAA"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />

              <TextInput
                style={styles.notesInput}
                placeholder="Add notes (optional)"
                placeholderTextColor="#AAAAAA"
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.pillsContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={styles.pillTouchable}
                  >
                    <View
                      style={[
                        category === cat && styles.pillSelected,
                      ]}
                    >
                      <CategoryPill category={cat} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {PRIORITIES.map((pri) => (
                  <TouchableOpacity
                    key={pri}
                    onPress={() => {
                      setPriority(pri);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.priorityButton,
                      priority === pri && styles.priorityButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        priority === pri && styles.priorityTextSelected,
                      ]}
                    >
                      {pri.charAt(0).toUpperCase() + pri.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    // Date picker not supported on web; ignore or show a message
                    return;
                  }
                  setShowDatePicker(true);
                }}
              >
                <Text style={[styles.dateText, !dueDate && styles.datePlaceholder]}>
                  {dueDate ? dueDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'No due date'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && Platform.OS !== 'web' && DateTimePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: any, date?: Date) => {
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                    if (date) {
                      setDueDate(date);
                      if (Platform.OS === 'ios') {
                        setShowDatePicker(false);
                      }
                    }
                  }}
                />
              )}

              <Text style={styles.label}>Subtasks</Text>
              <View style={styles.subtasksInputContainer}>
                <TextInput
                  style={styles.subtaskInput}
                  placeholder="Add a subtask"
                  placeholderTextColor="#AAAAAA"
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  onSubmitEditing={handleAddSubtask}
                />
                <TouchableOpacity style={styles.addSubtaskButton} onPress={handleAddSubtask}>
                  <Text style={styles.addSubtaskText}>Add</Text>
                </TouchableOpacity>
              </View>
              {subtasks.map((st) => (
                <View key={st.id} style={styles.subtaskItem}>
                  <Text style={styles.subtaskText}>{st.title}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSubtask(st.id)}>
                    <Text style={styles.removeSubtask}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {task ? 'Save Changes' : 'Create Task'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
        </RNView>
      </RNView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    height: '80%',
    width: '100%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  keyboardView: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 18,
    color: '#111111',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12,
    marginBottom: 20,
  },
  notesInput: {
    fontSize: 14,
    color: '#111111',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12,
    marginBottom: 24,
    minHeight: 60,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  pillTouchable: {
    padding: 2,
  },
  pillSelected: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2D2D2D',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderColor: '#2D2D2D',
    backgroundColor: '#2D2D2D',
  },
  priorityText: {
    fontSize: 14,
    color: '#888888',
  },
  priorityTextSelected: {
    color: '#FFFFFF',
  },
  dateButton: {
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#EEEEEE',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
    color: '#111111',
  },
  datePlaceholder: {
    color: '#AAAAAA',
  },
  subtasksInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 8,
  },
  addSubtaskButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addSubtaskText: {
    fontSize: 14,
    color: '#2D2D2D',
    fontWeight: '500',
  },
  subtaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
  },
  removeSubtask: {
    fontSize: 20,
    color: '#888888',
    paddingHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});