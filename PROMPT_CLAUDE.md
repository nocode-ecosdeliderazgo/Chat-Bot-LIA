# PROMPT PARA CLAUDE - SOLUCIONAR CARGA DE PREGUNTAS DE COMUNIDAD

## 🎯 OBJETIVO PRINCIPAL
Solucionar el problema de carga de preguntas de la comunidad en `chat-online.html`. Las preguntas existen en la base de datos de Supabase pero no se están cargando correctamente en la interfaz.

## 🔍 DIAGNÓSTICO REALIZADO
Se ha identificado que:
- ✅ Las preguntas existen en Supabase
- ✅ Los archivos de API están configurados (`community-api.js`, `community-database.js`)
- ❌ Las preguntas no se cargan en la interfaz
- ❌ Posibles problemas de conexión o configuración

## 📋 TAREAS A REALIZAR

### PASO 1: DIAGNOSTICAR EL PROBLEMA
1. **Verificar conexión a Supabase**
   - Revisar si `window.supabase` está disponible
   - Verificar configuración de URL y API key
   - Comprobar autenticación de usuario

2. **Verificar tablas de base de datos**
   - Confirmar que existe la tabla `community_questions`
   - Verificar permisos RLS (Row Level Security)
   - Comprobar estructura de datos

3. **Revisar errores en consola**
   - Abrir DevTools en `chat-online.html`
   - Buscar errores relacionados con comunidad
   - Verificar logs de carga de datos

### PASO 2: IMPLEMENTAR SOLUCIÓN PASO A PASO

#### 2.1 Verificar y corregir conexión a Supabase
```javascript
// En chat-online.js, función loadCommunityQuestions()
async loadCommunityQuestions() {
    console.log('🔍 Iniciando carga de preguntas de comunidad...');
    
    // Verificar si Supabase está disponible
    if (!window.supabase) {
        console.error('❌ Supabase no está disponible');
        this.showCommunityError('Supabase no configurado');
        return;
    }
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError) {
        console.error('❌ Error de autenticación:', authError);
        this.showCommunityError('Error de autenticación');
        return;
    }
    
    console.log('✅ Usuario autenticado:', user?.email || 'Anónimo');
    
    // Intentar cargar preguntas
    try {
        const { data: questions, error } = await window.supabase
            .from('community_questions')
            .select(`
                *,
                users:user_id (
                    id,
                    display_name,
                    username,
                    profile_picture_url
                )
            `)
            .order('created_at', { ascending: false })
            .limit(20);
            
        if (error) {
            console.error('❌ Error cargando preguntas:', error);
            this.showCommunityError(`Error: ${error.message}`);
            return;
        }
        
        console.log('✅ Preguntas cargadas:', questions.length);
        this.renderCommunityQuestions(questions);
        
    } catch (error) {
        console.error('❌ Error general:', error);
        this.showCommunityError('Error inesperado');
    }
}
```

#### 2.2 Implementar fallback con CommunityDatabase
```javascript
// Si Supabase falla, usar CommunityDatabase como fallback
async loadCommunityQuestionsWithFallback() {
    console.log('🔄 Intentando cargar con fallback...');
    
    try {
        // Intentar con Supabase primero
        await this.loadCommunityQuestions();
    } catch (error) {
        console.warn('⚠️ Supabase falló, usando CommunityDatabase...');
        
        try {
            // Inicializar CommunityDatabase si no existe
            if (!this.communityDB) {
                this.communityDB = new window.CommunityDatabase();
                await this.communityDB.initialize();
            }
            
            // Cargar preguntas con CommunityDatabase
            const questions = await this.communityDB.getQuestions({
                course_id: this.currentCourseId,
                module_id: `module-${this.currentModule}`
            });
            
            console.log('✅ Preguntas cargadas con CommunityDatabase:', questions.length);
            this.renderCommunityQuestions(questions);
            
        } catch (dbError) {
            console.error('❌ CommunityDatabase también falló:', dbError);
            this.showCommunityError('No se pudieron cargar las preguntas');
        }
    }
}
```

#### 2.3 Mejorar manejo de errores y estados
```javascript
// Función para mostrar errores de manera amigable
showCommunityError(message) {
    const questionsList = document.getElementById('questionsList');
    if (questionsList) {
        questionsList.innerHTML = `
            <div class="community-error">
                <div class="error-icon">⚠️</div>
                <h3>Error al cargar preguntas</h3>
                <p>${message}</p>
                <button onclick="window.chatOnline.loadCommunityQuestionsWithFallback()" class="retry-btn">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Función para mostrar estado de carga
showCommunityLoading() {
    const questionsList = document.getElementById('questionsList');
    if (questionsList) {
        questionsList.innerHTML = `
            <div class="community-loading">
                <div class="loading-spinner"></div>
                <p>Cargando preguntas de la comunidad...</p>
</div>
        `;
    }
}

