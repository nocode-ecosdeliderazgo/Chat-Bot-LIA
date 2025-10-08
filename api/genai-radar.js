/**
 * ENDPOINT PARA RADAR GENAI
 * ========================
 * 
 * Endpoint para obtener datos del radar de competencias GenAI
 * Funciona tanto para Express.js como para Netlify Functions
 */

const { Client } = require('pg');

// Configuración de base de datos
const DB_CONFIG = {
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/database',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Función principal para obtener datos del radar
async function getGenAIRadarData(userId) {
    const client = new Client(DB_CONFIG);
    
    try {
        await client.connect();
        console.log('✅ Conexión a PostgreSQL establecida para GenAI radar');
        
        // Query para obtener los últimos datos del radar por usuario
        const query = `
            WITH user_responses AS (
                SELECT 
                    r.user_id,
                    r.pregunta_id,
                    r.valor->>'answer' as answer,
                    r.respondido_en,
                    p.bloque,
                    p.scoring
                FROM respuestas r
                JOIN preguntas p ON p.id = r.pregunta_id
                WHERE r.user_id = $1 
                    AND p.section = 'Cuestionario'
                ORDER BY r.respondido_en DESC
            ),
            scores_calculados AS (
                SELECT 
                    user_id,
                    COUNT(*) as total_questions,
                    COUNT(CASE WHEN bloque = 'Adopción' THEN 1 END) as adoption_questions,
                    COUNT(CASE WHEN bloque = 'Conocimiento' THEN 1 END) as knowledge_questions,
                    AVG(CASE WHEN bloque = 'Adopción' THEN 
                        CASE 
                            WHEN answer = 'A' THEN 1
                            WHEN answer = 'B' THEN 2
                            WHEN answer = 'C' THEN 3
                            WHEN answer = 'D' THEN 4
                            WHEN answer = 'E' THEN 5
                            ELSE 0
                        END
                    END) as adoption_score,
                    AVG(CASE WHEN bloque = 'Conocimiento' THEN 
                        CASE 
                            WHEN answer = 'A' THEN 20
                            WHEN answer = 'B' THEN 40
                            WHEN answer = 'C' THEN 60
                            WHEN answer = 'D' THEN 80
                            WHEN answer = 'E' THEN 100
                            ELSE 0
                        END
                    END) as knowledge_score
                FROM user_responses
                GROUP BY user_id
            )
            SELECT 
                ur.user_id,
                u.username,
                u.email,
                sc.total_questions,
                sc.adoption_questions,
                sc.knowledge_questions,
                sc.adoption_score,
                sc.knowledge_score,
                (sc.adoption_score + sc.knowledge_score) / 2 as total_score,
                CASE 
                    WHEN (sc.adoption_score + sc.knowledge_score) / 2 >= 70 THEN 'Avanzado'
                    WHEN (sc.adoption_score + sc.knowledge_score) / 2 >= 40 THEN 'Intermedio'
                    ELSE 'Básico'
                END as classification,
                MAX(ur.respondido_en) as completed_at
            FROM user_responses ur
            JOIN scores_calculados sc ON sc.user_id = ur.user_id
            LEFT JOIN users u ON u.id = ur.user_id
            GROUP BY ur.user_id, u.username, u.email, sc.total_questions, sc.adoption_questions, 
                     sc.knowledge_questions, sc.adoption_score, sc.knowledge_score
            ORDER BY completed_at DESC
            LIMIT 1
        `;
        
        const result = await client.query(query, [userId]);
        
        if (result.rows.length === 0) {
            console.log(`📭 No se encontraron datos GenAI para userId: ${userId}`);
            return {
                hasData: false,
                message: 'No hay datos de cuestionario GenAI completado',
                userId: userId,
                dataSource: 'preguntas_respuestas'
            };
        }
        
        const row = result.rows[0];
        
        // Formatear datos para el radar chart
        const radarData = {
            hasData: true,
            session_id: 'session-' + row.user_id + '-' + Date.now(),
            userId: row.user_id,
            username: row.username,
            email: row.email,
            genaiArea: 'Operaciones', // Por defecto, se puede mejorar obteniendo el área real
            
            // Scores principales
            totalScore: parseFloat(row.total_score) || 0,
            adoptionScore: parseFloat(row.adoption_score) || 0,
            knowledgeScore: parseFloat(row.knowledge_score) || 0,
            classification: row.classification,
            completedAt: row.completed_at,
            
            // Datos para radar chart (5 dimensiones)
            // Mapear los 2 scores GenAI a 5 dimensiones del radar original
            conocimiento: parseFloat(row.knowledge_score) || 0,
            aplicacion: parseFloat(row.adoption_score) || 0,
            productividad: parseFloat(row.adoption_score) || 0, // Usar adopción como proxy
            estrategia: parseFloat(row.total_score) || 0, // Usar score total como estrategia
            inversion: Math.min(parseFloat(row.total_score) || 0, 80), // Cap a 80 para ser realista
            
            dataSource: 'preguntas_respuestas'
        };
        
        console.log('📊 Datos GenAI radar obtenidos:', {
            userId: radarData.userId,
            genaiArea: radarData.genaiArea,
            totalScore: radarData.totalScore,
            classification: radarData.classification
        });
        
        return radarData;
        
    } catch (error) {
        console.error('❌ Error obteniendo datos GenAI radar:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Función para Express.js
async function expressHandler(req, res) {
    // Configurar CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const userId = req.params.userId || req.query.userId;
        
        if (!userId) {
            return res.status(400).json({
                error: 'userId es requerido',
                message: 'Proporciona userId como parámetro de ruta o query'
            });
        }
        
        console.log(`🎯 Obteniendo datos GenAI radar para userId: ${userId}`);
        
        const radarData = await getGenAIRadarData(userId);
        
        res.json(radarData);
        
    } catch (error) {
        console.error('❌ Error en endpoint GenAI radar:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message,
            hasData: false
        });
    }
}

// Función para Netlify Functions
async function netlifyHandler(event, context) {
    // Configurar CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    try {
        // Extraer userId de la ruta o query parameters
        const pathSegments = event.path.split('/');
        const userId = pathSegments[pathSegments.length - 1] || event.queryStringParameters?.userId;
        
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'userId es requerido',
                    message: 'Proporciona userId como parámetro de ruta o query'
                })
            };
        }
        
        console.log(`🎯 [Netlify] Obteniendo datos GenAI radar para userId: ${userId}`);
        
        const radarData = await getGenAIRadarData(userId);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(radarData)
        };
        
    } catch (error) {
        console.error('❌ [Netlify] Error en función GenAI radar:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                message: error.message,
                hasData: false
            })
        };
    }
}

