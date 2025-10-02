const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

// Solo crear el cliente si las variables están disponibles
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente de Supabase inicializado');
} else {
    console.warn('⚠️ Variables de entorno de Supabase no configuradas - funcionando en modo de desarrollo');
}

exports.handler = async (event, context) => {
    // Configurar CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        console.log('📰 News API called:', event.httpMethod, event.path);

        // Solo permitir GET requests
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Método no permitido' })
            };
        }

        // Si Supabase no está disponible, devolver datos de prueba
        if (!supabase) {
            console.log('🔄 Usando datos de prueba (Supabase no disponible)');
            const mockNews = getMockNews();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    news: mockNews,
                    total: mockNews.length,
                    message: 'Noticias de prueba obtenidas exitosamente'
                })
            };
        }

        // Obtener parámetros de consulta
        const { category, limit = 20, offset = 0, featured } = event.queryStringParameters || {};

        console.log('📋 Query parameters:', { category, limit, offset, featured });

        // Construir la consulta base
        let query = supabase
            .from('news')
            .select('*')
            .eq('status', 'published') // Solo noticias publicadas
            .order('published_at', { ascending: false });

        // Aplicar filtros
        if (category) {
            query = query.eq('language', category); // Asumiendo que language se usa para categoría
        }

        if (featured === 'true') {
            // Si tienes un campo featured en la tabla, úsalo
            // query = query.eq('featured', true);
        }

        // Aplicar paginación
        query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        console.log('🔍 Ejecutando consulta a Supabase...');
        const { data, error } = await query;

        if (error) {
            console.error('❌ Error en consulta Supabase:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Error al consultar noticias',
                    details: error.message 
                })
            };
        }

        console.log('✅ Noticias obtenidas:', data?.length || 0);

        // Transformar los datos para que coincidan con el formato esperado por el frontend
        const transformedNews = (data || []).map(news => {
            // Extraer secciones del array
            const sections = news.sections || [];
            const getSectionItems = (kind) => {
                const section = sections.find(s => s.kind === kind);
                return section?.items || [];
            };

            return {
                id: news.id,
                title: news.title,
                subtitle: news.subtitle,
                excerpt: news.intro || news.subtitle || news.title,
                category: news.language || 'general',
                categoryLabel: getCategoryLabel(news.language || 'general'),
                author: 'Chat-Bot-LIA',
                date: news.published_at || news.created_at,
                image: getCategoryIcon(news.language || 'general'),
                views: news.metrics && Array.isArray(news.metrics) ? 
                    (news.metrics.find(m => m.name === 'views')?.value || Math.floor(Math.random() * 1000)) : 
                    Math.floor(Math.random() * 1000),
                comments: Math.floor(Math.random() * 50),
                featured: false,
                hasDetailedView: true,
                detailedData: {
                    tldr: news.tldr || [],
                    suggestedSteps: getSectionItems('steps'),
                    risks: getSectionItems('risks'),
                    resources: Array.isArray(news.links) ? news.links.map(link => ({
                        url: link.url || '#',
                        label: link.label || 'Recurso'
                    })) : [],
                    whyMatters: getSectionItems('why'),
                    whatChanged: getSectionItems('whats_new'),
                    impact: getSectionItems('impact'),
                    cta: news.cta?.label || 'Leer más'
                }
            };
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                news: transformedNews,
                total: transformedNews.length,
                message: 'Noticias obtenidas exitosamente'
            })
        };

    } catch (error) {
        console.error('❌ Error en news API:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                details: error.message 
            })
        };
    }
};

// Función auxiliar para obtener etiquetas de categoría
function getCategoryLabel(category) {
    const labels = {
        'tecnologia': 'Tecnología',
        'ia': 'Inteligencia Artificial',
        'educacion': 'Educación',
        'eventos': 'Eventos',
        'actualizaciones': 'Actualizaciones',
        'general': 'General'
    };
    return labels[category] || 'General';
}

// Función auxiliar para obtener iconos de categoría
function getCategoryIcon(category) {
    const icons = {
        'tecnologia': 'fas fa-microchip',
        'ia': 'fas fa-brain',
        'educacion': 'fas fa-graduation-cap',
        'eventos': 'fas fa-calendar-alt',
        'actualizaciones': 'fas fa-sync-alt',
        'general': 'fas fa-newspaper'
    };
    return icons[category] || 'fas fa-newspaper';
}

