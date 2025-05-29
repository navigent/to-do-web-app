import { useMemo } from 'react'
import { TaskFilters, Task } from '@/types'
import { EmptyStateVariant } from '@/components/ui/empty-state'

interface UseEmptyStateProps {
  tasks: Task[]
  filteredTasks: Task[]
  filters: TaskFilters
  isFirstTime?: boolean
}

interface EmptyStateInfo {
  variant: EmptyStateVariant
  title?: string
  description?: string
  searchTerm?: string
}

export function useEmptyState({
  tasks,
  filteredTasks,
  filters,
  isFirstTime = false,
}: UseEmptyStateProps): EmptyStateInfo | null {
  return useMemo(() => {
    // If there are filtered tasks, no empty state needed
    if (filteredTasks.length > 0) {
      return null
    }

    // No tasks at all - new user
    if (tasks.length === 0) {
      return {
        variant: 'new-user',
        title: isFirstTime ? 'Welcome to TaskFlow!' : 'No tasks yet',
        description: isFirstTime 
          ? 'Start organizing your work by creating your first task. Stay productive and never miss a deadline.'
          : 'Create your first task to get started with TaskFlow.',
      }
    }

    // All tasks are completed
    const allCompleted = tasks.every(task => task.status === 'COMPLETED')
    if (allCompleted) {
      return {
        variant: 'all-completed',
        title: 'All tasks completed! 🎉',
        description: 'Congratulations! You\'ve finished everything on your list. Time for new challenges or a well-deserved break.',
      }
    }

    // Search with no results
    if (filters.search && filters.search.trim()) {
      return {
        variant: 'search',
        title: 'No search results',
        description: `No tasks found for "${filters.search}". Try different keywords or check your spelling.`,
        searchTerm: filters.search,
      }
    }

    // Filtered results (status, priority, or combination)
    const hasStatusFilter = filters.status && filters.status.length > 0
    const hasPriorityFilter = filters.priority && filters.priority.length > 0
    
    if (hasStatusFilter || hasPriorityFilter) {
      let title = 'No matching tasks'
      let description = 'No tasks match your current filter settings.'
      
      if (hasStatusFilter && hasPriorityFilter) {
        description = `No tasks found with the selected status and priority filters.`
      } else if (hasStatusFilter) {
        const statusText = filters.status!.join(', ').toLowerCase().replace('_', ' ')
        description = `No tasks found with status: ${statusText}.`
      } else if (hasPriorityFilter) {
        const priorityText = filters.priority!.join(', ').toLowerCase()
        description = `No tasks found with priority: ${priorityText}.`
      }
      
      return {
        variant: 'filtered',
        title,
        description,
      }
    }

    // Fallback - general no results
    return {
      variant: 'no-results',
      title: 'No tasks found',
      description: 'Start by creating a new task to organize your work.',
    }
  }, [tasks, filteredTasks, filters, isFirstTime])
}

// Helper hook to check if user is new (could be enhanced with localStorage or user data)
export function useIsFirstTimeUser(): boolean {
  return useMemo(() => {
    // Simple check - could be enhanced with actual user tracking
    if (typeof window === 'undefined') return false
    
    try {
      const hasVisited = localStorage.getItem('taskflow-visited')
      if (!hasVisited) {
        localStorage.setItem('taskflow-visited', 'true')
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])
}

// Helper to get filter summary for empty states
export function getActiveFiltersCount(filters: TaskFilters): number {
  let count = 0
  if (filters.status?.length) count += filters.status.length
  if (filters.priority?.length) count += filters.priority.length
  if (filters.search?.trim()) count += 1
  return count
}