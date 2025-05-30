import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTaskSchema } from '@/lib/validations/task'
import { withErrorHandler, ApiError } from '@/lib/api-errors'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')
  const priority = searchParams.get('priority')
  const status = searchParams.get('status')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    throw new ApiError(400, 'Invalid pagination parameters')
  }

  // Validate sort parameters
  const validSortFields = ['createdAt', 'updatedAt', 'priority', 'status', 'title']
  const validSortOrders = ['asc', 'desc']
  
  if (!validSortFields.includes(sortBy)) {
    throw new ApiError(400, `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`)
  }
  
  if (!validSortOrders.includes(sortOrder)) {
    throw new ApiError(400, 'Invalid sort order. Must be asc or desc')
  }

  // Validate priority and status if provided
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH']
  const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED']
  
  if (priority && !validPriorities.includes(priority)) {
    throw new ApiError(400, `Invalid priority. Must be one of: ${validPriorities.join(', ')}`)
  }
  
  if (status && !validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`)
  }

  const where: any = {}

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ]
  }

  if (priority) {
    where.priority = priority
  }

  if (status) {
    where.status = status
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ])

  return NextResponse.json({
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  
  // Validate request body
  const validatedData = createTaskSchema.parse(body)

  // Create the task
  const task = await prisma.task.create({
    data: validatedData,
  })

  return NextResponse.json(task, { status: 201 })
})