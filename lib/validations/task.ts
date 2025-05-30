import { z } from 'zod'
import type { TaskPriority, TaskStatus } from '@/types/task'
import { sanitizeString, sanitizeSearchQuery, sanitizeSortField, sanitizeSortOrder, sanitizeNumber } from '@/lib/sanitization'

const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
const taskStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])

export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .transform((val) => sanitizeString(val, { maxLength: 255, trim: true })),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable()
    .transform((val) => val ? sanitizeString(val, { maxLength: 1000, trim: true }) : val),
  priority: taskPrioritySchema.default('MEDIUM'),
  status: taskStatusSchema.default('PENDING'),
})

export const updateTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .transform((val) => sanitizeString(val, { maxLength: 255, trim: true }))
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable()
    .transform((val) => val ? sanitizeString(val, { maxLength: 1000, trim: true }) : val),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
})

export const taskIdSchema = z.object({
  id: z.string().cuid({ message: 'Invalid task ID format' }),
})

// Query parameter validation schemas
export const taskQuerySchema = z.object({
  search: z.string()
    .max(100, 'Search query must be less than 100 characters')
    .transform((val) => sanitizeSearchQuery(val))
    .optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  sortBy: z.string()
    .transform((val) => sanitizeSortField(val, ['createdAt', 'updatedAt', 'priority', 'status', 'title']))
    .default('createdAt'),
  sortOrder: z.string()
    .transform((val) => sanitizeSortOrder(val))
    .default('desc'),
  page: z.string()
    .transform((val) => sanitizeNumber(val, { min: 1, max: 1000, isInt: true }))
    .default('1'),
  limit: z.string()
    .transform((val) => sanitizeNumber(val, { min: 1, max: 100, isInt: true }))
    .default('10'),
})

// Bulk operations validation
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid({ message: 'Invalid task ID format' }))
    .min(1, 'At least one ID is required')
    .max(100, 'Cannot delete more than 100 tasks at once'),
})

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string().cuid({ message: 'Invalid task ID format' }))
    .min(1, 'At least one ID is required')
    .max(100, 'Cannot update more than 100 tasks at once'),
  data: z.object({
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field to update is required',
  }),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskQueryInput = z.infer<typeof taskQuerySchema>
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>