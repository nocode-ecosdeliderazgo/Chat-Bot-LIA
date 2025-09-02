/**
 * NETLIFY FUNCTION: ADOPCIÓN GENAI
 * ================================
 * 
 * Función serverless para obtener datos de adopción de GenAI por países
 * Compatible con la ruta /api/adopcion-genai
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

// Inicializar cliente Supabase
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client inicializado en Netlify Function');
} else {
    console.warn('⚠️ Variables de Supabase no encontradas');
}

// Datos de fallback en caso de no tener conexión a Supabase
const fallbackData = [
    {
        pais: 'Estados Unidos',
        indice_aipi: 85.2,
        region: 'Norte América',
        poblacion_millones: 332.4,
        pib_billones_usd: 25.46,
        sector_dominante: 'Tecnología'
    },
    {
        pais: 'China',
        indice_aipi: 82.7,
        region: 'Asia',
        poblacion_millones: 1412.4,
        pib_billones_usd: 17.73,
        sector_dominante: 'Manufactura'
    },
    {
        pais: 'Reino Unido',
        indice_aipi: 78.5,
        region: 'Europa',
        poblacion_millones: 67.9,
        pib_billones_usd: 3.13,
        sector_dominante: 'Servicios Financieros'
    },
    {
        pais: 'Singapur',
        indice_aipi: 77.8,
        region: 'Asia-Pacífico',
        poblacion_millones: 5.9,
        pib_billones_usd: 0.40,
        sector_dominante: 'Servicios Financieros'
    },
    {
        pais: 'Alemania',
        indice_aipi: 76.2,
        region: 'Europa',
        poblacion_millones: 83.2,
        pib_billones_usd: 4.26,
        sector_dominante: 'Manufactura'
    },
    {
        pais: 'Canadá',
        indice_aipi: 74.9,
        region: 'Norte América',
        poblacion_millones: 38.2,
        pib_billones_usd: 2.14,
        sector_dominante: 'Recursos Naturales'
    },
    {
        pais: 'Francia',
        indice_aipi: 73.1,
        region: 'Europa',
        poblacion_millones: 67.4,
        pib_billones_usd: 2.94,
        sector_dominante: 'Servicios'
    },
    {
        pais: 'Australia',
        indice_aipi: 71.6,
        region: 'Oceanía',
        poblacion_millones: 25.7,
        pib_billones_usd: 1.55,
        sector_dominante: 'Servicios'
    },
    {
        pais: 'Japón',
        indice_aipi: 70.3,
        region: 'Asia',
        poblacion_millones: 125.8,
        pib_billones_usd: 4.94,
        sector_dominante: 'Tecnología'
    },
    {
        pais: 'Corea del Sur',
        indice_aipi: 69.8,
        region: 'Asia',
        poblacion_millones: 51.8,
        pib_billones_usd: 1.81,
        sector_dominante: 'Tecnología'
    },
    {
        pais: 'Suecia',
        indice_aipi: 68.5,
        region: 'Europa',
        poblacion_millones: 10.4,
        pib_billones_usd: 0.64,
        sector_dominante: 'Tecnología'
    },
    {
        pais: 'Países Bajos',
        indice_aipi: 67.9,
        region: 'Europa',
        poblacion_millones: 17.4,
        pib_billones_usd: 1.01,
        sector_dominante: 'Servicios'
    },
    {
        pais: 'Suiza',
        indice_aipi: 66.4,
        region: 'Europa',
        poblacion_millones: 8.7,
        pib_billones_usd: 0.81,
        sector_dominante: 'Servicios Financieros'
    },
    {
        pais: 'Dinamarca',
        indice_aipi: 65.2,
        region: 'Europa',
        poblacion_millones: 5.8,
        pib_billones_usd: 0.40,
        sector_dominante: 'Servicios'
    },
    {
        pais: 'España',
        indice_aipi: 58.7,
        region: 'Europa',
        poblacion_millones: 47.4,
        pib_billones_usd: 1.42,
        sector_dominante: 'Servicios'
    }
];

// Función para obtener datos de adopción
async function getAdoptionData() {
    if (!supabase) {
        console.log('📊 Usando datos de fallback por falta de configuración Supabase');
        return fallbackData;
    }
    
    try {
        const { data, error } = await supabase
            .from('adopcion_genai')
            .select('*')
            .order('indice_aipi', { ascending: false });
        
        if (error) {
            console.error('❌ Error obteniendo datos de adopción:', error);
            console.log('📊 Fallback: usando datos estáticos');
            return fallbackData;
        }
        
        if (!data || data.length === 0) {
            console.log('📊 No hay datos en Supabase, usando datos de fallback');
            return fallbackData;
        }
        
        console.log(`✅ Datos de adopción obtenidos de Supabase: ${data.length} países`);
        return data;
        
    } catch (error) {
        console.error('❌ Error conectando a Supabase:', error);
        console.log('📊 Fallback: usando datos estáticos');
        return fallbackData;
    }
}

// Handler principal de Netlify
exports.handler = async (event, context) => {
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
    
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }
    
    try {
        console.log('🌍 [Netlify] Obteniendo datos de adopción GenAI por países...');
        
        const data = await getAdoptionData();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        console.error('❌ [Netlify] Error en función adopción GenAI:', error);
        
        // En caso de error, retornar datos de fallback
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                data: fallbackData,
                warning: 'Datos de fallback por error en base de datos',
                originalError: error.message
            })
        };
    }
};