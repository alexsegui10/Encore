const fs = require('fs');
const data = JSON.parse(fs.readFileSync('.\mongo_migration_temp\users.json', 'utf8'));
if (Array.isArray(data) && data.length > 0) {
    db.getCollection('users').insertMany(data);
    print('Importados ' + data.length + ' documentos');
} else {
    print('No hay datos para importar');
}
