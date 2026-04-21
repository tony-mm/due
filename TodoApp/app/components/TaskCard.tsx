import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Task } from '../types';
import { CategoryPill } from './CategoryPill';
import { PriorityBadge } from './PriorityBadge';
import { SubtaskItem } from './SubtaskItem';
import { formatDueDate, isOverdue } from '../utils/dateHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface TaskCardProps {
  task: Task;
  onToggleComplete: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDelete: () => void;
  onEdit: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onToggleSubtask,
  onDelete,
  onEdit,
}) => {
  const [expanded, setExpanded] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const checkboxScale = useRef(new Animated.Value(task.completed ? 1 : 0)).current;

  const isTaskOverdue = task.dueDate && !task.completed && isOverdue(task.dueDate);

  React.useEffect(() => {
    Animated.spring(checkboxScale, {
      toValue: task.completed ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [task.completed]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0 || gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete();
          });
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onToggleComplete();
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const toggleExpand = () => {
    setExpanded(!expanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.card}>
        <PriorityBadge priority={task.priority} />
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.header}
            onPress={toggleExpand}
            activeOpacity={0.8}
          >
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggleComplete();
              }}
              style={styles.checkboxContainer}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.checkbox,
                  task.completed && styles.checkboxChecked,
                  {
                    transform: [{ scale: checkboxScale }],
                  },
                ]}
              >
                {task.completed && <Text style={styles.checkmark}>✓</Text>}
              </Animated.View>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text
                style={[styles.title, task.completed && styles.titleCompleted]}
                numberOfLines={expanded ? undefined : 2}
              >
                {task.title}
              </Text>
              <View style={styles.meta}>
                <CategoryPill category={task.category} />
                {task.dueDate && (
                  <Text
                    style={[
                      styles.dueDate,
                      isTaskOverdue && styles.dueDateOverdue,
                    ]}
                  >
                    {formatDueDate(task.dueDate)}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
          </TouchableOpacity>
          {expanded && task.subtasks.length > 0 && (
            <View style={styles.subtasksContainer}>
              {task.subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onToggle={() => onToggleSubtask(subtask.id)}
                />
              ))}
            </View>
          )}
          {expanded && (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>
          {task.completed ? 'Swipe left to delete' : 'Swipe right to complete'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 12,
    padding: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2D2D2D',
    borderColor: '#2D2D2D',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111111',
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#AAAAAA',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  dueDate: {
    fontSize: 12,
    color: '#888888',
  },
  dueDateOverdue: {
    color: '#CD5C5C',
  },
  expandIcon: {
    fontSize: 20,
    color: '#888888',
    marginLeft: 8,
    fontWeight: '300',
  },
  subtasksContainer: {
    marginTop: 8,
    paddingLeft: 36,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  editButton: {
    marginTop: 12,
    paddingLeft: 36,
  },
  editText: {
    fontSize: 14,
    color: '#2D2D2D',
    fontWeight: '500',
  },
  swipeHint: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 10,
    color: '#CCCCCC',
  },
});