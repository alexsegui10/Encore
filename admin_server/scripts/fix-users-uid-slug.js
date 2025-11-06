import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalizeUsername(text) {
  if (!text) return ""
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

function generateUid(prefix = "usr") {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `${prefix}_${timestamp}${random}`
}

async function main() {
  console.log('Conectando a la base de datos...')
  
  await prisma.$connect()
  
  // Usando agregación raw de MongoDB para encontrar usuarios con uid o slug null
  const usersWithoutUid = await prisma.$runCommandRaw({
    find: 'users',
    filter: {
      $or: [
        { uid: { $exists: false } },
        { uid: null },
        { slug: { $exists: false } },
        { slug: null }
      ]
    }
  })
  
  const usersList = usersWithoutUid.cursor?.firstBatch || []
  console.log(`Encontrados ${usersList.length} usuarios sin uid o slug`)
  
  let updated = 0
  for (const user of usersList) {
    const updateFields = {}
    
    // Generar uid si falta
    if (!user.uid) {
      updateFields.uid = generateUid()
      console.log(`  Usuario ${user.username || user.email || user._id}: asignando uid=${updateFields.uid}`)
    }
    
    // Generar slug si falta
    if (!user.slug) {
      const baseSlug = user.username 
        ? normalizeUsername(user.username) 
        : normalizeUsername(user.email?.split('@')[0] || `user-${user._id}`)
      
      // Verificar si el slug ya existe
      let slug = baseSlug
      let counter = 1
      const existingWithSlug = await prisma.users.findUnique({ where: { slug } })
      if (existingWithSlug && existingWithSlug.id !== user._id.toString()) {
        while (true) {
          slug = `${baseSlug}-${counter}`
          const check = await prisma.users.findUnique({ where: { slug } })
          if (!check || check.id === user._id.toString()) break
          counter++
        }
      }
      
      updateFields.slug = slug
      console.log(`  Usuario ${user.username || user.email || user._id}: asignando slug=${updateFields.slug}`)
    }
    
    // Actualizar el usuario usando Prisma raw update
    if (Object.keys(updateFields).length > 0) {
      await prisma.$runCommandRaw({
        update: 'users',
        updates: [{
          q: { _id: user._id },
          u: { $set: updateFields }
        }]
      })
      updated++
    }
  }
  
  console.log(`\n✅ Migración completada: ${updated} usuarios actualizados`)
  
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ Error en migración:', e)
  process.exit(1)
})
