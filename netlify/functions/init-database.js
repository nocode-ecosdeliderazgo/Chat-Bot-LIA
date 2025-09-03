const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const json = (status, data) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, X-API-Key',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
  },
  body: JSON.stringify(data),
});

// SQL Schema para progress system
const PROGRESS_SCHEMA = `
-- ===== COURSE PROGRESS SCHEMA =====
-- Esquema de base de datos para el sistema de progreso de cursos

-- Tabla principal de progreso de cursos
CREATE TABLE IF NOT EXISTS course_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID, -- Referencia opcional a la tabla courses
    course_identifier TEXT NOT NULL, -- Por ahora usar identificador de texto
    
    -- Progreso general del curso
    overall_progress_percentage INTEGER DEFAULT 0 CHECK (overall_progress_percentage >= 0 AND overall_progress_percentage <= 100),
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')),
    
    -- Tracking temporal
    started_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion_time INTEGER, -- en minutos
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT unique_user_course UNIQUE (user_id, course_identifier)
);

-- Tabla de progreso por módulos
CREATE TABLE IF NOT EXISTS module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_progress_id UUID NOT NULL REFERENCES course_progress(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Identificación del módulo
    module_number INTEGER NOT NULL CHECK (module_number >= 1),
    module_name TEXT NOT NULL,
    module_identifier TEXT NOT NULL, -- ej: "module-1-intro-ia"
    
    -- Estado del módulo
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Tracking de tiempo
    started_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0, -- tiempo total gastado en el módulo
    
    -- Video específico
    video_id TEXT, -- ID del video de YouTube
    video_progress_percentage INTEGER DEFAULT 0 CHECK (video_progress_percentage >= 0 AND video_progress_percentage <= 100),
    video_completed BOOLEAN DEFAULT FALSE,
    last_video_position INTEGER DEFAULT 0, -- última posición en segundos
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT unique_user_module UNIQUE (user_id, course_progress_id, module_number)
);

-- Tabla de progreso por secciones de video (los dots que se ven en el video)
CREATE TABLE IF NOT EXISTS video_section_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_progress_id UUID NOT NULL REFERENCES module_progress(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Identificación de la sección
    section_number INTEGER NOT NULL CHECK (section_number >= 1),
    section_name TEXT,
    start_time_seconds INTEGER NOT NULL, -- tiempo de inicio en segundos
    end_time_seconds INTEGER NOT NULL, -- tiempo de fin en segundos
    
    -- Estado de la sección
    completed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT unique_user_section UNIQUE (user_id, module_progress_id, section_number)
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_status ON course_progress(status);
CREATE INDEX IF NOT EXISTS idx_course_progress_last_accessed ON course_progress(last_accessed_at);

CREATE INDEX IF NOT EXISTS idx_module_progress_course_id ON module_progress(course_progress_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_id ON module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_status ON module_progress(status);
CREATE INDEX IF NOT EXISTS idx_module_progress_module_number ON module_progress(module_number);

CREATE INDEX IF NOT EXISTS idx_video_section_progress_module_id ON video_section_progress(module_progress_id);
CREATE INDEX IF NOT EXISTS idx_video_section_progress_user_id ON video_section_progress(user_id);

-- Función para actualizar el progreso general del curso
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el progreso general del curso basado en los módulos completados
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

-- Trigger para actualizar progreso automáticamente
DROP TRIGGER IF EXISTS trigger_update_course_progress ON module_progress;
CREATE TRIGGER trigger_update_course_progress
    AFTER INSERT OR UPDATE ON module_progress
    FOR EACH ROW EXECUTE FUNCTION update_course_progress();

-- Función para crear progreso inicial de un curso
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
    -- Crear registro principal de progreso del curso
    INSERT INTO course_progress (user_id, course_identifier, status, started_at)
    VALUES (p_user_id, p_course_identifier, 'in_progress', now())
    ON CONFLICT (user_id, course_identifier) 
    DO UPDATE SET 
        last_accessed_at = now(),
        updated_at = now(),
        -- Asegurarse de que siempre esté en progreso si se vuelve a inicializar
        status = CASE WHEN status = 'not_started' THEN 'in_progress' ELSE status END,
        started_at = CASE WHEN started_at IS NULL THEN now() ELSE started_at END
    RETURNING id INTO v_course_progress_id;
    
    -- Si se proporcionan módulos, crear el progreso inicial
    IF p_course_modules IS NOT NULL THEN
        FOR v_module IN SELECT * FROM jsonb_array_elements(p_course_modules)
        LOOP
            INSERT INTO module_progress (
                course_progress_id,
                user_id,
                module_number,
                module_name,
                module_identifier,
                status,
                video_id
            )
            VALUES (
                v_course_progress_id,
                p_user_id,
                (v_module->>'number')::integer,
                v_module->>'name',
                v_module->>'identifier',
                CASE WHEN (v_module->>'number')::integer = 1 THEN 'in_progress' ELSE 'locked' END,
                v_module->>'video_id'
            )
            ON CONFLICT (user_id, course_progress_id, module_number) 
            DO UPDATE SET
                -- Asegurar que el módulo 1 siempre esté disponible
                status = CASE 
                    WHEN (v_module->>'number')::integer = 1 THEN 'in_progress'
                    WHEN module_progress.status = 'not_started' AND (v_module->>'number')::integer = 1 THEN 'in_progress'
                    ELSE module_progress.status 
                END,
                last_accessed_at = now(),
                updated_at = now();
        END LOOP;
    END IF;
    
    RETURN v_course_progress_id;
END;
$$ LANGUAGE plpgsql;

-- Vista para obtener el progreso completo de un usuario
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
    
    -- Módulos
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

-- Función para asegurar módulo 1 disponible
CREATE OR REPLACE FUNCTION ensure_module_1_available()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está insertando o actualizando el módulo 1, asegurar que esté disponible
    IF NEW.module_number = 1 THEN
        NEW.status := CASE 
            WHEN NEW.status IN ('locked', 'not_started') THEN 'in_progress'
            ELSE NEW.status 
        END;
        
        IF NEW.started_at IS NULL THEN
            NEW.started_at := now();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asegurar módulo 1
DROP TRIGGER IF EXISTS trigger_ensure_module_1_available ON module_progress;
CREATE TRIGGER trigger_ensure_module_1_available
    BEFORE INSERT OR UPDATE ON module_progress
    FOR EACH ROW EXECUTE FUNCTION ensure_module_1_available();
`;

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Inicializando esquema de progreso de curso...');
    
    // Verificar si la tabla users existe
    const { rows: userTableCheck } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (userTableCheck.length === 0) {
      console.log('⚠️ Tabla users no encontrada. Creando tabla básica...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT,
          password_hash TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Crear usuario demo para testing
        INSERT INTO users (id, username, email) 
        VALUES ('00000000-0000-0000-0000-000000000001', 'demo-user', 'demo@example.com')
        ON CONFLICT (username) DO NOTHING;
      `);
    }
    
    // Ejecutar el schema principal
    await client.query(PROGRESS_SCHEMA);
    
    console.log('✅ Esquema de progreso inicializado correctamente');
    
    // Verificar tablas creadas
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN 
      ('course_progress', 'module_progress', 'video_section_progress')
      ORDER BY table_name
    `);
    
    console.log('📊 Tablas de progreso creadas:', tables.map(t => t.table_name));
    
    return {
      success: true,
      message: 'Base de datos inicializada correctamente',
      tables: tables.map(t => t.table_name)
    };
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  } finally {
    client.release();
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Solo se permite método POST' });
  }

  try {
    // Solo permitir en desarrollo o con una clave especial
    const body = JSON.parse(event.body || '{}');
    const initKey = body.init_key || event.headers['x-init-key'];
    
    if (process.env.NODE_ENV !== 'development' && initKey !== process.env.DB_INIT_KEY) {
      return json(403, { 
        success: false, 
        error: 'No autorizado - se requiere clave de inicialización' 
      });
    }

    console.log('🔧 Ejecutando inicialización de base de datos...');
    
    const result = await initializeDatabase();
    
    console.log('✅ Inicialización completada exitosamente');
    
    return json(200, result);

  } catch (error) {
    console.error('❌ Error en init-database:', error);
    return json(500, { 
      success: false, 
      error: 'Error inicializando base de datos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};