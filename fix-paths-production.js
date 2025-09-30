/**
 * Script para corregir rutas relativas a absolutas para Netlify deployment
 * Ejecutar: node fix-paths-production.js
 */

const fs = require('fs');
const path = require('path');

const files = [
    'src/Community/community.html',
    'src/Chat-Online/chat-online.html'
];

const replacements = [
    // Scripts
    { from: 'src="../scripts/', to: 'src="/scripts/' },
    { from: 'src="../utils/', to: 'src="/utils/' },

    // Assets
    { from: 'src="../assets/', to: 'src="/assets/' },
    { from: 'href="../assets/', to: 'href="/assets/' },

    // Específicos de Community
    { from: 'href="community.css"', to: 'href="/Community/community.css"' },

    // Específicos de Chat-Online
    { from: 'href="chat-online.css"', to: 'href="/Chat-Online/chat-online.css"' },
    { from: 'src="components/', to: 'src="/Chat-Online/components/' },
    { from: 'src="module1-videos-loader.js"', to: 'src="/Chat-Online/module1-videos-loader.js"' },
    { from: 'src="api/community-api.js"', to: 'src="/Chat-Online/api/community-api.js"' },
    { from: 'src="chat-online.js"', to: 'src="/Chat-Online/chat-online.js"' }
];

console.log('🔧 Corrigiendo rutas para producción Netlify...\n');

let totalChanges = 0;

files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let fileChanges = 0;

    replacements.forEach(({ from, to }) => {
        const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);

        if (matches) {
            content = content.replace(regex, to);
            fileChanges += matches.length;
        }
    });

    if (fileChanges > 0) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ ${filePath}: ${fileChanges} rutas corregidas`);
        totalChanges += fileChanges;
    } else {
        console.log(`✓  ${filePath}: Sin cambios necesarios`);
    }
});

console.log(`\n🎉 Total: ${totalChanges} rutas corregidas`);
console.log('\n📋 Próximos pasos:');
console.log('1. git add .');
console.log('2. git commit -m "Fix: Rutas absolutas para Netlify"');
console.log('3. git push');
console.log('4. Configurar SUPABASE_ANON_KEY en Netlify');