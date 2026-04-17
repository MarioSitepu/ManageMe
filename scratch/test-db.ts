import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const userCount = await prisma.user.count()
    console.log(`Database Connection: SUCCESS`)
    console.log(`User Count: ${userCount}`)
    
    const users = await prisma.user.findMany({ take: 1 })
    if (users.length > 0) {
      console.log(`Sample User Email: ${users[0].email}`)
    } else {
      console.log(`No users found in database.`)
    }
  } catch (error) {
    console.error(`Database Connection: FAILED`)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
