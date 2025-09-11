# PROMPT PARA CLAUDE CODE - ARREGLAR ERROR DE SUPABASE EN GENAI-FORM.JS

## PROBLEMA ACTUAL
Estoy recibiendo un `TypeError: this.supabase.from is not a function` en `src/Chat-Online/genai-form.js`. Este error ocurre específicamente en las funciones `updateAreaBadge` y `loadQuestions`, lo que indica que la instancia de Supabase (`this.supabase`) no está siendo inicializada o referenciada correctamente dentro de la clase `GenAIQuestionnaire`.

El log de errores es el siguiente:
```
❌ Error actualizando badge de área: TypeError: this.supabase.from is not a function
    at GenAIQuestionnaire.updateAreaBadge (genai-form.js:285:22)
    at GenAIQuestionnaire.loadUserInfo (genai-form.js:133:20)
    at GenAIQuestionnaire.init (genai-form.js:34:24)
updateAreaBadge @ genai-form.js:297
loadUserInfo @ genai-form.js:133
init @ genai-form.js:34
await in init
GenAIQuestionnaire @ genai-form.js:23
initializeQuestionnaire @ genai-form.js:900
genai-form.js:135 ✅ Usuario cargado: {userId: 'ae936bba-710c-462b-8e17-18d9ff920299', originalArea: 'Administración Pública/Gobierno', genaiArea: 4, genaiRol: 3}
genai-form.js:305 🔍 Cargando preguntas para área ID: 4, rol ID: 3
genai-form.js:381 ❌ Error cargando preguntas: TypeError: this.supabase.from is not a function
    at GenAIQuestionnaire.loadQuestions (genai-form.js:309:18)
    at GenAIQuestionnaire.init (genai-form.js:37:24)
loadQuestions @ genai-form.js:381
init @ genai-form.js:37
await in init
GenAIQuestionnaire @ genai-form.js:23
initializeQuestionnaire @ genai-form.js:900
genai-form.js:48 ❌ Error inicializando cuestionario GenAI: Error: Error cargando preguntas: this.supabase.from is not a function
    at GenAIQuestionnaire.loadQuestions (genai-form.js:382:19)
    at GenAIQuestionnaire.init (genai-form.js:37:24)
init @ genai-form.js:48
await in init
GenAIQuestionnaire @ genai-form.js:23
initializeQuestionnaire @ genai-form.js:900
genai-form.js:847 ❌ Error mostrado al usuario: Error cargando el cuestionario. Por favor recarga la página.
```

La imagen adjunta muestra la interfaz del cuestionario GenAI, lo que confirma que el contexto es la carga de este formulario.

## ARCHIVOS INVOLUCRADOS
- `src/Chat-Online/genai-form.js`: Contiene la clase `GenAIQuestionnaire` donde ocurre el error.
- `src/scripts/supabase-client.js`: Responsable de inicializar el cliente de Supabase y exponerlo globalmente (probablemente como `window.supabase`).
- `src/Chat-Online/chat-online.html`: Donde se carga `genai-form.js` y se inicializa la clase `GenAIQuestionnaire`.

## TAREAS ESPECÍFICAS

### 1. DIAGNOSTICAR EL PROBLEMA
- **Verificar inicialización de Supabase:** Asegurarse de que `window.supabase` esté correctamente inicializado y disponible *antes* de que la clase `GenAIQuestionnaire` intente usarlo.
- **Revisar constructor de `GenAIQuestionnaire`:** Examinar cómo se está pasando o asignando la instancia de Supabase a `this.supabase` dentro del constructor o método `init` de `GenAIQuestionnaire`.
- **Identificar conflictos o errores de carga:** Buscar cualquier escenario donde `genai-form.js` pueda estar intentando acceder a `this.supabase` antes de que el cliente de Supabase esté completamente listo.

### 2. SOLUCIONAR EL ERROR
- **Asegurar la disponibilidad de `supabase`:**
    - Modificar el constructor de `GenAIQuestionnaire` para que reciba explícitamente la instancia de Supabase como un argumento.
    - O, si se accede globalmente, asegurar que la inicialización de `GenAIQuestionnaire` se retrase hasta que `window.supabase` esté garantizado como disponible (por ejemplo, usando un `DOMContentLoaded` listener o un `setTimeout` si es necesario, aunque pasar la instancia es más robusto).
