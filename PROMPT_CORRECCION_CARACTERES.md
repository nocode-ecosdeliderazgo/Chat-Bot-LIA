# 🔤 PROMPT - CORRECCIÓN DE ERRORES DE CODIFICACIÓN DE CARACTERES

## 🔴 PROBLEMA IDENTIFICADO

Los textos en español están mostrando caracteres mal codificados:
- **"tecnologÃa"** → debe ser **"tecnología"**
- **"AyÃºdanos"** → debe ser **"Ayúdanos"**
- **"SÃ© Respetuoso"** → debe ser **"Sé Respetuoso"**
- **"cortesÃa"** → debe ser **"cortesía"**
- **"discriminaciÃ³n"** → debe ser **"discriminación"**
- **"informaciÃ³n Ãºtil"** → debe ser **"información útil"**
- **"MantÃ©n la Privacidad"** → debe ser **"Mantén la Privacidad"**
- **"informaciÃ³n personal"** → debe ser **"información personal"**
- **"repÃ³rtalo"** → debe ser **"repórtalo"**
- **"ColaboraciÃ³n"** → debe ser **"Colaboración"**
- **"MantÃ©n una mente"** → debe ser **"Mantén una mente"**
- **"demÃ¡s"** → debe ser **"demás"**
- **"DiseÃ±o"** → debe ser **"Diseño"**
- **"EstadÃsticas"** → debe ser **"Estadísticas"**
- **"sesiÃ³n"** → debe ser **"sesión"**

## 🎯 ARCHIVOS A CORREGIR

### ⚡ ARCHIVO 1: community.html

**Archivo**: `src/Community/community.html`

**CORRECCIONES ESPECÍFICAS**:

**Línea ~83** - Hero subtitle:
```html
<!-- CAMBIAR DE: -->
<p class="hero-subtitle">Conecta con otros estudiantes, comparte conocimientos y participa en discusiones sobre inteligencia artificial y tecnologÃa educativa</p>

<!-- CAMBIAR A: -->
<p class="hero-subtitle">Conecta con otros estudiantes, comparte conocimientos y participa en discusiones sobre inteligencia artificial y tecnología educativa</p>
```

**Línea ~110** - Section subtitle:
```html
<!-- CAMBIAR DE: -->
<p class="section-subtitle">AyÃºdanos a mantener un ambiente respetuoso y constructivo</p>

<!-- CAMBIAR A: -->
<p class="section-subtitle">Ayúdanos a mantener un ambiente respetuoso y constructivo</p>
```

**Línea ~117** - Guideline title:
```html
<!-- CAMBIAR DE: -->
<h3 class="guideline-title">SÃ© Respetuoso</h3>

<!-- CAMBIAR A: -->
<h3 class="guideline-title">Sé Respetuoso</h3>
```

**Línea ~118** - Guideline description:
```html
<!-- CAMBIAR DE: -->
<p class="guideline-description">Trata a todos los miembros con respeto y cortesÃa. No toleramos el acoso o la discriminaciÃ³n.</p>

<!-- CAMBIAR A: -->
<p class="guideline-description">Trata a todos los miembros con respeto y cortesía. No toleramos el acoso o la discriminación.</p>
```

**Línea ~125** - Guideline description:
```html
<!-- CAMBIAR DE: -->
<p class="guideline-description">Contribuye con informaciÃ³n Ãºtil y constructiva. Ayuda a otros a aprender y crecer.</p>

<!-- CAMBIAR A: -->
<p class="guideline-description">Contribuye con información útil y constructiva. Ayuda a otros a aprender y crecer.</p>
```

**Línea ~131** - Guideline title:
```html
<!-- CAMBIAR DE: -->
<h3 class="guideline-title">MantÃ©n la Privacidad</h3>

<!-- CAMBIAR A: -->
<h3 class="guideline-title">Mantén la Privacidad</h3>
```

**Línea ~132** - Guideline description:
```html
<!-- CAMBIAR DE: -->
<p class="guideline-description">No compartas informaciÃ³n personal de otros miembros sin su consentimiento.</p>

<!-- CAMBIAR A: -->
<p class="guideline-description">No compartas información personal de otros miembros sin su consentimiento.</p>
```

**Línea ~138** - Guideline title:
```html
<!-- CAMBIAR DE: -->
<h3 class="guideline-title">Reporta Problemas</h3>

<!-- CAMBIAR A: -->
<h3 class="guideline-title">Reporta Problemas</h3>
```

**Línea ~139** - Guideline description:
```html
<!-- CAMBIAR DE: -->
<p class="guideline-description">Si ves contenido inapropiado, repÃ³rtalo inmediatamente a los moderadores.</p>

<!-- CAMBIAR A: -->
<p class="guideline-description">Si ves contenido inapropiado, repórtalo inmediatamente a los moderadores.</p>
```

**Línea ~145** - Guideline title:
```html
<!-- CAMBIAR DE: -->
<h3 class="guideline-title">Comunica con Claridad</h3>

<!-- CAMBIAR A: -->
<h3 class="guideline-title">Comunica con Claridad</h3>
```

**Línea ~152** - Guideline title:
```html
<!-- CAMBIAR DE: -->
<h3 class="guideline-title">Fomenta la ColaboraciÃ³n</h3>

<!-- CAMBIAR A: -->
<h3 class="guideline-title">Fomenta la Colaboración</h3>
```

**Línea ~160** - Guideline description:
```html
<!-- CAMBIAR DE: -->
<p class="guideline-description">MantÃ©n una mente abierta y dispuesta a aprender de otros. Comparte recursos educativos.</p>

<!-- CAMBIAR A: -->
<p class="guideline-description">Mantén una mente abierta y dispuesta a aprender de otros. Comparte recursos educativos.</p>
```

