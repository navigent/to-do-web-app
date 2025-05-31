'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { TaskDeleteConfirmation } from '@/components/ui/confirmation-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Task, TaskPriority, TaskStatus } from '@/types'
import { CalendarDays, Clock, Edit, Trash2, CheckCircle2, Circle, PlayCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  isLoading?: boolean
  isSelected?: boolean
  onSelectChange?: (selected: boolean) => void
  showCheckbox?: boolean
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const priorityIcons: Record<TaskPriority, string> = {
  LOW: '🟢',
  MEDIUM: '🟡',
  HIGH: '🟠',
  URGENT: '🔴',
}

const statusColors: Record<TaskStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export function TaskCard({ 
  task, 
  onStatusChange, 
  onEdit, 
  onDelete, 
  isLoading = false,
  isSelected = false,
  onSelectChange,
  showCheckbox = false
}: TaskCardProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const isCompleted = task.status === 'COMPLETED'
  const isCancelled = task.status === 'CANCELLED'
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange && newStatus !== task.status) {
      onStatusChange(task.id, newStatus as TaskStatus)
    }
  }

  const getStatusIcon = (status: TaskStatus, size: 'sm' | 'md' = 'md') => {
    const className = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
    switch (status) {
      case 'PENDING':
        return <Circle className={className} />
      case 'IN_PROGRESS':
        return <PlayCircle className={className} />
      case 'COMPLETED':
        return <CheckCircle2 className={className} />
      case 'CANCELLED':
        return <XCircle className={className} />
      default:
        return <Circle className={className} />
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true)
  }

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      setIsDeleting(true)
      try {
        await onDelete(task.id)
        setShowDeleteConfirmation(false)
      } catch (error) {
        // Error handling is done in parent component
        console.error('Delete failed:', error)
      } finally {
        setIsDeleting(false)
      }
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

  const formatStatus = (status: TaskStatus) => {
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        'border-muted/50 bg-gradient-to-br from-background to-muted/10',
        isCompleted && 'opacity-75 bg-gradient-to-br from-background to-green-50/50 dark:to-green-950/20',
        isCancelled && 'opacity-60 bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-950/20',
        isOverdue && 'border-red-200 bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10',
        isLoading && 'opacity-60 pointer-events-none',
      )}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 sm:gap-3 flex-1">
            {showCheckbox && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectChange?.(checked as boolean)}
                className="mt-1"
                disabled={isLoading}
                aria-label="Select task"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'font-semibold text-sm sm:text-base leading-tight tracking-tight',
                  'text-foreground/90 group-hover:text-foreground transition-colors',
                  isCompleted && 'line-through text-muted-foreground/70',
                  isCancelled && 'line-through text-muted-foreground/70',
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={cn(
                    'text-xs sm:text-sm text-muted-foreground/80 mt-1.5 line-clamp-2',
                    'leading-relaxed',
                    (isCompleted || isCancelled) && 'line-through opacity-60',
                  )}
                >
                  {task.description || ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                disabled={isLoading}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="sm" className="text-destructive" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs border-0 flex items-center gap-1 px-2.5 py-1',
                'shadow-sm backdrop-blur-sm',
                priorityColors[task.priority] || priorityColors.MEDIUM
              )}
            >
              <span className="text-xs leading-none">{priorityIcons[task.priority] || priorityIcons.MEDIUM}</span>
              <span className="font-medium">
                {task.priority ? task.priority.charAt(0) + task.priority.slice(1).toLowerCase() : 'Medium'}
              </span>
            </Badge>
            {onStatusChange ? (
              <Select value={task.status} onValueChange={handleStatusChange} disabled={isLoading}>
                <SelectTrigger className={cn(
                  'h-7 text-xs px-2.5 py-1 gap-1 border-0',
                  'shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow',
                  statusColors[task.status]
                )}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(task.status, 'sm')}
                    <span className="font-medium">{formatStatus(task.status)}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="IN_PROGRESS">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Completed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="CANCELLED">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      <span>Cancelled</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className={cn(
                'text-xs border-0 px-2.5 py-1',
                'shadow-sm backdrop-blur-sm',
                statusColors[task.status]
              )}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(task.status, 'sm')}
                  <span className="font-medium">{formatStatus(task.status)}</span>
                </div>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
            {task.dueDate && (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2 py-0.5 rounded-full',
                  'bg-muted/50 backdrop-blur-sm',
                  isOverdue && 'bg-red-100/50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-medium',
                )}
              >
                <CalendarDays className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 opacity-50" />
              <span>{formatTime(task.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <TaskDeleteConfirmation
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        taskTitle={task.title}
        taskDescription={task.description || undefined}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </Card>
  )
}