// Función para generar datos de prueba cuando Supabase no está disponible
function getMockNews() {
    return [
        {
            id: '1',
            title: 'Nuevas funcionalidades de IA en Chat-Bot-LIA',
            subtitle: 'Descubre las últimas mejoras en inteligencia artificial para profesionales',
            excerpt: 'Chat-Bot-LIA ha implementado nuevas funcionalidades de IA que mejoran significativamente la experiencia del usuario.',
            category: 'ia',
            categoryLabel: 'Inteligencia Artificial',
            author: 'Chat-Bot-LIA',
            date: new Date().toISOString(),
            image: 'fas fa-brain',
            views: 1250,
            comments: 23,
            featured: true,
            hasDetailedView: true,
            detailedData: {
                tldr: [
                    'Nuevas funcionalidades de IA implementadas',
                    'Mejora en la precisión de respuestas',
                    'Interfaz más intuitiva'
                ],
                suggestedSteps: [
                    'Explorar las nuevas funciones en el dashboard',
                    'Probar las mejoras en el chat',
                    'Revisar la documentación actualizada'
                ],
                risks: [
                    'Posibles cambios en el flujo de trabajo',
                    'Necesidad de capacitación adicional'
                ],
                resources: [
                    { url: '#', label: 'Documentación de nuevas funciones' },
                    { url: '#', label: 'Tutorial en video' }
                ],
                whyMatters: [
                    'Mejora la productividad de los usuarios',
                    'Mantiene la competitividad del sistema'
                ],
                whatChanged: [
                    'Algoritmo de IA actualizado',
                    'Nueva interfaz de usuario',
                    'Mejores tiempos de respuesta'
                ],
                impact: [
                    'Aumento del 30% en la satisfacción del usuario',
                    'Reducción del 25% en el tiempo de respuesta'
                ],
                cta: 'Probar nuevas funciones'
            }
        },
        {
            id: '2',
            title: 'Actualización del sistema de cursos',
            subtitle: 'Nuevas mejoras en la plataforma educativa',
            excerpt: 'Hemos actualizado el sistema de cursos con nuevas funcionalidades y mejoras en la experiencia de aprendizaje.',
            category: 'educacion',
            categoryLabel: 'Educación',
            author: 'Chat-Bot-LIA',
            date: new Date(Date.now() - 86400000).toISOString(), // Ayer
            image: 'fas fa-graduation-cap',
            views: 890,
            comments: 15,
            featured: false,
            hasDetailedView: true,
            detailedData: {
                tldr: [
                    'Sistema de cursos actualizado',
                    'Nuevas herramientas de evaluación',
                    'Mejor seguimiento del progreso'
                ],
                suggestedSteps: [
                    'Revisar los cursos actualizados',
                    'Explorar las nuevas herramientas',
                    'Actualizar el perfil de aprendizaje'
                ],
                risks: [
                    'Posible necesidad de reconfigurar preferencias',
                    'Cambios en la interfaz pueden requerir adaptación'
                ],
                resources: [
                    { url: '#', label: 'Guía de nuevos cursos' },
                    { url: '#', label: 'FAQ actualizada' }
                ],
                whyMatters: [
                    'Mejora la experiencia de aprendizaje',
                    'Facilita el seguimiento del progreso'
                ],
                whatChanged: [
                    'Nueva interfaz de cursos',
                    'Sistema de evaluación mejorado',
                    'Mejor tracking de progreso'
                ],
                impact: [
                    'Aumento del 40% en la retención de estudiantes',
                    'Mejora del 35% en las calificaciones'
                ],
                cta: 'Explorar cursos'
            }
        },
        {
            id: '3',
            title: 'Evento: Conferencia de IA 2024',
            subtitle: 'Únete a la conferencia más importante del año sobre inteligencia artificial',
            excerpt: 'No te pierdas la conferencia anual de IA donde expertos compartirán las últimas tendencias y avances.',
            category: 'eventos',
            categoryLabel: 'Eventos',
            author: 'Chat-Bot-LIA',
            date: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
            image: 'fas fa-calendar-alt',
            views: 2100,
            comments: 45,
            featured: true,
            hasDetailedView: true,
            detailedData: {
                tldr: [
                    'Conferencia anual de IA 2024',
                    'Expertos internacionales',
                    'Networking y aprendizaje'
                ],
                suggestedSteps: [
                    'Registrarse en el evento',
                    'Revisar la agenda de ponencias',
                    'Preparar preguntas para los expertos'
                ],
                risks: [
                    'Cupo limitado',
                    'Posible cambio de fechas'
                ],
                resources: [
                    { url: '#', label: 'Registro al evento' },
                    { url: '#', label: 'Agenda completa' }
                ],
                whyMatters: [
                    'Oportunidad de networking',
                    'Acceso a conocimiento de vanguardia'
                ],
                whatChanged: [
                    'Nuevos ponentes confirmados',
                    'Agenda actualizada',
                    'Nuevas modalidades de participación'
                ],
                impact: [
                    'Más de 500 profesionales registrados',
                    '15 ponentes internacionales'
                ],
                cta: 'Registrarse ahora'
            }
        }
    ];
}
