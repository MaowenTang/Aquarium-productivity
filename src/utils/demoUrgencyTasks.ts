import { Task } from '../types/Task';

// Helper function to create demo tasks with various urgency levels for testing
export function generateDemoUrgencyTasks(): Omit<Task, 'id' | 'completed' | 'createdAt'>[] {
  const now = new Date();

  return [
    // Overdue task (high priority)
    {
      title: 'Submit Project Report',
      description: 'Final project submission deadline passed',
      deadline: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      priority: 3
    },
    
    // Urgent task (1 hour remaining, high priority)
    {
      title: 'Team Meeting',
      description: 'Weekly standup with the team',
      deadline: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
      priority: 3
    },
    
    // Warning task (10 hours remaining, high priority - within 24h window)
    {
      title: 'Review Pull Requests',
      description: 'Code review for pending PRs',
      deadline: new Date(now.getTime() + 10 * 60 * 60 * 1000), // 10 hours from now
      priority: 3
    },
    
    // Warning task (8 hours remaining, medium priority - within 12h window)
    {
      title: 'Update Documentation',
      description: 'Update API documentation with new endpoints',
      deadline: new Date(now.getTime() + 8 * 60 * 60 * 1000), // 8 hours from now
      priority: 2
    },
    
    // Warning task (6 hours remaining, low priority - within 8h window)
    {
      title: 'Water Plants',
      description: 'Office plants need watering',
      deadline: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
      priority: 1
    },
    
    // Normal task (2 days away, high priority)
    {
      title: 'Prepare Presentation',
      description: 'Quarterly review presentation',
      deadline: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 2 days from now
      priority: 3
    },
    
    // Normal task (3 days away, medium priority)
    {
      title: 'Organize Team Event',
      description: 'Plan next month\'s team building activity',
      deadline: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 3 days from now
      priority: 2
    },
    
    // Normal task (no deadline, low priority)
    {
      title: 'Read Industry Article',
      description: 'Catch up on latest tech trends',
      priority: 1
    },
    
    // Urgent task (30 minutes remaining, medium priority)
    {
      title: 'Send Client Email',
      description: 'Follow up on proposal',
      deadline: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
      priority: 2
    },
    
    // Normal task (1 week away, low priority)
    {
      title: 'Clean Workspace',
      description: 'Organize desk and files',
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      priority: 1
    }
  ];
}
