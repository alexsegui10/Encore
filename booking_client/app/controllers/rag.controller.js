import asyncHandler from 'express-async-handler';
import Document from '../models/document.model.js';
import Event from '../models/evento.model.js';
import { generateEmbedding, cosineSimilarity } from '../services/rag.service.js';

function extractPriceFilter(question) {
    const lowerQuestion = question.toLowerCase();

    const patterns = [
        /entre\s+(\d+)\s+y\s+(\d+)\s+euros?/i,
        /de\s+(\d+)\s+a\s+(\d+)\s+euros?/i,
        /(\d+)\s*-\s*(\d+)\s+euros?/i,
        /presupuesto\s+de\s+(\d+)\s+a\s+(\d+)/i,
        /entre\s+(\d+)\s+y\s+(\d+)/i,
        /menos\s+de\s+(\d+)\s+euros?/i,
        /máximo\s+(\d+)\s+euros?/i,
        /hasta\s+(\d+)\s+euros?/i,
    ];

    for (const pattern of patterns) {
        const match = lowerQuestion.match(pattern);
        if (match) {
            if (pattern.source.includes('menos') || pattern.source.includes('máximo') || pattern.source.includes('hasta')) {
                return { min: 0, max: parseInt(match[1]) };
            }
            return { min: parseInt(match[1]), max: parseInt(match[2]) };
        }
    }

    return null;
}

export const askQuestion = asyncHandler(async (req, res) => {
    const { question } = req.body;

    if (!question || question.trim() === '') {
        return res.status(400).json({
            error: 'La pregunta es obligatoria'
        });
    }

    try {
        const queryEmbedding = await generateEmbedding(question);

        const allDocuments = await Document.find({}).lean();

        if (allDocuments.length === 0) {
            return res.status(404).json({
                error: 'No hay documentos en la base de datos. Ejecuta insertDocs.js primero.'
            });
        }

        const documentsWithSimilarity = allDocuments.map(doc => ({
            document: doc,
            similarity: cosineSimilarity(queryEmbedding, doc.embedding)
        }));

        documentsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

        const SIMILARITY_THRESHOLD = 0.5;

        let relevantDocuments = documentsWithSimilarity
            .filter(item => item.similarity >= SIMILARITY_THRESHOLD)
            .map(item => item.document);

        const priceFilter = extractPriceFilter(question);

        if (priceFilter) {
            relevantDocuments = relevantDocuments.filter(doc => {
                const price = doc.metadata.price;
                return price >= priceFilter.min && price <= priceFilter.max;
            });
        }

        const eventIds = relevantDocuments.map(doc => doc.metadata.eventId);
        const relatedEvents = await Event.find({ _id: { $in: eventIds } })
            .populate('category')
            .lean();

        return res.status(200).json({
            answer: '',
            relatedEvents: relatedEvents,
            context: relevantDocuments.map(doc => ({
                title: doc.metadata.title,
                slug: doc.metadata.slug,
                similarity: 'high'
            }))
        });
    } catch (error) {
        console.error('Error en askQuestion:', error);

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'No se puede conectar con LM Studio. Asegúrate de que esté ejecutándose en http://localhost:1234'
            });
        }

        return res.status(500).json({
            error: 'Error procesando la consulta',
            details: error.message
        });
    }
});
