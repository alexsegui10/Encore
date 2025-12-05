const fs = require('fs');

// Leer el dump
const dump = JSON.parse(fs.readFileSync('dump_encore.json', 'utf8'));

// Conectar a la base de datos
const db = db.getSiblingDB('encore');

// Importar cada colección
for (const [collectionName, documents] of Object.entries(dump)) {
    if (documents && documents.length > 0) {
        print(`Importando ${documents.length} documentos en ${collectionName}...`);
        
        try {
            db[collectionName].insertMany(documents);
            print(`✅ ${collectionName} importada`);
        } catch (error) {
            print(`❌ Error en ${collectionName}: ${error.message}`);
        }
    }
}

print('\n✅ Base de datos restaurada');
