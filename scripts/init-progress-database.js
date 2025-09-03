const { Pool } = require('pg');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initializeProgressDatabase() {
  console.log('🚀 Inicializando sistema de progreso de cursos...');
  console.log('🔗 Conectando a:', process.env.DATABASE_URL ? 'Base de datos configurada' : 'Sin DATABASE_URL');
  
  const client = await pool.connect();
  
  try {
    // 1. Verificar conexión
    const { rows: versionRows } = await client.query('SELECT version()');
    console.log('✅ Conectado a PostgreSQL:', versionRows[0].version.split(' ')[0]);
    
    // 2. Verificar tabla users
    const { rows: userTableCheck } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (userTableCheck.length === 0) {
      console.log('⚠️ Tabla users no encontrada. Creando...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT,
          password_hash TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      console.log('✅ Tabla users creada');
    }
    
    // 3. Crear usuario demo
    await client.query(`
      INSERT INTO users (id, username, email, password_hash) 
      VALUES (
        '00000000-0000-0000-0000-000000000001', 
        'demo-user', 
        'demo@chatonline.com',
        '$2b$10$demo.hash.for.testing.purposes.only'
      )
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('✅ Usuario demo asegurado');
    
    // 4. Ejecutar schema del curso-progress-schema.sql
    console.log('📋 Aplicando schema de progreso...');
    
    // Eliminar tablas existentes si existen
    await client.query(`
      DROP TABLE IF EXISTS video_section_progress CASCADE;
      DROP TABLE IF EXISTS module_progress CASCADE;
      DROP TABLE IF EXISTS course_progress CASCADE;
    `);
    
    // Leer y ejecutar el schema
    const schemaSQL = `
-- Tabla principal de progreso de cursos
CREATE TABLE IF NOT EXISTS course_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID DEFAULT NULL,
    course_identifier TEXT NOT NULL,
    overall_progress_percentage INTEGER DEFAULT 0 CHECK (overall_progress_percentage >= 0 AND overall_progress_percentage <= 100),
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')),
    started_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_user_course UNIQUE (user_id, course_identifier)
);

-- Tabla de progreso por módulos
CREATE TABLE IF NOT EXISTS module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_progress_id UUID NOT NULL REFERENCES course_progress(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_number INTEGER NOT NULL CHECK (module_number >= 1),
    module_name TEXT NOT NULL,
    module_identifier TEXT NOT NULL,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    video_id TEXT,
    video_progress_percentage INTEGER DEFAULT 0 CHECK (video_progress_percentage >= 0 AND video_progress_percentage <= 100),
    video_completed BOOLEAN DEFAULT FALSE,
    last_video_position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_user_module UNIQUE (user_id, course_progress_id, module_number)
);

-- Tabla de progreso por secciones de video
CREATE TABLE IF NOT EXISTS video_section_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_progress_id UUID NOT NULL REFERENCES module_progress(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section_number INTEGER NOT NULL CHECK (section_number >= 1),
    section_name TEXT,
    start_time_seconds INTEGER NOT NULL,
    end_time_seconds INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_user_section UNIQUE (user_id, module_progress_id, section_number)
);
    `;
    
    await client.query(schemaSQL);
    console.log('✅ Tablas principales creadas');
    
    // 5. Crear índices
    console.log('📊 Creando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_course_progress_status ON course_progress(status);
      CREATE INDEX IF NOT EXISTS idx_module_progress_course_id ON module_progress(course_progress_id);
      CREATE INDEX IF NOT EXISTS idx_module_progress_user_id ON module_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_module_progress_status ON module_progress(status);
      CREATE INDEX IF NOT EXISTS idx_module_progress_module_number ON module_progress(module_number);
      CREATE INDEX IF NOT EXISTS idx_video_section_progress_module_id ON video_section_progress(module_progress_id);
      CREATE INDEX IF NOT EXISTS idx_video_section_progress_user_id ON video_section_progress(user_id);
    `);
    console.log('✅ Índices creados');
    
    // 6. Crear funciones y triggers
    console.log('⚙️ Creando funciones y triggers...');
    
    // Función para actualizar progreso del curso
    await client.query(`
      CREATE OR REPLACE FUNCTION update_course_progress()
      RETURNS TRIGGER AS $$
      BEGIN
          UPDATE course_progress 
          SET overall_progress_percentage = (
              SELECT COALESCE(
                  ROUND(AVG(progress_percentage)::numeric, 0)::integer, 
                  0
              )
              FROM module_progress 
              WHERE course_progress_id = NEW.course_progress_id
          ),
          last_accessed_at = now(),
          updated_at = now(),
          status = CASE 
              WHEN (SELECT COALESCE(AVG(progress_percentage), 0) FROM module_progress WHERE course_progress_id = NEW.course_progress_id) >= 100 THEN 'completed'
              WHEN (SELECT COALESCE(AVG(progress_percentage), 0) FROM module_progress WHERE course_progress_id = NEW.course_progress_id) > 0 THEN 'in_progress'
              ELSE 'not_started'
          END,
          completed_at = CASE 
              WHEN (SELECT COALESCE(AVG(progress_percentage), 0) FROM module_progress WHERE course_progress_id = NEW.course_progress_id) >= 100 
              THEN COALESCE(completed_at, now())
              ELSE NULL
          END
          WHERE id = NEW.course_progress_id;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Trigger
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_course_progress ON module_progress;
      CREATE TRIGGER trigger_update_course_progress
          AFTER INSERT OR UPDATE ON module_progress
          FOR EACH ROW EXECUTE FUNCTION update_course_progress();
    `);
    
    // Función de inicialización
    await client.query(`
      CREATE OR REPLACE FUNCTION initialize_course_progress(
          p_user_id UUID,
          p_course_identifier TEXT,
          p_course_modules JSONB DEFAULT NULL
      )
      RETURNS UUID AS $$
      DECLARE
          v_course_progress_id UUID;
          v_module JSONB;
      BEGIN
          INSERT INTO course_progress (user_id, course_identifier, status, started_at)
          VALUES (p_user_id, p_course_identifier, 'in_progress', now())
          ON CONFLICT (user_id, course_identifier) 
          DO UPDATE SET 
              last_accessed_at = now(),
              updated_at = now(),
              status = CASE WHEN course_progress.status = 'not_started' THEN 'in_progress' ELSE course_progress.status END,
              started_at = CASE WHEN course_progress.started_at IS NULL THEN now() ELSE course_progress.started_at END
          RETURNING id INTO v_course_progress_id;
          
          IF p_course_modules IS NOT NULL THEN
              FOR v_module IN SELECT * FROM jsonb_array_elements(p_course_modules)
              LOOP
                  INSERT INTO module_progress (
                      course_progress_id, user_id, module_number, module_name, 
                      module_identifier, status, video_id
                  )
                  VALUES (
                      v_course_progress_id, p_user_id, (v_module->>'number')::integer,
                      v_module->>'name', v_module->>'identifier',
                      CASE WHEN (v_module->>'number')::integer = 1 THEN 'in_progress' ELSE 'locked' END,
                      v_module->>'video_id'
                  )
                  ON CONFLICT (user_id, course_progress_id, module_number) 
                  DO UPDATE SET
                      status = CASE 
                          WHEN (v_module->>'number')::integer = 1 THEN 'in_progress'
                          ELSE module_progress.status 
                      END,
                      last_accessed_at = now(),
                      updated_at = now();
              END LOOP;
          END IF;
          
          RETURN v_course_progress_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Vista
    await client.query(`
      CREATE OR REPLACE VIEW user_course_progress_view AS
      SELECT 
          cp.id as course_progress_id,
          cp.user_id,
          cp.course_identifier,
          cp.overall_progress_percentage,
          cp.status as course_status,
          cp.started_at as course_started_at,
          cp.last_accessed_at,
          cp.completed_at as course_completed_at,
          json_agg(
              json_build_object(
                  'module_id', mp.id,
                  'module_number', mp.module_number,
                  'module_name', mp.module_name,
                  'module_identifier', mp.module_identifier,
                  'status', mp.status,
                  'progress_percentage', mp.progress_percentage,
                  'video_id', mp.video_id,
                  'video_progress', mp.video_progress_percentage,
                  'video_completed', mp.video_completed,
                  'last_video_position', mp.last_video_position,
                  'time_spent_minutes', mp.time_spent_minutes,
                  'started_at', mp.started_at,
                  'completed_at', mp.completed_at
              ) ORDER BY mp.module_number
          ) as modules
      FROM course_progress cp
      LEFT JOIN module_progress mp ON cp.id = mp.course_progress_id
      GROUP BY cp.id, cp.user_id, cp.course_identifier, cp.overall_progress_percentage, 
               cp.status, cp.started_at, cp.last_accessed_at, cp.completed_at;
    `);
    
    console.log('✅ Funciones y triggers creados');
    
    // 7. Inicializar progreso demo
    console.log('🎯 Creando progreso demo...');
    
    const courseModules = [
      { number: 1, name: '¿Qué es la IA?', identifier: 'module-1-intro-ia', video_id: 'Yy_eZ65jzmo' },
      { number: 2, name: 'Historia de la IA', identifier: 'module-2-history-ia', video_id: 'dhsy6epaJGs' },
      { number: 3, name: 'Fundamentos del ML', identifier: 'module-3-ml-fundamentals', video_id: 'DvyOm9HeT-k' },
      { number: 4, name: 'Redes Neuronales', identifier: 'module-4-neural-networks', video_id: 'oiKj0Z_Xnjc' },
      { number: 5, name: 'Aplicaciones Prácticas', identifier: 'module-5-applications', video_id: 'HMoaRIbOaN0' }
    ];
    
    const { rows: initResult } = await client.query(
      'SELECT initialize_course_progress($1, $2, $3) as course_progress_id',
      ['00000000-0000-0000-0000-000000000001', 'intro-to-ai', JSON.stringify(courseModules)]
    );
    
    console.log('✅ Progreso demo creado:', initResult[0].course_progress_id);
    
    // 8. Verificación final
    console.log('🔍 Verificación final...');
    
    const { rows: finalCheck } = await client.query(`
      SELECT 
        'course_progress' as table_name,
        count(*) as records
      FROM course_progress
      UNION ALL
      SELECT 
        'module_progress' as table_name,
        count(*) as records
      FROM module_progress
      ORDER BY table_name
    `);
    
    console.log('📊 Estado final:');
    finalCheck.forEach(row => {
      console.log(`   ${row.table_name}: ${row.records} registros`);
    });
    
    console.log('🎉 ¡Sistema de progreso inicializado exitosamente!');
    console.log('');
    console.log('💡 Próximos pasos:');
    console.log('   1. Ejecuta tu aplicación con npm start');
    console.log('   2. Abre chat-online.html');
    console.log('   3. El progreso del video se guardará automáticamente en la base de datos');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeProgressDatabase()
    .then(() => {
      console.log('✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en inicialización:', error.message);
      process.exit(1);
    });
}

module.exports = { initializeProgressDatabase };