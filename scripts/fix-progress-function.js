#!/usr/bin/env node

// Script para corregir la función initialize_course_progress en la base de datos
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/coach_lia_ia',
});

async function fixProgressFunction() {
    console.log('🔧 Corrigiendo función initialize_course_progress...');
    
    try {
        // Leer el archivo SQL con la corrección
        const sqlPath = path.join(__dirname, '..', 'fix-progress-function.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Ejecutar la corrección
        await pool.query(sqlContent);
        
        console.log('✅ Función initialize_course_progress corregida exitosamente');
        
        // Probar la función con un usuario de prueba
        console.log('🧪 Probando la función corregida...');
        
        const testResult = await pool.query(`
            SELECT initialize_course_progress(
                '00000000-0000-0000-0000-000000000001'::uuid,
                'intro-to-ai',
                '[{"number": 1, "name": "Test Module", "identifier": "test-module", "video_id": "test-video"}]'::jsonb
            ) as course_progress_id;
        `);
        
        console.log('✅ Función probada exitosamente, ID de progreso:', testResult.rows[0].course_progress_id);
        
    } catch (error) {
        console.error('❌ Error corrigiendo función:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    fixProgressFunction();
}

module.exports = { fixProgressFunction };