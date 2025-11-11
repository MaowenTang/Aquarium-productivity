import { Task } from '../types/Task';

export type UrgencyState = 'normal' | 'warning' | 'urgent' | 'overdue';

export interface TaskUrgency {
  task: Task;
  state: UrgencyState;
  timeUntilDue: number; // in milliseconds
  reminderTriggered: boolean;
  sortPriority: number; // Higher number = more urgent
}

// Reminder windows in hours based on priority
const REMINDER_WINDOWS = {
  high: 24,     // 24 hours before
  medium: 12,   // 12 hours before
  low: 8        // 8 hours before
};

// Convert priority number to string
export function getPriorityLevel(priority: number): 'high' | 'medium' | 'low' {
  if (priority === 3) return 'high';
  if (priority === 2) return 'medium';
  return 'low';
}

// Calculate urgency state for a task
export function calculateUrgencyState(task: Task): TaskUrgency {
  const now = new Date();
  
  // If no deadline, it's normal priority
  if (!task.deadline) {
    return {
      task,
      state: 'normal',
      timeUntilDue: Infinity,
      reminderTriggered: false,
      sortPriority: 0
    };
  }

  const deadline = new Date(task.deadline);
  const timeUntilDue = deadline.getTime() - now.getTime();
  const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);
  
  // Task is overdue
  if (timeUntilDue < 0) {
    return {
      task,
      state: 'overdue',
      timeUntilDue,
      reminderTriggered: true,
      sortPriority: 1000 + task.priority // Overdue tasks are highest priority
    };
  }

  const priorityLevel = getPriorityLevel(task.priority);
  const reminderWindow = REMINDER_WINDOWS[priorityLevel];
  
  // Within urgent window (last 2 hours)
  if (hoursUntilDue <= 2) {
    return {
      task,
      state: 'urgent',
      timeUntilDue,
      reminderTriggered: true,
      sortPriority: 500 + task.priority
    };
  }
  
  // Within warning window (before reminder window)
  if (hoursUntilDue <= reminderWindow) {
    return {
      task,
      state: 'warning',
      timeUntilDue,
      reminderTriggered: true,
      sortPriority: 100 + task.priority
    };
  }
  
  // Normal state
  return {
    task,
    state: 'normal',
    timeUntilDue,
    reminderTriggered: false,
    sortPriority: task.priority
  };
}

// Sort tasks by urgency (most urgent first)
export function sortTasksByUrgency(tasks: Task[]): TaskUrgency[] {
  const taskUrgencies = tasks
    .filter(task => !task.completed) // Only active tasks
    .map(task => calculateUrgencyState(task));
  
  return taskUrgencies.sort((a, b) => {
    // Sort by sortPriority (descending)
    if (b.sortPriority !== a.sortPriority) {
      return b.sortPriority - a.sortPriority;
    }
    
    // If same priority, sort by time until due (ascending)
    return a.timeUntilDue - b.timeUntilDue;
  });
}

// Get color scheme for urgency state
export function getUrgencyColors(state: UrgencyState, isDark: boolean = false) {
  if (isDark) {
    switch (state) {
      case 'overdue':
        return {
          gradient: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)',
          border: 'rgba(239, 68, 68, 0.5)',
          glow: 'rgba(239, 68, 68, 0.3)',
          text: '#fca5a5'
        };
      case 'urgent':
        return {
          gradient: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
          border: 'rgba(244, 63, 94, 0.5)',
          glow: 'rgba(244, 63, 94, 0.3)',
          text: '#fda4af'
        };
      case 'warning':
        return {
          gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)',
          border: 'rgba(251, 191, 36, 0.5)',
          glow: 'rgba(251, 191, 36, 0.3)',
          text: '#fcd34d'
        };
      case 'normal':
      default:
        return {
          gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          border: 'rgba(96, 165, 250, 0.5)',
          glow: 'rgba(96, 165, 250, 0.2)',
          text: '#93c5fd'
        };
    }
  } else {
    switch (state) {
      case 'overdue':
      case 'urgent':
        // Orange ocean gradient for urgent states
        return {
          gradient: 'linear-gradient(135deg, #FF6A3D 0%, #FF9A3D 100%)',
          border: 'rgba(255, 106, 61, 0.5)',
          glow: 'rgba(255, 154, 61, 0.4)',
          text: '#ffffff'
        };
      case 'warning':
        return {
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)',
          border: 'rgba(245, 158, 11, 0.4)',
          glow: 'rgba(245, 158, 11, 0.3)',
          text: '#b45309'
        };
      case 'normal':
      default:
        return {
          gradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #60a5fa 100%)',
          border: 'rgba(14, 165, 233, 0.3)',
          glow: 'rgba(14, 165, 233, 0.2)',
          text: '#0c4a6e'
        };
    }
  }
}

