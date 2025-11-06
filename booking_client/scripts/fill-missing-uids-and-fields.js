import 'dotenv/config.js'
import mongoose from 'mongoose'
import User from '../app/models/user.model.js'

function generateUid(prefix = 'usr') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `${prefix}_${timestamp}${random}`
}

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/encore'
  console.log('Conectando a MongoDB:', uri)
  await mongoose.connect(uri, { autoIndex: true })

  // Encuentra usuarios que no tengan uid o cuyo uid sea null
  const docs = await User.find({ $or: [{ uid: { $exists: false } }, { uid: null }] }).exec()
  console.log('Usuarios sin uid encontrados:', docs.length)

  const ops = docs.map((doc) => {
    const uid = generateUid()
    const set = { uid }
    if (doc.isActive === undefined) set.isActive = true
    if (doc.status === undefined) set.status = 'active'
    return {
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: set }
      }
    }
  })

  if (ops.length > 0) {
    const res = await User.bulkWrite(ops)
    console.log('BulkWrite result:', res.modifiedCount ?? res.nModified ?? res)
  } else {
    console.log('No hay usuarios para actualizar')
  }

  await mongoose.disconnect()
  console.log('Completado')
}

main().catch(async (e) => {
  console.error('Error:', e)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})
