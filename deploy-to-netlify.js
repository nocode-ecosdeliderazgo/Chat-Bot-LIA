#!/usr/bin/env node

/**
 * Script de ayuda para despliegue en Netlify
 * Verifica configuración y proporciona instrucciones
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando despliegue para Netlify...\n');

// Verificar archivos esenciales
const requiredFiles = [
    'netlify.toml',
    'package.json',
    'src/index.html',
    'netlify/functions'
];

const missingFiles = [];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
    }
});

if (missingFiles.length > 0) {
    console.error('❌ Archivos faltantes:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
}

console.log('✅ Archivos esenciales encontrados');

// Verificar netlify.toml
const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
if (!netlifyConfig.includes('publish = "src"')) {
    console.warn('⚠️  Advertencia: netlify.toml podría no tener la configuración correcta');
}

// Verificar package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!packageJson.scripts || !packageJson.scripts.build) {
    console.warn('⚠️  Advertencia: No se encontró script de build en package.json');
}

// Contar funciones Netlify
const functionsDir = 'netlify/functions';
const functions = fs.readdirSync(functionsDir).filter(f => f.endsWith('.js'));
console.log(`✅ ${functions.length} funciones Netlify encontradas`);

// Contar archivos HTML en src
const srcFiles = fs.readdirSync('src').filter(f => f.endsWith('.html'));
console.log(`✅ ${srcFiles.length} archivos HTML en directorio src`);

console.log('\n📋 Próximos pasos para desplegar en Netlify:');
console.log('');
console.log('1. 🌐 Ve a https://app.netlify.com/');
console.log('2. 🔗 Conecta tu repositorio GitHub');
console.log('3. 🎯 Selecciona la rama "Deploy-produccion"');
console.log('4. ⚙️  Configuración de build:');
console.log('   - Build command: npm run build');
console.log('   - Publish directory: src');
console.log('   - Node version: 18');
console.log('');
console.log('5. 🔐 Configura variables de entorno (ver .env.netlify.example)');
console.log('');
console.log('6. 🚀 ¡Despliega!');
console.log('');
console.log('📖 Para más detalles, lee NETLIFY_DEPLOYMENT_GUIDE.md');
console.log('✅ Para verificar el despliegue, usa NETLIFY_DEPLOYMENT_CHECKLIST.md');
console.log('');
console.log('🎉 ¡Tu aplicación está lista para Netlify!');