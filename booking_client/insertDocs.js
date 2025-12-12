if (!process.env.MONGO_URI) {
    const dotenv = await import("dotenv");
    dotenv.config();
}

import mongoose from 'mongoose';
import Event from './app/models/evento.model.js';
import Document from './app/models/document.model.js';
import Category from './app/models/category.model.js';
import { generateEmbedding } from './app/services/rag.service.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booking';

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
}

async function insertDocuments() {
    try {
        console.log('🔍 Buscando eventos en la base de datos...');

        const events = await Event.find({})
            .populate('category')
            .lean();

        if (events.length === 0) {
            console.log('⚠️  No se encontraron eventos en la base de datos.');
            return;
        }

        console.log(`📚 Se encontraron ${events.length} eventos`);

        await Document.deleteMany({});
        console.log('🗑️  Documentos anteriores eliminados');

        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            console.log(`\n[${i + 1}/${events.length}] Procesando: ${event.title}`);

            const categoryName = event.category?.name || 'Sin categoría';

            const text = `${event.title}. ${event.description || ''}. Categoría: ${categoryName}. Precio: ${event.price} ${event.currency || 'EUR'}.`;

            console.log('   🔄 Generando embedding...');
            const embedding = await generateEmbedding(text);

            const document = new Document({
                text: text,
                embedding: embedding,
                metadata: {
                    eventId: event._id,
                    slug: event.slug,
                    title: event.title,
                    category: categoryName,
                    price: event.price,
                    currency: event.currency || 'EUR',
                    date: event.date,
                    location: event.location || ''
                }
            });

            await document.save();
            console.log('   ✅ Documento guardado');
        }

        console.log('\n✨ ¡Proceso completado exitosamente!');
        console.log(`📊 Total de documentos insertados: ${events.length}`);

        await Document.collection.createIndex({ text: 'text' });
        console.log('📑 Índice de texto creado');

    } catch (error) {
        console.error('❌ Error insertando documentos:', error);
        throw error;
    }
}

async function main() {
    await connectDB();
    await insertDocuments();
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
}

main().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