**Línea ~166** - Guideline title:
```html
<!-- CAMBIAR DE: -->
<h3 class="guideline-title">SÃ© Puntual</h3>

<!-- CAMBIAR A: -->
<h3 class="guideline-title">Sé Puntual</h3>
```

**Línea ~167** - Guideline description:
```html
<!-- CAMBIAR DE: -->
<p class="guideline-description">Respeta los horarios de las sesiones y eventos. Valora el tiempo de los demÃ¡s.</p>

<!-- CAMBIAR A: -->
<p class="guideline-description">Respeta los horarios de las sesiones y eventos. Valora el tiempo de los demás.</p>
```

**Línea ~188** - Filter chip:
```html
<!-- CAMBIAR DE: -->
<button class="discover-chip" data-category="diseno">DiseÃ±o</button>

<!-- CAMBIAR A: -->
<button class="discover-chip" data-category="diseno">Diseño</button>
```

### ⚡ ARCHIVO 2: Menú de Perfil

**Buscar en el archivo que contiene el menú de perfil** (probablemente `community.html` o un archivo de JavaScript):

**Correcciones del menú**:
```html
<!-- CAMBIAR DE: -->
<div class="pm-item" onclick="location.href='../estadisticas.html'"><i class='bx bx-bar-chart-alt-2'></i> Mis EstadÃ­sticas</div>

<!-- CAMBIAR A: -->
<div class="pm-item" onclick="location.href='../estadisticas.html'"><i class='bx bx-bar-chart-alt-2'></i> Mis Estadísticas</div>
```

```html
<!-- CAMBIAR DE: -->
<div class="pm-item" onclick="location.href='../index.html'"><i class='bx bx-log-out'></i> Cerrar sesiÃ³n</div>

<!-- CAMBIAR A: -->
<div class="pm-item" onclick="location.href='../index.html'"><i class='bx bx-log-out'></i> Cerrar sesión</div>
```

### ⚡ ARCHIVO 3: Verificar Encoding del Archivo

**ACCIÓN IMPORTANTE**: Verificar que el archivo esté guardado con codificación UTF-8

**En el editor de código**:
1. Abrir `src/Community/community.html`
2. Verificar que la codificación sea **UTF-8**
3. Si no lo es, cambiar a UTF-8 y guardar

**En el HTML, verificar la meta tag**:
```html
<!-- Debe estar presente en el <head>: -->
<meta charset="UTF-8">
```

### ⚡ ARCHIVO 4: Posibles Archivos JavaScript

**Si hay textos en archivos JavaScript**, buscar y corregir:

**En `community.js`** o archivos similares:
```javascript
// Buscar y corregir textos como:
console.log('[PROFILE] âœ… MenÃº de perfil configurado correctamente');
// Cambiar a:
console.log('[PROFILE] ✅ Menú de perfil configurado correctamente');
```

## 🔍 MÉTODO DE BÚSQUEDA Y REEMPLAZO

### USAR BÚSQUEDA GLOBAL EN EL EDITOR:

**Buscar y reemplazar estos patrones**:

1. `Ã³` → `ó`
2. `Ã±` → `ñ` 
3. `Ãº` → `ú`
4. `Ã­` → `í`
5. `Ã©` → `é`
6. `Ã¡` → `á`
7. `Ã` → `Á`
8. `âœ…` → `✅`
9. `âš ï¸` → `⚠️`
10. `ðŸš€` → `🚀`
11. `ðŸ"` → `🔍`
12. `ðŸ˜ï¸` → `🏘️`

### COMANDO DE BÚSQUEDA GLOBAL:

**En VS Code o editor similar**:
1. `Ctrl + Shift + H` (Buscar y reemplazar en archivos)
2. Buscar en: `src/Community/`
3. Aplicar los reemplazos uno por uno

## ✅ VERIFICACIÓN FINAL

### Textos que deben quedar correctos:
- ✅ **"tecnología educativa"**
- ✅ **"Ayúdanos a mantener"**
- ✅ **"Sé Respetuoso"**
- ✅ **"cortesía"**
- ✅ **"discriminación"**
- ✅ **"información útil"**
- ✅ **"Mantén la Privacidad"**
- ✅ **"información personal"**
- ✅ **"repórtalo"**
- ✅ **"Colaboración"**
- ✅ **"Mantén una mente"**
- ✅ **"demás"**
- ✅ **"Diseño"**
- ✅ **"Estadísticas"**
- ✅ **"sesión"**

### Console logs que deben quedar correctos:
- ✅ **"✅ Menú de perfil configurado correctamente"**
- ✅ **"🚀 Inicializando CommunityDatabase..."**
- ✅ **"🔍 Obteniendo usuario actual..."**
- ✅ **"⚠️ No hay usuario autenticado"**
- ✅ **"🏘️ Obteniendo comunidades..."**

## 🎯 ORDEN DE EJECUCIÓN

1. **PRIMERO**: Hacer búsqueda y reemplazo global de caracteres problemáticos
2. **SEGUNDO**: Verificar codificación UTF-8 en archivos
3. **TERCERO**: Revisar meta charset en HTML
4. **CUARTO**: Probar la página para verificar correcciones
5. **QUINTO**: Verificar console logs sin caracteres extraños

---

**📝 NOTA**: Estos errores son típicos cuando archivos UTF-8 se interpretan como ISO-8859-1 o viceversa. La corrección asegura que todos los caracteres especiales del español se muestren correctamente.
