import asyncHandler from 'express-async-handler';
import Document from '../models/document.model.js';
import Event from '../models/evento.model.js';
import { generateEmbedding, cosineSimilarity, askLLM } from '../services/rag.service.js';

const STOP_WORDS = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'de', 'del', 'a', 'al', 'en', 'con', 'por', 'para',
    'que', 'y', 'o', 'si', 'no', 'es', 'son', 'está', 'están',
    'me', 'te', 'se', 'lo', 'le'
]);

function extractKeywords(question) {
    return question
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));
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

        const keywords = extractKeywords(question);

        if (keywords.length === 0) {
            return res.status(200).json({
                answer: '',
                relatedEvents: [],
                context: []
            });
        }

        const regexPattern = keywords.join('|');

        const textMatches = await Document.find({
            text: { $regex: regexPattern, $options: 'i' }
        }).limit(150).lean();

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
            .filter(d => d.similarity >= 0.45)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10);

        if (scoredDocs.length === 0) {
            return res.status(200).json({
                answer: '',
                relatedEvents: [],
                context: []
            });
        }

        const context = scoredDocs.map(d => {
            const meta = d.metadata;
            return `Título: ${meta.title}
Categoría: ${meta.category}
Precio: ${meta.price} ${meta.currency}
Fecha: ${new Date(meta.date).toLocaleDateString('es-ES')}
Ubicación: ${meta.location || 'No especificada'}
Descripción: ${d.text}`;
        }).join('\n\n---\n\n');

        const finalPrompt = `Eres un experto en filtrar eventos relevantes. Analiza cada evento y determina cuáles son relevantes para la pregunta del usuario.

EVENTOS DISPONIBLES:
${context}

PREGUNTA DEL USUARIO:
${question}

INSTRUCCIONES:
- Devuelve los títulos de eventos que sean relevantes para la pregunta
- Si la pregunta menciona temas (motos, música, Disney, deportes), busca eventos relacionados con esos temas
- Si menciona una ubicación específica, prioriza eventos de esa ubicación pero no descartes otros si no hay suficientes
- Si menciona precio o fecha, considéralo pero no lo uses como único criterio
- Sé flexible con sinónimos y términos relacionados (ej: "motos" incluye MotoGP, motociclismo, etc.)
- Si NO hay eventos relevantes, responde "NINGUNO"

Responde SOLO con los títulos exactos de los eventos relevantes, uno por línea.

RESPUESTA:`;

        const llmResponse = await askLLM(finalPrompt, '');

        const relevantTitles = llmResponse
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && line !== 'NINGUNO' && !line.toLowerCase().startsWith('respuesta'));

        let filteredDocs = scoredDocs;
        if (relevantTitles.length > 0 && !llmResponse.toUpperCase().includes('NINGUNO')) {
            filteredDocs = scoredDocs.filter(doc => {
                const docTitle = doc.metadata.title.toLowerCase();
                return relevantTitles.some(title => {
                    const titleLower = title.toLowerCase();
                    return docTitle.includes(titleLower) ||
                        titleLower.includes(docTitle) ||
                        docTitle.split(' ').some(word => titleLower.includes(word) && word.length > 4);
                });
            });

            if (filteredDocs.length === 0) {
                filteredDocs = scoredDocs.slice(0, 3);
            }
        } else if (llmResponse.toUpperCase().includes('NINGUNO')) {
            filteredDocs = [];
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