- **Actualizar la inicialización de `GenAIQuestionnaire` en `chat-online.html`:** Si se modifica el constructor, actualizar la llamada a `new GenAIQuestionnaire()` para pasar la instancia de `window.supabase`.
- **Refactorizar `genai-form.js`:** Asegurar que `this.supabase` dentro de la clase `GenAIQuestionnaire` siempre se refiera a una instancia válida del cliente de Supabase.

## CÓDIGO ESPERADO (Ejemplo de cómo podría ser la solución)

**En `src/Chat-Online/genai-form.js`:**
```javascript
// Posiblemente modificar el constructor para recibir supabase
class GenAIQuestionnaire {
    constructor(supabaseClient) {
        if (!supabaseClient || typeof supabaseClient.from !== 'function') {
            console.error('❌ Supabase client no válido pasado a GenAIQuestionnaire.');
            throw new Error('Supabase client must be provided and valid.');
        }
        this.supabase = supabaseClient;
        // ... resto del constructor
    }

    async init() {
        // ...
        await this.loadUserInfo();
        await this.loadQuestions();
        // ...
    }

    async updateAreaBadge() {
        // Asegurarse de que this.supabase sea válido aquí
        if (!this.supabase || typeof this.supabase.from !== 'function') {
            console.error('❌ this.supabase no es una función en updateAreaBadge.');
            return; // O lanzar un error
        }
        const { data, error } = await this.supabase.from('user_profiles')
            .select('genai_area')
            .eq('user_id', this.currentUser.userId)
            .single();
        // ...
    }

    async loadQuestions() {
        // Asegurarse de que this.supabase sea válido aquí
        if (!this.supabase || typeof this.supabase.from !== 'function') {
            console.error('❌ this.supabase no es una función en loadQuestions.');
            return; // O lanzar un error
        }
        const { data, error } = await this.supabase.from('genai_questions')
            .select('*')
            .eq('area_id', this.currentAreaId)
            .eq('rol_id', this.currentRolId)
            .order('order', { ascending: true });
        // ...
    }
    // ... otras funciones
}
```

**En `src/Chat-Online/chat-online.html` (o donde se inicialice `GenAIQuestionnaire`):**
```html
<script type="module">
    import { initializeQuestionnaire } from './genai-form.js'; // Si es un módulo
    // Asegurarse de que window.supabase esté disponible
    document.addEventListener('DOMContentLoaded', async () => {
        if (window.supabase) {
            await initializeQuestionnaire(window.supabase); // Pasar la instancia de supabase
        } else {
            console.error('❌ Supabase client no disponible globalmente.');
            // Implementar un retry o un mensaje de error al usuario
        }
    });
</script>
```
O si `initializeQuestionnaire` ya es una función global:
```javascript
// En chat-online.html, dentro de un script o después de cargar genai-form.js
document.addEventListener('DOMContentLoaded', async () => {
    if (window.supabase) {
        // Asumiendo que initializeQuestionnaire puede tomar el cliente de supabase
        await initializeQuestionnaire(window.supabase); 
    } else {
        console.error('❌ Supabase client no disponible globalmente al inicializar el cuestionario.');
        // Considerar un mecanismo de reintento o mostrar un error al usuario
    }
});
```

## VERIFICACIÓN
- Recargar la página del cuestionario.
- Verificar que no aparezcan errores en la consola relacionados con `this.supabase.from is not a function`.
- Confirmar que el badge del área se actualice correctamente.
- Confirmar que las preguntas del cuestionario se carguen y muestren en la interfaz.

## INSTRUCCIONES ESPECÍFICAS
- NO modificar otros archivos que no sean los mencionados
- Mantener la funcionalidad existente del cuestionario
- Asegurar que la interfaz del cuestionario GenAI funcione correctamente
- Agregar logs de debugging para verificar la inicialización de Supabase
- Probar cada cambio paso a paso

## PRIORIDAD
ALTA - El cuestionario GenAI es funcionalidad crítica y debe funcionar correctamente sin errores de Supabase.