// Get color scheme based on priority (for normal state only)
export function getPriorityColors(priority: number, isDark: boolean = false) {
  if (isDark) {
    switch (priority) {
      case 3: // High priority
        return {
          gradient: 'linear-gradient(135deg, #0A3CBF 0%, #1459FF 100%)',
          border: 'rgba(20, 89, 255, 0.5)',
          glow: 'rgba(20, 89, 255, 0.3)',
          text: '#93c5fd'
        };
      case 2: // Medium priority
        return {
          gradient: 'linear-gradient(135deg, #1D74F0 0%, #4DA3FF 100%)',
          border: 'rgba(77, 163, 255, 0.5)',
          glow: 'rgba(77, 163, 255, 0.3)',
          text: '#bfdbfe'
        };
      case 1: // Low priority
      default:
        return {
          gradient: 'linear-gradient(135deg, #6FB8FF 0%, #A8D8FF 100%)',
          border: 'rgba(168, 216, 255, 0.5)',
          glow: 'rgba(168, 216, 255, 0.2)',
          text: '#dbeafe'
        };
    }
  } else {
    switch (priority) {
      case 3: // High priority - darkest ocean blue
        return {
          gradient: 'linear-gradient(135deg, #0A3CBF 0%, #1459FF 100%)',
          border: 'rgba(10, 60, 191, 0.4)',
          glow: 'rgba(20, 89, 255, 0.3)',
          text: '#ffffff'
        };
      case 2: // Medium priority - mid blue
        return {
          gradient: 'linear-gradient(135deg, #1D74F0 0%, #4DA3FF 100%)',
          border: 'rgba(29, 116, 240, 0.4)',
          glow: 'rgba(77, 163, 255, 0.3)',
          text: '#ffffff'
        };
      case 1: // Low priority - pale blue
      default:
        return {
          gradient: 'linear-gradient(135deg, #6FB8FF 0%, #A8D8FF 100%)',
          border: 'rgba(111, 184, 255, 0.3)',
          glow: 'rgba(168, 216, 255, 0.2)',
          text: '#0c4a6e'
        };
    }
  }
}

// Format time remaining in human-readable format
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds < 0) {
    const absMs = Math.abs(milliseconds);
    const hours = Math.floor(absMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d overdue`;
    if (hours > 0) return `${hours}h overdue`;
    return 'Overdue';
  }

  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 1) return `${days} days`;
  if (days === 1) return '1 day';
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return 'Due now';
}

// Get urgency icon
export function getUrgencyIcon(state: UrgencyState): string {
  switch (state) {
    case 'overdue':
      return '🚨';
    case 'urgent':
      return '⏰';
    case 'warning':
      return '⚠️';
    case 'normal':
    default:
      return '💧';
  }
}

// Get urgency message
export function getUrgencyMessage(urgency: TaskUrgency): string {
  const priorityLevel = getPriorityLevel(urgency.task.priority);
  
  switch (urgency.state) {
    case 'overdue':
      return `Task is overdue!`;
    case 'urgent':
      return `Due in ${formatTimeRemaining(urgency.timeUntilDue)}!`;
    case 'warning':
      return `${formatTimeRemaining(urgency.timeUntilDue)} remaining`;
    case 'normal':
    default:
      if (urgency.task.deadline) {
        return `Due ${formatTimeRemaining(urgency.timeUntilDue)}`;
      }
      return 'No deadline';
  }
}