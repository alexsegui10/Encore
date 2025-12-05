const fs = require('fs');

// Leer el dump
const dump = JSON.parse(fs.readFileSync('dump_encore_real.json', 'utf8'));

// Conectar a la base de datos
const db = db.getSiblingDB('encore');

// Importar cada colección
for (const [collectionName, documents] of Object.entries(dump)) {
    if (documents && documents.length > 0) {
        print(`Importando ${documents.length} documentos en ${collectionName}...`);
        db[collectionName].insertMany(documents);
        print(`✅ ${collectionName} importada`);
    }
}

print('\n✅ Base de datos restaurada correctamente');
