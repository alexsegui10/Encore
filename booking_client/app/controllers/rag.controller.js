import asyncHandler from 'express-async-handler';
import Document from '../models/document.model.js';
import Event from '../models/evento.model.js';
import { generateEmbedding, cosineSimilarity, askLLM } from '../services/rag.service.js';

export const askQuestion = asyncHandler(async (req, res) => {
    const { question } = req.body;

    if (!question || question.trim() === '') {
        return res.status(400).json({
            error: 'La pregunta es obligatoria'
        });
    }

    try {
        const questionEmbedding = await generateEmbedding(question);

        const allDocuments = await Document.find({}).lean();

        if (allDocuments.length === 0) {
            return res.status(404).json({
                error: 'No hay documentos en la base de datos. Ejecuta insertDocs.js primero.'
            });
        }

        const scoredDocs = allDocuments
            .map(d => ({
                ...d,
                similarity: cosineSimilarity(d.embedding, questionEmbedding)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 25);

        console.log('Top 5 candidates:', scoredDocs.slice(0, 5).map(d => ({
            title: d.metadata.title,
            category: d.metadata.category,
            similarity: d.similarity.toFixed(3)
        })));

        const context = scoredDocs.map(d => {
            const meta = d.metadata;
            return `Título: ${meta.title}
Categoría: ${meta.category}
Descripción: ${d.text}`;
        }).join('\n\n---\n\n');

        const finalPrompt = `Tu tarea es filtrar eventos basándote ÚNICAMENTE en lo que el usuario pide.

EVENTOS DISPONIBLES:
${context}

PREGUNTA DEL USUARIO:
${question}

EJEMPLOS DE LO QUE DEBES HACER:

Usuario pregunta: "fútbol"
✓ INCLUIR: "Real Madrid vs FC Barcelona" (Categoría: Fútbol), "Final Copa del Rey" (Categoría: Fútbol)
✗ NO INCLUIR: "David Broncano" (es comedia), "Mad Cool Festival" (es música), "Hans Zimmer" (es música)
Razón: Solo partidos de fútbol, NO conciertos, NO shows, NO festivales

Usuario pregunta: "quiero reírme"  
✓ INCLUIR: "Show de Stand-Up" (Categoría: Comedia), "David Broncano" (Categoría: Comedia)
✗ NO INCLUIR: "Real Madrid vs FC Barcelona" (es fútbol), "Mad Cool" (es música)
Razón: Solo comedia/humor, NO deportes, NO música

Usuario pregunta: "música"
✓ INCLUIR: "Mad Cool Festival", "Primavera Sound" (Categoría: Música)
✗ NO INCLUIR: "Real Madrid vs FC Barcelona" (es fútbol), "David Broncano" (es comedia)
Razón: Solo música, NO deportes, NO comedia

INSTRUCCIONES CRÍTICAS:
1. Lee ATENTAMENTE qué pide el usuario
2. Para CADA evento, mira su título, categoría y descripción
3. Pregúntate: "¿Este evento ES del mismo tipo que lo que pide?"
4. Si el usuario pide fútbol → SOLO fútbol
5. Si pide comedia → SOLO comedia  
6. Si pide música → SOLO música
7. NO mezcles tipos diferentes
8. Si NO estás 100% seguro, NO lo incluyas

Responde SOLO con los títulos EXACTOS de eventos que corresponden.
Si NO hay, responde "NINGUNO".

RESPUESTA:`;

        const llmResponse = await askLLM(finalPrompt, '');
        console.log('=== LLM Response ===');
        console.log(llmResponse);
        console.log('===================');

        const relevantTitles = llmResponse
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && line !== 'NINGUNO' && !line.toLowerCase().startsWith('respuesta'));

        console.log('Relevant Titles from LLM:', relevantTitles);

        let filteredDocs = scoredDocs;
        if (relevantTitles.length > 0 && !llmResponse.toUpperCase().includes('NINGUNO')) {
            filteredDocs = scoredDocs.filter(doc => {
                const docTitle = doc.metadata.title.toLowerCase();

                return relevantTitles.some(title => {
                    const titleLower = title.toLowerCase();

                    const match = docTitle === titleLower ||
                        docTitle.includes(titleLower) ||
                        titleLower.includes(docTitle);

                    if (match) {
                        console.log(`✓ Match: "${docTitle}" ↔ "${titleLower}"`);
                    }

                    return match;
                });
            });

            console.log('Final Filtered Docs:', filteredDocs.map(d => d.metadata.title));

            if (filteredDocs.length === 0 && relevantTitles.length > 0) {
                console.log('WARNING: LLM gave titles but none matched.');
                filteredDocs = [];
            }
        } else if (llmResponse.toUpperCase().includes('NINGUNO')) {
            console.log('LLM returned NINGUNO');
            filteredDocs = [];
        } else {
            console.log('LLM returned empty');
            filteredDocs = [];
        }

        const eventIds = filteredDocs.map(doc => doc.metadata.eventId);
        const relatedEvents = await Event.find({ _id: { $in: eventIds } })
            .populate('category')
            .lean();

        console.log(`Returning ${relatedEvents.length} events`);

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
