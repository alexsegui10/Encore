import 'dotenv/config'
import argon2 from 'argon2'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Verificando contraseñas de usuarios...')
  
  // Obtener todos los usuarios
  const users = await prisma.users.findMany()
  
  console.log(`Encontrados ${users.length} usuarios`)
  
  // NOTA: Solo regeneramos si detectamos que NO es argon2
  // Argon2 hashes empiezan con $argon2
  let regenerated = 0
  
  for (const user of users) {
    // Si la contraseña NO empieza con $argon2, probablemente es bcrypt
    if (!user.password.startsWith('$argon2')) {
      console.log(`⚠️  Usuario ${user.username} tiene hash no-argon2, regenerando...`)
      
      // Contraseña por defecto (CAMBIAR ESTO EN PRODUCCIÓN)
      const defaultPassword = 'password123'
      const hashedPassword = await argon2.hash(defaultPassword)
      
      await prisma.users.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
      
      console.log(`   ✅ Nueva contraseña: ${defaultPassword}`)
      regenerated++
    } else {
      console.log(`✓ Usuario ${user.username} ya tiene hash argon2`)
    }
  }
  
  if (regenerated > 0) {
    console.log(`\n⚠️  ${regenerated} usuarios con contraseña reseteada a: password123`)
    console.log('   Notifica a los usuarios que cambien su contraseña')
  } else {
    console.log('\n✅ Todos los usuarios ya usan argon2')
  }
  
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ Error:', e)
  await prisma.$disconnect()
  process.exit(1)
})
