import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { taskApi, type TaskFilters, type CreateTaskData, type UpdateTaskData } from '@/lib/api-client'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'
import { useToast } from '@/hooks/use-toast'

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

// Hook for fetching tasks with filters
export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}


// Hook for creating a task
export function useCreateTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTaskData) => taskApi.create(data),
    onSuccess: (newTask) => {
      // Invalidate and refetch task lists
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      
      toast({
        title: 'Task created',
        description: `"${newTask.title}" has been created successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to create task',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook for updating a task
export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) => 
      taskApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData(taskKeys.detail(id))

      // Optimistically update the cache
      if (previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), (old: Task) => ({
          ...old,
          ...data,
          updatedAt: new Date(),
        }))

        // Update task in all list queries
        queryClient.setQueriesData(
          { queryKey: taskKeys.lists() },
          (old: any) => {
            if (!old?.tasks) return old
            return {
              ...old,
              tasks: old.tasks.map((task: Task) =>
                task.id === id ? { ...task, ...data, updatedAt: new Date() } : task
              ),
            }
          }
        )
      }

      return { previousTask }
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), context.previousTask)
      }
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })

      toast({
        title: 'Failed to update task',
        description: error.message,
        variant: 'destructive',
      })
    },
    onSuccess: (updatedTask) => {
      // Update the cache with server response
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask)
      
      toast({
        title: 'Task updated',
        description: `"${updatedTask.title}" has been updated successfully.`,
      })
    },
    onSettled: (data, error, { id }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Hook for deleting a task
export function useDeleteTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot the previous value
      const previousLists = queryClient.getQueriesData({ queryKey: taskKeys.lists() })

      // Optimistically remove the task from all list queries
      queryClient.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: any) => {
          if (!old?.tasks) return old
          return {
            ...old,
            tasks: old.tasks.filter((task: Task) => task.id !== id),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          }
        }
      )

      return { previousLists }
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast({
        title: 'Failed to delete task',
        description: error.message,
        variant: 'destructive',
      })
    },
    onSuccess: (result) => {
      // Remove the task from individual cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(result.id) })
      
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully.',
      })
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Hook for updating task status
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => 
      taskApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData(taskKeys.detail(id))

      // Optimistically update the cache
      const optimisticUpdate = { status, updatedAt: new Date() }

      if (previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), (old: Task) => ({
          ...old,
          ...optimisticUpdate,
        }))
      }

      // Update task in all list queries
      queryClient.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: any) => {
          if (!old?.tasks) return old
          return {
            ...old,
            tasks: old.tasks.map((task: Task) =>
              task.id === id ? { ...task, ...optimisticUpdate } : task
            ),
          }
        }
      )

      return { previousTask }
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), context.previousTask)
      }
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })

      toast({
        title: 'Failed to update task status',
        description: error.message,
        variant: 'destructive',
      })
    },
    onSettled: (data, error, { id }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Hook for bulk operations
export function useBulkUpdateTasks() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ 
      ids, 
      data 
    }: { 
      ids: string[]; 
      data: { priority?: TaskPriority; status?: TaskStatus } 
    }) => taskApi.bulkUpdate(ids, data),
    onSuccess: (updatedTasks) => {
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      
      toast({
        title: 'Tasks updated',
        description: `${updatedTasks.length} tasks have been updated successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to update tasks',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useBulkDeleteTasks() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (ids: string[]) => taskApi.bulkDelete(ids),
    onMutate: async (ids) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot the previous value
      const previousLists = queryClient.getQueriesData({ queryKey: taskKeys.lists() })

      // Optimistically remove the tasks from all list queries
      queryClient.setQueriesData(
        { queryKey: taskKeys.lists() },
        (old: any) => {
          if (!old?.tasks) return old
          return {
            ...old,
            tasks: old.tasks.filter((task: Task) => !ids.includes(task.id)),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - ids.length,
            },
          }
        }
      )

      return { previousLists }
    },
    onError: (error, ids, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast({
        title: 'Failed to delete tasks',
        description: error.message,
        variant: 'destructive',
      })
    },
    onSuccess: (result) => {
      // Remove the tasks from individual cache
      result.deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: taskKeys.detail(id) })
      })
      
      toast({
        title: 'Tasks deleted',
        description: `${result.deletedIds.length} tasks have been deleted successfully.`,
      })
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}