// Función para crear datos de prueba (desarrollo)
async function createTestData(userId) {
    console.log(`🧪 Creando datos de prueba para userId: ${userId}`);
    
    // Datos realistas basados en un perfil de CEO intermedio
    return {
        hasData: true,
        session_id: 'test-session-' + Date.now(),
        userId: userId,
        username: 'usuario_prueba',
        email: 'test@example.com',
        genaiArea: 'CEO/Alta Dirección',
        
        totalScore: 65,
        adoptionScore: 70,
        knowledgeScore: 60,
        classification: 'Intermedio',
        completedAt: new Date().toISOString(),
        
        // Datos para radar chart
        conocimiento: 60,    // Conocimiento técnico
        aplicacion: 70,      // Uso práctico
        productividad: 68,   // Impacto en productividad
        estrategia: 65,      // Visión estratégica
        inversion: 55,       // Disposición a invertir
        
        dataSource: 'test_data'
    };
}

// Exportar funciones
module.exports = {
    getGenAIRadarData,
    expressHandler,
    netlifyHandler,
    createTestData
};

// Para uso directo en Express.js
if (require.main === module) {
    const express = require('express');
    const app = express();
    const port = process.env.PORT || 3001;
    
    // Middleware
    app.use(express.json());
    
    // Rutas
    app.get('/api/genai-radar/:userId', expressHandler);
    app.get('/api/genai-radar', expressHandler);
    
    // Ruta de prueba
    app.get('/api/genai-radar/test/:userId', async (req, res) => {
        try {
            const testData = await createTestData(req.params.userId);
            res.json(testData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    app.listen(port, () => {
        console.log(`🚀 Servidor GenAI radar ejecutándose en puerto ${port}`);
        console.log(`📡 Endpoints disponibles:`);
        console.log(`   GET /api/genai-radar/:userId`);
        console.log(`   GET /api/genai-radar/test/:userId`);
    });
}