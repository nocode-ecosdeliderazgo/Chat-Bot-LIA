# PROMPT PARA CLAUDE - IMPLEMENTACIÓN BOTÓN COMUNIDAD

## OBJETIVO
Implementar paso a paso un botón de "Comunidad" en la página `chat-online.html` que funcione de manera similar a los botones de "Transcripción" y "Resumen" existentes.

## ANÁLISIS DEL CÓDIGO ACTUAL

### 1. ESTRUCTURA HTML (Líneas 450-480)
Los botones de transcripción y resumen están en la sección `.content-tabs`:

```html
<div class="content-tabs">
    <button class="tab-btn active" data-content="transcript">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        Transcripción
    </button>
    <button class="tab-btn" data-content="summary">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        Resumen
    </button>
    <button class="tab-btn" data-content="quiz">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Quiz
    </button>
</div>
```

### 2. ESTILOS CSS (Líneas 939-980)
Los estilos están definidos en `.content-tabs` y `.tab-btn`:

```css
.content-tabs {
    display: flex;
    gap: 0.5rem;
    border-bottom: var(--glass-border-subtle);
    padding-bottom: 1rem;
}

.tab-btn {
    background: transparent;
    border: none;
    color: var(--glass-text-secondary);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 44px;
}

.tab-btn.active {
    background: var(--glass-primary);
    color: var(--glass-text-dark);
}
```

### 3. FUNCIONALIDAD JAVASCRIPT (Líneas 584-650)
La lógica está en `setupContentTabs()` y `updateContentArea()`:

```javascript
setupContentTabs() {
    const tabButtons = document.querySelectorAll('.content-tabs .tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const contentType = e.currentTarget.dataset.content;
            console.log(`📄 Cambiando contenido a: ${contentType}`);
            this.switchContentTab(contentType);
        });
    });
}

updateContentArea(contentType) {
    const contentArea = document.querySelector('.content-area');
    if (!contentArea) return;
    
    switch(contentType) {
        case 'transcript':
            contentArea.innerHTML = `
                <div class="transcript-content">
                    ${this.getModuleTranscript(this.currentModule)}
                </div>
            `;
            break;
        case 'summary':
            contentArea.innerHTML = `
                <div class="summary-content">
                    <h4>Resumen del Módulo</h4>
                    <ul>
                        <li>Conceptos fundamentales de redes neuronales</li>
                        <li>Perceptrones simples y su funcionamiento</li>
                        <li>Funciones de activación (sigmoid, tanh, ReLU)</li>
                        <li>Aplicaciones prácticas en IA</li>
                    </ul>
                </div>
            `;
            break;
        case 'community':
            contentArea.innerHTML = `
                <div class="community-content">
                    <h4>Comunidad de Aprendizaje</h4>
                    <div class="community-features">
                        <div class="community-section">
                            <h5>📚 Foros de Discusión</h5>
                            <p>Comparte ideas y resuelve dudas con otros estudiantes</p>
                        </div>
                        <div class="community-section">
                            <h5>🤝 Grupos de Estudio</h5>
                            <p>Únete a grupos según tu nivel y intereses</p>
                        </div>
                        <div class="community-section">
                            <h5>💡 Proyectos Colaborativos</h5>
                            <p>Participa en proyectos de IA con la comunidad</p>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}
```

## IMPLEMENTACIÓN PASO A PASO

### PASO 1: AGREGAR EL BOTÓN HTML
Agregar el botón de "Comunidad" después del botón de "Quiz":

```html
<button class="tab-btn" data-content="community">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
    Comunidad
</button>
```

### PASO 2: ACTUALIZAR LA FUNCIÓN JAVASCRIPT
Modificar `updateContentArea()` para incluir el caso de "community":

```javascript
updateContentArea(contentType) {
    const contentArea = document.querySelector('.content-area');
    if (!contentArea) return;
    
    switch(contentType) {
        case 'transcript':
            contentArea.innerHTML = `
                <div class="transcript-content">
                    ${this.getModuleTranscript(this.currentModule)}
                </div>
            `;
            break;
        case 'summary':
            contentArea.innerHTML = `
                <div class="summary-content">
                    <h4>Resumen del Módulo</h4>
                    <ul>
                        <li>Conceptos fundamentales de redes neuronales</li>
                        <li>Perceptrones simples y su funcionamiento</li>
                        <li>Funciones de activación (sigmoid, tanh, ReLU)</li>
                        <li>Aplicaciones prácticas en IA</li>
                    </ul>
                </div>
            `;
            break;
        case 'community':
            contentArea.innerHTML = `
                <div class="community-content">
                    <h4>Comunidad de Aprendizaje</h4>
                    <div class="community-features">
                        <div class="community-section">
                            <h5>📚 Foros de Discusión</h5>
                            <p>Comparte ideas y resuelve dudas con otros estudiantes</p>
                        </div>
                        <div class="community-section">
                            <h5>🤝 Grupos de Estudio</h5>
                            <p>Únete a grupos según tu nivel y intereses</p>
                        </div>
                        <div class="community-section">
                            <h5>💡 Proyectos Colaborativos</h5>
                            <p>Participa en proyectos de IA con la comunidad</p>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}
```

### PASO 3: AGREGAR ESTILOS CSS (OPCIONAL)
Si se desea personalizar el contenido de la comunidad, agregar estilos específicos:

```css
.community-content {
    color: var(--glass-text-secondary);
    line-height: 1.6;
}

.community-features {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
}

.community-section {
    background: rgba(68, 229, 255, 0.05);
    border: 1px solid rgba(68, 229, 255, 0.1);
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.3s ease;
}

.community-section:hover {
    background: rgba(68, 229, 255, 0.08);
    border-color: rgba(68, 229, 255, 0.2);
}

.community-section h5 {
    color: var(--glass-primary);
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.community-section p {
    margin: 0;
    color: var(--glass-text-secondary);
    font-size: 0.9rem;
}
```

## INSTRUCCIONES PARA CLAUDE

1. **PRIMERO**: Analiza el código actual en `chat-online.html` para entender la estructura exacta
2. **SEGUNDO**: Agrega el botón de "Comunidad" en la sección `.content-tabs` después del botón "Quiz"
3. **TERCERO**: Modifica la función `updateContentArea()` en `chat-online.js` para incluir el caso "community"
4. **CUARTO**: Verifica que el botón funcione correctamente al hacer clic
5. **QUINTO**: Asegúrate de que el contenido de la comunidad se muestre correctamente en el área de contenido

## CONSIDERACIONES IMPORTANTES

- Mantén la consistencia visual con los otros botones
- Usa el mismo patrón de datos (`data-content="community"`)
- El icono SVG debe ser apropiado para "comunidad" (grupo de personas)
- El contenido debe ser relevante para una comunidad de aprendizaje de IA
- Mantén el mismo estilo de transiciones y estados activos

## VERIFICACIÓN FINAL

Después de implementar:
1. El botón debe aparecer visualmente igual a los otros
2. Al hacer clic debe cambiar a estado activo
3. El contenido de la comunidad debe mostrarse en el área de contenido
4. Los otros botones deben seguir funcionando normalmente
5. El diseño debe ser responsive y mantener la estética glassmorphism
