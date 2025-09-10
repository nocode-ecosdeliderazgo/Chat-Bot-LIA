// =====================================================
// ENDPOINT PÚBLICO PARA PREGUNTAS DE COMUNIDAD
// Permite acceso sin autenticación según PROMPT_CLAUDE.md
// =====================================================

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar OPTIONS (preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Solo permitir método GET
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ 
                    error: 'Método no permitido',
                    allowed: ['GET']
                })
            };
        }

        console.log('🌐 [community-public] Solicitud recibida:', {
            method: event.httpMethod,
            query: event.queryStringParameters,
            headers: event.headers
        });

        // Configuración de Supabase
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Variables de entorno de Supabase no configuradas');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Configuración de Supabase faltante',
                    success: false
                })
            };
        }

        // Crear cliente de Supabase
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Cliente de Supabase creado');

        // Obtener parámetros de consulta
        const {
            course_id,
            module_id,
            filter = 'all',
            sort = 'recent',
            limit = 20,
            offset = 0,
            search
        } = event.queryStringParameters || {};

        console.log('📋 Parámetros de consulta:', {
            course_id,
            module_id,
            filter,
            sort,
            limit,
            offset,
            search
        });

        // Construir query base
        let query = supabase
            .from('community_questions')
            .select(`
                id,
                title,
                content,
                created_at,
                updated_at,
                user_id,
                course_id,
                module_id,
                tags,
                votes_count,
                answers_count,
                views_count,
                is_answered,
                is_featured,
                users:user_id (
                    id,
                    username,
                    display_name
                )
            `);

        // Aplicar filtros básicos
        if (course_id) {
            query = query.eq('course_id', course_id);
        }
        if (module_id) {
            query = query.eq('module_id', module_id);
        }
        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        // Aplicar filtros específicos
        switch (filter) {
            case 'unanswered':
                query = query.eq('is_answered', false);
                break;
            case 'answered':
                query = query.eq('is_answered', true);
                break;
            case 'featured':
                query = query.eq('is_featured', true);
                break;
            case 'all':
            default:
                // No aplicar filtro adicional
                break;
        }

        // Aplicar ordenamiento
        switch (sort) {
            case 'votes':
                query = query.order('votes_count', { ascending: false });
                break;
            case 'answers':
                query = query.order('answers_count', { ascending: false });
                break;
            case 'views':
                query = query.order('views_count', { ascending: false });
                break;
            case 'recent':
            default:
                query = query.order('created_at', { ascending: false });
                break;
        }

        // Aplicar paginación
        const limitNum = Math.min(parseInt(limit) || 20, 100); // Máximo 100
        const offsetNum = parseInt(offset) || 0;
        query = query.range(offsetNum, offsetNum + limitNum - 1);

        console.log('📡 Ejecutando consulta...');
        const { data: questions, error } = await query;
        
        if (error) {
            console.error('❌ Error en consulta Supabase:', error);
            throw error;
        }

        console.log(`✅ ${questions.length} preguntas públicas obtenidas`);
        
        // Procesar datos para respuesta
        const processedQuestions = questions.map(question => ({
            ...question,
            // Asegurar que los datos del usuario estén disponibles
            user: question.users || {
                id: question.user_id,
                username: 'Usuario anónimo',
                display_name: 'Usuario anónimo'
            },
            // Remover referencia redundante
            users: undefined,
            // Agregar campos calculados
            time_ago: calculateTimeAgo(question.created_at),
            preview: question.content ? question.content.substring(0, 150) + '...' : ''
        }));

        // Respuesta exitosa
        const response = {
            success: true,
            data: processedQuestions,
            pagination: {
                limit: limitNum,
                offset: offsetNum,
                count: questions.length,
                hasMore: questions.length === limitNum
            },
            filters: {
                course_id,
                module_id,
                filter,
                sort,
                search
            },
            timestamp: new Date().toISOString()
        };

        console.log('✅ Respuesta preparada exitosamente');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };
        
    } catch (error) {
        console.error('❌ Error en community-public:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

// Función auxiliar para calcular tiempo transcurrido
function calculateTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Ahora mismo';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    } else {
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}