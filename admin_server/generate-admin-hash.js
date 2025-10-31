import bcrypt from 'bcrypt'

const password = 'admin123'
const hash = await bcrypt.hash(password, 10)

console.log('Password:', password)
console.log('Hash:', hash)
console.log('\nCopia este comando para MongoDB:\n')
console.log(`db.Admin.insertOne({
  uid: "adm_admin001",
  username: "admin",
  email: "admin@encore.com",
  password: "${hash}",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})`)
