// Script para conectar directamente a MongoDB y agregar un usuario enterprise
require('dotenv').config();
const { MongoClient } = require('mongodb');
const argon2 = require('argon2');

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/encore';

async function addEnterpriseUser() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const database = client.db();
    const collection = database.collection('Enterprise');

    // Datos del usuario enterprise
    const enterpriseData = {
      uid: 'enterprise_' + Date.now(),
      email: 'admin@enterprise.com',
      password: await argon2.hash('password123'),
      name: 'Empresa Demo',
      description: 'Empresa de demostración para pruebas',
      logo: 'https://via.placeholder.com/150',
      website: 'https://enterprise-demo.com',
      contactEmail: 'contact@enterprise.com',
      phone: '+34 600 000 000',
      status: 'active',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Verificar si ya existe un usuario con ese email
    const existingUser = await collection.findOne({ email: enterpriseData.email });
    
    if (existingUser) {
      console.log('⚠️  Ya existe un usuario con el email:', enterpriseData.email);
      console.log('📧 Email:', existingUser.email);
      console.log('🆔 ID:', existingUser._id);
      return;
    }

    // Insertar el usuario
    const result = await collection.insertOne(enterpriseData);
    
    console.log('\n✅ Usuario enterprise creado exitosamente!');
    console.log('═'.repeat(50));
    console.log('📧 Email:', enterpriseData.email);
    console.log('🔑 Password: password123');
    console.log('🆔 UID:', enterpriseData.uid);
    console.log('🏢 Nombre:', enterpriseData.name);
    console.log('📍 MongoDB ID:', result.insertedId);
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

addEnterpriseUser();
