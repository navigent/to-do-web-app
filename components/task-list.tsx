'use client'

import { Task, TaskStatus } from '@/types'
import { TaskCard } from './task-card'
import { useState } from 'react'

interface TaskListProps {
  tasks: Task[]
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  loadingStates?: Record<string, boolean>
  emptyMessage?: string
  className?: string
}

export function TaskList({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  loadingStates = {},
  emptyMessage = 'No tasks found',
  className,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
        <div className="rounded-full bg-muted p-4 sm:p-6 mb-3 sm:mb-4">
          <svg
            className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No tasks yet</h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xs sm:max-w-sm px-4 sm:px-0">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-2 sm:space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={loadingStates[task.id] || false}
          />
        ))}
      </div>
    </div>
  )
}
