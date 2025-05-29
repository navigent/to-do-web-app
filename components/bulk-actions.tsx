'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  BulkActionConfirmation,
  ConfirmationDialog 
} from '@/components/ui/confirmation-dialog'
import { Task, TaskStatus } from '@/types'
import { 
  Trash2, 
  Check, 
  X, 
  MoreHorizontal, 
  Archive,
  CheckCircle2
} from 'lucide-react'

interface BulkActionsProps {
  tasks: Task[]
  selectedTaskIds: string[]
  onSelectionChange: (taskIds: string[]) => void
  onBulkDelete: (taskIds: string[]) => Promise<void>
  onBulkStatusChange: (taskIds: string[], status: TaskStatus) => Promise<void>
  isLoading?: boolean
}

export function BulkActions({
  tasks,
  selectedTaskIds,
  onSelectionChange,
  onBulkDelete,
  onBulkStatusChange,
  isLoading = false,
}: BulkActionsProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<TaskStatus>('COMPLETED')
  const [actionLoading, setActionLoading] = useState(false)

  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id))
  const hasSelection = selectedTaskIds.length > 0
  const allSelected = tasks.length > 0 && selectedTaskIds.length === tasks.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(tasks.map(task => task.id))
    }
  }

  const handleBulkDelete = () => {
    setShowDeleteConfirmation(true)
  }

  const handleBulkStatusChange = (status: TaskStatus) => {
    setPendingStatus(status)
    setShowStatusConfirmation(true)
  }

  const confirmBulkDelete = async () => {
    setActionLoading(true)
    try {
      await onBulkDelete(selectedTaskIds)
      onSelectionChange([])
      setShowDeleteConfirmation(false)
    } catch (error) {
      console.error('Bulk delete failed:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const confirmBulkStatusChange = async () => {
    setActionLoading(true)
    try {
      await onBulkStatusChange(selectedTaskIds, pendingStatus)
      onSelectionChange([])
      setShowStatusConfirmation(false)
    } catch (error) {
      console.error('Bulk status change failed:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (!hasSelection) {
    return (
      <Card className="mb-4">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={tasks.length === 0}
              />
              <span className="text-sm text-muted-foreground">
                Select all tasks
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {tasks.length} tasks
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-4 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange([])}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Mark as Completed */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('COMPLETED')}
                disabled={isLoading || actionLoading}
                className="h-8"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Button>

              {/* Mark as Cancelled */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('CANCELLED')}
                disabled={isLoading || actionLoading}
                className="h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>

              {/* Delete Selected */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isLoading || actionLoading}
                className="h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          {/* Selected Tasks Preview */}
          {selectedTasks.length <= 3 && (
            <div className="mt-3 space-y-1">
              {selectedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3" />
                  <span className="truncate">{task.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Delete Confirmation */}
      <BulkActionConfirmation
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        action="Delete"
        itemCount={selectedTaskIds.length}
        itemType="tasks"
        onConfirm={confirmBulkDelete}
        isLoading={actionLoading}
      />

      {/* Bulk Status Change Confirmation */}
      <ConfirmationDialog
        open={showStatusConfirmation}
        onOpenChange={setShowStatusConfirmation}
        title={`Mark ${selectedTaskIds.length} tasks as ${pendingStatus}?`}
        description={`This will change the status of ${selectedTaskIds.length} selected tasks to ${pendingStatus.toLowerCase().replace('_', ' ')}. This action can be reversed.`}
        confirmText={`Mark as ${pendingStatus}`}
        variant={pendingStatus === 'CANCELLED' ? 'warning' : 'info'}
        onConfirm={confirmBulkStatusChange}
        isLoading={actionLoading}
      >
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected tasks:</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded p-2">
                <span className="flex-1 truncate">{task.title}</span>
                <Badge variant="outline" className="text-xs">
                  {task.status} → {pendingStatus}
                </Badge>
              </div>
            ))}
            {selectedTasks.length > 5 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{selectedTasks.length - 5} more tasks
              </div>
            )}
          </div>
        </div>
      </ConfirmationDialog>
    </>
  )
}