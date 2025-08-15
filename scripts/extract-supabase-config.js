// Script para extraer configuración de Supabase desde .env y actualizar new-auth.html

const fs = require('fs');
const path = require('path');

function extractSupabaseConfig() {
    try {
        // Leer .env
        const envPath = path.join(__dirname, '..', '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Extraer DATABASE_URL
        const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
        if (!dbUrlMatch) {
            console.error('No se encontró DATABASE_URL en .env');
            return;
        }
        
        const dbUrl = dbUrlMatch[1];
        console.log('DATABASE_URL encontrada:', dbUrl);
        
        // Extraer el ID del proyecto desde la URL
        const projectIdMatch = dbUrl.match(/postgres\.([a-zA-Z0-9]+):/);
        if (!projectIdMatch) {
            console.error('No se pudo extraer el ID del proyecto de Supabase');
            return;
        }
        
        const projectId = projectIdMatch[1];
        const supabaseUrl = `https://${projectId}.supabase.co`;
        
        console.log('Proyecto Supabase ID:', projectId);
        console.log('Supabase URL:', supabaseUrl);
        
        // Buscar si existe SUPABASE_ANON_KEY en .env
        const anonKeyMatch = envContent.match(/SUPABASE_ANON_KEY=["']?([^"'\n]+)["']?/);
        let anonKey = anonKeyMatch ? anonKeyMatch[1] : 'TU_CLAVE_ANON_AQUI';
        
        console.log('\n=== CONFIGURACIÓN EXTRAÍDA ===');
        console.log('URL:', supabaseUrl);
        console.log('Anon Key:', anonKey);
        
        if (anonKey === 'TU_CLAVE_ANON_AQUI') {
            console.log('\n⚠️  IMPORTANTE:');
            console.log('No se encontró SUPABASE_ANON_KEY en .env');
            console.log('Debes agregar tu clave anon pública al .env:');
            console.log('SUPABASE_ANON_KEY="tu_clave_anon_aqui"');
            console.log('\nPuedes encontrar esta clave en:');
            console.log('https://supabase.com/dashboard/project/' + projectId + '/settings/api');
        }
        
        // Intentar actualizar new-auth.html automáticamente
        updateNewAuthHtml(supabaseUrl, anonKey);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function updateNewAuthHtml(supabaseUrl, anonKey) {
    try {
        const htmlPath = path.join(__dirname, '..', 'src', 'login', 'new-auth.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Reemplazar las meta tags
        htmlContent = htmlContent.replace(
            /<meta name="supabase-url" content="[^"]*">/,
            `<meta name="supabase-url" content="${supabaseUrl}">`
        );
        
        htmlContent = htmlContent.replace(
            /<meta name="supabase-key" content="[^"]*">/,
            `<meta name="supabase-key" content="${anonKey}">`
        );
        
        fs.writeFileSync(htmlPath, htmlContent);
        console.log('\n✅ new-auth.html actualizado exitosamente');
        
    } catch (error) {
        console.error('Error actualizando new-auth.html:', error.message);
    }
}

// Ejecutar
extractSupabaseConfig();