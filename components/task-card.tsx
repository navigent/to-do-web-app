'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Task, TaskPriority, TaskStatus } from '@/types'
import { CalendarDays, Clock, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const statusColors: Record<TaskStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'COMPLETED'
  const isCancelled = task.status === 'CANCELLED'
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted

  const handleToggleComplete = () => {
    if (onStatusChange) {
      const newStatus = isCompleted ? 'PENDING' : 'COMPLETED'
      onStatusChange(task.id, newStatus)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const formatTime = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        isCompleted && 'opacity-75',
        isCancelled && 'opacity-60',
        isOverdue && 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/50',
      )}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 sm:gap-3 flex-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggleComplete}
              className="mt-1"
              disabled={isCancelled}
            />
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'font-medium text-sm sm:text-base leading-tight',
                  isCompleted && 'line-through text-muted-foreground',
                  isCancelled && 'line-through text-muted-foreground',
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={cn(
                    'text-sm text-muted-foreground mt-1 line-clamp-2',
                    (isCompleted || isCancelled) && 'line-through',
                  )}
                >
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-9 w-9 sm:h-8 sm:w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-9 w-9 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn('text-xs sm:text-sm', priorityColors[task.priority])}>
              {task.priority}
            </Badge>
            <Badge variant="outline" className={cn('text-xs sm:text-sm', statusColors[task.status])}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            {task.dueDate && (
              <div
                className={cn(
                  'flex items-center gap-1',
                  isOverdue && 'text-red-600 dark:text-red-400',
                )}
              >
                <CalendarDays className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(task.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
