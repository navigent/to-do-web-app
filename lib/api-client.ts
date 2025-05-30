import type { Task, TaskStatus, TaskPriority } from '@/types/task'

export interface CreateTaskData {
  title: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
}

export interface UpdateTaskData {
  title?: string
  description?: string | null
  priority?: TaskPriority
  status?: TaskStatus
}

export interface TaskFilters {
  search?: string
  priority?: TaskPriority
  status?: TaskStatus
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'title'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface TasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message: string
  details?: any
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        const error: ApiError = data
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  // Task CRUD operations
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    const searchParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks'
    
    return this.request<TasksResponse>(endpoint)
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`)
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(id: string): Promise<{ message: string; id: string }> {
    return this.request<{ message: string; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  // Bulk operations
  async bulkUpdateTasks(
    ids: string[], 
    data: { priority?: TaskPriority; status?: TaskStatus }
  ): Promise<Task[]> {
    return this.request<Task[]>('/tasks/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, data }),
    })
  }

  async bulkDeleteTasks(ids: string[]): Promise<{ message: string; deletedIds: string[] }> {
    return this.request<{ message: string; deletedIds: string[] }>('/tasks/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    })
  }

  // Quick status update
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return this.updateTask(id, { status })
  }

  // Search tasks
  async searchTasks(query: string, filters: Omit<TaskFilters, 'search'> = {}): Promise<TasksResponse> {
    return this.getTasks({ ...filters, search: query })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export individual methods for convenience
export const taskApi = {
  // CRUD operations
  list: (filters?: TaskFilters) => apiClient.getTasks(filters),
  get: (id: string) => apiClient.getTask(id),
  create: (data: CreateTaskData) => apiClient.createTask(data),
  update: (id: string, data: UpdateTaskData) => apiClient.updateTask(id, data),
  delete: (id: string) => apiClient.deleteTask(id),
  
  // Bulk operations
  bulkUpdate: (ids: string[], data: { priority?: TaskPriority; status?: TaskStatus }) => 
    apiClient.bulkUpdateTasks(ids, data),
  bulkDelete: (ids: string[]) => apiClient.bulkDeleteTasks(ids),
  
  // Convenience methods
  updateStatus: (id: string, status: TaskStatus) => apiClient.updateTaskStatus(id, status),
  search: (query: string, filters?: Omit<TaskFilters, 'search'>) => 
    apiClient.searchTasks(query, filters),
}

// Error handling utilities
export class TaskApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'TaskApiError'
  }
}

export function isApiError(error: unknown): error is TaskApiError {
  return error instanceof TaskApiError
}

// Response type guards
export function isTasksResponse(data: unknown): data is TasksResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'tasks' in data &&
    'pagination' in data &&
    Array.isArray((data as TasksResponse).tasks)
  )
}

export function isTask(data: unknown): data is Task {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'title' in data &&
    'status' in data &&
    'priority' in data
  )
}

// Cache utility for optimistic updates
export class TaskCache {
  private cache = new Map<string, Task>()
  private listCache = new Map<string, TasksResponse>()

  setTask(task: Task) {
    this.cache.set(task.id, task)
  }

  getTask(id: string): Task | undefined {
    return this.cache.get(id)
  }

  removeTask(id: string) {
    this.cache.delete(id)
  }

  setTaskList(key: string, response: TasksResponse) {
    this.listCache.set(key, response)
  }

  getTaskList(key: string): TasksResponse | undefined {
    return this.listCache.get(key)
  }

  invalidateTaskList() {
    this.listCache.clear()
  }

  clear() {
    this.cache.clear()
    this.listCache.clear()
  }

  // Optimistic update helpers
  updateTaskOptimistically(id: string, updates: Partial<Task>) {
    const existing = this.cache.get(id)
    if (existing) {
      this.cache.set(id, { ...existing, ...updates, updatedAt: new Date() })
    }
  }

  removeTaskOptimistically(id: string) {
    this.cache.delete(id)
    // Also update list cache to remove the task
    this.listCache.forEach((response, key) => {
      const updatedTasks = response.tasks.filter(task => task.id !== id)
      this.listCache.set(key, {
        ...response,
        tasks: updatedTasks,
        pagination: {
          ...response.pagination,
          total: response.pagination.total - 1
        }
      })
    })
  }
}

export const taskCache = new TaskCache()