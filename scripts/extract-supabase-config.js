// Script para extraer configuración de Supabase desde .env y actualizar new-auth.html

const fs = require('fs');
const path = require('path');

function extractSupabaseConfig() {
    try {
        // Leer .env
        const envPath = path.join(__dirname, '..', '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Preferir SUPABASE_URL explícito; si no, intentar derivar de DATABASE_URL
        const explicitUrlMatch = envContent.match(/SUPABASE_URL=["']?([^"'\n]+)["']?/);
        let supabaseUrl = explicitUrlMatch ? explicitUrlMatch[1] : '';
        if (!supabaseUrl) {
            const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
            if (!dbUrlMatch) {
                console.error('No se encontró SUPABASE_URL ni DATABASE_URL en .env');
                return;
            }
            const dbUrl = dbUrlMatch[1];
            console.log('DATABASE_URL encontrada:', dbUrl);
            // Intentar extraer project-ref de hosts tipo db.<ref>.supabase.co
            const refFromHost = dbUrl.match(/db\.([a-z0-9]{20,})\.supabase\.co/i);
            if (refFromHost) {
                supabaseUrl = `https://${refFromHost[1]}.supabase.co`;
            } else {
                console.warn('No se pudo derivar el project-ref desde DATABASE_URL. Define SUPABASE_URL en .env');
            }
        }
        
        // Leer SUPABASE_ANON_KEY (debe ser un JWT con 3 partes)
        const anonKeyMatch = envContent.match(/SUPABASE_ANON_KEY=["']?([^"'\n]+)["']?/);
        let anonKey = anonKeyMatch ? anonKeyMatch[1] : '';
        const looksLikeJwt = (k) => k && k.split('.').length === 3 && !/^postgres/i.test(k);
        if (!looksLikeJwt(anonKey)) {
            console.error('\n⚠️  SUPABASE_ANON_KEY inválida o ausente en .env. Debe ser la clave ANON (JWT) del dashboard, no la DATABASE_URL.');
            console.error('Ejemplo: eyJhbGciOiJI... (formato con 3 segmentos separados por puntos).');
        }

        console.log('\n=== CONFIGURACIÓN DETECTADA ===');
        console.log('SUPABASE_URL:', supabaseUrl || '(vacío)');
        console.log('SUPABASE_ANON_KEY:', looksLikeJwt(anonKey) ? '(formato JWT válido)' : '(inválida)');

        // Actualizar HTMLs si hay URL y KEY válidos
        if (supabaseUrl && looksLikeJwt(anonKey)) {
            updateHtmlMeta(path.join(__dirname, '..', 'src', 'login', 'new-auth.html'), supabaseUrl, anonKey);
            updateHtmlMeta(path.join(__dirname, '..', 'src', 'q', 'form.html'), supabaseUrl, anonKey);
            updateHtmlMeta(path.join(__dirname, '..', 'src', 'perfil-cuestionario.html'), supabaseUrl, anonKey);
            console.log('\n✅ Metas actualizadas en archivos HTML clave.');
        } else {
            console.log('\nℹ️  No se actualizaron metas porque falta SUPABASE_URL o la ANON KEY es inválida.');
            console.log('   - Añade SUPABASE_URL="https://<project-ref>.supabase.co"');
            console.log('   - Añade SUPABASE_ANON_KEY="<tu_anon_key>"');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function updateHtmlMeta(htmlPath, supabaseUrl, anonKey) {
    try {
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Asegurar existencia de metas; si no existen, insertarlas en <head>
        if (!/<meta name="supabase-url"/i.test(htmlContent)) {
            htmlContent = htmlContent.replace(
                /<head>([\s\S]*?)<\/head>/i,
                (m, inner) => `<head>${inner}\n    <meta name="supabase-url" content="${supabaseUrl}">\n    <meta name="supabase-key" content="${anonKey}">\n</head>`
            );
        } else {
            htmlContent = htmlContent.replace(
                /<meta name="supabase-url" content="[^"]*">/,
                `<meta name="supabase-url" content="${supabaseUrl}">`
            );
            if (/<meta name="supabase-key"/i.test(htmlContent)) {
                htmlContent = htmlContent.replace(
                    /<meta name="supabase-key" content="[^"]*">/,
                    `<meta name="supabase-key" content="${anonKey}">`
                );
            } else {
                htmlContent = htmlContent.replace(
                    /<meta name="supabase-url"[^>]*>\s*/,
                    (m) => `${m}\n    <meta name="supabase-key" content="${anonKey}">\n`
                );
            }
        }
        
        fs.writeFileSync(htmlPath, htmlContent);
        console.log(`✅ Metas actualizadas en ${path.relative(path.join(__dirname, '..'), htmlPath)}`);
        
    } catch (error) {
        console.error('Error actualizando HTML:', error.message);
    }
}

// Ejecutar
extractSupabaseConfig();