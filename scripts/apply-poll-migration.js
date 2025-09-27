const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://miwbzotcuaywpdbidpwo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno de Supabase no encontradas');
    console.error('Necesita SUPABASE_URL y SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    console.log('🚀 Aplicando migración de encuestas...\n');

    const migrations = [
        {
            name: 'Agregar columna attachment_data',
            sql: `ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS attachment_data jsonb;`
        },
        {
            name: 'Eliminar constraint anterior',
            sql: `ALTER TABLE public.community_posts DROP CONSTRAINT IF EXISTS community_posts_attachment_type_check;`
        },
        {
            name: 'Agregar constraint con poll',
            sql: `ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_attachment_type_check CHECK (attachment_type = ANY (ARRAY['image'::text, 'video'::text, 'document'::text, 'link'::text, 'poll'::text]));`
        },
        {
            name: 'Agregar índice para attachment_data',
            sql: `CREATE INDEX IF NOT EXISTS idx_community_posts_attachment_data ON public.community_posts USING gin (attachment_data);`
        },
        {
            name: 'Función initialize_poll_votes',
            sql: `
CREATE OR REPLACE FUNCTION initialize_poll_votes(poll_options text[])
RETURNS jsonb AS $$
DECLARE
    votes_obj jsonb := '{}';
    i integer;
BEGIN
    FOR i IN 0..array_length(poll_options, 1)-1 LOOP
        votes_obj := votes_obj || jsonb_build_object(i::text, '[]'::jsonb);
    END LOOP;
    RETURN votes_obj;
END;
$$ LANGUAGE plpgsql;`
        },
        {
            name: 'Función cast_poll_vote',
            sql: `
CREATE OR REPLACE FUNCTION cast_poll_vote(
    post_id_param uuid,
    user_id_param uuid,
    option_index_param integer
)
RETURNS jsonb AS $$
DECLARE
    current_data jsonb;
    votes_data jsonb;
    option_key text;
    current_votes jsonb;
    prev_vote_option text;
BEGIN
    -- Get current attachment_data
    SELECT attachment_data INTO current_data
    FROM public.community_posts
    WHERE id = post_id_param AND attachment_type = 'poll';

    IF current_data IS NULL THEN
        RAISE EXCEPTION 'Post not found or is not a poll';
    END IF;

    votes_data := current_data->'votes';
    option_key := option_index_param::text;

    -- Remove previous vote if exists
    FOR prev_vote_option IN SELECT jsonb_object_keys(votes_data) LOOP
        current_votes := votes_data->prev_vote_option;
        IF current_votes ? user_id_param::text THEN
            votes_data := votes_data || jsonb_build_object(
                prev_vote_option,
                current_votes - user_id_param::text
            );
            EXIT;
        END IF;
    END LOOP;

    -- Add new vote
    current_votes := COALESCE(votes_data->option_key, '[]'::jsonb);
    votes_data := votes_data || jsonb_build_object(
        option_key,
        current_votes || to_jsonb(user_id_param::text)
    );

    -- Update the post
    UPDATE public.community_posts
    SET attachment_data = current_data || jsonb_build_object('votes', votes_data),
        updated_at = now()
    WHERE id = post_id_param;

    RETURN votes_data;
END;
$$ LANGUAGE plpgsql;`
        },
        {
            name: 'Función get_poll_results',
            sql: `
CREATE OR REPLACE FUNCTION get_poll_results(post_id_param uuid)
RETURNS jsonb AS $$
DECLARE
    poll_data jsonb;
    votes_data jsonb;
    results jsonb := '{}';
    option_key text;
    vote_count integer;
    total_votes integer := 0;
BEGIN
    SELECT attachment_data INTO poll_data
    FROM public.community_posts
    WHERE id = post_id_param AND attachment_type = 'poll';

    IF poll_data IS NULL THEN
        RAISE EXCEPTION 'Post not found or is not a poll';
    END IF;

    votes_data := poll_data->'votes';

    FOR option_key IN SELECT jsonb_object_keys(votes_data) LOOP
        vote_count := jsonb_array_length(votes_data->option_key);
        total_votes := total_votes + vote_count;
        results := results || jsonb_build_object(
            option_key, jsonb_build_object(
                'votes', vote_count,
                'percentage', 0
            )
        );
    END LOOP;

    -- Calculate percentages
    FOR option_key IN SELECT jsonb_object_keys(results) LOOP
        vote_count := (results->option_key->>'votes')::integer;
        results := results || jsonb_build_object(
            option_key, (results->option_key) || jsonb_build_object(
                'percentage', CASE
                    WHEN total_votes > 0 THEN ROUND((vote_count::decimal / total_votes * 100), 1)
                    ELSE 0
                END
            )
        );
    END LOOP;

    RETURN jsonb_build_object(
        'results', results,
        'total_votes', total_votes,
        'question', poll_data->>'question',
        'options', poll_data->'options'
    );
END;
$$ LANGUAGE plpgsql;`
        }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const migration of migrations) {
        try {
            console.log(`🔄 ${migration.name}...`);

            // Para funciones, usar rpc
            if (migration.sql.includes('CREATE OR REPLACE FUNCTION')) {
                const { error } = await supabase.rpc('exec_sql', { sql: migration.sql });
                if (error) {
                    console.error(`❌ ${migration.name}: ${error.message}`);
                    errorCount++;
                } else {
                    console.log(`✅ ${migration.name}: OK`);
                    successCount++;
                }
            } else {
                // Para otros comandos SQL
                const { error } = await supabase.rpc('exec_sql', { sql: migration.sql });
                if (error) {
                    console.error(`❌ ${migration.name}: ${error.message}`);
                    errorCount++;
                } else {
                    console.log(`✅ ${migration.name}: OK`);
                    successCount++;
                }
            }
        } catch (error) {
            console.error(`❌ ${migration.name}: ${error.message}`);
            errorCount++;
        }
    }

    console.log(`\n📊 Resumen de migración:`);
    console.log(`✅ Exitosas: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);

    if (errorCount > 0) {
        console.log(`\n⚠️ Hay errores en la migración. Puede ejecutar manualmente:`);
        console.log(`1. Ir a Supabase Dashboard > SQL Editor`);
        console.log(`2. Copiar y pegar el contenido de database/add_poll_support.sql`);
        console.log(`3. Ejecutar el script`);
    } else {
        console.log(`\n🎉 ¡Migración completada exitosamente!`);
        console.log(`Las encuestas están listas para usar.`);
    }
}

// Función para probar la migración
async function testMigration() {
    console.log('\n🧪 Probando configuración...');

    try {
        // Probar conexión
        const { data, error } = await supabase.from('community_posts').select('count').limit(1);
        if (error) {
            console.error('❌ Error de conexión:', error.message);
            return;
        }
        console.log('✅ Conexión a Supabase OK');

        // Probar si attachment_data existe
        const { data: testData, error: testError } = await supabase
            .from('community_posts')
            .select('attachment_data')
            .limit(1);

        if (testError && testError.message.includes('column "attachment_data" does not exist')) {
            console.log('⚠️ La columna attachment_data no existe - necesita migración');
        } else {
            console.log('✅ La columna attachment_data existe');
        }

        // Probar funciones
        const { error: funcError } = await supabase.rpc('cast_poll_vote', {
            post_id_param: '00000000-0000-0000-0000-000000000000',
            user_id_param: '00000000-0000-0000-0000-000000000000',
            option_index_param: 0
        });

        if (funcError && funcError.message.includes('function cast_poll_vote') && funcError.message.includes('does not exist')) {
            console.log('⚠️ Las funciones de encuesta no existen - necesita migración');
        } else {
            console.log('✅ Las funciones de encuesta están disponibles');
        }

    } catch (error) {
        console.error('❌ Error probando configuración:', error.message);
    }
}

// Ejecutar
async function main() {
    await testMigration();
    await applyMigration();
}

main().catch(console.error);