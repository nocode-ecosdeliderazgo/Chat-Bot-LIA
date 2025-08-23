const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://miwbzotcuaywpdbidpwo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd2J6b3RjdWF5d3BkYmlkcHdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYxMTIyOSwiZXhwIjoyMDcwMTg3MjI5fQ.AENCuzy-2PTgTMMKELVeOXScXp4dD-t7SfKVHwu1ld0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdopcionTable() {
    try {
        console.log('🔍 Verificando tabla adopcion_genai...');
        
        // Verificar si la tabla existe
        const { data, error } = await supabase
            .from('adopcion_genai')
            .select('*')
            .limit(5);
        
        if (error) {
            console.error('❌ Error accediendo a la tabla:', error);
            return;
        }
        
        console.log('✅ Tabla encontrada');
        console.log('📊 Datos encontrados:', data.length, 'registros');
        
        if (data.length > 0) {
            console.log('📋 Primeros registros:');
            data.forEach((item, index) => {
                console.log(`${index + 1}. ${item.pais}: ${item.indice_aipi}`);
            });
        } else {
            console.log('📭 La tabla está vacía');
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
    }
}

checkAdopcionTable();
