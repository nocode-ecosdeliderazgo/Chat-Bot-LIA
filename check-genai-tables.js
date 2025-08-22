const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.miwbzotcuaywpdbidpwo:EcosDeLiderazgo2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
});

async function checkTables() {
  try {
    await client.connect();
    console.log('✅ Conectado a Supabase');
    
    console.log('\n🔍 Verificando tablas GenAI...');
    
    // Check if genai_questions table exists
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'genai_%'
    `);
    
    console.log('📋 Tablas GenAI encontradas:', tablesResult.rows.map(r => r.table_name));
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No se encontraron tablas GenAI. Ejecutar migración primero.');
      return;
    }
    
    // Check if genai_questions exists specifically
    const hasGenaiQuestions = tablesResult.rows.some(r => r.table_name === 'genai_questions');
    
    if (hasGenaiQuestions) {
      // Check questions count
      const questionsResult = await client.query('SELECT COUNT(*) as count FROM genai_questions');
      console.log(`📊 Total preguntas GenAI: ${questionsResult.rows[0].count}`);
      
      // Check areas
      const areasResult = await client.query('SELECT DISTINCT genai_area FROM genai_questions ORDER BY genai_area');
      console.log('🏢 Áreas disponibles:');
      areasResult.rows.forEach(row => console.log(`   - ${row.genai_area}`));
      
      // Check question types
      const typesResult = await client.query('SELECT question_type, COUNT(*) as count FROM genai_questions GROUP BY question_type');
      console.log('\n📋 Tipos de preguntas:');
      typesResult.rows.forEach(row => console.log(`   - ${row.question_type}: ${row.count}`));
      
      // Sample questions
      const sampleResult = await client.query('SELECT question_text, genai_area, question_type FROM genai_questions LIMIT 3');
      console.log('\n📝 Muestra de preguntas:');
      sampleResult.rows.forEach(row => {
        console.log(`   - [${row.genai_area}] [${row.question_type}] ${row.question_text.substring(0, 80)}...`);
      });
      
    } else {
      console.log('❌ Tabla genai_questions no existe');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();