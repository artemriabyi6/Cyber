// scripts/fix-passwords.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPasswords() {
  console.log('🔐 Хешування паролів...')
  
  const users = await prisma.user.findMany()
  
  for (const user of users) {
    // Перевіряємо, чи пароль вже захешований
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      const hashedPassword = await bcrypt.hash(user.password, 12)
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
      
      console.log(`✅ Пароль оновлено для ${user.email}`)
    }
  }
  
  console.log('🎉 Всі паролі захешовані!')
}

hashPasswords()
  .catch(console.error)
  .finally(() => prisma.$disconnect())