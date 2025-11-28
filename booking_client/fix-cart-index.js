import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/encore';

async function fixCartIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;
    const cartsCollection = db.collection('carts');

    // Obtener índices actuales
    const indexes = await cartsCollection.indexes();
    console.log('📋 Índices actuales:', indexes.map(i => i.name));

    // Eliminar todos los índices relacionados con userId (excepto _id_)
    const indexesToDrop = ['userId_1', 'userId_1_status_1', 'userId_status_active_unique'];
    
    for (const indexName of indexesToDrop) {
      try {
        await cartsCollection.dropIndex(indexName);
        console.log(`🗑️  Índice ${indexName} eliminado`);
      } catch (error) {
        if (error.code === 27) {
          console.log(`ℹ️  Índice ${indexName} no existe, continuando...`);
        } else {
          console.log(`⚠️  Error eliminando ${indexName}:`, error.message);
        }
      }
    }

    // Crear el nuevo índice compuesto
    await cartsCollection.createIndex(
      { userId: 1, status: 1 },
      { 
        unique: true, 
        partialFilterExpression: { status: 'active' },
        name: 'userId_status_active_unique'
      }
    );
    console.log('✅ Nuevo índice compuesto creado: userId + status (solo active único)');

    // Verificar índices finales
    const newIndexes = await cartsCollection.indexes();
    console.log('📋 Índices finales:', newIndexes.map(i => i.name));

    await mongoose.disconnect();
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixCartIndexes();
