'use client'

import { Task, TaskStatus } from '@/types'
import { TaskCard } from './task-card'
import { Checkbox } from './ui/checkbox'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useState } from 'react'
import { CheckSquare, Square, MinusSquare, X, Trash2, Circle, PlayCircle, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskListProps {
  tasks: Task[]
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  loadingStates?: Record<string, boolean>
  emptyComponent?: React.ReactNode
  className?: string
  selectedTaskIds?: string[]
  onSelectionChange?: (taskIds: string[]) => void
  showCheckboxes?: boolean
  onBulkDelete?: (taskIds: string[]) => Promise<void>
  onBulkStatusChange?: (taskIds: string[], status: TaskStatus) => Promise<void>
}

export function TaskList({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  loadingStates = {},
  emptyComponent,
  className,
  selectedTaskIds = [],
  onSelectionChange,
  showCheckboxes = false,
  onBulkDelete,
  onBulkStatusChange,
}: TaskListProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  if (tasks.length === 0) {
    return emptyComponent || null
  }

  const handleSelectTask = (taskId: string, selected: boolean) => {
    if (!onSelectionChange) return
    
    if (selected) {
      onSelectionChange([...selectedTaskIds, taskId])
    } else {
      onSelectionChange(selectedTaskIds.filter(id => id !== taskId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange(tasks.map(task => task.id))
    } else {
      onSelectionChange([])
    }
  }

  const isAllSelected = tasks.length > 0 && selectedTaskIds.length === tasks.length
  const isPartiallySelected = selectedTaskIds.length > 0 && selectedTaskIds.length < tasks.length

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedTaskIds.length === 0) return
    
    setIsDeleting(true)
    try {
      await onBulkDelete(selectedTaskIds)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkStatusChange = async (status: TaskStatus) => {
    if (!onBulkStatusChange || selectedTaskIds.length === 0) return
    
    setIsUpdatingStatus(true)
    try {
      await onBulkStatusChange(selectedTaskIds, status)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className={className}>
      {showCheckboxes && tasks.length > 0 && (
        <div className="relative mb-4 group animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-background/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              {/* Custom select all button */}
              <button
                onClick={() => handleSelectAll(!isAllSelected)}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  isAllSelected 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : isPartiallySelected
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
                aria-label="Select all tasks"
              >
                {isAllSelected ? (
                  <CheckSquare className="h-5 w-5" />
                ) : isPartiallySelected ? (
                  <MinusSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              <div className="flex flex-col gap-1">
                <span className={cn(
                  "text-sm font-semibold transition-colors",
                  selectedTaskIds.length > 0 ? "text-foreground" : "text-muted-foreground"
                )}>
                  {selectedTaskIds.length === 0 
                    ? 'Select tasks' 
                    : isAllSelected
                    ? 'All tasks selected'
                    : `${selectedTaskIds.length} task${selectedTaskIds.length === 1 ? '' : 's'} selected`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {tasks.length} total
                  </span>
                  {selectedTaskIds.length > 0 && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${(selectedTaskIds.length / tasks.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((selectedTaskIds.length / tasks.length) * 100)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Bulk actions - only show when items are selected */}
              {selectedTaskIds.length > 0 && (
                <>
                  {/* Status change dropdown */}
                  {onBulkStatusChange && (
                    <Select 
                      value=""
                      onValueChange={(value) => handleBulkStatusChange(value as TaskStatus)}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="h-8 text-xs w-auto gap-1">
                        <div className="flex items-center gap-1">
                          <Circle className="h-3 w-3" />
                          <span className="hidden sm:inline">Status</span>
                          <span className="sm:hidden">Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">
                          <div className="flex items-center gap-2">
                            <Circle className="h-3.5 w-3.5" />
                            <span>Pending</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="IN_PROGRESS">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="h-3.5 w-3.5" />
                            <span>In Progress</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Completed</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancelled</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {/* Delete button */}
                  {onBulkDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="text-xs h-8 px-3 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  )}

                  <div className="h-4 w-px bg-border mx-1" />
                </>
              )}

              {/* Quick select options */}
              {!isAllSelected && selectedTaskIds.length < tasks.length && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                  className="text-xs h-8 px-3 hover:bg-primary/10 hover:text-primary"
                >
                  <CheckSquare className="h-3 w-3 mr-1.5 sm:mr-0 sm:hidden" />
                  <span className="hidden sm:inline">Select all</span>
                  <span className="sm:hidden">All</span>
                </Button>
              )}
              
              {/* Clear selection */}
              {selectedTaskIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectionChange && onSelectionChange([])}
                  className="text-xs h-8 px-3 hover:bg-muted/80"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="space-y-2 sm:space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={loadingStates[task.id] || false}
            isSelected={selectedTaskIds.includes(task.id)}
            onSelectChange={showCheckboxes ? (selected) => handleSelectTask(task.id, selected) : undefined}
            showCheckbox={showCheckboxes}
          />
        ))}
      </div>
    </div>
  )
}
