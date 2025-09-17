const https = require('https');
const fs = require('fs');
const path = require('path');

// URLs de las imágenes de las herramientas
const toolImages = {
    'chatgpt.png': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    'midjourney.png': 'https://cdn.midjourney.com/assets/logo/logo-midjourney.png',
    'github-copilot.png': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    'notion.png': 'https://www.notion.so/cdn-cgi/image/format=auto,width=256,quality=100/front-static/shared/icons/notion-app-icon-3d.png',
    'runway.png': 'https://runwayml.com/favicon.ico',
    'claude.png': 'https://claude.ai/favicon.ico',
    'dalle.png': 'https://openai.com/content/images/2022/05/openai-avatar.png',
    'figma.png': 'https://cdn.figma.com/app/icon/1/favicon.ico',
    'loom.png': 'https://loom.com/favicon.ico',
    'zapier.png': 'https://zapier.com/favicon.ico'
};

// Función para descargar una imagen
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join('src/assets/images/tools', filename));
        
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ Descargado: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(path.join('src/assets/images/tools', filename), () => {});
            console.error(`❌ Error descargando ${filename}:`, err.message);
            reject(err);
        });
    });
}

// Descargar todas las imágenes
async function downloadAllImages() {
    console.log('🚀 Iniciando descarga de imágenes de herramientas...');
    
    for (const [filename, url] of Object.entries(toolImages)) {
        try {
            await downloadImage(url, filename);
        } catch (error) {
            console.log(`⚠️ Saltando ${filename} debido a error`);
        }
    }
    
    console.log('✅ Descarga completada');
}

downloadAllImages();

