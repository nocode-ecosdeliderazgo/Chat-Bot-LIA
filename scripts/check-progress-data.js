#!/usr/bin/env node

// Script para verificar los datos de progreso en la base de datos
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/coach_lia_ia',
});

async function checkProgressData() {
    console.log('🔍 Verificando datos de progreso en la base de datos...\n');
    
    try {
        // 1. Verificar tabla course_progress
        console.log('📚 === TABLA: course_progress ===');
        const courseProgressResult = await pool.query(`
            SELECT 
                user_id,
                course_identifier,
                overall_progress_percentage,
                status,
                started_at,
                last_accessed_at,
                completed_at,
                created_at,
                updated_at
            FROM course_progress 
            ORDER BY updated_at DESC 
            LIMIT 5;
        `);
        
        if (courseProgressResult.rows.length > 0) {
            courseProgressResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. Usuario: ${row.user_id}`);
                console.log(`   Curso: ${row.course_identifier}`);
                console.log(`   Progreso: ${row.overall_progress_percentage}%`);
                console.log(`   Estado: ${row.status}`);
                console.log(`   Último acceso: ${row.last_accessed_at}`);
                console.log(`   Actualizado: ${row.updated_at}\n`);
            });
        } else {
            console.log('❌ No hay datos en course_progress\n');
        }

        // 2. Verificar tabla module_progress
        console.log('📖 === TABLA: module_progress ===');
        const moduleProgressResult = await pool.query(`
            SELECT 
                user_id,
                module_number,
                module_name,
                status,
                progress_percentage,
                video_progress_percentage,
                video_completed,
                last_video_position,
                time_spent_minutes,
                started_at,
                last_accessed_at,
                completed_at,
                updated_at
            FROM module_progress 
            ORDER BY updated_at DESC 
            LIMIT 5;
        `);
        
        if (moduleProgressResult.rows.length > 0) {
            moduleProgressResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. Usuario: ${row.user_id}`);
                console.log(`   Módulo: ${row.module_number} - ${row.module_name}`);
                console.log(`   Estado: ${row.status}`);
                console.log(`   Progreso módulo: ${row.progress_percentage}%`);
                console.log(`   Progreso video: ${row.video_progress_percentage}%`);
                console.log(`   Video completado: ${row.video_completed}`);
                console.log(`   Última posición: ${row.last_video_position}s`);
                console.log(`   Tiempo gastado: ${row.time_spent_minutes} min`);
                console.log(`   Último acceso: ${row.last_accessed_at}`);
                console.log(`   Completado: ${row.completed_at}`);
                console.log(`   Actualizado: ${row.updated_at}\n`);
            });
        } else {
            console.log('❌ No hay datos en module_progress\n');
        }

        // 3. Verificar si hay otros registros relacionados
        console.log('🔗 === CONTADORES ===');
        const courseCount = await pool.query('SELECT COUNT(*) FROM course_progress');
        const moduleCount = await pool.query('SELECT COUNT(*) FROM module_progress');
        const sectionCount = await pool.query('SELECT COUNT(*) FROM video_section_progress');
        const activityCount = await pool.query('SELECT COUNT(*) FROM activity_progress');
        
        console.log(`📚 Total registros course_progress: ${courseCount.rows[0].count}`);
        console.log(`📖 Total registros module_progress: ${moduleCount.rows[0].count}`);
        console.log(`🎥 Total registros video_section_progress: ${sectionCount.rows[0].count}`);
        console.log(`📝 Total registros activity_progress: ${activityCount.rows[0].count}`);

        // 4. Verificar registros específicos del usuario de la prueba
        console.log('\n🎯 === USUARIO ESPECÍFICO (9562a449-4ade-4d4b-a3e4-b66dddb7e6f0) ===');
        const userSpecificResult = await pool.query(`
            SELECT 
                cp.course_identifier,
                cp.overall_progress_percentage as curso_progreso,
                cp.status as curso_estado,
                mp.module_number,
                mp.progress_percentage as modulo_progreso,
                mp.video_progress_percentage,
                mp.video_completed,
                mp.last_video_position,
                mp.status as modulo_estado
            FROM course_progress cp
            LEFT JOIN module_progress mp ON cp.id = mp.course_progress_id
            WHERE cp.user_id = '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0'
            ORDER BY mp.module_number;
        `);
        
        if (userSpecificResult.rows.length > 0) {
            userSpecificResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. Curso: ${row.course_identifier} (${row.curso_progreso}% - ${row.curso_estado})`);
                if (row.module_number) {
                    console.log(`   Módulo ${row.module_number}: ${row.modulo_progreso}% - ${row.modulo_estado}`);
                    console.log(`   Video: ${row.video_progress_percentage}% - Completado: ${row.video_completed}`);
                    console.log(`   Posición: ${row.last_video_position}s\n`);
                }
            });
        } else {
            console.log('❌ No hay datos para el usuario específico\n');
        }
        
    } catch (error) {
        console.error('❌ Error consultando datos:', error.message);
    } finally {
        await pool.end();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    checkProgressData();
}

module.exports = { checkProgressData };