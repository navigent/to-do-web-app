'use client'

import { useState, useMemo } from 'react'
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  TaskStatus,
  TaskPriority,
} from '@/types'
import { TaskList } from './task-list'
import { TaskFilter } from './task-filter'
import { AddTaskButton } from './add-task-button'
import { TaskForm } from './task-form'
import { ErrorBoundary } from './error-boundary'
import { TaskListSkeleton } from './ui/loading-skeleton'
import { EmptyState } from './ui/empty-state'
import { useToast } from '@/hooks/use-toast'
import { useEmptyState, useIsFirstTimeUser } from '@/hooks/use-empty-state'

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Setup development environment',
    description: 'Install Node.js, npm, and configure the project',
    status: 'COMPLETED',
    priority: 'HIGH',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T14:30:00Z'),
    completedAt: new Date('2024-01-15T14:30:00Z'),
  },
  {
    id: '2',
    title: 'Design user interface mockups',
    description: 'Create wireframes and high-fidelity designs for the task management app',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: new Date('2024-01-16T09:00:00Z'),
    updatedAt: new Date('2024-01-16T15:20:00Z'),
    dueDate: new Date('2024-01-20T17:00:00Z'),
  },
  {
    id: '3',
    title: 'Implement authentication system',
    description: 'Add user registration, login, and session management',
    status: 'PENDING',
    priority: 'URGENT',
    createdAt: new Date('2024-01-17T11:30:00Z'),
    updatedAt: new Date('2024-01-17T11:30:00Z'),
    dueDate: new Date('2024-01-18T23:59:00Z'),
  },
  {
    id: '4',
    title: 'Write unit tests',
    description: 'Create comprehensive test coverage for all components',
    status: 'PENDING',
    priority: 'LOW',
    createdAt: new Date('2024-01-18T08:15:00Z'),
    updatedAt: new Date('2024-01-18T08:15:00Z'),
  },
]

