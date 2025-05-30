"use client";

import { useState, useMemo } from "react";
import { TaskStatus } from "@/types/task";
import { TaskFilters } from "@/types";
import { TaskList } from "./task-list";
import { TaskForm } from "./task-form";
import { TaskFilter } from "./task-filter";
import { AddTaskButton } from "./add-task-button";
import { Card } from "./ui/card";
import { useEmptyState } from "@/hooks/use-empty-state";
import { EmptyStateWrapper } from "./ui/empty-state";
import { withErrorBoundary } from "./error-boundary";
import { Spinner } from "./ui/spinner";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useBulkUpdateTasks,
  useBulkDeleteTasks,
} from "@/hooks/use-tasks";
import type { CreateTaskData, UpdateTaskData } from "@/lib/api-client";

function TaskManagerApiContent() {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<{ id: string; data: UpdateTaskData } | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 20,
  });

  // API hooks
  const { data: tasksResponse, isLoading, error, refetch } = useTasks(filters);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const bulkUpdateMutation = useBulkUpdateTasks();
  const bulkDeleteMutation = useBulkDeleteTasks();

  // Extract tasks and pagination from response
  const tasks = tasksResponse?.tasks || [];
  const pagination = tasksResponse?.pagination;

  // Task counts for filter component
  const taskCounts = useMemo(() => {
    return {
      total: pagination?.total || 0,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      cancelled: tasks.filter(t => t.status === 'CANCELLED').length,
    };
  }, [tasks, pagination]);

  // Empty state configuration
  const emptyStateConfig = useEmptyState({
    tasks,
    filteredTasks: tasks, // Tasks are already filtered by API
    filters,
  });

  // Loading states for individual tasks
  const loadingStates = useMemo(() => {
    const states: Record<string, boolean> = {};
    
    // Add loading states for various operations
    if (updateStatusMutation.isPending) {
      // We don't have access to specific task ID in mutation state
      // This could be improved with more sophisticated state management
    }
    
    return states;
  }, [updateStatusMutation.isPending]);

  // Event handlers
  const handleAddTask = async (data: CreateTaskData) => {
    try {
      await createTaskMutation.mutateAsync(data);
      setIsAddingTask(false);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (data: UpdateTaskData) => {
    if (!editingTask) return;

    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        data,
      });
      setEditingTask(null);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: taskId, status });
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to delete task:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync(selectedTaskIds);
      setSelectedTaskIds([]);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to delete tasks:', error);
    }
  };

  const handleBulkStatusChange = async (status: TaskStatus) => {
    if (selectedTaskIds.length === 0) return;

    try {
      await bulkUpdateMutation.mutateAsync({
        ids: selectedTaskIds,
        data: { status },
      });
      setSelectedTaskIds([]);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update task status:', error);
    }
  };

  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset page when filters change (except for page changes)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const handleEditTask = (task: any) => {
    setEditingTask({
      id: task.id,
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
      },
    });
  };

  // Handle loading and error states
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Tasks</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || 'Failed to load tasks. Please try again.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full sm:max-w-6xl">
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Add Task Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tasks</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage and track your daily tasks
              {pagination && ` (${pagination.total} total)`}
            </p>
          </div>
          <AddTaskButton
            onClick={() => setIsAddingTask(true)}
            disabled={
              isAddingTask || 
              editingTask !== null || 
              createTaskMutation.isPending
            }
          />
        </div>

        {/* Filters */}
        <TaskFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          taskCounts={taskCounts}
        />

        {/* Main Content Area */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr,400px]">
          {/* Task List */}
          <Card className="p-3 sm:p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
                <span className="ml-2 text-muted-foreground">Loading tasks...</span>
              </div>
            ) : (
              <EmptyStateWrapper config={emptyStateConfig}>
                {/* <TaskList
                  tasks={tasks}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  selectedTaskIds={selectedTaskIds}
                  onSelectionChange={setSelectedTaskIds}
                  loadingStates={loadingStates}
                  showCheckboxes={tasks.length > 0}
                  onBulkDelete={handleBulkDelete}
                  onBulkStatusChange={handleBulkStatusChange}
                  pagination={pagination}
                  onPageChange={(page) => handleFiltersChange({ ...filters, page })}
                  isLoading={{
                    bulkDelete: bulkDeleteMutation.isPending,
                    bulkUpdate: bulkUpdateMutation.isPending,
                  }}
                /> */}
              </EmptyStateWrapper>
            )}
          </Card>

          {/* Add/Edit Task Form */}
          {(isAddingTask || editingTask) && (
            <div className="md:sticky md:top-4 h-fit">
              <Card className="p-3 sm:p-4 md:p-6">
                <TaskForm
                  task={editingTask?.data}
                  onSubmit={editingTask ? handleUpdateTask : handleAddTask}
                  onCancel={() => {
                    setIsAddingTask(false);
                    setEditingTask(null);
                  }}
                  isLoading={
                    editingTask 
                      ? updateTaskMutation.isPending
                      : createTaskMutation.isPending
                  }
                />
              </Card>
            </div>
          )}
        </div>

        {/* Pagination (if needed) */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => handleFiltersChange({ ...filters, page: Math.max(1, filters.page! - 1) })}
              disabled={filters.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handleFiltersChange({ ...filters, page: Math.min(pagination.totalPages, filters.page! + 1) })}
              disabled={filters.page === pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const TaskManagerApi = withErrorBoundary(TaskManagerApiContent);