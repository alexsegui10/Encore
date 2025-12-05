// Arreglar fechas en todas las colecciones

const collections = ['users', 'Admin', 'events', 'categories', 'Order', 'Payment', 'OrderItem', 'carts', 'comments'];

collections.forEach(collName => {
    print(`\nArreglando fechas en ${collName}...`);
    
    const coll = db.getCollection(collName);
    const docs = coll.find().toArray();
    
    docs.forEach(doc => {
        const update = {};
        
        // Convertir createdAt
        if (doc.createdAt && typeof doc.createdAt === 'string') {
            update.createdAt = new Date(doc.createdAt);
        }
        
        // Convertir updatedAt
        if (doc.updatedAt && typeof doc.updatedAt === 'string') {
            update.updatedAt = new Date(doc.updatedAt);
        }
        
        // Convertir date (para events)
        if (doc.date && typeof doc.date === 'string') {
            update.date = new Date(doc.date);
        }
        
        // Si hay algo que actualizar
        if (Object.keys(update).length > 0) {
            coll.updateOne({ _id: doc._id }, { $set: update });
        }
    });
    
    print(`✅ ${collName} actualizada`);
});

print('\n✅ Todas las fechas convertidas a Date');
