import asyncHandler from 'express-async-handler';
import Document from '../models/document.model.js';
import Event from '../models/evento.model.js';
import { generateEmbedding, cosineSimilarity, askLLM } from '../services/rag.service.js';

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
        const questionEmbedding = await generateEmbedding(question);

        const words = question.toLowerCase().split(/\s+/);
        const regexPattern = words.join('|');

        const textMatches = await Document.find({
            text: { $regex: regexPattern, $options: 'i' }
        }).limit(200).lean();

        if (textMatches.length === 0) {
            return res.status(200).json({
                answer: '',
                relatedEvents: [],
                context: []
            });
        }

        const scoredDocs = textMatches
            .map(d => ({
                ...d,
                similarity: cosineSimilarity(d.embedding, questionEmbedding)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10);

        const context = scoredDocs.map(d => {
            const meta = d.metadata;
            return `Título: ${meta.title}
Precio: ${meta.price} ${meta.currency}
Fecha: ${new Date(meta.date).toLocaleDateString('es-ES')}
Ubicación: ${meta.location || 'No especificada'}
Descripción: ${d.text}`;
        }).join('\n\n---\n\n');

        const finalPrompt = `Usa SOLO este contexto para determinar qué eventos son relevantes para la pregunta del usuario.

CONTEXTO DE EVENTOS DISPONIBLES:
${context}

PREGUNTA DEL USUARIO:
${question}

INSTRUCCIONES:
- Devuelve SOLO los títulos de los eventos que sean realmente relevantes para la pregunta
- Si la pregunta menciona una ubicación, descarta eventos de otras ubicaciones
- Si menciona un rango de precio, descarta eventos fuera de ese rango
- Si menciona una fecha o período, ten en cuenta las fechas de los eventos
- Si menciona un tipo de evento o categoría, filtra por eso
- Si NO hay eventos relevantes, di "NINGUNO"
- Responde SOLO con los títulos separados por saltos de línea, sin explicaciones adicionales

RESPUESTA:`;

        const llmResponse = await askLLM(finalPrompt, '');

        const relevantTitles = llmResponse
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && line !== 'NINGUNO' && !line.startsWith('RESPUESTA:'));

        let filteredDocs = scoredDocs;
        if (relevantTitles.length > 0 && !llmResponse.includes('NINGUNO')) {
            filteredDocs = scoredDocs.filter(doc =>
                relevantTitles.some(title =>
                    doc.metadata.title.toLowerCase().includes(title.toLowerCase()) ||
                    title.toLowerCase().includes(doc.metadata.title.toLowerCase())
                )
            );
        }

        const eventIds = filteredDocs.map(doc => doc.metadata.eventId);
        const relatedEvents = await Event.find({ _id: { $in: eventIds } })
            .populate('category')
            .lean();

        return res.status(200).json({
            answer: '',
            relatedEvents: relatedEvents,
            context: filteredDocs.map(doc => ({
                title: doc.metadata.title,
                slug: doc.metadata.slug,
                similarity: doc.similarity.toFixed(2)
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
