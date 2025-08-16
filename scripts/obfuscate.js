const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Configuración de ofuscación optimizada para producción
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false, // Deshabilitado para evitar problemas en producción
    debugProtectionInterval: 0,
    disableConsoleOutput: false, // Permitir console.log en producción
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false, // No renombrar globales para evitar problemas
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
};

// Función para procesar archivos recursivamente
function processDirectory(directory, excludePaths = []) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        
        // Verificar si la ruta está excluida
        const isExcluded = excludePaths.some(excludePath => 
            filePath.includes(excludePath)
        );
        
        if (isExcluded) {
            console.log(`⚠️  Saltando archivo excluido: ${filePath}`);
            return;
        }
        
        if (stat.isDirectory()) {
            processDirectory(filePath, excludePaths);
        } else if (file.endsWith('.js') && !file.endsWith('.min.js') && !file.endsWith('.obfuscated.js')) {
            obfuscateFile(filePath);
        }
    });
}

// Función para ofuscar un archivo individual
function obfuscateFile(filePath) {
    try {
        console.log(`🔄 Ofuscando: ${filePath}`);
        
        // Leer el archivo original
        const originalCode = fs.readFileSync(filePath, 'utf8');
        
        // Crear backup del archivo original
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, originalCode);
        
        // Ofuscar el código
        const obfuscatedResult = JavaScriptObfuscator.obfuscate(originalCode, obfuscationOptions);
        const obfuscatedCode = obfuscatedResult.getObfuscatedCode();
        
        // Escribir el código ofuscado
        fs.writeFileSync(filePath, obfuscatedCode);
        
        console.log(`✅ Ofuscado exitosamente: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Error ofuscando ${filePath}:`, error.message);
    }
}

// Función para restaurar archivos desde backup
function restoreFromBackups() {
    console.log('🔄 Restaurando archivos desde backups...');
    
    const findBackups = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                findBackups(filePath);
            } else if (file.endsWith('.backup')) {
                const originalPath = filePath.replace('.backup', '');
                const backupContent = fs.readFileSync(filePath, 'utf8');
                fs.writeFileSync(originalPath, backupContent);
                fs.unlinkSync(filePath);
                console.log(`✅ Restaurado: ${originalPath}`);
            }
        });
    };
    
    // Restaurar desde todas las carpetas
    const directories = ['./src', './netlify'];
    directories.forEach(dir => {
        if (fs.existsSync(dir)) {
            findBackups(dir);
        }
    });
}

// Función principal
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--restore')) {
        restoreFromBackups();
        return;
    }
    
    console.log('🚀 Iniciando proceso de ofuscación...');
    console.log('📁 Procesando archivos JavaScript...');
    
    // Rutas a excluir (node_modules, tests, etc.)
    const excludePaths = [
        'node_modules',
        '.git',
        'coverage',
        'dist',
        'build',
        '__tests__',
        'test',
        'tests',
        '.backup'
    ];
    
    // Directorios a procesar
    const directoriesToProcess = [
        './src',
        './netlify'
    ];
    
    directoriesToProcess.forEach(directory => {
        if (fs.existsSync(directory)) {
            console.log(`📂 Procesando directorio: ${directory}`);
            processDirectory(directory, excludePaths);
        } else {
            console.log(`⚠️  Directorio no encontrado: ${directory}`);
        }
    });
    
    console.log('✨ Proceso de ofuscación completado!');
    console.log('💡 Para restaurar archivos originales, ejecuta: npm run obfuscate -- --restore');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = {
    obfuscateFile,
    processDirectory,
    restoreFromBackups,
    obfuscationOptions
};