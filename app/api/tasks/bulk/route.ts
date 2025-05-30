import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bulkDeleteSchema, bulkUpdateSchema } from '@/lib/validations/task'
import { withErrorHandler, ApiError } from '@/lib/api-errors'
import { withSecurity, validateRequestBody } from '@/lib/security-middleware'

export const PATCH = withSecurity({
  enableRateLimit: true,
  maxRequestsPerMinute: 20,
  maxRequestSize: 1024 * 10, // 10KB
  enableCSRF: true,
})(withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  
  // Validate request body structure
  const bodyValidation = validateRequestBody(body)
  if (!bodyValidation.valid) {
    throw new ApiError(400, bodyValidation.error || 'Invalid request body')
  }
  
  // Validate and sanitize request data
  const validatedData = bulkUpdateSchema.parse(body)

  // Check if all tasks exist
  const existingTasks = await prisma.task.findMany({
    where: { id: { in: validatedData.ids } },
    select: { id: true },
  })

  if (existingTasks.length !== validatedData.ids.length) {
    const foundIds = existingTasks.map(task => task.id)
    const missingIds = validatedData.ids.filter(id => !foundIds.includes(id))
    throw new ApiError(404, `Tasks not found: ${missingIds.join(', ')}`)
  }

  // Update tasks
  const updatedTasks = await prisma.task.updateMany({
    where: { id: { in: validatedData.ids } },
    data: {
      ...validatedData.data,
      updatedAt: new Date(),
    },
  })

  // Fetch updated tasks to return
  const tasks = await prisma.task.findMany({
    where: { id: { in: validatedData.ids } },
  })

  return NextResponse.json(tasks)
}))

export const DELETE = withSecurity({
  enableRateLimit: true,
  maxRequestsPerMinute: 10,
  enableCSRF: true,
})(withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  
  // Validate request body structure
  const bodyValidation = validateRequestBody(body)
  if (!bodyValidation.valid) {
    throw new ApiError(400, bodyValidation.error || 'Invalid request body')
  }
  
  // Validate and sanitize request data
  const validatedData = bulkDeleteSchema.parse(body)

  // Check if all tasks exist
  const existingTasks = await prisma.task.findMany({
    where: { id: { in: validatedData.ids } },
    select: { id: true },
  })

  if (existingTasks.length !== validatedData.ids.length) {
    const foundIds = existingTasks.map(task => task.id)
    const missingIds = validatedData.ids.filter(id => !foundIds.includes(id))
    throw new ApiError(404, `Tasks not found: ${missingIds.join(', ')}`)
  }

  // Delete tasks
  await prisma.task.deleteMany({
    where: { id: { in: validatedData.ids } },
  })

  return NextResponse.json({
    message: `${validatedData.ids.length} tasks deleted successfully`,
    deletedIds: validatedData.ids,
  })
}))