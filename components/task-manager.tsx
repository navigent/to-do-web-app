"use client";

import { useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { TaskFilters } from "@/types";
import { TaskList } from "./task-list";
import { TaskForm } from "./task-form";
import { TaskFilter } from "./task-filter";
import { AddTaskButton } from "./add-task-button";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEmptyState } from "@/hooks/use-empty-state";
import { EmptyStateWrapper } from "./ui/empty-state";
import { withErrorBoundary } from "./error-boundary";

// Initial tasks for demonstration
const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the new features",
    status: "PENDING",
    priority: "HIGH",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Review pull requests",
    description: "Review and approve pending pull requests from the team",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "3",
    title: "Deploy to production",
    description: "Deploy the latest version to production environment",
    status: "COMPLETED",
    priority: "URGENT",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-17"),
  },
];

function TaskManagerContent() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const { toast } = useToast();

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(task.status)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
      
      switch (filters.sortBy) {
        case "createdAt":
          const aCreated = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
          const bCreated = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
          return sortOrder * (bCreated.getTime() - aCreated.getTime());
        case "updatedAt":
          const aUpdated = typeof a.updatedAt === 'string' ? new Date(a.updatedAt) : a.updatedAt;
          const bUpdated = typeof b.updatedAt === 'string' ? new Date(b.updatedAt) : b.updatedAt;
          return sortOrder * (bUpdated.getTime() - aUpdated.getTime());
        case "title":
          return sortOrder * a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Empty state configuration
  const emptyStateConfig = useEmptyState({
    tasks,
    filteredTasks,
    filters,
  });

  const handleAddTask = async (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newTask: Task = {
        ...data,
        id: Date.now().toString(),
        priority: data.priority || "MEDIUM",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTasks((prev) => [newTask, ...prev]);
      setIsAddingTask(false);

      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!editingTask) return;

    try {
      const updatedTask: Task = {
        ...editingTask,
        ...data,
        updatedAt: new Date(),
      };

      setTasks((prev) =>
        prev.map((task) => (task.id === editingTask.id ? updatedTask : task))
      );
      setEditingTask(null);

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTask = async (taskId: string) => {
    setLoadingStates((prev) => ({ ...prev, [taskId]: true }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newStatus: TaskStatus =
        task.status === "COMPLETED"
          ? "PENDING"
          : task.status === "PENDING"
          ? "IN_PROGRESS"
          : "COMPLETED";

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, updatedAt: new Date() }
            : t
        )
      );

      toast({
        title: "Status updated",
        description: `Task marked as ${newStatus.toLowerCase().replace("_", " ")}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const task = tasks.find((t) => t.id === taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));

      toast({
        title: "Task deleted",
        description: task ? `"${task.title}" has been deleted.` : "Task deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const deletedCount = selectedTaskIds.length;
      setTasks((prev) => prev.filter((task) => !selectedTaskIds.includes(task.id)));
      setSelectedTaskIds([]);

      toast({
        title: "Tasks deleted",
        description: `${deletedCount} task${deletedCount > 1 ? "s" : ""} deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusChange = async (status: TaskStatus) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedCount = selectedTaskIds.length;
      setTasks((prev) =>
        prev.map((task) =>
          selectedTaskIds.includes(task.id)
            ? { ...task, status, updatedAt: new Date() }
            : task
        )
      );
      setSelectedTaskIds([]);

      toast({
        title: "Status updated",
        description: `${updatedCount} task${updatedCount > 1 ? "s" : ""} updated to ${status.toLowerCase().replace("_", " ")}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tasks. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-full sm:max-w-6xl">
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Add Task Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tasks</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage and track your daily tasks
            </p>
          </div>
          <AddTaskButton
            onClick={() => setIsAddingTask(true)}
            disabled={isAddingTask || editingTask !== null}
          />
        </div>

        {/* Filters */}
        <TaskFilter
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Main Content Area */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr,400px]">
          {/* Task List */}
          <Card className="p-3 sm:p-4 md:p-6">
            <EmptyStateWrapper config={emptyStateConfig}>
              <TaskList
                tasks={filteredTasks}
                onStatusChange={handleToggleTask}
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                selectedTaskIds={selectedTaskIds}
                onSelectionChange={setSelectedTaskIds}
                loadingStates={loadingStates}
                showCheckboxes={tasks.length > 0}
                onBulkDelete={handleBulkDelete}
                onBulkStatusChange={handleBulkStatusChange}
              />
            </EmptyStateWrapper>
          </Card>

          {/* Add/Edit Task Form */}
          {(isAddingTask || editingTask) && (
            <div className="md:sticky md:top-4 h-fit">
              <Card className="p-3 sm:p-4 md:p-6">
                <TaskForm
                  task={editingTask}
                  onSubmit={editingTask ? handleUpdateTask : handleAddTask}
                  onCancel={() => {
                    setIsAddingTask(false);
                    setEditingTask(null);
                  }}
                  isLoading={false}
                />
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const TaskManager = withErrorBoundary(TaskManagerContent);