export function TaskManagerDemo() {
  // Check URL params for demo mode
  const isEmptyDemo = typeof window !== 'undefined' && 
    window.location.search.includes('demo=empty')
  const isCompletedDemo = typeof window !== 'undefined' && 
    window.location.search.includes('demo=completed')
  
  // Create completed tasks for demo
  const completedMockTasks = mockTasks.map(task => ({
    ...task,
    status: 'COMPLETED' as const,
    completedAt: new Date(),
  }))
  
  const initialTasks = isEmptyDemo ? [] : 
                      isCompletedDemo ? completedMockTasks : 
                      mockTasks
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filters, setFilters] = useState<TaskFilters>({})
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)
  const { toast } = useToast()
  const isFirstTime = useIsFirstTimeUser()

  // Simulate async operations with loading states
  const setTaskLoading = (taskId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [taskId]: loading }))
  }

  // Simulate network delay
  const simulateNetworkDelay = (ms: number = 800) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Apply status filter
    if (filters.status?.length) {
      result = result.filter((task) => filters.status!.includes(task.status))
    }

    // Apply priority filter
    if (filters.priority?.length) {
      result = result.filter((task) => filters.priority!.includes(task.priority))
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm),
      )
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'

    result.sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      if (sortBy === 'priority') {
        const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }
        aValue = priorityOrder[a.priority]
        bValue = priorityOrder[b.priority]
      }

      if (aValue instanceof Date) aValue = aValue.getTime()
      if (bValue instanceof Date) bValue = bValue.getTime()

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return result
  }, [tasks, filters])

  // Calculate task counts
  const taskCounts = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      in_progress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      cancelled: tasks.filter((t) => t.status === 'CANCELLED').length,
    }
  }, [tasks])

  // Determine empty state
  const emptyStateInfo = useEmptyState({
    tasks,
    filteredTasks,
    filters,
    isFirstTime,
  })

  // Clear filters handler
  const handleClearFilters = () => {
    setFilters({})
  }

  // Handle add task from empty state
  const handleAddTaskFromEmpty = () => {
    setShowAddTaskForm(true)
  }

  const handleAddTask = async (data: CreateTaskData) => {
    try {
      await simulateNetworkDelay(600)
      
      const newTask: Task = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        status: 'PENDING',
        priority: data.priority,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      }
      
      // Simulate potential error
      if (Math.random() < 0.1) {
        throw new Error('Failed to create task. Please try again.')
      }
      
      setTasks((prev) => [newTask, ...prev])
      setShowAddTaskForm(false) // Close inline form
      toast({
        title: 'Task created',
        description: `"${data.title}" has been added to your tasks.`,
      })
    } catch (error) {
      toast({
        title: 'Error creating task',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleUpdateTask = async (data: UpdateTaskData) => {
    if (!editingTask) return

    try {
      await simulateNetworkDelay(500)
      
      // Simulate potential error
      if (Math.random() < 0.1) {
        throw new Error('Failed to update task. Please try again.')
      }
      
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...data,
                updatedAt: new Date(),
                completedAt: data.status === 'COMPLETED' ? new Date() : task.completedAt,
              }
            : task,
        ),
      )
      setEditingTask(null)
      toast({
        title: 'Task updated',
        description: `"${editingTask.title}" has been updated.`,
      })
    } catch (error) {
      toast({
        title: 'Error updating task',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    setTaskLoading(taskId, true)
    
    try {
      await simulateNetworkDelay(400)
      
      // Simulate potential error
      if (Math.random() < 0.05) {
        throw new Error('Failed to update status. Please try again.')
      }
      
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status,
                updatedAt: new Date(),
                completedAt: status === 'COMPLETED' ? new Date() : undefined,
              }
            : t,
        ),
      )

      const statusText = status === 'COMPLETED' ? 'completed' : 'updated'
      toast({
        title: `Task ${statusText}`,
        description: `"${task.title}" has been ${statusText}.`,
      })
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setTaskLoading(taskId, false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    setTaskLoading(taskId, true)
    
    try {
      await simulateNetworkDelay(300)
      
      // Simulate potential error
      if (Math.random() < 0.05) {
        throw new Error('Failed to delete task. Please try again.')
      }
      
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      toast({
        title: 'Task deleted',
        description: `"${task.title}" has been removed from your tasks.`,
        variant: 'destructive',
      })
    } catch (error) {
      toast({
        title: 'Error deleting task',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setTaskLoading(taskId, false)
    }
  }

  if (editingTask) {
    return (
      <ErrorBoundary>
        <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full sm:max-w-2xl">
          <TaskForm
            task={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
          />
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full sm:max-w-6xl">
        {/* Demo Controls */}
        {typeof window !== 'undefined' && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Demo Mode: {isEmptyDemo ? 'Empty State Testing' : 
                          isCompletedDemo ? 'All Tasks Completed' : 
                          'With Sample Tasks'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = '?demo=normal'}
                  className={`px-3 py-1 rounded text-xs ${!isEmptyDemo && !isCompletedDemo ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => window.location.href = '?demo=empty'}
                  className={`px-3 py-1 rounded text-xs ${isEmptyDemo ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                >
                  Empty
                </button>
                <button
                  onClick={() => window.location.href = '?demo=completed'}
                  className={`px-3 py-1 rounded text-xs ${isCompletedDemo ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6">
          {/* Sidebar with filters and add button */}
          <div className="w-full md:w-80 lg:w-96 space-y-3 sm:space-y-4">
            <ErrorBoundary>
              <AddTaskButton onAddTask={handleAddTask} variant="card" />
            </ErrorBoundary>
            <ErrorBoundary>
              <TaskFilter filters={filters} onFiltersChange={setFilters} taskCounts={taskCounts} />
            </ErrorBoundary>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Tasks</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
            </div>

            <ErrorBoundary>
              {/* Inline Add Task Form */}
              {showAddTaskForm && (
                <div className="mb-6">
                  <TaskForm
                    onSubmit={handleAddTask}
                    onCancel={() => setShowAddTaskForm(false)}
                  />
                </div>
              )}

              <TaskList
                tasks={filteredTasks}
                onStatusChange={handleStatusChange}
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                loadingStates={loadingStates}
                emptyComponent={
                  emptyStateInfo && (
                    <EmptyState
                      variant={emptyStateInfo.variant}
                      title={emptyStateInfo.title}
                      description={emptyStateInfo.description}
                      onAddTask={handleAddTaskFromEmpty}
                      onClearFilters={handleClearFilters}
                      filters={filters}
                      searchTerm={emptyStateInfo.searchTerm}
                      totalTasks={tasks.length}
                    />
                  )
                }
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
