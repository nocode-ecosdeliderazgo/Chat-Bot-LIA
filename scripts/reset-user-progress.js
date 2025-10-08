#!/usr/bin/env node

// Script para resetear y reinicializar el progreso de un usuario específico
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/coach_lia_ia',
});

async function resetUserProgress(userId = '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0', courseId = 'intro-to-ai') {
    console.log(`🧹 Reseteando progreso para usuario: ${userId}, curso: ${courseId}`);
    
    try {
        // 1. Eliminar progreso existente del usuario
        console.log('1️⃣ Eliminando progreso existente...');
        
        await pool.query(`
            DELETE FROM video_section_progress 
            WHERE user_id = $1
        `, [userId]);
        
        await pool.query(`
            DELETE FROM activity_progress 
            WHERE user_id = $1
        `, [userId]);
        
        await pool.query(`
            DELETE FROM module_progress 
            WHERE user_id = $1
        `, [userId]);
        
        await pool.query(`
            DELETE FROM course_progress 
            WHERE user_id = $1 AND course_identifier = $2
        `, [userId, courseId]);
        
        console.log('✅ Progreso anterior eliminado');
        
        // 2. Reinicializar progreso con módulos
        console.log('2️⃣ Reinicializando progreso con módulos...');
        
        const courseModules = JSON.stringify([
            { "number": 1, "name": "¿Qué es la IA?", "identifier": "module-1-intro-ia", "video_id": "Yy_eZ65jzmo" },
            { "number": 2, "name": "Historia de la IA", "identifier": "module-2-history-ia", "video_id": "dhsy6epaJGs" },
            { "number": 3, "name": "Fundamentos del ML", "identifier": "module-3-ml-fundamentals", "video_id": "DvyOm9HeT-k" },
            { "number": 4, "name": "Redes Neuronales", "identifier": "module-4-neural-networks", "video_id": "oiKj0Z_Xnjc" },
            { "number": 5, "name": "Aplicaciones Prácticas", "identifier": "module-5-applications", "video_id": "HMoaRIbOaN0" }
        ]);
        
        const initResult = await pool.query(`
            SELECT initialize_course_progress($1, $2, $3::jsonb) as course_progress_id
        `, [userId, courseId, courseModules]);
        
        console.log('✅ Progreso reinicializado, ID:', initResult.rows[0].course_progress_id);
        
        // 3. Verificar que se crearon los módulos
        console.log('3️⃣ Verificando módulos creados...');
        
        const moduleCheck = await pool.query(`
            SELECT 
                cp.course_identifier,
                cp.overall_progress_percentage,
                cp.status as course_status,
                COUNT(mp.id) as modules_count,
                json_agg(
                    json_build_object(
                        'number', mp.module_number,
                        'name', mp.module_name,
                        'status', mp.status,
                        'video_id', mp.video_id
                    ) ORDER BY mp.module_number
                ) as modules
            FROM course_progress cp
            LEFT JOIN module_progress mp ON cp.id = mp.course_progress_id
            WHERE cp.user_id = $1 AND cp.course_identifier = $2
            GROUP BY cp.id, cp.course_identifier, cp.overall_progress_percentage, cp.status
        `, [userId, courseId]);
        
        if (moduleCheck.rows.length > 0) {
            const data = moduleCheck.rows[0];
            console.log(`✅ Curso: ${data.course_identifier}`);
            console.log(`📊 Progreso: ${data.overall_progress_percentage}% - Estado: ${data.course_status}`);
            console.log(`📖 Módulos creados: ${data.modules_count}`);
            
            if (data.modules && data.modules[0] !== null) {
                console.log('📋 Módulos:');
                data.modules.forEach(module => {
                    console.log(`   ${module.number}. ${module.name} - ${module.status} (${module.video_id})`);
                });
            }
        }
        
        console.log('🎉 ¡Reset completado exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en reset:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const userId = process.argv[2] || '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0';
    const courseId = process.argv[3] || 'intro-to-ai';
    resetUserProgress(userId, courseId);
}

module.exports = { resetUserProgress };