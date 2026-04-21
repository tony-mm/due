import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types';
import { TaskCard } from '../components/TaskCard';
import { AddTaskSheet } from '../components/AddTaskSheet';

export const HomeScreen: React.FC = () => {
  const {
    getTodayTasks,
    toggleTaskComplete,
    toggleSubtask,
    deleteTask,
    addTask,
    updateTask,
    getTaskById,
  } = useTasks();

  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [fabAnim] = useState(new Animated.Value(0));

  const todayTasks = getTodayTasks();
  const overdueTasks = useMemo(
    () => todayTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))),
    [todayTasks]
  );
  const todayOnlyTasks = useMemo(
    () => todayTasks.filter(
      (t) => !t.dueDate || new Date(t.dueDate) >= new Date(new Date().setHours(0, 0, 0, 0))
    ),
    [todayTasks]
  );

  const openAddSheet = () => {
    setEditingTask(undefined);
    setAddSheetVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleEditTask = (taskId: string) => {
    setEditingTask(getTaskById(taskId));
    setAddSheetVisible(true);
  };

  const handleSaveTask = async (
    taskData: {
      title: string;
      notes?: string;
      dueDate?: string;
      category: import('../types').Category;
      priority: import('../types').Priority;
      subtasks?: import('../types').Subtask[];
    }
  ) => {
    const taskWithDefaults = {
      ...taskData,
      subtasks: taskData.subtasks || [],
    };
    if (editingTask) {
      await updateTask(editingTask.id, taskWithDefaults);
    } else {
      await addTask(taskWithDefaults);
    }
  };

  const renderTask = useCallback(
    ({ item }: { item: Task }) => (
      <TaskCard
        task={item}
        onToggleComplete={() => toggleTaskComplete(item.id)}
        onToggleSubtask={(subtaskId) => toggleSubtask(item.id, subtaskId)}
        onDelete={() => deleteTask(item.id)}
        onEdit={() => handleEditTask(item.id)}
      />
    ),
    [toggleTaskComplete, toggleSubtask, deleteTask]
  );

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {overdueTasks.length > 0 && renderSectionHeader('Overdue', overdueTasks.length)}
        {todayOnlyTasks.length > 0 &&
          overdueTasks.length > 0 &&
          renderSectionHeader('Today', todayOnlyTasks.length)}
        {todayOnlyTasks.length > 0 &&
          overdueTasks.length === 0 &&
          renderSectionHeader('Today', todayOnlyTasks.length)}
        {todayOnlyTasks.length === 0 && overdueTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks for today</Text>
            <Text style={styles.emptySubtitle}>
              Enjoy your day or add a new task
            </Text>
          </View>
        )}
      </View>
    ),
    [overdueTasks.length, todayOnlyTasks.length]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today</Text>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
      <FlatList
        data={todayOnlyTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddSheet}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      <AddTaskSheet
        visible={addSheetVisible}
        task={editingTask}
        onClose={() => setAddSheetVisible(false)}
        onSave={handleSaveTask}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#111111',
  },
  headerDate: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  sectionCount: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 8,
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111111',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});