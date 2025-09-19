// =====================================================
// SCRIPT: Inicializar Comunidades
// Crear comunidades iniciales en la tabla communities
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas');
    console.error('Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu archivo .env');
    console.error('SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ Faltante');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Datos de las comunidades iniciales
const communities = [
    {
        id: '1',
        slug: 'comunidad-general',
        name: 'Comunidad General',
        description: 'Espacio principal para discusiones generales sobre inteligencia artificial, aprendizaje y tecnología educativa. Aquí puedes compartir dudas, experiencias y conectar con otros estudiantes.',
        category: 'general',
        banner_url: 'src/Community/images/comunidad-general.png',
        icon: 'bx-group',
        is_active: true,
        is_public: true,
        requires_approval: false,
        access_level: 'public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        slug: 'comunidad-rba',
        name: 'Comunidad RBA',
        description: 'Comunidad especializada en RBA (Robotic Process Automation) y automatización inteligente. Comparte estrategias, herramientas y casos de éxito en automatización de procesos.',
        category: 'desarrollo',
        banner_url: 'src/Community/images/comunidad-RBA.png',
        icon: 'bx-bot',
        is_active: true,
        is_public: true,
        requires_approval: false,
        access_level: 'public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        slug: 'liga-diamante',
        name: 'Liga Diamante',
        description: 'Comunidad exclusiva para estudiantes de alto rendimiento y expertos en IA. Acceso a contenido avanzado, mentoría especializada y proyectos de investigación.',
        category: 'ia',
        banner_url: 'src/Community/images/liga-diamante.png',
        icon: 'bx-diamond',
        is_active: true,
        is_public: false,
        requires_approval: true,
        access_level: 'premium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '4',
        slug: 'liga-platino',
        name: 'Liga Platino',
        description: 'Comunidad para estudiantes avanzados con experiencia intermedia en IA. Proyectos colaborativos, certificaciones y networking profesional.',
        category: 'ia',
        banner_url: 'src/Community/images/liga-platino.png',
        icon: 'bx-medal',
        is_active: true,
        is_public: false,
        requires_approval: true,
        access_level: 'intermediate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '5',
        slug: 'liga-oro',
        name: 'Liga Oro',
        description: 'Comunidad para estudiantes que han completado cursos básicos y buscan profundizar en aplicaciones prácticas de IA. Workshops y proyectos hands-on.',
        category: 'ia',
        banner_url: 'src/Community/images/liga-oro.png',
        icon: 'bx-trophy',
        is_active: true,
        is_public: true,
        requires_approval: false,
        access_level: 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '6',
        slug: 'openminder',
        name: 'OpenMinder',
        description: 'Comunidad de innovadores y pensadores creativos enfocada en el futuro de la educación con IA. Brainstorming, ideas disruptivas y experimentación.',
        category: 'negocios',
        banner_url: 'src/Community/images/openminder.png',
        icon: 'bx-brain',
        is_active: true,
        is_public: true,
        requires_approval: false,
        access_level: 'public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

async function createCommunitiesTable() {
    console.log('📊 Verificando estructura de tabla communities...');

    // Primero verificamos si la tabla ya existe consultando una sola fila
    try {
        const { data, error } = await supabase
            .from('communities')
            .select('*')
            .limit(1);

        if (error && error.message.includes('relation "communities" does not exist')) {
            console.log('🏗️ Creando tabla communities...');

            // Crear tabla communities
            const { error: createError } = await supabase.rpc('create_communities_table', {});

            if (createError) {
                console.error('❌ Error creando tabla communities:', createError);
                // Intentamos crear la tabla manualmente si no existe la función
                console.log('🔧 Intentando crear tabla manualmente...');

                const createTableSQL = `
                CREATE TABLE IF NOT EXISTS communities (
                    id TEXT PRIMARY KEY,
                    slug TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    category TEXT DEFAULT 'general',
                    banner_url TEXT,
                    icon TEXT,
                    is_active BOOLEAN DEFAULT true,
                    is_public BOOLEAN DEFAULT true,
                    requires_approval BOOLEAN DEFAULT false,
                    access_level TEXT DEFAULT 'public',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );

                -- Habilitar RLS
                ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

                -- Política para lectura pública
                CREATE POLICY "Communities are viewable by everyone" ON communities
                    FOR SELECT USING (true);

                -- Política para inserción (solo administradores)
                CREATE POLICY "Communities can be inserted by authenticated users" ON communities
                    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

                -- Política para actualización (solo administradores)
                CREATE POLICY "Communities can be updated by authenticated users" ON communities
                    FOR UPDATE USING (auth.uid() IS NOT NULL);
                `;

                // Nota: En un entorno real, esto se haría a través de migraciones de Supabase
                console.warn('⚠️ Para crear la tabla, ejecuta este SQL en el panel de Supabase:');
                console.log(createTableSQL);
                return false;
            }
        } else if (error) {
            console.error('❌ Error consultando tabla communities:', error);
            return false;
        }

        console.log('✅ Tabla communities existe y es accesible');
        return true;
    } catch (error) {
        console.error('❌ Error verificando tabla communities:', error);
        return false;
    }
}

async function insertCommunities() {
    console.log('🏘️ Insertando comunidades iniciales...');

    // Verificar si ya hay comunidades
    const { data: existing, error: checkError } = await supabase
        .from('communities')
        .select('id, name')
        .limit(10);

    if (checkError) {
        console.error('❌ Error verificando comunidades existentes:', checkError);
        return false;
    }

    if (existing && existing.length > 0) {
        console.log(`📋 Ya existen ${existing.length} comunidades:`);
        existing.forEach(community => {
            console.log(`  • ${community.name} (ID: ${community.id})`);
        });

        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            readline.question('¿Deseas reemplazar las comunidades existentes? (y/N): ', resolve);
        });
        readline.close();

        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('🛑 Operación cancelada por el usuario');
            return true;
        }

        // Eliminar comunidades existentes
        console.log('🗑️ Eliminando comunidades existentes...');
        const { error: deleteError } = await supabase
            .from('communities')
            .delete()
            .neq('id', '');

        if (deleteError) {
            console.error('❌ Error eliminando comunidades existentes:', deleteError);
            return false;
        }
    }

    // Insertar nuevas comunidades
    console.log('📝 Insertando nuevas comunidades...');
    const { data, error } = await supabase
        .from('communities')
        .insert(communities)
        .select();

    if (error) {
        console.error('❌ Error insertando comunidades:', error);
        console.error('Detalles del error:', JSON.stringify(error, null, 2));
        return false;
    }

    console.log(`✅ ${data.length} comunidades insertadas exitosamente:`);
    data.forEach(community => {
        console.log(`  • ${community.name} (${community.slug})`);
    });

    return true;
}

