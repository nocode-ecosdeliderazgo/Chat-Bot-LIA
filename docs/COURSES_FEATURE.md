# 📚 Página de Mis Cursos - Documentación

## 🎯 Descripción General

La nueva página "Mis Cursos" es una experiencia de aprendizaje similar a Udemy que permite a los usuarios gestionar su progreso educativo, visualizar rachas de aprendizaje y acceder a herramientas de estudio organizadas.

## 🗂️ Estructura de Archivos

```
src/
├── courses.html           # Página principal de cursos
├── styles/
│   └── courses.css       # Estilos específicos para cursos
└── scripts/
    └── courses.js        # Lógica y funcionalidad de cursos
```

## 🎨 Características Principales

### 🔖 Sistema de Pestañas
- **Todos los cursos**: Vista principal con cursos activos
- **Mis Listas**: Listas personalizadas de cursos
- **Lista de deseos**: Cursos marcados como favoritos
- **Archivados**: Cursos completados o pausados
- **Herramientas**: Recursos de aprendizaje adicionales

### 📊 Racha de Aprendizaje
- Visualización circular del progreso semanal
- Contador de días consecutivos de estudio
- Estadísticas de tiempo invertido
- Meta semanal personalizable (30 min por defecto)
- Celebraciones al alcanzar objetivos

### 🎯 Funcionalidades de Cursos
- Tarjetas visuales con progreso
- Menús contextuales (favoritos, listas, archivo, compartir)
- Botones de acción dinámicos (Iniciar/Continuar)
- Información detallada (instructor, tiempo estimado, dificultad)

### ⚙️ Herramientas de Aprendizaje
- **Notas de curso**: Sistema de notas organizadas
- **Marcadores**: Puntos importantes guardados
- **Progreso**: Estadísticas detalladas

## 🎨 Diseño y Estética

### 🌙 Tema Oscuro Consistente
- Paleta de colores coherente con el chat existente
- Gradientes y efectos de cristal (glassmorphism)
- Bordes con efecto neón azul cian
- Tipografía Inter y Montserrat

### ✨ Animaciones y Efectos
- **Entrada de página**: Elementos aparecen escalonados
- **Hover effects**: Transformaciones sutiles en cards
- **Ripple effect**: Feedback visual en botones
- **Progress bars**: Animación de llenado progresivo
- **Tab transitions**: Transiciones suaves entre pestañas

### 📱 Responsive Design
- **Desktop**: Layout completo con 3-4 columnas
- **Tablet**: Pestañas colapsadas, 2 columnas
- **Móvil**: Vista de columna única, íconos únicamente

## 🔧 Configuración Técnica

### 📋 Variables CSS Principales
```css
--course-bg-primary: rgba(10, 15, 25, 0.95)
--course-bg-secondary: rgba(15, 25, 40, 0.8)
--course-card-bg: rgba(20, 30, 45, 0.9)
--course-border: rgba(68, 229, 255, 0.15)
--course-accent: #44e5ff
```

### 🎯 JavaScript Funcionalidades
- **Gestión de pestañas**: Sistema de routing interno
- **Persistencia de datos**: LocalStorage para preferencias
- **Animaciones**: RequestAnimationFrame para suavidad
- **Eventos**: Delegación eficiente de eventos
- **Responsive**: Adaptación automática a dispositivos

## 🔗 Integración con Sistema Existente

### 🚀 Navegación
- Botón "Mis Cursos" agregado al menú global del chat
- Enlaces bidireccionales entre chat y cursos
- Preservación del estado entre páginas

### 🎨 Estilos Compartidos
- Utiliza las variables CSS del `main.css`
- Consistencia visual con el chat existente
- Componentes reutilizables (botones, cards, modales)

## 📱 Funcionalidades Avanzadas

### 📅 Programador de Aprendizaje
- Modal interactivo para configurar horarios
- Selección de días de la semana
- Configuración de tiempo diario
- Recordatorios por notificación

### 🎊 Sistema de Celebraciones
- Modal de congratulaciones al alcanzar metas
- Efectos visuales y animaciones
- Motivación gamificada

### 💾 Persistencia de Datos
```javascript
// Estructura de datos guardada en localStorage
{
  currentTab: 'all-courses',
  learningStreak: {
    currentStreak: 5,
    weeklyGoal: 30,
    weeklyProgress: 25,
    visits: 12
  },
  userPreferences: {
    remindersEnabled: true,
    dailyGoal: 30,
    studyDays: ['1','2','3','4','5']
  }
}
```

## 🎮 Interacciones del Usuario

### 🖱️ Eventos Principales
1. **Click en pestaña**: Cambio de vista animado
2. **Hover en curso**: Efectos visuales de elevación
3. **Click en menú contextual**: Opciones de gestión
4. **Programar tiempo**: Modal de configuración
5. **Continuar curso**: Redirección al chat con contexto

### ⌨️ Accesibilidad
- Navegación por teclado completa
- ARIA labels en elementos interactivos
- Contraste adecuado para legibilidad
- Responsive para dispositivos táctiles

## 🔄 Estados de la Aplicación

### 📊 Estados de Carga
- **Inicial**: Animación de entrada
- **Navegación**: Transiciones suaves
- **Carga**: Indicadores visuales
- **Error**: Manejo graceful de fallos

### 💾 Sincronización
- Auto-guardado cada 30 segundos
- Sincronización al cambiar de pestaña
- Backup en LocalStorage
- Recuperación de estado al recargar

## 🚀 Casos de Uso

### 👨‍🎓 Usuario Nuevo
1. Ve la racha en 0, se motiva a empezar
2. Programa su tiempo de aprendizaje
3. Inicia su primer curso
4. Comienza a construir su racha

### 👨‍💼 Usuario Activo
1. Revisa su progreso semanal
2. Continúa con sus cursos en progreso
3. Organiza cursos en listas personalizadas
4. Utiliza herramientas de estudio

### 🎯 Usuario Avanzado
1. Gestiona múltiples cursos simultáneamente
2. Utiliza todas las herramientas disponibles
3. Mantiene rachas largas de aprendizaje
4. Comparte y recomienda cursos

## 📈 Métricas y Analytics

### 📊 Datos Rastreados
- Tiempo de sesión en la página
- Cursos iniciados vs completados
- Rachas de aprendizaje mantenidas
- Interacciones con herramientas
- Patrones de navegación entre pestañas

### 🎯 KPIs Principales
- **Retención**: Usuarios que regresan diariamente
- **Engagement**: Tiempo promedio en la página
- **Conversión**: Cursos iniciados después de visitar
- **Satisfacción**: Uso de herramientas avanzadas

---

## 🛠️ Mantenimiento y Extensiones

### 🔧 Próximas Funcionalidades
- [ ] Integración con calendario
- [ ] Notificaciones push
- [ ] Compartir en redes sociales
- [ ] Sistema de badges/logros
- [ ] Modo sin conexión
- [ ] Exportar progreso a PDF

### 📝 Consideraciones de Desarrollo
- Código modular y reutilizable
- Comentarios detallados en JavaScript
- Estructura CSS bien organizada
- Fácil extensión y personalización

¡La página de Mis Cursos está lista para brindar una experiencia de aprendizaje excepcional! 🎉
