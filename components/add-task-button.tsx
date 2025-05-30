'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AddTaskButtonProps {
  onClick?: () => void
  isLoading?: boolean
  disabled?: boolean
  variant?: 'button' | 'card'
  className?: string
}

export function AddTaskButton({
  onClick,
  isLoading,
  disabled,
  variant = 'button',
  className,
}: AddTaskButtonProps) {

  if (variant === 'card') {
    return (
      <Card
        className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer group"
        onClick={() => !isLoading && !disabled && onClick?.()}
      >
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-3 group-hover:bg-muted/80 transition-colors">
            {isLoading ? (
              <Spinner size="sm" className="text-muted-foreground" />
            ) : (
              <Plus className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <h3 className="font-medium text-sm text-foreground mb-1">
            {isLoading ? 'Creating Task...' : 'Add New Task'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Please wait...' : 'Click to create a new task'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Button onClick={onClick} disabled={isLoading || disabled} className={className}>
      {isLoading ? (
        <Spinner size="sm" className="mr-2" />
      ) : (
        <Plus className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Creating...' : 'Add Task'}
    </Button>
  )
}