async function verifyInsert() {
    console.log('🔍 Verificando inserción...');

    const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error('❌ Error verificando comunidades:', error);
        return false;
    }

    console.log(`📊 Comunidades activas encontradas: ${data.length}`);
    data.forEach(community => {
        console.log(`  • ${community.name} (${community.category}) - ${community.access_level}`);
    });

    return true;
}

async function main() {
    console.log('🚀 Iniciando configuración de comunidades...\n');

    try {
        // Paso 1: Verificar/crear tabla
        const tableReady = await createCommunitiesTable();
        if (!tableReady) {
            console.error('❌ No se pudo verificar la tabla communities');
            process.exit(1);
        }

        // Paso 2: Insertar comunidades
        const insertSuccess = await insertCommunities();
        if (!insertSuccess) {
            console.error('❌ Error insertando comunidades');
            process.exit(1);
        }

        // Paso 3: Verificar inserción
        const verifySuccess = await verifyInsert();
        if (!verifySuccess) {
            console.error('❌ Error verificando inserción');
            process.exit(1);
        }

        console.log('\n🎉 ¡Configuración de comunidades completada exitosamente!');
        console.log('📱 Las comunidades ahora deberían aparecer en src/Community/community.html');

    } catch (error) {
        console.error('❌ Error general:', error);
        process.exit(1);
    }
}

// Ejecutar script si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { main, insertCommunities, verifyInsert };