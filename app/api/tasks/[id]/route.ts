import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTaskSchema, taskIdSchema } from '@/lib/validations/task'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = taskIdSchema.parse(resolvedParams)

    const task = await prisma.task.findUnique({
      where: { id },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      )
    }

    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = taskIdSchema.parse(resolvedParams)
    const body = await request.json()
    
    const validatedData = updateTaskSchema.parse(body)

    const task = await prisma.task.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = taskIdSchema.parse(resolvedParams)

    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      )
    }

    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}