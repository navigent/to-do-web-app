import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskFilters } from '@/types'
import { 
  ClipboardList, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  Plus,
  RotateCcw,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type EmptyStateVariant = 'new-user' | 'no-results' | 'search' | 'all-completed' | 'filtered'

interface EmptyStateProps {
  variant: EmptyStateVariant
  title?: string
  description?: string
  className?: string
  onAddTask?: () => void
  onClearFilters?: () => void
  filters?: TaskFilters
  searchTerm?: string
  totalTasks?: number
}

const variantConfig = {
  'new-user': {
    icon: Sparkles,
    iconColor: 'text-blue-500',
    title: 'Welcome to TaskFlow!',
    description: 'Start organizing your work by creating your first task. Stay productive and never miss a deadline.',
    actionText: 'Create Your First Task',
    showTemplates: true,
  },
  'no-results': {
    icon: ClipboardList,
    iconColor: 'text-muted-foreground',
    title: 'No tasks found',
    description: 'Try adjusting your filters or search criteria to find what you\'re looking for.',
    actionText: 'Add New Task',
    showTemplates: false,
  },
  'search': {
    icon: Search,
    iconColor: 'text-orange-500',
    title: 'No search results',
    description: 'We couldn\'t find any tasks matching your search. Try different keywords or check your spelling.',
    actionText: 'Create Task',
    showTemplates: false,
  },
  'all-completed': {
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    title: 'All done! 🎉',
    description: 'Congratulations! You\'ve completed all your tasks. Time to add new ones or take a well-deserved break.',
    actionText: 'Add New Task',
    showTemplates: false,
  },
  'filtered': {
    icon: Filter,
    iconColor: 'text-purple-500',
    title: 'No matching tasks',
    description: 'No tasks match your current filter settings. Try clearing some filters or adding new tasks.',
    actionText: 'Add New Task',
    showTemplates: false,
  },
}

const taskTemplates = [
  'Review project documentation',
  'Schedule team meeting',
  'Update project timeline',
  'Send weekly status report',
]

export function EmptyState({
  variant,
  title,
  description,
  className,
  onAddTask,
  onClearFilters,
  filters,
  searchTerm,
  totalTasks = 0,
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const activeFilters = [
    ...(filters?.status?.length ? [`Status: ${filters.status.join(', ')}`] : []),
    ...(filters?.priority?.length ? [`Priority: ${filters.priority.join(', ')}`] : []),
    ...(searchTerm ? [`Search: "${searchTerm}"`] : []),
  ]

  const hasActiveFilters = activeFilters.length > 0

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {/* Icon */}
      <div className="rounded-full bg-muted p-6 mb-6">
        <Icon className={cn('h-12 w-12', config.iconColor)} />
      </div>

      {/* Title and Description */}
      <div className="max-w-md space-y-3 mb-6">
        <h3 className="text-xl font-semibold text-foreground">
          {title || config.title}
        </h3>
        <p className="text-muted-foreground">
          {description || config.description}
        </p>

        {/* Show active filters if applicable */}
        {hasActiveFilters && (variant === 'filtered' || variant === 'no-results' || variant === 'search') && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Primary action - Add Task */}
        {onAddTask && (
          <Button onClick={onAddTask} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {config.actionText}
          </Button>
        )}

        {/* Secondary action - Clear Filters */}
        {hasActiveFilters && onClearFilters && (
          <Button onClick={onClearFilters} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Task Templates for new users */}
      {config.showTemplates && variant === 'new-user' && (
        <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Quick Start Ideas</span>
          </div>
          <div className="grid gap-2">
            {taskTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => onAddTask?.()}
                className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded hover:bg-background"
              >
                • {template}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats for context */}
      {totalTasks > 0 && variant !== 'new-user' && (
        <p className="text-xs text-muted-foreground mt-4">
          Showing 0 of {totalTasks} total tasks
        </p>
      )}
    </div>
  )
}

export function EmptyStateWrapper({
  children,
  isEmpty,
  ...emptyStateProps
}: {
  children: React.ReactNode
  isEmpty: boolean
} & EmptyStateProps) {
  if (isEmpty) {
    return <EmptyState {...emptyStateProps} />
  }
  return <>{children}</>
}