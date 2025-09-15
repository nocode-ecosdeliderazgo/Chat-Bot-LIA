# PROMPT PARA IMPLEMENTAR DISEÑO DE NOTICIA EXACTO COMO LA IMAGEN

## OBJETIVO
Crear una sección de noticias que replique EXACTAMENTE el diseño mostrado en la imagen de referencia. El diseño debe incluir un header gráfico con cerebro, secciones organizadas, y un botón CTA al final.

## ESTRUCTURA EXACTA REQUERIDA

### 1. HEADER GRÁFICO (Parte superior de la tarjeta)
- **Fondo**: Gradiente azul oscuro con efecto glassmorphism
- **Elementos centrales**:
  - Cerebro estilizado con efecto de brillo azul en el centro
  - Lupa superpuesta sobre el cerebro
  - Líneas abstractas azules brillantes (redes neuronales) emanando del cerebro
  - Engranaje azul en la esquina inferior izquierda
- **Efectos visuales**: Brillo, sombras, y efectos de glow

### 2. TÍTULO PRINCIPAL
- **Texto**: "Nueva IA reduce 50% el tiempo de auditoría – así podría ayudarte"
- **Estilo**: Grande, bold, color blanco
- **Posición**: Debajo del header gráfico

### 3. SECCIÓN TL;DR
- **Encabezado**: "TL;DR:" con ícono circular azul pequeño
- **Lista de viñetas**:
  - "Detecta errores 30% más rápido"
  - "Finaliza auditorías, menos horas rutinarias"

### 4. SECCIÓN "Por qué importa para firmas de servicios profesionales:"
- **Encabezado**: "Por qué importa para firmas de servicios profesionales:"
- **Contenido**: Texto descriptivo debajo

### 5. SECCIÓN "Qué cambió / Novedad:"
- **Encabezado**: "Qué cambió / Novedad:"
- **Lista de viñetas**:
  - "Competencia con 'Big Four'"
  - "Más tiempo estratégico"

### 6. SECCIÓN "Impacto en ingresos/eficiencia:"
- **Encabezado**: "Impacto en ingresos/eficiencia:" con ícono de gráfico de barras
- **Contenido**: "Podría reducir 30% el tiempo de análisis contable"

### 7. SECCIÓN "Riesgos y límites:" (Lista numerada)
- **Encabezado**: "Riesgos y límites:"
- **Lista numerada**:
  - "1. Prueba la versión gratuita de X"
  - "2. Identifica tareas repetitivas"
  - "3. Agenda demo con experto"

### 8. SECCIÓN "Riesgos y límites:" (Contenido detallado)
- **Encabezado**: "Riesgos y límites:"
- **Contenido**: Párrafos de texto detallado sobre riesgos

### 9. SECCIÓN "Recursos/Enlaces:"
- **Encabezado**: "Recursos/Enlaces:" con ícono de información
- **Lista de enlaces**:
  - "[Forbes México] OPEAli AuditGPT"
  - "[Strat-bridge] AI in Consulting"
  - "[Documento] IA y ética"

### 10. BOTÓN CTA
- **Texto**: "Calcula tu ahorro potencial"
- **Estilo**: Botón azul prominente que abarca casi todo el ancho
- **Posición**: Parte inferior de la tarjeta
- **Etiqueta**: "CTA:" en la esquina inferior izquierda

## ESPECIFICACIONES TÉCNICAS

