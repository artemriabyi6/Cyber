// scripts/seed.ts
import { PrismaClient } from '@prisma/client'
import * as data from '../../back/db.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Початок імпорту даних...')

  // Імпорт користувачів
  console.log('👥 Імпорт користувачів...')
  for (const user of data.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        image: user.image || null,
        createdAt: new Date(user.createdAt),
        role: user.role || 'student'
      }
    })
  }

  // Імпорт статистики прогресу
  console.log('📊 Імпорт статистики прогресу...')
  for (const stat of data.progressStats) {
    await prisma.progressStat.create({
      data: {
        id: stat.id,
        userId: stat.userId,
        skill: stat.skill,
        current: stat.current,
        previous: stat.previous,
        icon: stat.icon
      }
    })
  }

  // Імпорт тренувань
  console.log('🏃 Імпорт тренувань...')
  for (const session of data.trainingSessions) {
    await prisma.trainingSession.create({
      data: {
        id: session.id.toString(),
        trainingPlanId: session.trainingPlanId?.toString(),
        userId: session.userId,
        date: session.date,
        duration: session.duration,
        performance: session.performance,
        coachNotes: session.coachNotes,
        completed: session.completed
      }
    })
  }

  // Імпорт повідомлень
  console.log('💬 Імпорт повідомлень...')
  for (const message of data.messages) {
    await prisma.message.create({
      data: {
        id: message.id.toString(),
        text: message.text,
        senderId: message.senderId,
        receiverId: message.receiverId,
        timestamp: new Date(message.timestamp),
        read: message.read
      }
    })
  }

  // Імпорт цілей
  console.log('🎯 Імпорт цілей...')
  for (const goal of data.goals) {
    await prisma.goal.create({
      data: {
        id: goal.id.toString(),
        title: goal.title,
        description: goal.description,
        category: goal.category,
        targetValue: goal.targetValue,
        deadline: goal.deadline,
        priority: goal.priority,
        exercises: goal.exercises,
        userId: goal.userId,
        currentValue: goal.currentValue,
        status: goal.status,
        createdAt: goal.createdAt
      }
    })
  }

  console.log('✅ Імпорт даних завершено!')
}

main()
  .catch((e) => {
    console.error('❌ Помилка імпорту:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })