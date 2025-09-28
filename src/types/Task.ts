export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: Date;
  priority: number; // 1 = low, 2 = medium, 3 = high
  completed: boolean;
  createdAt: Date;
}