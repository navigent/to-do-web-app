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
  emptyComponent?: React.ReactNode
  className?: string
}

export function TaskList({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  loadingStates = {},
  emptyComponent,
  className,
}: TaskListProps) {
  if (tasks.length === 0) {
    return emptyComponent || null
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
