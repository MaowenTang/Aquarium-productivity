export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number; // e.g., every 2 days, every 3 weeks
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday (for weekly/custom)
  dayOfMonth?: number; // 1-31 (for monthly)
  endDate?: Date; // Optional end date for the recurrence
}

export interface TaskOccurrence {
  date: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: Date;
  priority: number; // 1 = low, 2 = medium, 3 = high
  completed: boolean;
  createdAt: Date;
  
  // Recurring task fields
  isRecurring?: boolean;
  recurrence?: RecurrencePattern;
  occurrences?: TaskOccurrence[]; // Track completed instances
  nextOccurrence?: Date; // Cached next occurrence date
  reminderBefore?: number; // Minutes before occurrence to remind
}