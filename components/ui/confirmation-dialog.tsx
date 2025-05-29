import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  Trash2, 
  CheckCircle2,
  Info,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type ConfirmationVariant = 'destructive' | 'warning' | 'info' | 'success'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationVariant
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  children?: React.ReactNode
  showIcon?: boolean
}

const variantConfig = {
  destructive: {
    icon: Trash2,
    iconColor: 'text-red-500',
    confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
    defaultConfirmText: 'Delete',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    confirmClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    defaultConfirmText: 'Continue',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    defaultConfirmText: 'Confirm',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    confirmClass: 'bg-green-600 hover:bg-green-700 text-white',
    defaultConfirmText: 'Continue',
  },
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = 'Cancel',
  variant = 'destructive',
  onConfirm,
  onCancel,
  isLoading = false,
  children,
  showIcon = true,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      handleCancel()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            {showIcon && (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                <Icon className={cn('h-5 w-5', config.iconColor)} />
              </div>
            )}
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Custom content */}
        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'w-full sm:w-auto',
              config.confirmClass
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText || config.defaultConfirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Specialized confirmation dialogs for common use cases

interface TaskDeleteConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskTitle: string
  taskDescription?: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function TaskDeleteConfirmation({
  open,
  onOpenChange,
  taskTitle,
  taskDescription,
  onConfirm,
  isLoading = false,
}: TaskDeleteConfirmationProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Task?"
      description={`Are you sure you want to delete this task? This action cannot be undone.`}
      confirmText="Delete Task"
      variant="destructive"
      onConfirm={onConfirm}
      isLoading={isLoading}
    >
      <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-red-500">
        <h4 className="font-medium text-sm mb-1">{taskTitle}</h4>
        {taskDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {taskDescription}
          </p>
        )}
      </div>
    </ConfirmationDialog>
  )
}

interface BulkActionConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: string
  itemCount: number
  itemType?: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function BulkActionConfirmation({
  open,
  onOpenChange,
  action,
  itemCount,
  itemType = 'tasks',
  onConfirm,
  isLoading = false,
}: BulkActionConfirmationProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${action} Multiple Items?`}
      description={`This will ${action.toLowerCase()} ${itemCount} ${itemType}. This action cannot be undone.`}
      confirmText={`${action} ${itemCount} ${itemType}`}
      variant="warning"
      onConfirm={onConfirm}
      isLoading={isLoading}
    >
      <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {itemCount} {itemType} affected
        </Badge>
      </div>
    </ConfirmationDialog>
  )
}

interface ClearFiltersConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filterCount: number
  onConfirm: () => void
  isLoading?: boolean
}

export function ClearFiltersConfirmation({
  open,
  onOpenChange,
  filterCount,
  onConfirm,
  isLoading = false,
}: ClearFiltersConfirmationProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Clear All Filters?"
      description={`You have ${filterCount} active filters. Clearing them will show all tasks.`}
      confirmText="Clear Filters"
      variant="info"
      onConfirm={onConfirm}
      isLoading={isLoading}
    >
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <Badge variant="outline" className="text-base px-4 py-2">
          {filterCount} active filters
        </Badge>
      </div>
    </ConfirmationDialog>
  )
}

interface UnsavedChangesConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onSave?: () => void
  isLoading?: boolean
}

export function UnsavedChangesConfirmation({
  open,
  onOpenChange,
  onConfirm,
  onSave,
  isLoading = false,
}: UnsavedChangesConfirmationProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Unsaved Changes"
      description="You have unsaved changes that will be lost. What would you like to do?"
      confirmText="Discard Changes"
      cancelText="Keep Editing"
      variant="warning"
      onConfirm={onConfirm}
      isLoading={isLoading}
    >
      {onSave && (
        <div className="flex justify-center">
          <Button 
            onClick={onSave} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            Save and Close
          </Button>
        </div>
      )}
    </ConfirmationDialog>
  )
}