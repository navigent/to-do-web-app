export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  dueDate?: Date
}

export interface CreateTaskData {
  title: string
  description?: string
  priority: TaskPriority
  dueDate?: Date
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: Date
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title'
  sortOrder?: 'asc' | 'desc'
}
