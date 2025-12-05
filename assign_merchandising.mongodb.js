// Script para asignar productos aleatorios al merchandising de cada evento
use('encore');

// Obtener todos los IDs de productos
const products = db.products.find({}, { _id: 1 }).toArray();
const productIds = products.map(p => p._id.toString());

print(`Total de productos disponibles: ${productIds.length}`);

// Función para obtener productos aleatorios únicos
function getRandomProducts(allProducts, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, allProducts.length));
}

// Obtener todos los eventos
const events = db.events.find({}).toArray();
print(`Total de eventos: ${events.length}`);

let updatedCount = 0;

// Asignar productos aleatorios a cada evento
events.forEach(event => {
    // Generar entre 2 y 4 productos aleatorios diferentes
    const randomProductIds = getRandomProducts(productIds, 2, 4);
    
    // Obtener la información completa de los productos
    const fullProducts = db.products.find({
        _id: { $in: randomProductIds.map(id => new ObjectId(id)) }
    }).toArray();
    
    // Crear objetos con toda la información
    const merchandisingObjects = fullProducts.map(p => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        description: p.description,
        image: p.image,
        category: p.category
    }));
    
    db.events.updateOne(
        { _id: event._id },
        { $set: { merchandising: merchandisingObjects } }
    );
    
    updatedCount++;
    print(`✓ Evento "${event.title}" actualizado con ${merchandisingObjects.length} productos`);
});

print(`\n========================================`);
print(`✓ ${updatedCount} eventos actualizados correctamente`);
print(`========================================`);
