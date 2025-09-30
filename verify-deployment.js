#!/usr/bin/env node

/**
 * Script de verificación para el despliegue en Netlify
 * Verifica que todos los archivos necesarios estén en su lugar
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de despliegue en Netlify...\n');

const checks = [
    {
        name: 'netlify.toml existe',
        path: './netlify.toml',
        required: true
    },
    {
        name: 'package.json principal existe',
        path: './package.json',
        required: true
    },
    {
        name: 'Directorio src/ existe (frontend)',
        path: './src',
        required: true,
        isDirectory: true
    },
    {
        name: 'index.html principal existe',
        path: './src/index.html',
        required: true
    },
    {
        name: 'Directorio netlify/functions/ existe (backend)',
        path: './netlify/functions',
        required: true,
        isDirectory: true
    },
    {
        name: 'package.json de functions existe',
        path: './netlify/functions/package.json',
        required: true
    },
    {
        name: 'Guía de despliegue existe',
        path: './NETLIFY_DEPLOYMENT_GUIDE.md',
        required: false
    },
    {
        name: 'Archivo .env.example existe',
        path: './.env.example',
        required: false
    }
];

let passed = 0;
let failed = 0;

console.log('📋 Ejecutando verificaciones:\n');

checks.forEach(check => {
    const fullPath = path.resolve(check.path);
    let exists = false;
    
    try {
        const stat = fs.statSync(fullPath);
        if (check.isDirectory) {
            exists = stat.isDirectory();
        } else {
            exists = stat.isFile();
        }
    } catch (error) {
        exists = false;
    }
    
    if (exists) {
        console.log(`✅ ${check.name}`);
        passed++;
    } else {
        if (check.required) {
            console.log(`❌ ${check.name} (REQUERIDO)`);
            failed++;
        } else {
            console.log(`⚠️  ${check.name} (opcional)`);
        }
    }
});

console.log('\n📊 Resumen de verificación:');
console.log(`✅ Verificaciones pasadas: ${passed}`);
console.log(`❌ Verificaciones fallidas: ${failed}`);

if (failed === 0) {
    console.log('\n🎉 ¡Todo listo para desplegar en Netlify!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Sube los cambios a la rama Deploy-produccion');
    console.log('2. Conecta el repositorio en Netlify');
    console.log('3. Configura las variables de entorno (ver .env.example)');
    console.log('4. Despliega el sitio');
    console.log('\n📖 Para más detalles, consulta NETLIFY_DEPLOYMENT_GUIDE.md');
} else {
    console.log('\n⚠️  Hay archivos faltantes que pueden afectar el despliegue.');
    console.log('Por favor, revisa los archivos marcados como REQUERIDO.');
}

console.log('\n🔗 Estructura de archivos para Netlify:');
console.log('├── src/                     # Frontend estático');
console.log('├── netlify/functions/       # Backend serverless');
console.log('├── netlify.toml            # Configuración de Netlify');
console.log('├── package.json            # Dependencias principales');
console.log('├── .env.example            # Variables de entorno');
console.log('└── NETLIFY_DEPLOYMENT_GUIDE.md # Guía de despliegue');

process.exit(failed > 0 ? 1 : 0);