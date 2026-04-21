export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export type Category = 'Work' | 'Personal' | 'Health';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  category: Category;
  priority: Priority;
  subtasks: Subtask[];
  completed: boolean;
  createdAt: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  AddTask: { taskId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  AllTasks: undefined;
};