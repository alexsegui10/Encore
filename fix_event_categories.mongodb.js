// Actualizar los eventos para que apunten a las categorías correctas

use('encore');

// Obtener los IDs de las categorías actuales
const conciertos = db.categories.findOne({ name: 'Conciertos' });
const festivales = db.categories.findOne({ name: 'Festivales' });
const deportes = db.categories.findOne({ name: 'Deportes' });
const teatro = db.categories.findOne({ name: 'Teatro' });
const comedia = db.categories.findOne({ name: 'Comedia' });

print('📁 Categorías encontradas:');
print('  Conciertos:', conciertos._id);
print('  Festivales:', festivales._id);
print('  Deportes:', deportes._id);
print('  Teatro:', teatro._id);
print('  Comedia:', comedia._id);
print('');

// Asignar eventos a categorías según su tipo
const updates = [
  // Conciertos
  { title: 'Coldplay - Music of the Spheres World Tour', category: conciertos._id },
  { title: 'ROSALÍA - MOTOMAMI WORLD TOUR', category: conciertos._id },
  { title: 'The Weeknd - After Hours til Dawn', category: conciertos._id },
  { title: 'Dua Lipa - Radical Optimism Tour', category: conciertos._id },
  { title: 'Taylor Swift - The Eras Tour', category: conciertos._id },
  // Festivales
  { title: 'Bad Bunny - Most Wanted Tour', category: festivales._id }
];

print('🔄 Actualizando eventos...\n');

updates.forEach(update => {
  const result = db.events.updateOne(
    { title: update.title },
    { $set: { category: update.category } }
  );
  
  if (result.modifiedCount > 0) {
    print(`✅ ${update.title}`);
  } else {
    print(`⚠️  No se encontró: ${update.title}`);
  }
});

print('\n📊 Verificando resultado...\n');

// Verificar que los eventos tienen las categorías correctas
db.events.find({}).forEach(event => {
  const cat = db.categories.findOne({ _id: event.category });
  print(`🎫 ${event.title}`);
  print(`   → Categoría: ${cat ? cat.name : 'NO ENCONTRADA'}`);
});

print('\n✅ Actualización completada');
