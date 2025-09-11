# PROMPT PARA CLAUDE CODE - ARREGLAR ERROR DE SUPABASE EN GENAI-FORM.JS

## PROBLEMA ACTUAL
Estoy recibiendo un `TypeError: this.supabase.from is not a function` en `src/q/genai-form.js`. Este error ocurre específicamente en las funciones `updateAreaBadge` y `loadQuestions`, lo que indica que la instancia de Supabase (`this.supabase`) no está siendo inicializada o referenciada correctamente dentro de la clase `GenAIQuestionnaire`.

El log de errores es el siguiente:
```
❌ Error actualizando badge de área: TypeError: this.supabase.from is not a function
    at GenAIQuestionnaire.updateAreaBadge (genai-form.js:285:22)
    at GenAIQuestionnaire.loadUserInfo (genai-form.js:133:20)
    at GenAIQuestionnaire.init (genai-form.js:34:24)
updateAreaBadge @ genai-form.js:297
genai-form.js:135 ✅ Usuario cargado: Object
genai-form.js:305 🔍 Cargando preguntas para área ID: 4, rol ID: 2
genai-form.js:381 ❌ Error cargando preguntas: TypeError: this.supabase.from is not a function
    at GenAIQuestionnaire.loadQuestions (genai-form.js:309:18)
    at GenAIQuestionnaire.init (genai-form.js:37:24)
loadQuestions @ genai-form.js:381
genai-form.js:48 ❌ Error inicializando cuestionario GenAI: Error: Error cargando preguntas: this.supabase.from is not a function
    at GenAIQuestionnaire.loadQuestions (genai-form.js:382:19)
    at GenAIQuestionnaire.init (genai-form.js:37:24)
init @ genai-form.js:48
genai-form.js:847 ❌ Error mostrado al usuario: Error cargando el cuestionario. Por favor recarga la página.
showError @ genai-form.js:847
supabase-client.js:230 ✅ Conexión de Supabase verificada
supabase-client.js:85 ✅ Cliente de Supabase inicializado correctamente
```

**ANÁLISIS DEL PROBLEMA:**
- El error ocurre en la línea 285 (updateAreaBadge) y 309 (loadQuestions)
- A pesar de que los logs muestran "✅ Cliente de Supabase inicializado correctamente", `this.supabase` no tiene el método `.from()`
- Esto sugiere un problema de timing: el cliente de Supabase se inicializa DESPUÉS de que la clase GenAIQuestionnaire ya intentó usarlo
- La URL del cuestionario es: `genai-form.html?area=Tecnología%2FDesarrollo+de+Software`
- También hay errores de Content Security Policy relacionados con boxicons y conexiones

La imagen adjunta muestra la interfaz del cuestionario GenAI con el error visible, confirmando que el contexto es la carga de este formulario.

## ARCHIVOS INVOLUCRADOS
- `src/q/genai-form.js`: Contiene la clase `GenAIQuestionnaire` donde ocurre el error.
- `src/scripts/supabase-client.js`: Responsable de inicializar el cliente de Supabase y exponerlo globalmente (probablemente como `window.supabase`).
- `src/q/genai-form.html`: Donde se carga `genai-form.js` y se inicializa la clase `GenAIQuestionnaire`.

## CÓDIGO ACTUAL PROBLEMÁTICO

**En `src/q/genai-form.js`:**
```javascript
class GenAIQuestionnaire {
    constructor() {
        this.supabase = null;  // ← Se inicializa como null
        // ...
        this.init();  // ← Se llama inmediatamente
    }
    
    async init() {
        try {
            // Inicializar Supabase
            await this.initializeSupabase();  // ← Aquí se asigna this.supabase
            
            // Obtener información del usuario
            await this.loadUserInfo();  // ← Aquí falla updateAreaBadge
            
            // Cargar preguntas del área
            await this.loadQuestions();  // ← Aquí también falla
            
        } catch (error) {
            console.error('❌ Error inicializando cuestionario GenAI:', error);
        }
    }
    
    async initializeSupabase() {
        // Supabase ya debería estar disponible en este punto
        if (typeof window.supabase !== 'undefined' && window.supabase) {
            this.supabase = window.supabase;
            console.log('✅ Cliente Supabase inicializado');
            return;
        }
        
        throw new Error('Cliente de Supabase no disponible');
    }
}
```