### HTML Structure
```html
<section class="ai-news-section">
    <div class="container">
        <div class="news-content-card">
            <!-- Header gráfico con cerebro -->
            <div class="news-header-graphic">
                <div class="brain-icon">
                    <i class="fas fa-brain"></i>
                    <i class="fas fa-search"></i>
                </div>
                <div class="neural-lines"></div>
                <div class="gear-icon">
                    <i class="fas fa-cog"></i>
                </div>
            </div>
            
            <!-- Título principal -->
            <h1 class="news-main-title">Nueva IA reduce 50% el tiempo de auditoría – así podría ayudarte</h1>
            
            <!-- TL;DR Section -->
            <div class="tldr-section">
                <h3 class="tldr-heading">
                    <span class="tldr-icon"></span>
                    TL;DR:
                </h3>
                <ul class="tldr-items">
                    <li>Detecta errores 30% más rápido</li>
                    <li>Menos horas rutinarias</li>
                </ul>
            </div>
            
            <!-- Contenido principal en dos columnas -->
            <div class="news-main-content">
                <!-- Columna izquierda - Acciones -->
                <div class="left-column">
                    <!-- Pasos sugeridos -->
                    <div class="suggested-steps">
                        <h4 class="section-heading">Pasos sugeridos</h4>
                        <ol class="numbered-list">
                            <li>Prueba versión gratuita</li>
                            <li>Identifica repetitivas</li>
                            <li>Agenda demo con experto</li>
                        </ol>
                    </div>
                    
                    <!-- Riesgos/Límites -->
                    <div class="risks-limits">
                        <h4 class="section-heading">Riesgos/Límites</h4>
                        <ul class="section-list">
                            <li>Errores en cálculos</li>
                            <li>Sesgos posibles</li>
                            <li>Requiere validación</li>
                        </ul>
                    </div>
                    
                    <!-- Recursos/Links -->
                    <div class="resources-section">
                        <h4 class="section-heading">
                            <i class="fas fa-info-circle"></i>
                            Recursos/Links:
                        </h4>
                        <ul class="resources-list">
                            <li><a href="#">[Forbes] AuditGPT</a></li>
                            <li><a href="#">[Strat] AI Consulting</a></li>
                            <li><a href="#">[Doc] IA y ética</a></li>
                        </ul>
                    </div>
                </div>
                
                <!-- Columna derecha - Noticia -->
                <div class="right-column">
                    <!-- Por qué importa -->
                    <div class="why-matters-section">
                        <h4 class="section-heading">Por qué importa:</h4>
                        <ul class="section-list">
                            <li>Competencia Big Four</li>
                            <li>Más tiempo estrat.</li>
                        </ul>
                    </div>
                    
                    <!-- Qué cambió -->
                    <div class="what-changed-section">
                        <h4 class="section-heading">Qué cambió / Novedad:</h4>
                        <ul class="section-list">
                            <li>IA apoyo auditoría</li>
                        </ul>
                    </div>
                    
                    <!-- Impacto -->
                    <div class="impact-section">
                        <h4 class="section-heading">
                            <i class="fas fa-chart-bar"></i>
                            Impacto en efic.:
                        </h4>
                        <ul class="section-list">
                            <li>-30% análisis cont.</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- CTA Button -->
            <div class="cta-section">
                <span class="cta-label">CTA:</span>
                <button class="cta-button">Calcula tu ahorro potencial</button>
            </div>
        </div>
    </div>
</section>
```

### CSS Requirements
- **Tema oscuro** con acentos azules brillantes
- **Efecto glassmorphism** en la tarjeta principal
- **Gradientes azules** para el header gráfico
- **Efectos de glow** en elementos del cerebro
- **Animaciones sutiles** en hover
- **Responsive design** para tablet y móvil
- **Tipografía** clara y legible

### JavaScript Functionality
- **Botón "Ver más"** que abre el modal con el contenido completo
- **Modal** que muestra la noticia completa con el diseño exacto
- **Navegación** entre secciones
- **Efectos visuales** interactivos

## DIAGRAMA DE LA ESTRUCTURA EXACTA

