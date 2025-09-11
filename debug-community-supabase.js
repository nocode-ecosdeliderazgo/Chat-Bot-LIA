// SCRIPT DE DEPURACIÓN - COMUNIDAD SUPABASE
// Ejecutar en consola del navegador en chat-online.html

console.log('🔍 === INICIANDO DEPURACIÓN DE COMUNIDAD SUPABASE ===');

// Función de depuración principal
async function debugCommunitySupabase() {
    console.log('\n📋 1. VERIFICANDO COMPONENTES DISPONIBLES...');
    
    // Verificar Supabase
    console.log('Supabase SDK:', typeof supabase !== 'undefined' ? '✅' : '❌');
    console.log('window.supabase:', typeof window.supabase !== 'undefined' ? '✅' : '❌');
    console.log('SUPABASE_URL:', window.SUPABASE_URL || '❌ No configurada');
    console.log('SUPABASE_ANON_KEY:', window.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
    
    // Verificar ChatOnline
    console.log('window.chatOnline:', typeof window.chatOnline !== 'undefined' ? '✅' : '❌');
    console.log('CommunityDatabase:', typeof window.CommunityDatabase !== 'undefined' ? '✅' : '❌');
    console.log('communityAPI:', typeof window.communityAPI !== 'undefined' ? '✅' : '❌');
    
    console.log('\n📋 2. VERIFICANDO CONFIGURACIÓN DE SUPABASE...');
    
    if (window.supabase) {
        try {
            // Verificar autenticación
            const { data: { user }, error: authError } = await window.supabase.auth.getUser();
            if (authError) {
                console.warn('⚠️ Error de autenticación:', authError.message);
            } else {
                console.log('✅ Usuario autenticado:', user?.email || 'Anónimo');
            }
            
            // Verificar tabla de preguntas
            console.log('\n📋 3. PROBANDO CONSULTA A SUPABASE...');
            const { data: questions, error } = await window.supabase
                .from('community_questions')
                .select('*')
                .limit(5);
                
            if (error) {
                console.error('❌ Error consultando preguntas:', error);
            } else {
                console.log('✅ Preguntas encontradas:', questions.length);
                if (questions.length > 0) {
                    console.log('📄 Primera pregunta:', {
                        id: questions[0].id,
                        title: questions[0].title,
                        created_at: questions[0].created_at
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error general con Supabase:', error);
        }
    } else {
        console.error('❌ Cliente de Supabase no inicializado');
    }
    
    console.log('\n📋 4. PROBANDO FUNCIONES DE CHAT-ONLINE...');
    
    if (window.chatOnline) {
        // Verificar funciones
        const functionsToCheck = [
            'loadCommunityQuestions',
            'loadCommunityQuestionsWithFallback',
            'showCommunityLoading',
            'showCommunityError',
            'showCommunityEmpty',
            'renderCommunityQuestions',
            'showAskQuestionForm',
            'viewQuestion',
            'bookmarkQuestion'
        ];
        
        functionsToCheck.forEach(funcName => {
            const exists = typeof window.chatOnline[funcName] === 'function';
            console.log(`${funcName}:`, exists ? '✅' : '❌');
        });
        
        // Verificar variables de estado
        console.log('\n📊 Variables de estado:');
        console.log('currentCourseId:', window.chatOnline.currentCourseId || 'No definido');
        console.log('currentModule:', window.chatOnline.currentModule || 'No definido');
        console.log('loadingQuestions:', !!window.chatOnline.loadingQuestions);
        console.log('communityQuestionsLoaded:', !!window.chatOnline.communityQuestionsLoaded);
    }
    
    console.log('\n📋 5. VERIFICANDO DOM...');
    
    const questionsList = document.getElementById('questionsList');
    console.log('questionsList element:', questionsList ? '✅' : '❌');
    if (questionsList) {
        console.log('questionsList content length:', questionsList.innerHTML.length);
        console.log('questionsList has content:', questionsList.innerHTML.trim().length > 0 ? '✅' : '❌');
    }
    
    console.log('\n🔧 === COMANDOS DE PRUEBA DISPONIBLES ===');
    console.log('Ejecuta estos comandos para probar:');
    console.log('1. await testLoadQuestions() - Probar carga de preguntas');
    console.log('2. testStates() - Probar estados visuales');
    console.log('3. testFallback() - Probar sistema de fallback');
    console.log('4. forceReload() - Forzar recarga de preguntas');
}

// Función para probar carga de preguntas
async function testLoadQuestions() {
    console.log('🧪 PROBANDO CARGA DE PREGUNTAS...');
    
    if (!window.chatOnline) {
        console.error('❌ window.chatOnline no disponible');
        return;
    }
    
    try {
        await window.chatOnline.loadCommunityQuestions('debug-test');
        console.log('✅ Test de carga completado');
    } catch (error) {
        console.error('❌ Error en test de carga:', error);
    }
}

// Función para probar estados
function testStates() {
    console.log('🧪 PROBANDO ESTADOS VISUALES...');
    
    if (!window.chatOnline) {
        console.error('❌ window.chatOnline no disponible');
        return;
    }
    
    setTimeout(() => {
        console.log('Mostrando estado de carga...');
        window.chatOnline.showCommunityLoading();
    }, 1000);
    
    setTimeout(() => {
        console.log('Mostrando estado de error...');
        window.chatOnline.showCommunityError('Esto es una prueba de error');
    }, 3000);
    
    setTimeout(() => {
        console.log('Mostrando estado vacío...');
        window.chatOnline.showCommunityEmpty();
    }, 5000);
    
    console.log('✅ Secuencia de estados iniciada');
}

// Función para probar fallback
async function testFallback() {
    console.log('🧪 PROBANDO SISTEMA DE FALLBACK...');
    
    if (!window.chatOnline) {
        console.error('❌ window.chatOnline no disponible');
        return;
    }
    
    try {
        await window.chatOnline.loadCommunityQuestionsWithFallback();
        console.log('✅ Test de fallback completado');
    } catch (error) {
        console.error('❌ Error en test de fallback:', error);
    }
}

// Función para forzar recarga
async function forceReload() {
    console.log('🔄 FORZANDO RECARGA DE PREGUNTAS...');
    
    if (!window.chatOnline) {
        console.error('❌ window.chatOnline no disponible');
        return;
    }
    
    // Resetear estado
    window.chatOnline.communityQuestionsLoaded = false;
    window.chatOnline.loadingQuestions = false;
    
    try {
        await window.chatOnline.loadCommunityQuestions('force-reload');
        console.log('✅ Recarga forzada completada');
    } catch (error) {
        console.error('❌ Error en recarga forzada:', error);
    }
}

// Ejecutar depuración automáticamente
debugCommunitySupabase();

// Exponer funciones globalmente para facilitar testing
window.debugCommunitySupabase = debugCommunitySupabase;
window.testLoadQuestions = testLoadQuestions;
window.testStates = testStates;
window.testFallback = testFallback;
window.forceReload = forceReload;

console.log('\n✅ Script de depuración cargado. Ejecuta debugCommunitySupabase() para revisar el estado.');