## TAREAS ESPECÍFICAS

### 1. DIAGNOSTICAR EL PROBLEMA
- **Verificar timing de inicialización:** El problema es que `window.supabase` se inicializa DESPUÉS de que `GenAIQuestionnaire` ya intentó usarlo
- **Revisar orden de carga de scripts:** Asegurarse de que `supabase-client.js` se cargue ANTES de `genai-form.js`
- **Identificar conflictos de timing:** Buscar cualquier escenario donde `genai-form.js` pueda estar intentando acceder a `this.supabase` antes de que el cliente de Supabase esté completamente listo

### 2. SOLUCIONAR EL ERROR
- **Modificar el constructor de `GenAIQuestionnaire`:**
    - Eliminar la llamada automática a `this.init()` en el constructor
    - Crear un método estático o una función de inicialización que se ejecute DESPUÉS de que `window.supabase` esté disponible
- **Actualizar la inicialización en `genai-form.html`:**
    - Asegurar que la inicialización de `GenAIQuestionnaire` se retrase hasta que `window.supabase` esté garantizado como disponible
    - Usar `DOMContentLoaded` o un mecanismo de espera para la disponibilidad de Supabase
- **Agregar validaciones robustas:**
    - Verificar que `this.supabase` tenga el método `.from()` antes de usarlo
    - Implementar un sistema de reintentos si Supabase no está disponible inmediatamente

## CÓDIGO ESPERADO (Solución)

**En `src/q/genai-form.js`:**
```javascript
class GenAIQuestionnaire {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.genaiArea = null;
        this.questions = [];
        this.responses = {};
        this.sessionId = null;
        this.totalQuestions = 0;
        this.answeredQuestions = 0;
        // ← NO llamar this.init() aquí
    }
    
    // Método estático para crear instancia de forma segura
    static async create() {
        const instance = new GenAIQuestionnaire();
        await instance.init();
        return instance;
    }
    
    async init() {
        try {
            console.log('🎯 Inicializando cuestionario GenAI...');
            
            // Esperar a que Supabase esté disponible
            await this.waitForSupabase();
            
            // Inicializar Supabase
            await this.initializeSupabase();
            
            // Obtener información del usuario
            await this.loadUserInfo();
            
            // Cargar preguntas del área
            await this.loadQuestions();
            
            // Renderizar interfaz
            this.renderQuestionnaire();
            
            // Configurar eventos
            this.setupEventListeners();
            
            console.log('✅ Cuestionario GenAI inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando cuestionario GenAI:', error);
            this.showError('Error cargando el cuestionario. Por favor recarga la página.');
        }
    }
    
    async waitForSupabase(maxAttempts = 10, delay = 100) {
        for (let i = 0; i < maxAttempts; i++) {
            if (typeof window.supabase !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') {
                console.log('✅ Supabase disponible después de', i + 1, 'intentos');
                return;
            }
            console.log(`⏳ Esperando Supabase... intento ${i + 1}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        throw new Error('Supabase no disponible después de múltiples intentos');
    }
    
    async initializeSupabase() {
        if (typeof window.supabase !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') {
            this.supabase = window.supabase;
            console.log('✅ Cliente Supabase asignado correctamente');
            return;
        }
        
        throw new Error('Cliente de Supabase no válido');
    }
    
    async updateAreaBadge() {
        // Validación robusta
        if (!this.supabase || typeof this.supabase.from !== 'function') {
            console.error('❌ this.supabase no es válido en updateAreaBadge');
            return;
        }
        
        const areaBadge = document.getElementById('areaBadge');
        if (areaBadge) {
            try {
                const { data: areaData, error: areaError } = await this.supabase
                    .from('areas')
                    .select('nombre')
                    .eq('id', this.genaiArea)
                    .single();
                
                if (areaError) {
                    console.warn('⚠️ No se pudo obtener el nombre del área:', areaError);
                    areaBadge.innerHTML = `<i class='bx bx-user-circle'></i> Área ID ${this.genaiArea}`;
                } else {
                    areaBadge.innerHTML = `<i class='bx bx-user-circle'></i> ${areaData.nombre}`;
                }
            } catch (error) {
                console.error('❌ Error actualizando badge de área:', error);
                areaBadge.innerHTML = `<i class='bx bx-user-circle'></i> Área ID ${this.genaiArea}`;
            }
        }
    }
    
    async loadQuestions() {
        // Validación robusta
        if (!this.supabase || typeof this.supabase.from !== 'function') {
            console.error('❌ this.supabase no es válido en loadQuestions');
            throw new Error('Cliente de Supabase no válido');
        }
        
        try {
            console.log(`🔍 Cargando preguntas para área ID: ${this.genaiArea}, rol ID: ${this.genaiRol}`);
            
            const { data: areaData, error: areaError } = await this.supabase
                .from('areas')
                .select('nombre')
                .eq('id', this.genaiArea)
                .single();
                
            if (areaError) {
                console.warn('⚠️ No se pudo obtener nombre del área:', areaError);
            }
            
            const { data: questions, error: questionsError } = await this.supabase
                .from('genai_questions')
                .select('*')
                .eq('area_id', this.genaiArea)
                .eq('rol_id', this.genaiRol)
                .order('order', { ascending: true });
                
            if (questionsError) {
                throw new Error(`Error cargando preguntas: ${questionsError.message}`);
            }
            
            this.questions = questions || [];
            this.totalQuestions = this.questions.length;
            
            console.log(`✅ ${this.questions.length} preguntas cargadas para ${areaData?.nombre || 'área desconocida'}`);
            
        } catch (error) {
            console.error('❌ Error cargando preguntas:', error);
            throw error;
        }
    }
}

