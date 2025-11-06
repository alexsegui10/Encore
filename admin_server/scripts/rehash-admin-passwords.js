import 'dotenv/config'
import argon2 from 'argon2'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Regenerando contraseñas de administradores con Argon2...')
  
  // Obtener todos los administradores
  const admins = await prisma.admin.findMany()
  
  console.log(`Encontrados ${admins.length} administradores`)
  
  // IMPORTANTE: Aquí debes poner la contraseña por defecto que quieres usar
  // O puedes personalizar por cada admin
  const defaultPassword = 'admin123' // CAMBIAR ESTO
  
  for (const admin of admins) {
    // Genera el hash con argon2
    const hashedPassword = await argon2.hash(defaultPassword)
    
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    })
    
    console.log(`✅ Admin ${admin.username} (${admin.email}) - nueva contraseña hasheada`)
  }
  
  console.log('\n⚠️  IMPORTANTE: Todas las contraseñas se han reseteado a:', defaultPassword)
  console.log('    Cambia este valor en el script antes de ejecutar en producción')
  
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ Error:', e)
  await prisma.$disconnect()
  process.exit(1)
})
