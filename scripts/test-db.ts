import { prisma } from '../lib/prisma'

async function testConnection() {
  try {
    // Test creating a task
    const task = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'This is a test task to verify database connection',
        priority: 'high',
        status: 'pending'
      }
    })
    console.log('✅ Created task:', task)

    // Test reading tasks
    const tasks = await prisma.task.findMany()
    console.log('✅ Found tasks:', tasks.length)

    // Test updating a task
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status: 'completed' }
    })
    console.log('✅ Updated task status:', updatedTask.status)

    // Test deleting a task
    await prisma.task.delete({
      where: { id: task.id }
    })
    console.log('✅ Deleted task')

    console.log('\n🎉 Database connection test successful!')
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()