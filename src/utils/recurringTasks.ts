import { Task, RecurrencePattern, TaskOccurrence } from '../types/Task';

// Calculate the next occurrence date based on recurrence pattern
export function calculateNextOccurrence(
  pattern: RecurrencePattern,
  fromDate: Date = new Date()
): Date | null {
  const now = new Date(fromDate);
  now.setHours(0, 0, 0, 0); // Start of day

  // Check if recurrence has ended
  if (pattern.endDate && now > new Date(pattern.endDate)) {
    return null;
  }

  const interval = pattern.interval || 1;
  let nextDate = new Date(now);

  switch (pattern.type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case 'weekly':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find next occurrence from selected days of week
        const currentDay = nextDate.getDay();
        const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);
        
        // Find next day in the same week
        let nextDay = sortedDays.find(day => day > currentDay);
        
        if (nextDay !== undefined) {
          nextDate.setDate(nextDate.getDate() + (nextDay - currentDay));
        } else {
          // Move to first day of next week(s)
          const firstDay = sortedDays[0];
          const daysToAdd = (7 - currentDay + firstDay) + (interval - 1) * 7;
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        }
      } else {
        nextDate.setDate(nextDate.getDate() + 7 * interval);
      }
      break;

    case 'monthly':
      const targetDay = pattern.dayOfMonth || 1;
      nextDate.setMonth(nextDate.getMonth() + interval);
      
      // Handle months with fewer days
      const maxDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      nextDate.setDate(Math.min(targetDay, maxDay));
      break;

    case 'custom':
      // For custom, use weekly logic with custom days
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const currentDay = nextDate.getDay();
        const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);
        
        let nextDay = sortedDays.find(day => day > currentDay);
        
        if (nextDay !== undefined) {
          nextDate.setDate(nextDate.getDate() + (nextDay - currentDay));
        } else {
          const firstDay = sortedDays[0];
          nextDate.setDate(nextDate.getDate() + (7 - currentDay + firstDay));
        }
      }
      break;
  }

  // Check if calculated date exceeds end date
  if (pattern.endDate && nextDate > new Date(pattern.endDate)) {
    return null;
  }

  return nextDate;
}

// Get recurrence description text
export function getRecurrenceDescription(pattern: RecurrencePattern): string {
  const interval = pattern.interval || 1;
  const intervalText = interval > 1 ? `every ${interval} ` : '';

  switch (pattern.type) {
    case 'daily':
      return interval === 1 ? 'Daily' : `Every ${interval} days`;

    case 'weekly':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const days = pattern.daysOfWeek.map(getDayName);
        if (days.length === 7) return 'Daily';
        if (days.length === 1) return `Weekly on ${days[0]}`;
        return `Weekly on ${days.join(', ')}`;
      }
      return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;

    case 'monthly':
      const dayNum = pattern.dayOfMonth || 1;
      const suffix = getDaySuffix(dayNum);
      return `Monthly on the ${dayNum}${suffix}`;

    case 'custom':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const days = pattern.daysOfWeek.map(getDayName);
        return days.join(', ');
      }
      return 'Custom schedule';

    default:
      return 'Custom';
  }
}

// Helper to get day name
function getDayName(dayIndex: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex] || '';
}

// Helper to get ordinal suffix
function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Check if current occurrence is due today
export function isOccurrenceDueToday(nextOccurrence: Date | undefined): boolean {
  if (!nextOccurrence) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const occurrenceDate = new Date(nextOccurrence);
  occurrenceDate.setHours(0, 0, 0, 0);
  return today.getTime() === occurrenceDate.getTime();
}

// Check if current occurrence is overdue
export function isOccurrenceOverdue(nextOccurrence: Date | undefined): boolean {
  if (!nextOccurrence) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const occurrenceDate = new Date(nextOccurrence);
  occurrenceDate.setHours(0, 0, 0, 0);
  return occurrenceDate.getTime() < today.getTime();
}

// Mark current occurrence as completed and calculate next
export function completeCurrentOccurrence(task: Task): Task {
  if (!task.isRecurring || !task.recurrence || !task.nextOccurrence) {
    return task;
  }

  const newOccurrence: TaskOccurrence = {
    date: new Date(task.nextOccurrence),
    completed: true,
    completedAt: new Date(),
  };

  const occurrences = [...(task.occurrences || []), newOccurrence];
  const nextOccurrence = calculateNextOccurrence(task.recurrence, new Date(task.nextOccurrence));

  return {
    ...task,
    occurrences,
    nextOccurrence: nextOccurrence || undefined,
  };
}

// Check if reminder should be shown
export function shouldShowReminder(
  task: Task,
  currentTime: Date = new Date()
): boolean {
  if (!task.isRecurring || !task.nextOccurrence || !task.reminderBefore) {
    return false;
  }

  const occurrenceTime = new Date(task.nextOccurrence).getTime();
  const reminderTime = occurrenceTime - (task.reminderBefore * 60 * 1000);
  const now = currentTime.getTime();

  return now >= reminderTime && now < occurrenceTime;
}

// Get all upcoming occurrences for preview (next N occurrences)
export function getUpcomingOccurrences(
  pattern: RecurrencePattern,
  count: number = 5,
  startDate: Date = new Date()
): Date[] {
  const occurrences: Date[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const next = calculateNextOccurrence(pattern, currentDate);
    if (!next) break;
    occurrences.push(next);
    currentDate = new Date(next);
    currentDate.setDate(currentDate.getDate() + 1); // Move to next day to find next occurrence
  }

  return occurrences;
}

// Format next occurrence date
export function formatNextOccurrence(nextOccurrence: Date | undefined): string {
  if (!nextOccurrence) return 'No upcoming occurrences';

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const occDate = new Date(nextOccurrence);
  occDate.setHours(0, 0, 0, 0);

  if (occDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (occDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else if (occDate < today) {
    return 'Overdue';
  } else {
    const diffDays = Math.floor((occDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    return occDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// Initialize next occurrence for a new recurring task
export function initializeRecurringTask(task: Omit<Task, 'nextOccurrence'>): Task {
  if (!task.isRecurring || !task.recurrence) {
    return task as Task;
  }

  const nextOccurrence = calculateNextOccurrence(task.recurrence);

  return {
    ...task,
    nextOccurrence: nextOccurrence || undefined,
    occurrences: task.occurrences || [],
  } as Task;
}
