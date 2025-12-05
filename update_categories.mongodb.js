// Actualizar categorías con fotos reales, descripciones adecuadas y eventos asociados

use('encore');

// Primero obtenemos todos los eventos para poder asignarlos correctamente
const allEvents = db.events.find({}).toArray();

// Mapeamos eventos por título para facilitar la asignación
const eventsByTitle = {};
allEvents.forEach(event => {
  eventsByTitle[event.title] = event._id;
});

// Categorías actualizadas con imágenes reales de Unsplash, descripciones cortas y eventos relevantes
const updatedCategories = [
  {
    name: 'Conciertos',
    shortDescription: 'Los mejores artistas en directo. Desde pop hasta rock, vive la música en vivo.',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80', // Concierto multitud
    events: [
      eventsByTitle['Coldplay - Music of the Spheres World Tour'],
      eventsByTitle['ROSALÍA - MOTOMAMI WORLD TOUR'],
      eventsByTitle['The Weeknd - After Hours til Dawn'],
      eventsByTitle['Dua Lipa - Radical Optimism Tour'],
      eventsByTitle['Taylor Swift - The Eras Tour']
    ].filter(Boolean)
  },
  {
    name: 'Festivales',
    shortDescription: 'Experiencias musicales únicas. Varios artistas, múltiples escenarios, días de diversión.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80', // Festival escenario
    events: [
      eventsByTitle['Bad Bunny - Most Wanted Tour']
    ].filter(Boolean)
  },
  {
    name: 'Deportes',
    shortDescription: 'Emociones al máximo. Fútbol, baloncesto, y más. Vive el deporte en primera persona.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80', // Estadio deportivo
    events: []
  },
  {
    name: 'Teatro',
    shortDescription: 'Obras clásicas y contemporáneas. Drama, comedia y musicales en los mejores teatros.',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80', // Teatro escenario
    events: []
  },
  {
    name: 'Comedia',
    shortDescription: 'Risas garantizadas. Los mejores cómicos y humoristas te harán pasar una noche inolvidable.',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80', // Micrófono stand-up
    events: []
  }
];

// Actualizar cada categoría
updatedCategories.forEach((cat, index) => {
  const oldCategory = db.categories.findOne({ name: cat.name });
  
  if (oldCategory) {
    // Actualizar categoría existente
    db.categories.updateOne(
      { _id: oldCategory._id },
      {
        $set: {
          name: cat.name,
          shortDescription: cat.shortDescription,
          image: cat.image,
          events: cat.events,
          updatedAt: new Date()
        }
      }
    );
    print(`✅ Actualizada categoría: ${cat.name}`);
  } else {
    // Crear nueva categoría si no existe
    db.categories.insertOne({
      name: cat.name,
      shortDescription: cat.shortDescription,
      image: cat.image,
      events: cat.events,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    print(`✨ Creada categoría: ${cat.name}`);
  }
});

// Eliminar categorías que ya no usamos (las que no están en updatedCategories)
const categoriesToKeep = updatedCategories.map(c => c.name);
const deleteResult = db.categories.deleteMany({ 
  name: { $nin: categoriesToKeep } 
});
print(`🗑️  Eliminadas ${deleteResult.deletedCount} categorías obsoletas`);

// Mostrar resultado final
print('\n📊 CATEGORÍAS ACTUALIZADAS:');
db.categories.find({}).forEach(cat => {
  print(`\n📁 ${cat.name}`);
  print(`   📝 ${cat.shortDescription}`);
  print(`   🖼️  ${cat.image}`);
  print(`   🎫 ${cat.events ? cat.events.length : 0} eventos`);
});

print('\n✅ Actualización completada');
