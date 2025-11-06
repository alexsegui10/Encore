import 'dotenv/config.js'
import mongoose from 'mongoose'
import User from '../app/models/user.model.js'

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/encore'
  console.log('Conectando a MongoDB:', uri)
  await mongoose.connect(uri, { autoIndex: true })

  // Actualiza todos los usuarios que no tengan isActive/status
  const res = await User.updateMany(
    { $or: [{ isActive: { $exists: false } }, { status: { $exists: false } }] },
    { $set: { isActive: true, status: 'active' } }
  )

  console.log('Usuarios actualizados:', res.modifiedCount)
  await mongoose.disconnect()
  console.log('Migración completada')
}

main().catch(async (e) => {
  console.error('Error en migración:', e)
  try { await mongoose.disconnect(); } catch {}
  process.exit(1)
})
