import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTasks } from '../hooks/useTasks';
import { Task, Category, Priority } from '../types';
import { TaskCard } from '../components/TaskCard';
import { AddTaskSheet } from '../components/AddTaskSheet';

const CATEGORIES: (Category | 'All')[] = ['All', 'Work', 'Personal', 'Health'];
const PRIORITIES: (Priority | 'All')[] = ['All', 'low', 'medium', 'high'];

export const AllTasksScreen: React.FC = () => {
  const {
    tasks,
    toggleTaskComplete,
    toggleSubtask,
    deleteTask,
    addTask,
    updateTask,
    getTaskById,
  } = useTasks();

  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (categoryFilter !== 'All') {
      result = result.filter((t) => t.category === categoryFilter);
    }
    if (priorityFilter !== 'All') {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    return result;
  }, [tasks, categoryFilter, priorityFilter]);

  const groupedTasks = useMemo(() => {
    const groups: Record<Category, Task[]> = {
      Work: [],
      Personal: [],
      Health: [],
    };
    filteredTasks.forEach((task) => {
      groups[task.category].push(task);
    });
    return groups;
  }, [filteredTasks]);

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

  const handleFilterChange = (
    filterType: 'category' | 'priority',
    value: Category | Priority | 'All'
  ) => {
    if (filterType === 'category') {
      setCategoryFilter(value as Category | 'All');
    } else {
      setPriorityFilter(value as Priority | 'All');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const renderCategoryGroup = (category: Category, tasks: Task[]) => {
    if (tasks.length === 0 && categoryFilter !== 'All') return null;
    if (categoryFilter !== 'All') {
      return (
        <View key={category}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskWrapper}>
              {renderTask({ item: task })}
            </View>
          ))}
        </View>
      );
    }
    return (
      <View key={category} style={styles.categoryGroup}>
        <Text style={styles.categoryTitle}>
          {category} ({tasks.length})
        </Text>
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskWrapper}>
            {renderTask({ item: task })}
          </View>
        ))}
      </View>
    );
  };

  const activeFilters = categoryFilter !== 'All' || priorityFilter !== 'All';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>All Tasks</Text>
          <TouchableOpacity
            style={[styles.filterButton, activeFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilters && styles.filterButtonTextActive,
              ]}
            >
              Filter{activeFilters ? ' •' : ''}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.taskCount}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.filterOptions}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterOption,
                      categoryFilter === cat && styles.filterOptionActive,
                    ]}
                    onPress={() => handleFilterChange('category', cat)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        categoryFilter === cat && styles.filterOptionTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Priority</Text>
              <View style={styles.filterOptions}>
                {PRIORITIES.map((pri) => (
                  <TouchableOpacity
                    key={pri}
                    style={[
                      styles.filterOption,
                      priorityFilter === pri && styles.filterOptionActive,
                    ]}
                    onPress={() => handleFilterChange('priority', pri)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        priorityFilter === pri && styles.filterOptionTextActive,
                      ]}
                    >
                      {pri === 'All' ? 'All' : pri.charAt(0).toUpperCase() + pri.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first task to get started
          </Text>
        </View>
      ) : categoryFilter !== 'All' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(groupedTasks).map(([category, tasks]) =>
            renderCategoryGroup(category as Category, tasks)
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : (
        <>
          {['Work', 'Personal', 'Health'].map((cat) =>
            renderCategoryGroup(cat as Category, groupedTasks[cat as Category])
          )}
        </>
      )}

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
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#111111',
  },
  taskCount: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  filterButtonActive: {
    borderColor: '#2D2D2D',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#888888',
  },
  filterButtonTextActive: {
    color: '#2D2D2D',
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filtersScroll: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 24,
  },
  filterGroup: {},
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  filterOptionActive: {
    borderColor: '#2D2D2D',
    backgroundColor: '#2D2D2D',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#888888',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  categoryGroup: {
    marginTop: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  taskWrapper: {
    marginBottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
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
  bottomSpacer: {
    height: 100,
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