# PROMPT PARA CLAUDE - MEJORA DE CONTRASTE EN MODO CLARO

## OBJETIVO
Mejorar el contraste y la estética de la página de bienvenida (`index.html`) en modo claro cambiando los colores de fuente a `#0066cc` donde sea conveniente, para mejorar la legibilidad y la experiencia visual.

## CONTEXTO
La página actual usa un sistema de colores con:
- `--course-primary: #44E5FF` (Turquesa IA)
- `--course-secondary: #0077A6` (Azul Oscuro)
- `--text-primary: #1E293B` (Gris oscuro para modo claro)
- `--text-secondary: rgba(30, 41, 59, 0.9)` (Gris secundario)

## CAMBIOS SOLICITADOS

### 1. VARIABLES CSS EN `welcome.css`
Actualizar las variables del modo claro para usar `#0066cc`:

```css
/* ===== MODO CLARO ===== */
[data-theme="light"] {
    /* Colores de fondo y texto - Modo Claro */
    --bg-primary: #F0F4F8;
    --bg-secondary: #E2E8F0;
    --bg-tertiary: rgba(0, 0, 0, 0.08);
    --text-primary: #0066cc;                    /* CAMBIAR de #1E293B a #0066cc */
    --text-secondary: rgba(0, 102, 204, 0.9);  /* CAMBIAR de rgba(30, 41, 59, 0.9) */
    --text-muted: rgba(0, 102, 204, 0.7);      /* CAMBIAR de rgba(30, 41, 59, 0.7) */
    
    /* Actualizar course-secondary para mejor contraste */
    --course-secondary: #0066cc;               /* CAMBIAR de #0077A6 a #0066cc */
}
```

### 2. ELEMENTOS ESPECÍFICOS A ACTUALIZAR

#### A. Títulos y Textos Principales
- `.hero-title` - Usar `#0066cc` en lugar del gradiente actual
- `.section-header h2` - Aplicar `#0066cc`
- `.feature-card h3` - Usar `#0066cc`
- `.cta-content h2` - Aplicar `#0066cc`

#### B. Textos Secundarios
- `.hero-description` - Usar `rgba(0, 102, 204, 0.9)`
- `.section-header p` - Aplicar `rgba(0, 102, 204, 0.9)`
- `.feature-card p` - Usar `rgba(0, 102, 204, 0.9)`
- `.cta-content p` - Aplicar `rgba(0, 102, 204, 0.9)`

#### C. Elementos de Navegación
- `.logo-text` - Mantener gradiente pero con `#0066cc` como color base
- `.nav-actions` - Actualizar colores de botones para usar `#0066cc`

#### D. Testimonios
- `.testimonial-content p` - Usar `#0066cc`
- `.testimonial-author h4` - Aplicar `#0066cc`
- `.testimonial-author span` - Usar `#0066cc`

### 3. GRADIENTES Y EFECTOS
Actualizar gradientes para incluir `#0066cc`:

```css
/* Gradientes actualizados para modo claro */
[data-theme="light"] {
    --gradient-primary: linear-gradient(135deg, #44E5FF 0%, #0066cc 100%);
    --gradient-glass: linear-gradient(135deg, rgba(0, 102, 204, 0.08) 0%, rgba(0, 102, 204, 0.08) 100%);
}
```

### 4. ANIMACIONES Y EFECTOS HOVER
Actualizar las animaciones del logo y efectos hover para usar `#0066cc`:

```css
/* Estilos para modo claro - MEJORADOS */
[data-theme="light"] .animated-text .letter {
    background: linear-gradient(45deg, #0066cc, var(--course-primary), #0066cc);
    /* ... resto de estilos ... */
}

[data-theme="light"] .animated-text:hover .letter {
    background: linear-gradient(45deg, var(--course-primary), #0066cc, var(--course-primary));
    filter: drop-shadow(0 0 15px #0066cc) drop-shadow(0 0 30px #0066cc);
}
```

### 5. BOTONES Y ELEMENTOS INTERACTIVOS
Actualizar colores de botones para modo claro:

```css
/* Mejorar botón primario en modo claro */
[data-theme="light"] .btn-primary {
    color: #0066cc;
    border-color: #0066cc;
    box-shadow: 0 4px 16px rgba(0, 102, 204, 0.2);
}

/* Mejorar contraste del botón secundario en modo claro */
[data-theme="light"] .btn-secondary {
    color: #0066cc;
    border-color: rgba(0, 102, 204, 0.4);
    box-shadow: 0 4px 16px rgba(0, 102, 204, 0.1);
}
```

## CONSIDERACIONES DE ACCESIBILIDAD

1. **Contraste**: Asegurar que `#0066cc` sobre fondos claros tenga al menos 4.5:1 de contraste
2. **Consistencia**: Mantener la jerarquía visual con diferentes opacidades del mismo color
3. **Legibilidad**: Verificar que todos los textos sean legibles en diferentes tamaños de pantalla

## ELEMENTOS A NO CAMBIAR

1. **Colores de fondo**: Mantener los fondos actuales para preservar la estética
2. **Colores de acento**: Mantener `--course-primary: #44E5FF` para elementos de acento
3. **Modo oscuro**: No modificar los estilos del modo oscuro
4. **Estructura HTML**: No cambiar la estructura, solo los estilos CSS

## RESULTADO ESPERADO

- Mejor contraste y legibilidad en modo claro
- Consistencia visual con el color `#0066cc`
- Mantenimiento de la estética y funcionalidad actual
- Mejor experiencia de usuario en dispositivos con pantallas claras

## ARCHIVOS A MODIFICAR

1. `src/styles/welcome.css` - Actualizar variables CSS y estilos específicos
2. `src/index.html` - Verificar que no necesite cambios estructurales
3. `src/scripts/welcome.js` - Verificar que no necesite cambios en la lógica

---

**NOTA**: Este prompt debe ejecutarse paso a paso, comenzando por las variables CSS y luego aplicando los cambios específicos a cada elemento para asegurar la coherencia visual.
