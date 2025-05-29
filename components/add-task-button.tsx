'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TaskForm } from './task-form'
import { CreateTaskData, UpdateTaskData } from '@/types'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AddTaskButtonProps {
  onAddTask: (data: CreateTaskData) => void
  isLoading?: boolean
  variant?: 'button' | 'card'
  className?: string
}

export function AddTaskButton({
  onAddTask,
  isLoading,
  variant = 'button',
  className,
}: AddTaskButtonProps) {
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (data: CreateTaskData | UpdateTaskData) => {
    onAddTask(data as CreateTaskData)
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
  }

  if (showForm) {
    return (
      <div className={className}>
        <TaskForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card
        className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer group"
        onClick={() => setShowForm(true)}
      >
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-3 group-hover:bg-muted/80 transition-colors">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-sm text-foreground mb-1">Add New Task</h3>
          <p className="text-xs text-muted-foreground">Click to create a new task</p>
        </div>
      </Card>
    )
  }

  return (
    <Button onClick={() => setShowForm(true)} disabled={isLoading} className={className}>
      <Plus className="h-4 w-4 mr-2" />
      Add Task
    </Button>
  )
}
