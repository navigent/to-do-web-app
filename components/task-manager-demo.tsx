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
import { useToast } from '@/hooks/use-toast'

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
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [filters, setFilters] = useState<TaskFilters>({})
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { toast } = useToast()

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

  const handleAddTask = (data: CreateTaskData) => {
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
    setTasks((prev) => [newTask, ...prev])
    toast({
      title: 'Task created',
      description: `"${data.title}" has been added to your tasks.`,
    })
  }

  const handleUpdateTask = (data: UpdateTaskData) => {
    if (!editingTask) return

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
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              updatedAt: new Date(),
              completedAt: status === 'COMPLETED' ? new Date() : undefined,
            }
          : task,
      ),
    )

    if (task) {
      const statusText = status === 'COMPLETED' ? 'completed' : 'updated'
      toast({
        title: `Task ${statusText}`,
        description: `"${task.title}" has been ${statusText}.`,
        variant: status === 'COMPLETED' ? 'default' : 'default',
      })
    }
  }

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    setTasks((prev) => prev.filter((task) => task.id !== taskId))

    if (task) {
      toast({
        title: 'Task deleted',
        description: `"${task.title}" has been removed from your tasks.`,
        variant: 'destructive',
      })
    }
  }

  if (editingTask) {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full sm:max-w-2xl">
        <TaskForm
          task={editingTask}
          onSubmit={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full sm:max-w-6xl">
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6">
        {/* Sidebar with filters and add button */}
        <div className="w-full md:w-80 lg:w-96 space-y-3 sm:space-y-4">
          <AddTaskButton onAddTask={handleAddTask} variant="card" />
          <TaskFilter filters={filters} onFiltersChange={setFilters} taskCounts={taskCounts} />
        </div>

        {/* Main content area */}
        <div className="flex-1">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Tasks</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>

          <TaskList
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            emptyMessage="No tasks match your current filters. Try adjusting your search or filter criteria."
          />
        </div>
      </div>
    </div>
  )
}