// Función para mostrar estado vacío
showCommunityEmpty() {
    const questionsList = document.getElementById('questionsList');
    if (questionsList) {
        questionsList.innerHTML = `
            <div class="community-empty">
                <div class="empty-icon">💬</div>
                <h3>No hay preguntas aún</h3>
                <p>Sé el primero en hacer una pregunta sobre este módulo</p>
                <button onclick="window.chatOnline.showAskQuestionForm()" class="ask-question-btn">
                    Hacer Pregunta
                </button>
  </div>
        `;
    }
}
```

#### 2.4 Corregir renderizado de preguntas
```javascript
// Función mejorada para renderizar preguntas
renderCommunityQuestions(questions) {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) {
        console.error('❌ Elemento questionsList no encontrado');
        return;
    }
    
    if (!questions || questions.length === 0) {
        this.showCommunityEmpty();
        return;
    }
    
    console.log('🎨 Renderizando preguntas:', questions.length);
    
    const questionsHTML = questions.map(question => {
        const author = question.users || { display_name: 'Usuario', username: 'usuario' };
        const timeAgo = this.formatTimeAgo(question.created_at);
        
        return `
            <div class="question-card" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-meta">
                        <span class="question-author">${author.display_name || author.username}</span>
                        <span class="question-time">${timeAgo}</span>
                    </div>
                    <div class="question-stats">
                        <span class="question-answers">${question.answers_count || 0} respuestas</span>
                        <span class="question-views">${question.views_count || 0} vistas</span>
  </div>
</div>
                <h3 class="question-title">${question.title}</h3>
                <p class="question-content">${question.content}</p>
                <div class="question-tags">
                    ${(question.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
  </div>
                <div class="question-actions">
                    <button class="action-btn" onclick="window.chatOnline.viewQuestion('${question.id}')">
                        Ver Pregunta
                    </button>
                    <button class="action-btn" onclick="window.chatOnline.bookmarkQuestion('${question.id}')">
                        Guardar
                    </button>
  </div>
</div>
        `;
    }).join('');
    
    questionsList.innerHTML = questionsHTML;
    console.log('✅ Preguntas renderizadas correctamente');
}
```

### PASO 3: AGREGAR ESTILOS CSS PARA ESTADOS
```css
/* En chat-online.css */
.community-error,
.community-loading,
.community-empty {
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin: 1rem 0;
}

.error-icon,
.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(68, 229, 255, 0.3);
    border-top: 3px solid var(--glass-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.retry-btn,
.ask-question-btn {
    background: var(--glass-primary);
    color: var(--glass-text-dark);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

.retry-btn:hover,
.ask-question-btn:hover {
    background: var(--glass-primary-dark);
    transform: translateY(-2px);
}
```

### PASO 4: VERIFICAR Y CORREGIR CONFIGURACIÓN

#### 4.1 Verificar meta tags en HTML
```html
<!-- En chat-online.html, dentro de <head> -->
<meta name="supabase-url" content="TU_URL_DE_SUPABASE">
<meta name="supabase-key" content="TU_CLAVE_ANON_DE_SUPABASE">
```

#### 4.2 Verificar carga de scripts
```html
<!-- Al final de chat-online.html, antes de </body> -->
<script src="../scripts/supabase-client.js"></script>
<script src="../scripts/community-database.js"></script>
<script src="api/community-api.js"></script>
<script src="chat-online.js"></script>
```

## 🔧 COMANDOS DE VERIFICACIÓN

### 1. Verificar en consola del navegador:
```javascript
// Ejecutar en DevTools de chat-online.html
console.log('Supabase:', window.supabase);
console.log('CommunityDatabase:', window.CommunityDatabase);
console.log('CommunityAPI:', window.communityAPI);

// Verificar usuario autenticado
window.supabase.auth.getUser().then(({data: {user}}) => {
    console.log('Usuario:', user);
});

// Verificar tablas
window.supabase.from('community_questions').select('*').limit(1).then(({data, error}) => {
    console.log('Preguntas:', data, 'Error:', error);
});
```

### 2. Verificar configuración de Supabase:
- URL debe ser: `https://tu-proyecto.supabase.co`
- Key debe ser una clave anónima válida
- Tabla `community_questions` debe existir
- RLS debe estar configurado correctamente

## ✅ CRITERIOS DE ÉXITO

1. **✅ Conexión establecida:** Supabase se conecta correctamente
2. **✅ Preguntas cargadas:** Se muestran preguntas reales de la base de datos
3. **✅ Manejo de errores:** Errores se muestran de manera amigable
4. **✅ Estados visuales:** Loading, error y empty states funcionan
5. **✅ Fallback funcional:** CommunityDatabase funciona como respaldo
6. **✅ Sin contenido hardcodeado:** Solo datos reales de la base de datos

## 🚨 PUNTOS CRÍTICOS

1. **NO eliminar funcionalidad existente** - Solo corregir la carga de datos
2. **Mantener compatibilidad** - Asegurar que funcione en localhost y Netlify
3. **Manejar errores gracefully** - Mostrar mensajes útiles al usuario
4. **Verificar configuración** - Asegurar que Supabase esté bien configurado
5. **Probar paso a paso** - Verificar cada cambio antes de continuar

## 📝 ORDEN DE IMPLEMENTACIÓN

1. **PRIMERO:** Diagnosticar el problema específico
2. **SEGUNDO:** Corregir conexión a Supabase
3. **TERCERO:** Implementar fallback con CommunityDatabase
4. **CUARTO:** Mejorar manejo de errores y estados
5. **QUINTO:** Agregar estilos CSS para estados
6. **SEXTO:** Verificar y probar todo el flujo

---

**IMPORTANTE:** Trabajar paso a paso, verificar cada cambio y mantener la funcionalidad existente. El objetivo es que las preguntas de la comunidad se carguen correctamente desde Supabase.
