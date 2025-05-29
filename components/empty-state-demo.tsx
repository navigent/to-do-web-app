'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { TaskFilters } from '@/types'

const demoScenarios = [
  {
    id: 'new-user',
    title: 'New User',
    description: 'First-time user with no tasks',
    variant: 'new-user' as const,
    filters: {},
    totalTasks: 0,
  },
  {
    id: 'no-results',
    title: 'No Results',
    description: 'User has tasks but none match criteria',
    variant: 'no-results' as const,
    filters: {},
    totalTasks: 15,
  },
  {
    id: 'search-empty',
    title: 'Search No Results',
    description: 'Search query returns no results',
    variant: 'search' as const,
    filters: { search: 'nonexistent task' },
    totalTasks: 8,
  },
  {
    id: 'all-completed',
    title: 'All Completed',
    description: 'All tasks are completed',
    variant: 'all-completed' as const,
    filters: {},
    totalTasks: 12,
  },
  {
    id: 'filtered-status',
    title: 'Filtered by Status',
    description: 'No tasks match status filter',
    variant: 'filtered' as const,
    filters: { status: ['IN_PROGRESS'] },
    totalTasks: 10,
  },
  {
    id: 'filtered-priority',
    title: 'Filtered by Priority',
    description: 'No tasks match priority filter',
    variant: 'filtered' as const,
    filters: { priority: ['URGENT'] },
    totalTasks: 7,
  },
  {
    id: 'filtered-multiple',
    title: 'Multiple Filters',
    description: 'No tasks match multiple filters',
    variant: 'filtered' as const,
    filters: { 
      status: ['PENDING', 'IN_PROGRESS'],
      priority: ['HIGH', 'URGENT'],
      search: 'meeting'
    },
    totalTasks: 20,
  },
]

export function EmptyStateDemo() {
  const [selectedScenario, setSelectedScenario] = useState(demoScenarios[0])

  const handleAddTask = () => {
    console.log('Add task clicked for scenario:', selectedScenario.id)
  }

  const handleClearFilters = () => {
    console.log('Clear filters clicked for scenario:', selectedScenario.id)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Empty State Demo</h1>
        <p className="text-muted-foreground">
          Explore different empty state scenarios and their contextual messaging.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scenario Selector */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Scenario</h2>
          <div className="space-y-3">
            {demoScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedScenario.id === scenario.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : ''
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{scenario.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {scenario.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {scenario.variant}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {scenario.totalTasks} tasks
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scenario Details */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Scenario Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Variant:</span>{' '}
                <Badge variant="outline">{selectedScenario.variant}</Badge>
              </div>
              <div>
                <span className="font-medium">Total Tasks:</span>{' '}
                {selectedScenario.totalTasks}
              </div>
              {Object.keys(selectedScenario.filters).length > 0 && (
                <div>
                  <span className="font-medium">Active Filters:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedScenario.filters.status?.map((status) => (
                      <Badge key={status} variant="secondary" className="text-xs">
                        Status: {status}
                      </Badge>
                    ))}
                    {selectedScenario.filters.priority?.map((priority) => (
                      <Badge key={priority} variant="secondary" className="text-xs">
                        Priority: {priority}
                      </Badge>
                    ))}
                    {selectedScenario.filters.search && (
                      <Badge variant="secondary" className="text-xs">
                        Search: "{selectedScenario.filters.search}"
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Empty State Preview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Empty State Preview</h2>
          <Card className="min-h-[500px]">
            <CardContent className="p-0">
              <EmptyState
                variant={selectedScenario.variant}
                onAddTask={handleAddTask}
                onClearFilters={handleClearFilters}
                filters={selectedScenario.filters}
                searchTerm={selectedScenario.filters.search}
                totalTasks={selectedScenario.totalTasks}
              />
            </CardContent>
          </Card>

          {/* Action Log */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={handleAddTask} className="w-full">
                  Test "Add Task" Action
                </Button>
                <Button 
                  onClick={handleClearFilters} 
                  variant="outline" 
                  className="w-full"
                  disabled={Object.keys(selectedScenario.filters).length === 0}
                >
                  Test "Clear Filters" Action
                </Button>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Check browser console for action logs
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}