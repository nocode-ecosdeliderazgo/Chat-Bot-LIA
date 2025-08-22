#!/usr/bin/env node

/**
 * IMPORTADOR DE PREGUNTAS GENAI DESDE CSV
 * ====================================
 * 
 * Este script importa las preguntas del cuestionario GenAI MultiArea
 * desde el archivo CSV a la base de datos Supabase
 * 
 * Uso: node scripts/import-genai-questions.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ====================================================================
// CONFIGURACIÓN
// ====================================================================

const CONFIG = {
    CSV_FILE_PATH: path.join(__dirname, '..', 'Cuestionario_GenAI_MultiArea_MX_LATAM.csv'),
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://miwbzotcuaywpdbidpwo.supabase.co',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY,
    BATCH_SIZE: 50, // Insertar preguntas en lotes
    DRY_RUN: process.argv.includes('--dry-run'), // Solo simular, no insertar
    VERBOSE: process.argv.includes('--verbose') || process.argv.includes('-v'),
    CLEAR_EXISTING: process.argv.includes('--clear') // Limpiar preguntas existentes
};

// ====================================================================
// UTILIDADES
// ====================================================================

function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = {
        'INFO': '📝',
        'SUCCESS': '✅',
        'ERROR': '❌',
        'WARN': '⚠️',
        'DEBUG': '🔍'
    }[level] || '📝';
    
    console.log(`${timestamp} ${prefix} ${message}`);
}

function verbose(message) {
    if (CONFIG.VERBOSE) {
        log(message, 'DEBUG');
    }
}

// ====================================================================
// FUNCIONES DE PARSING CSV
// ====================================================================

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length && values[0].trim()) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            rows.push(row);
        }
    }
    
    return rows;
}

// ====================================================================
// FUNCIONES DE TRANSFORMACIÓN
// ====================================================================

function mapAreaToEnum(area) {
    const areaMap = {
        'CEO/Alta Dirección': 'CEO/Alta Dirección',
        'Tecnología/Desarrollo de Software': 'Tecnología/Desarrollo de Software',
        'Marketing y Comunicación': 'Marketing y Comunicación',
        'Salud/Medicina': 'Salud/Medicina',
        'Derecho/Sector Legal': 'Derecho/Sector Legal',
        'Finanzas/Contabilidad': 'Finanzas/Contabilidad',
        'Administración Pública/Gobierno': 'Administración Pública/Gobierno',
        'Academia/Investigación': 'Academia/Investigación',
        'Educación/Docentes': 'Educación/Docentes',
        'Diseño/Industrias Creativas': 'Diseño/Industrias Creativas',
        'Todas': 'CEO/Alta Dirección' // Metadatos van a CEO por defecto
    };
    
    return areaMap[area] || 'CEO/Alta Dirección';
}

function mapTypeToEnum(type) {
    const typeMap = {
        'Dropdown': 'Dropdown',
        'Multiple Choice (una respuesta)': 'Multiple Choice (una respuesta)',
        'Multiple Choice (escala Likert A–E)': 'Multiple Choice (escala Likert A–E)',
        'Short Answer': 'Short Answer'
    };
    
    return typeMap[type] || 'Short Answer';
}

function parseScoring(scoringText) {
    if (!scoringText || scoringText === 'null' || scoringText.trim() === '') {
        return null;
    }
    
    try {
        // Intentar parsear directamente como JSON
        if (scoringText.startsWith('{')) {
            return JSON.parse(scoringText);
        }
        
        // Parsear formato "A=0; B=25; C=50; D=75; E=100"
        if (scoringText.includes('=') && scoringText.includes(';')) {
            const result = {};
            const pairs = scoringText.split(';').map(s => s.trim());
            
            pairs.forEach(pair => {
                const [key, value] = pair.split('=').map(s => s.trim());
                if (key && value !== undefined) {
                    result[key] = parseInt(value) || 0;
                }
            });
            
            return result;
        }
        
        // Parsear formato "Correcta=100; Incorrecta=0"
        if (scoringText.toLowerCase().includes('correcta')) {
            return { correct: 100, incorrect: 0 };
        }
        
        return null;
    } catch (error) {
        verbose(`Error parsing scoring "${scoringText}": ${error.message}`);
        return null;
    }
}

function transformCSVRowToQuestion(row, index) {
    // Filtrar filas de metadatos o vacías
    if (row.section === 'Metadatos' || !row.question_text || row.question_text.trim() === '') {
        return null;
    }
    
    const question = {
        section: row.section || 'Cuestionario',
        area: mapAreaToEnum(row.area),
        block: row.block || 'Adopción',
        question_id: row.question_id || `Q${index}`,
        question_text: row.question_text.replace(/"/g, ''),
        type: mapTypeToEnum(row.type),
        option_a: row.option_a || null,
        option_b: row.option_b || null,
        option_c: row.option_c || null,
        option_d: row.option_d || null,
        option_e: row.option_e || null,
        correct_option: row.correct_option || null,
        scale_mapping: parseScoring(row.scale_mapping),
        scoring_mapping: parseScoring(row.scoring_mapping),
        weight_to_100: parseFloat(row.weight_to_100) || 8.333333,
        locale: row.locale || 'MX/LATAM',
        active: true
    };
    
    // Validaciones básicas
    if (!question.question_text || question.question_text.length < 10) {
        verbose(`Pregunta rechazada por texto inválido: ${question.question_id}`);
        return null;
    }
    
    return question;
}

// ====================================================================
// FUNCIONES DE BASE DE DATOS
// ====================================================================

async function initializeSupabase() {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_KEY) {
        throw new Error('SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos');
    }
    
    const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);
    
    // Probar conexión
    const { data, error } = await supabase.from('genai_questions').select('count').limit(1);
    if (error && !error.message.includes('relation "genai_questions" does not exist')) {
        throw new Error(`Error conectando a Supabase: ${error.message}`);
    }
    
    log('Conexión a Supabase establecida correctamente', 'SUCCESS');
    return supabase;
}

async function clearExistingQuestions(supabase) {
    if (!CONFIG.CLEAR_EXISTING) {
        return;
    }
    
    log('Limpiando preguntas existentes...', 'WARN');
    
    if (CONFIG.DRY_RUN) {
        log('[DRY RUN] Se limpiarían las preguntas existentes', 'INFO');
        return;
    }
    
    const { error } = await supabase
        .from('genai_questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (error) {
        throw new Error(`Error limpiando preguntas: ${error.message}`);
    }
    
    log('Preguntas existentes eliminadas', 'SUCCESS');
}

async function insertQuestionsBatch(supabase, questions) {
    if (CONFIG.DRY_RUN) {
        log(`[DRY RUN] Se insertarían ${questions.length} preguntas`, 'INFO');
        questions.forEach((q, i) => {
            verbose(`  ${i + 1}. [${q.area}] ${q.question_id}: ${q.question_text.substring(0, 50)}...`);
        });
        return { success: true, data: questions };
    }
    
    const { data, error } = await supabase
        .from('genai_questions')
        .insert(questions)
        .select();
    
    if (error) {
        throw new Error(`Error insertando preguntas: ${error.message}`);
    }
    
    return { success: true, data };
}

// ====================================================================
// FUNCIÓN PRINCIPAL
// ====================================================================

async function main() {
    try {
        log('🚀 Iniciando importación de preguntas GenAI...', 'INFO');
        
        // Verificar archivo CSV
        if (!fs.existsSync(CONFIG.CSV_FILE_PATH)) {
            throw new Error(`Archivo CSV no encontrado: ${CONFIG.CSV_FILE_PATH}`);
        }
        
        log(`Leyendo archivo CSV: ${CONFIG.CSV_FILE_PATH}`, 'INFO');
        const csvContent = fs.readFileSync(CONFIG.CSV_FILE_PATH, 'utf-8');
        
        // Parsear CSV
        const csvRows = parseCSV(csvContent);
        log(`CSV parseado: ${csvRows.length} filas encontradas`, 'SUCCESS');
        
        if (CONFIG.VERBOSE) {
            const areas = [...new Set(csvRows.map(r => r.area))];
            verbose(`Áreas encontradas: ${areas.join(', ')}`);
        }
        
        // Transformar a preguntas
        const questions = [];
        let skippedCount = 0;
        
        csvRows.forEach((row, index) => {
            const question = transformCSVRowToQuestion(row, index);
            if (question) {
                questions.push(question);
            } else {
                skippedCount++;
            }
        });
        
        log(`Preguntas procesadas: ${questions.length} válidas, ${skippedCount} omitidas`, 'INFO');
        
        // Estadísticas por área
        if (CONFIG.VERBOSE) {
            const areaStats = questions.reduce((acc, q) => {
                acc[q.area] = (acc[q.area] || 0) + 1;
                return acc;
            }, {});
            
            verbose('Distribución por área:');
            Object.entries(areaStats).forEach(([area, count]) => {
                verbose(`  ${area}: ${count} preguntas`);
            });
        }
        
        if (questions.length === 0) {
            throw new Error('No se encontraron preguntas válidas para importar');
        }
        
        // Conectar a Supabase
        const supabase = await initializeSupabase();
        
        // Limpiar preguntas existentes si se solicita
        await clearExistingQuestions(supabase);
        
        // Insertar preguntas en lotes
        log(`Insertando ${questions.length} preguntas en lotes de ${CONFIG.BATCH_SIZE}...`, 'INFO');
        
        let insertedCount = 0;
        const errors = [];
        
        for (let i = 0; i < questions.length; i += CONFIG.BATCH_SIZE) {
            const batch = questions.slice(i, i + CONFIG.BATCH_SIZE);
            const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(questions.length / CONFIG.BATCH_SIZE);
            
            try {
                verbose(`Procesando lote ${batchNumber}/${totalBatches} (${batch.length} preguntas)...`);
                
                const result = await insertQuestionsBatch(supabase, batch);
                if (result.success) {
                    insertedCount += batch.length;
                    log(`Lote ${batchNumber}/${totalBatches} insertado correctamente`, 'SUCCESS');
                }
            } catch (error) {
                const errorMsg = `Error en lote ${batchNumber}: ${error.message}`;
                log(errorMsg, 'ERROR');
                errors.push(errorMsg);
                
                // Continuar con el siguiente lote
                continue;
            }
        }
        
        // Reporte final
        log('', 'INFO');
        log('='.repeat(60), 'INFO');
        log('REPORTE FINAL DE IMPORTACIÓN', 'INFO');
        log('='.repeat(60), 'INFO');
        log(`Total filas CSV procesadas: ${csvRows.length}`, 'INFO');
        log(`Preguntas válidas generadas: ${questions.length}`, 'INFO');
        log(`Preguntas insertadas exitosamente: ${insertedCount}`, 'SUCCESS');
        log(`Errores encontrados: ${errors.length}`, errors.length > 0 ? 'WARN' : 'INFO');
        
        if (errors.length > 0) {
            log('Errores detallados:', 'ERROR');
            errors.forEach((error, index) => {
                log(`  ${index + 1}. ${error}`, 'ERROR');
            });
        }
        
        if (CONFIG.DRY_RUN) {
            log('', 'INFO');
            log('MODO DRY RUN - No se realizaron cambios en la base de datos', 'WARN');
            log('Para ejecutar la importación real, ejecuta sin --dry-run', 'INFO');
        } else if (insertedCount > 0) {
            log('', 'INFO');
            log('🎉 Importación completada exitosamente!', 'SUCCESS');
            log('Las preguntas están listas para ser usadas en el cuestionario GenAI', 'SUCCESS');
        } else {
            throw new Error('No se pudieron insertar preguntas en la base de datos');
        }
        
    } catch (error) {
        log(`Error fatal: ${error.message}`, 'ERROR');
        if (CONFIG.VERBOSE && error.stack) {
            log(error.stack, 'ERROR');
        }
        process.exit(1);
    }
}

// ====================================================================
// EJECUTAR SI ES LLAMADO DIRECTAMENTE
// ====================================================================

if (require.main === module) {
    // Mostrar ayuda si se solicita
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`
Importador de Preguntas GenAI
============================

Uso: node scripts/import-genai-questions.js [opciones]

Opciones:
  --dry-run     Simular la importación sin insertar datos
  --verbose, -v Mostrar información detallada
  --clear       Limpiar preguntas existentes antes de importar
  --help, -h    Mostrar esta ayuda

Variables de entorno:
  SUPABASE_URL         URL de tu proyecto Supabase
  SUPABASE_SERVICE_KEY Clave de servicio de Supabase (con permisos de escritura)

Ejemplos:
  node scripts/import-genai-questions.js --dry-run --verbose
  node scripts/import-genai-questions.js --clear
  SUPABASE_URL=https://xxx.supabase.co node scripts/import-genai-questions.js
`);
        process.exit(0);
    }
    
    // Ejecutar importación
    main().catch(error => {
        console.error('Error no manejado:', error);
        process.exit(1);
    });
}

module.exports = {
    parseCSV,
    transformCSVRowToQuestion,
    mapAreaToEnum,
    mapTypeToEnum,
    parseScoring
};