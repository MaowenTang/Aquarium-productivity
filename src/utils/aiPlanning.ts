import { Task } from '../types/Task';
import { TaskUrgency, sortTasksByUrgency } from './urgencySystem';

export interface TaskRecommendation {
  task: Task;
  recommendedPriority: number;
  reason: string;
  urgencyScore: number;
}

export interface PlanningResult {
  recommendations: TaskRecommendation[];
  summary: string;
  estimatedTime: number; // in minutes
}

// Calculate urgency score (0-100, higher = more urgent)
function calculateUrgencyScore(task: Task): number {
  let score = 0;
  
  // Base score from priority
  score += task.priority * 25; // 25, 50, or 75 points
  
  // Add score based on deadline proximity
  if (task.deadline) {
    const now = new Date().getTime();
    const deadline = new Date(task.deadline).getTime();
    const hoursUntilDue = (deadline - now) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) {
      score += 100; // Overdue - maximum urgency
    } else if (hoursUntilDue < 4) {
      score += 80; // Less than 4 hours
    } else if (hoursUntilDue < 12) {
      score += 60; // Less than 12 hours
    } else if (hoursUntilDue < 24) {
      score += 40; // Less than 24 hours
    } else if (hoursUntilDue < 48) {
      score += 20; // Less than 48 hours
    } else if (hoursUntilDue < 72) {
      score += 10; // Less than 72 hours
    }
  }
  
  return Math.min(100, score);
}

// Generate reason text based on task analysis
function generateReason(task: Task, urgencyScore: number): string {
  const reasons: string[] = [];
  
  // Check deadline
  if (task.deadline) {
    const now = new Date().getTime();
    const deadline = new Date(task.deadline).getTime();
    const hoursUntilDue = (deadline - now) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) {
      reasons.push('⚠️ Overdue');
    } else if (hoursUntilDue < 4) {
      reasons.push('🚨 Due in less than 4 hours');
    } else if (hoursUntilDue < 12) {
      reasons.push('⏰ Due in less than 12 hours');
    } else if (hoursUntilDue < 24) {
      reasons.push('📅 Due tomorrow');
    } else if (hoursUntilDue < 48) {
      reasons.push('📆 Due in 2 days');
    } else if (hoursUntilDue < 72) {
      reasons.push('📋 Due this week');
    }
  }
  
  // Check priority
  if (task.priority === 3) {
    reasons.push('🔥 High priority');
  } else if (task.priority === 2) {
    reasons.push('🌊 Medium priority');
  } else {
    reasons.push('🌿 Low priority');
  }
  
  // Add estimated time if available in description
  const estimatedTime = estimateTaskDuration(task);
  if (estimatedTime) {
    if (estimatedTime <= 15) {
      reasons.push('⚡ Quick task');
    } else if (estimatedTime <= 30) {
      reasons.push('⏱️ Short task');
    } else {
      reasons.push(`⏳ ~${estimatedTime} mins`);
    }
  }
  
  return reasons.join(' • ');
}

// Estimate task duration based on title/description keywords
function estimateTaskDuration(task: Task): number | null {
  const text = `${task.title} ${task.description || ''}`.toLowerCase();
  
  // Look for time indicators
  const quickKeywords = ['quick', 'call', 'email', 'send', 'check', 'review'];
  const mediumKeywords = ['write', 'prepare', 'create', 'plan', 'organize'];
  const longKeywords = ['meeting', 'presentation', 'report', 'project', 'develop'];
  
  if (quickKeywords.some(keyword => text.includes(keyword))) {
    return 15;
  } else if (mediumKeywords.some(keyword => text.includes(keyword))) {
    return 30;
  } else if (longKeywords.some(keyword => text.includes(keyword))) {
    return 60;
  }
  
  // Default based on priority
  return task.priority === 3 ? 45 : task.priority === 2 ? 30 : 20;
}

// Determine optimal priority based on urgency score
function getOptimalPriority(urgencyScore: number): number {
  if (urgencyScore >= 75) return 3; // High
  if (urgencyScore >= 40) return 2; // Medium
  return 1; // Low
}

// Main AI planning function
export function generateTaskPlan(tasks: Task[]): PlanningResult {
  // Filter active tasks only
  const activeTasks = tasks.filter(task => !task.completed);
  
  if (activeTasks.length === 0) {
    return {
      recommendations: [],
      summary: 'No active tasks to plan',
      estimatedTime: 0
    };
  }
  
  // Calculate urgency scores and generate recommendations
  const recommendations: TaskRecommendation[] = activeTasks.map(task => {
    const urgencyScore = calculateUrgencyScore(task);
    const recommendedPriority = getOptimalPriority(urgencyScore);
    const reason = generateReason(task, urgencyScore);
    
    return {
      task,
      recommendedPriority,
      reason,
      urgencyScore
    };
  });
  
  // Sort by urgency score (highest first)
  recommendations.sort((a, b) => b.urgencyScore - a.urgencyScore);
  
  // Generate summary
  const totalTime = recommendations.reduce((sum, rec) => {
    return sum + (estimateTaskDuration(rec.task) || 0);
  }, 0);
  
  const urgentCount = recommendations.filter(r => r.urgencyScore >= 75).length;
  const highPriorityCount = recommendations.filter(r => r.recommendedPriority === 3).length;
  
  let summary = '';
  if (urgentCount > 0) {
    summary = `Found ${urgentCount} urgent task${urgentCount > 1 ? 's' : ''} requiring immediate attention. `;
  } else if (highPriorityCount > 0) {
    summary = `Focus on ${highPriorityCount} high-priority task${highPriorityCount > 1 ? 's' : ''} first. `;
  } else {
    summary = 'Your tasks are well-balanced. Follow the suggested order for best results. ';
  }
  
  summary += `Estimated total time: ${Math.ceil(totalTime / 60)} hours ${totalTime % 60} minutes.`;
  
  return {
    recommendations,
    summary,
    estimatedTime: totalTime
  };
}

// Apply recommendations by updating task priorities
export function applyRecommendations(
  tasks: Task[],
  recommendations: TaskRecommendation[]
): Task[] {
  return tasks.map(task => {
    const recommendation = recommendations.find(r => r.task.id === task.id);
    if (recommendation && !task.completed) {
      return {
        ...task,
        priority: recommendation.recommendedPriority
      };
    }
    return task;
  });
}

// Check if recommendations differ from current priorities
export function hasSignificantChanges(recommendations: TaskRecommendation[]): boolean {
  return recommendations.some(rec => rec.task.priority !== rec.recommendedPriority);
}