```
┌─────────────────────────────────────────────────────────────┐
│                    NEWS CONTENT CARD                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              HEADER GRÁFICO                         │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  Fondo azul oscuro con gradiente            │    │    │
│  │  │        🧠  🔍  ⚙️  ╱╲╱╲ (neuronal)           │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  TÍTULO: "Nueva IA reduce 50% el tiempo de auditoría..."   │
│  ┌─ TL;DR: ● ──────────────────────────────────────────┐   │
│  │ • Detecta errores 30% más rápido                   │   │
│  │ • Menos horas rutinarias                           │   │
│  └────────────────────────────────────────────────────┘   │
│────────────────────────────────────────────────────────────│
│  IZQUIERDA (ACCIONES)             │  DERECHA (NOTICIA)      │
│───────────────────────────────────┼─────────────────────────│
│  ┌─ Pasos sugeridos ───────────┐ │ Por qué importa:        │
│  │ 1. Prueba versión gratuita  │ │ • Competencia Big Four  │
│  │ 2. Identifica repetitivas   │ │ • Más tiempo estrat.    │
│  │ 3. Agenda demo con experto  │ │                         │
│  └─────────────────────────────┘ │ Qué cambió / Novedad:   │
│                                   │ • IA apoyo auditoría   │
│  ┌─ Riesgos/Límites ───────────┐ │                         │
│  │ • Errores en cálculos       │ │ 📊 Impacto en efic.:    │
│  │ • Sesgos posibles           │ │ • -30% análisis cont.   │
│  │ • Requiere validación       │ │                         │
│  └─────────────────────────────┘ │                         │
│                                   │                         │
│  ℹ️ Recursos/Links:               │                         │
│  • [Forbes] AuditGPT              │                         │
│  • [Strat] AI Consulting          │                         │
│  • [Doc] IA y ética               │                         │
│───────────────────────────────────┴─────────────────────────│
│ CTA: [Calcula tu ahorro potencial]                          │
└─────────────────────────────────────────────────────────────┘
```

## IMPLEMENTACIÓN PASO A PASO

1. **Crear la estructura HTML** exacta como se muestra arriba
2. **Implementar los estilos CSS** con glassmorphism y efectos azules
3. **Añadir el header gráfico** con cerebro, lupa, líneas neuronales y engranaje
4. **Crear las secciones** con el contenido específico
5. **Implementar el botón CTA** prominente
6. **Añadir funcionalidad JavaScript** para el modal
7. **Hacer responsive** el diseño
8. **Probar** en diferentes dispositivos

## DETALLES TÉCNICOS ESPECÍFICOS

### Header Gráfico (Cerebro)
```css
.news-header-graphic {
    background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
    height: 200px;
    position: relative;
    border-radius: 20px 20px 0 0;
    overflow: hidden;
}

.brain-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    color: #44e5ff;
    text-shadow: 0 0 20px rgba(68, 229, 255, 0.8);
    z-index: 2;
}

.brain-icon .fa-search {
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 1.5rem;
    color: #44e5ff;
    text-shadow: 0 0 10px rgba(68, 229, 255, 0.6);
}

.neural-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, 
        rgba(68, 229, 255, 0.3) 0%, 
        transparent 70%);
}

.gear-icon {
    position: absolute;
    bottom: 20px;
    left: 20px;
    font-size: 2rem;
    color: #44e5ff;
    animation: rotate 10s linear infinite;
}
```

### Efectos Visuales
```css
.news-content-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(68, 229, 255, 0.2);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

.tldr-section {
    background: rgba(68, 229, 255, 0.1);
    border-left: 4px solid #44e5ff;
    padding: 20px;
    border-radius: 0 12px 12px 0;
    margin: 20px 0;
}

/* Layout de dos columnas */
.news-main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin: 30px 0;
    padding: 0 20px;
}

.left-column, .right-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.section-heading {
    font-family: var(--font-heading);
    font-size: 1.1rem;
    font-weight: 600;
    color: #44e5ff;
    margin-bottom: 10px;
}

.section-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.section-list li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 8px;
    color: var(--text-secondary);
}

.section-list li:before {
    content: "•";
    color: #44e5ff;
    font-weight: bold;
    position: absolute;
    left: 0;
}

.numbered-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.numbered-list li {
    position: relative;
    padding-left: 25px;
    margin-bottom: 8px;
    color: var(--text-secondary);
}

.numbered-list li:before {
    content: counter(item) ".";
    counter-increment: item;
    color: #44e5ff;
    font-weight: bold;
    position: absolute;
    left: 0;
}

.numbered-list {
    counter-reset: item;
}

.cta-button {
    background: linear-gradient(135deg, #44e5ff, #0077a6);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(68, 229, 255, 0.3);
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(68, 229, 255, 0.4);
}

/* Responsive para móviles */
@media (max-width: 768px) {
    .news-main-content {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}
```

