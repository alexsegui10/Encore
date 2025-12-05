// Verificar categorías y sus eventos
use('encore');

print('📊 RESUMEN DE CATEGORÍAS Y EVENTOS:\n');

db.categories.find({}).sort({ name: 1 }).forEach(cat => {
  print(`📁 ${cat.name}`);
  print(`   📝 ${cat.shortDescription}`);
  print(`   🎫 ${cat.events ? cat.events.length : 0} eventos`);
  
  if (cat.events && cat.events.length > 0) {
    cat.events.forEach(eventId => {
      const event = db.events.findOne({ _id: eventId });
      if (event) {
        print(`      - ${event.title}`);
      }
    });
  }
  print('');
});
