'use client'

import { Task, CreateTaskData, UpdateTaskData } from '@/types'
import { TaskForm } from './task-form'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSubmit: (data: CreateTaskData | UpdateTaskData) => void | Promise<void>
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: TaskFormDialogProps) {
  const handleSubmit = async (data: CreateTaskData | UpdateTaskData) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 [&>button]:hidden overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </VisuallyHidden>
        <TaskForm
          task={task}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}