### Funcionalidad JavaScript
```javascript
// Función para abrir el modal con el diseño exacto
function openNewsModal(newsId) {
    const news = getNewsById(newsId);
    const modal = document.getElementById('newsModal');
    
    // Llenar el modal con el contenido exacto de la imagen
    modal.querySelector('.news-header-graphic').innerHTML = createHeaderGraphic();
    modal.querySelector('.news-main-title').textContent = news.title;
    modal.querySelector('.tldr-items').innerHTML = createTldrItems(news);
    // ... resto de secciones
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Crear el header gráfico dinámicamente
function createHeaderGraphic() {
    return `
        <div class="brain-icon">
            <i class="fas fa-brain"></i>
            <i class="fas fa-search"></i>
        </div>
        <div class="neural-lines"></div>
        <div class="gear-icon">
            <i class="fas fa-cog"></i>
        </div>
    `;
}
```

## ARCHIVOS A MODIFICAR

1. **`src/Notices/notices.html`** - Agregar la nueva sección de noticias
2. **`src/Notices/notices.css`** - Estilos para el diseño exacto
3. **`src/Notices/notices.js`** - Funcionalidad del modal y botones
4. **`src/Notices/notices.html`** - Modal con el diseño completo

## CONTENIDO DE EJEMPLO

```javascript
const sampleNews = {
    id: 1,
    title: "Nueva IA reduce 50% el tiempo de auditoría – así podría ayudarte",
    tldr: [
        "Detecta errores 30% más rápido",
        "Finaliza auditorías, menos horas rutinarias"
    ],
    whyMatters: "Para firmas de servicios profesionales, esta tecnología representa una oportunidad única de optimizar procesos y mejorar la eficiencia operativa.",
    whatChanged: [
        "Competencia con 'Big Four'",
        "Más tiempo estratégico"
    ],
    impact: "Podría reducir 30% el tiempo de análisis contable",
    risks: [
        "1. Prueba la versión gratuita de X",
        "2. Identifica tareas repetitivas", 
        "3. Agenda demo con experto"
    ],
    resources: [
        "[Forbes México] OPEAli AuditGPT",
        "[Strat-bridge] AI in Consulting",
        "[Documento] IA y ética"
    ],
    cta: "Calcula tu ahorro potencial"
};
```

## CRITERIOS DE ACEPTACIÓN

- ✅ **Diseño idéntico** a la imagen de referencia
- ✅ **Header gráfico** con cerebro, lupa, líneas neuronales y engranaje
- ✅ **Secciones organizadas** exactamente como en la imagen
- ✅ **Botón CTA** prominente al final
- ✅ **Efectos visuales** (glassmorphism, glow, gradientes)
- ✅ **Funcionalidad** del botón "Ver más" con modal
- ✅ **Responsive design** para todos los dispositivos
- ✅ **Tema oscuro** con acentos azules

## NOTAS IMPORTANTES

- **NO cambiar** el diseño de la imagen
- **Replicar exactamente** la distribución y elementos visuales
- **Mantener** el estilo glassmorphism y efectos azules
- **Implementar** toda la funcionalidad interactiva
- **Asegurar** que sea responsive y funcional

El resultado final debe ser una réplica exacta del diseño mostrado en la imagen, con toda la funcionalidad implementada y lista para usar.
