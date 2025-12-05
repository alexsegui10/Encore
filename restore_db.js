import { MongoClient } from 'mongodb';
import fs from 'fs';

const url = 'mongodb://localhost:27017';
const dbName = 'encore';

async function restoreDatabase() {
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        console.log('Conectado a MongoDB');
        
        const db = client.db(dbName);
        
        // Leer el dump
        const dump = JSON.parse(fs.readFileSync('./dump_encore_real.json', 'utf8'));
        
        // Importar cada colección
        for (const [collectionName, documents] of Object.entries(dump)) {
            if (documents && documents.length > 0) {
                console.log(`Importando ${documents.length} documentos en ${collectionName}...`);
                
                // Convertir _id strings a ObjectId si es necesario
                const collection = db.collection(collectionName);
                await collection.insertMany(documents);
                
                console.log(`✅ ${collectionName} importada`);
            }
        }
        
        console.log('\n✅ Base de datos restaurada correctamente');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

restoreDatabase();
