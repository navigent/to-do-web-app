'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClearFiltersConfirmation } from '@/components/ui/confirmation-dialog'
import { TaskFilters, TaskPriority, TaskStatus } from '@/types'
import { 
  Search, 
  Filter, 
  X, 
  SortAsc, 
  SortDesc, 
  ChevronDown, 
  ChevronUp,
  Circle,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskFilterProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  taskCounts?: {
    total: number
    pending: number
    in_progress: number
    completed: number
    cancelled: number
  }
}

const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'PENDING', label: 'Pending', icon: <Circle className="h-3 w-3" />, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: <PlayCircle className="h-3 w-3" />, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900' },
  { value: 'COMPLETED', label: 'Completed', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900' },
  { value: 'CANCELLED', label: 'Cancelled', icon: <XCircle className="h-3 w-3" />, color: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900' },
]

const priorityOptions: { value: TaskPriority; label: string; icon: string; color: string }[] = [
  { value: 'LOW', label: 'Low', icon: '🟢', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900' },
  { value: 'MEDIUM', label: 'Medium', icon: '🟡', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900' },
  { value: 'HIGH', label: 'High', icon: '🟠', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900' },
  { value: 'URGENT', label: 'Urgent', icon: '🔴', color: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900' },
]

const sortOptions = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
] as const

export function TaskFilter({ filters, onFiltersChange, taskCounts }: TaskFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined })
  }

  const handleStatusToggle = (status: TaskStatus) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status]

    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    })
  }

  const handlePriorityToggle = (priority: TaskPriority) => {
    const currentPriorities = filters.priority || []
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority]

    onFiltersChange({
      ...filters,
      priority: newPriorities.length > 0 ? newPriorities : undefined,
    })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy: sortBy as any })
  }

  const handleSortOrderToggle = () => {
    const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc'
    onFiltersChange({ ...filters, sortOrder: newOrder })
  }

  const handleClearFilters = () => {
    const activeFilterCount = getActiveFilterCount()
    
    // Only show confirmation if there are multiple active filters
    if (activeFilterCount > 2) {
      setShowClearConfirmation(true)
    } else {
      onFiltersChange({})
    }
  }

  const handleClearFiltersConfirm = () => {
    onFiltersChange({})
    setShowClearConfirmation(false)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.status?.length) count += filters.status.length
    if (filters.priority?.length) count += filters.priority.length
    if (filters.search?.trim()) count += 1
    return count
  }

  const hasActiveFilters = filters.status?.length || filters.priority?.length || filters.search

  const activeFilterCount = getActiveFilterCount()

  return (
    <Card className="w-full bg-gradient-to-b from-background to-muted/20 border-muted/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Filters & Sort</CardTitle>
              {activeFilterCount > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters} 
                className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="h-8 w-8"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by title or description..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-3 transition-all focus:ring-2 focus:ring-primary/20"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSearchChange('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 opacity-60 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        {taskCounts && !isExpanded && (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
              <span>{taskCounts.pending} pending</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>{taskCounts.in_progress} in progress</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>{taskCounts.completed} completed</span>
            </div>
            {taskCounts.cancelled > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>{taskCounts.cancelled} cancelled</span>
              </div>
            )}
          </div>
        )}

        {/* Expanded filters */}
        {isExpanded && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Status filters */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status</label>
                {filters.status && filters.status.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {filters.status.length}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusToggle(option.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      'border hover:shadow-sm',
                      filters.status?.includes(option.value) 
                        ? option.color + ' border-transparent shadow-sm' 
                        : 'bg-background border-border hover:border-primary/50'
                    )}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority filters */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Priority</label>
                {filters.priority && filters.priority.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {filters.priority.length}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePriorityToggle(option.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      'border hover:shadow-sm',
                      filters.priority?.includes(option.value) 
                        ? option.color + ' border-transparent shadow-sm' 
                        : 'bg-background border-border hover:border-primary/50'
                    )}
                  >
                    <span className="text-xs leading-none">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2.5">
              <label className="text-sm font-medium">Sort & Order</label>
              <div className="flex gap-2">
                <Select value={filters.sortBy || 'createdAt'} onValueChange={handleSortChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={filters.sortOrder === 'asc' ? 'secondary' : 'outline'}
                  size="icon"
                  onClick={handleSortOrderToggle}
                  className="shrink-0"
                >
                  {filters.sortOrder === 'desc' ? (
                    <SortDesc className="h-4 w-4" />
                  ) : (
                    <SortAsc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    Filtering {taskCounts?.total || 0} tasks
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-auto p-0 text-xs"
                  >
                    Reset filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Clear Filters Confirmation Dialog */}
      <ClearFiltersConfirmation
        open={showClearConfirmation}
        onOpenChange={setShowClearConfirmation}
        filterCount={getActiveFilterCount()}
        onConfirm={handleClearFiltersConfirm}
      />
    </Card>
  )
}