// Función de inicialización global actualizada
async function initializeQuestionnaire() {
    try {
        console.log('🚀 Iniciando cuestionario GenAI...');
        const questionnaire = await GenAIQuestionnaire.create();
        // Asignar globalmente si es necesario
        window.genaiQuestionnaire = questionnaire;
    } catch (error) {
        console.error('❌ Error inicializando cuestionario:', error);
        // Mostrar error al usuario
        const errorContainer = document.getElementById('errorContainer') || document.body;
        errorContainer.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center;">
                <h3>Error cargando el cuestionario</h3>
                <p>Por favor recarga la página e intenta nuevamente.</p>
                <button onclick="location.reload()" style="background: #0066CC; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    Recargar Página
                </button>
            </div>
        `;
    }
}
```

**En `src/q/genai-form.html`:**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- ... otros head elements ... -->
    <!-- Asegurar que supabase-client.js se cargue PRIMERO -->
    <script src="../scripts/supabase-client.js"></script>
</head>
<body>
    <!-- ... contenido HTML ... -->
    
    <!-- Cargar genai-form.js DESPUÉS de supabase-client.js -->
    <script src="genai-form.js"></script>
    
    <script>
        // Inicializar DESPUÉS de que todo esté cargado
        document.addEventListener('DOMContentLoaded', async () => {
            // Esperar un poco más para asegurar que Supabase esté listo
            await new Promise(resolve => setTimeout(resolve, 100));
            await initializeQuestionnaire();
        });
    </script>
</body>
</html>
```

## VERIFICACIÓN
- Recargar la página del cuestionario
- Verificar que no aparezcan errores en la consola relacionados con `this.supabase.from is not a function`
- Confirmar que el badge del área se actualice correctamente
- Confirmar que las preguntas del cuestionario se carguen y muestren en la interfaz
- Verificar que los logs muestren el proceso de espera de Supabase

## INSTRUCCIONES ESPECÍFICAS
- NO modificar otros archivos que no sean los mencionados
- Mantener la funcionalidad existente del cuestionario
- Asegurar que la interfaz del cuestionario GenAI funcione correctamente
- Agregar logs de debugging detallados para verificar la inicialización de Supabase
- Implementar un sistema de espera robusto para la disponibilidad de Supabase
- Probar cada cambio paso a paso

## PRIORIDAD
ALTA - El cuestionario GenAI es funcionalidad crítica y debe funcionar correctamente sin errores de Supabase. El problema principal es de timing en la inicialización de dependencias.
