import axios from 'axios';

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-gte-small';
const LLM_MODEL = process.env.LLM_MODEL || 'microsoft/phi-3-mini-4k-instruct';

export async function generateEmbedding(text) {
    try {
        const response = await axios.post(`${LM_STUDIO_URL}/v1/embeddings`, {
            model: EMBEDDING_MODEL,
            input: text
        });

        if (response.data && response.data.data && response.data.data[0]) {
            return response.data.data[0].embedding;
        }

        throw new Error('No se pudo generar el embedding');
    } catch (error) {
        console.error('Error generando embedding:', error.message);
        throw error;
    }
}

export function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (normA * normB);
}

export async function findSimilarDocuments(queryEmbedding, documents, limit = 5) {
    const similarities = documents.map(doc => ({
        document: doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, limit).map(item => item.document);
}

export function buildContext(documents) {
    if (!documents || documents.length === 0) {
        return 'No se encontraron eventos relevantes en la base de datos.';
    }

    let context = 'Eventos disponibles en el catálogo:\n\n';

    documents.forEach((doc, index) => {
        const meta = doc.metadata;
        context += `${index + 1}. ${meta.title}\n`;
        context += `   - Categoría: ${meta.category}\n`;
        context += `   - Precio: ${meta.price} ${meta.currency}\n`;
        context += `   - Fecha: ${new Date(meta.date).toLocaleDateString('es-ES')}\n`;
        context += `   - Ubicación: ${meta.location || 'No especificada'}\n`;
        context += `   - Descripción: ${doc.text}\n\n`;
    });

    return context;
}

export async function askLLM(prompt, context = '') {
    try {
        const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

        const response = await axios.post(`${LM_STUDIO_URL}/v1/chat/completions`, {
            model: LLM_MODEL,
            messages: [
                { role: 'user', content: fullPrompt }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        if (response.data && response.data.choices && response.data.choices[0]) {
            return response.data.choices[0].message.content;
        }

        throw new Error('No se pudo obtener respuesta del LLM');
    } catch (error) {
        console.error('Error consultando LLM:', error.message);
        throw error;
    }
}
