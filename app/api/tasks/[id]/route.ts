import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTaskSchema, taskIdSchema } from '@/lib/validations/task'
import { withErrorHandler, ApiError } from '@/lib/api-errors'
import { withSecurity, validateRequestBody } from '@/lib/security-middleware'

export const GET = withSecurity({
  enableRateLimit: true,
  maxRequestsPerMinute: 200,
})(withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await params
  const { id } = taskIdSchema.parse(resolvedParams)

  const task = await prisma.task.findUnique({
    where: { id },
  })

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  return NextResponse.json(task)
}))

export const PATCH = withSecurity({
  enableRateLimit: true,
  maxRequestsPerMinute: 50,
  maxRequestSize: 1024 * 5, // 5KB
  enableCSRF: true,
})(withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await params
  const { id } = taskIdSchema.parse(resolvedParams)
  const body = await request.json()
  
  // Validate request body structure
  const bodyValidation = validateRequestBody(body)
  if (!bodyValidation.valid) {
    throw new ApiError(400, bodyValidation.error || 'Invalid request body')
  }
  
  // Validate and sanitize request data
  const validatedData = updateTaskSchema.parse(body)

  // Check if task exists before updating
  const existingTask = await prisma.task.findUnique({
    where: { id },
  })

  if (!existingTask) {
    throw new ApiError(404, 'Task not found')
  }

  // Update the task
  const task = await prisma.task.update({
    where: { id },
    data: validatedData,
  })

  return NextResponse.json(task)
}))

export const DELETE = withSecurity({
  enableRateLimit: true,
  maxRequestsPerMinute: 30,
  enableCSRF: true,
})(withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const resolvedParams = await params
  const { id } = taskIdSchema.parse(resolvedParams)

  // Check if task exists before deleting
  const existingTask = await prisma.task.findUnique({
    where: { id },
  })

  if (!existingTask) {
    throw new ApiError(404, 'Task not found')
  }

  // Delete the task
  await prisma.task.delete({
    where: { id },
  })

  return NextResponse.json({ 
    message: 'Task deleted successfully',
    id 
  })
}))

// Alias PUT to PATCH for backward compatibility
export const PUT = PATCH