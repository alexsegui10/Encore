const fs = require('fs');
const data = JSON.parse(fs.readFileSync('.\mongo_migration_temp\Product.json', 'utf8'));
if (Array.isArray(data) && data.length > 0) {
    db.getCollection('Product').insertMany(data);
    print('Importados ' + data.length + ' documentos');
} else {
    print('No hay datos para importar');
}
