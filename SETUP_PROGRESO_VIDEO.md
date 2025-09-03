# 🎥 Guía de Configuración del Sistema de Progreso de Video

Esta guía te ayudará a implementar el sistema completo de progreso de video que se conecta a la base de datos PostgreSQL para:
- ✅ Trackear el progreso de los videos en tiempo real
- ✅ Actualizar la barra de progreso conforme se ve el video
- ✅ Desbloquear el siguiente módulo cuando se completa un video
- ✅ Guardar todo el progreso en la base de datos

## 📋 Prerequisitos

1. **Base de datos PostgreSQL** funcionando
2. **Variables de entorno** configuradas en `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
3. **Sistema de login** funcionando (para obtener user IDs)

## 🚀 Paso 1: Inicializar la Base de Datos

### Opción A: Script Automático (Recomendado)
```bash
npm run init:progress
```

### Opción B: Manual
1. Conecta a tu base de datos PostgreSQL
2. Ejecuta el contenido del archivo `course-progress-schema.sql`

## 📁 Paso 2: Verificar Archivos Creados

El sistema ya está implementado con estos archivos:

### 🔧 APIs Backend (Netlify Functions)
- `netlify/functions/course-progress.js` - Obtener progreso del curso
- `netlify/functions/module-progress.js` - Actualizar progreso del módulo
- `netlify/functions/video-progress.js` - Actualizar progreso del video
- `netlify/functions/init-database.js` - Inicializar base de datos

### 🎯 Frontend JavaScript
- `src/scripts/course-progress-manager.js` - Gestor de progreso
- `src/scripts/youtube-progress-tracker.js` - Tracker del video YouTube
- `src/Chat-Online/chat-online.js` - Integración principal

## ⚙️ Paso 3: Configuración

### 1. Verificar Variables de Entorno
Asegúrate de que tu archivo `.env` tenga:
```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=development
```

### 2. Verificar Sistema de Login
El sistema necesita obtener el `userId` del usuario autenticado. El `CourseProgressManager` busca el userId en:
1. `localStorage.getItem('userData')` (sistema de login)
2. `localStorage.getItem('userId')` 
3. `sessionStorage.getItem('userData')`
4. URL parameter `?userId=xxxx`
5. ID demo generado automáticamente

## 🎮 Paso 4: Cómo Funciona

### Flujo Automático
1. **Usuario abre chat-online.html**
2. **Sistema obtiene userId** del localStorage/sessionStorage
3. **CourseProgressManager se inicializa** y obtiene progreso de la BD
4. **YouTubeProgressTracker se conecta** al video
5. **Conforme el video avanza**, se actualiza automáticamente:
   - Posición actual del video
   - Porcentaje de progreso
   - Estado del módulo
6. **Al completar el video (95%+)**:
   - Módulo se marca como completado
   - Siguiente módulo se desbloquea
   - UI se actualiza automáticamente

### Eventos en Consola
Puedes monitorear el funcionamiento en la consola del navegador:
```
🚀 Inicializando Chat Online...
📊 Inicializando Progress Manager...
👤 User ID: demo-user-abc123
🎥 Inicializando YouTube Progress Tracker...
📊 Video progress: 45% (120/267s)
📡 Actualizando progreso video módulo 1
✅ Progreso de video actualizado en backend
🎯 ¡Módulo 1 completado!
🔓 Desbloqueando módulo 2
```

## 📊 Paso 5: Verificar Funcionamiento

### 1. Abrir Herramientas de Desarrollo
- Presiona `F12` en el navegador
- Ve a la pestaña "Console"

### 2. Cargar la Página
- Abre `src/Chat-Online/chat-online.html`
- Deberías ver mensajes de inicialización

### 3. Reproducir Video
- Inicia el video
- Observa los mensajes de progreso cada 10 segundos
- Verifica que la barra de progreso se actualice

### 4. Completar Video
- Avanza el video al 95%+
- Deberías ver:
  - Notificación "¡Video completado!"
  - Notificación "¡Módulo completado!"
  - El siguiente módulo se desbloquea

## 🔍 Solución de Problemas

### Problema: No se conecta a la base de datos
**Síntomas**: Error 500 en las llamadas API
**Solución**:
1. Verifica `DATABASE_URL` en `.env`
2. Ejecuta `npm run init:progress` para crear las tablas
3. Verifica que la BD esté accesible

### Problema: No obtiene userId
**Síntomas**: Usa "demo-user-xxxxx" en lugar del usuario real
**Solución**:
1. Verifica que el login guarde `userData` en localStorage
2. O agrega `?userId=tu-user-id` a la URL

### Problema: Video no actualiza progreso
**Síntomas**: No se ven mensajes de progreso en consola
**Solución**:
1. Verifica que YouTube API esté cargada
2. Revisa errores en consola
3. Verifica que las APIs respondan correctamente

### Problema: Módulos no se desbloquean
**Síntomas**: Siguiente módulo sigue "locked" después de completar video
**Solución**:
1. Verifica que el progreso llegue al 100%
2. Revisa la respuesta de la API `video-progress`
3. Verifica triggers en la base de datos

## 📋 Comandos Útiles

```bash
# Inicializar base de datos
npm run init:progress

# Iniciar servidor de desarrollo
npm start

# Ver logs del servidor
# Los logs aparecerán en la terminal

# Limpiar y reiniciar
npm run port:kill
npm run dev:force
```

## 🗃️ Estructura de Base de Datos

### Tablas Principales
- `course_progress` - Progreso general del curso por usuario
- `module_progress` - Progreso de cada módulo
- `video_section_progress` - Progreso de secciones del video

### Datos de Ejemplo
Después de `npm run init:progress`, tendrás:
- Usuario demo: `demo-user`
- Curso: `intro-to-ai`
- 5 módulos con videos de YouTube
- Módulo 1 desbloqueado, resto bloqueado

## ✅ Verificación Final

Para confirmar que todo funciona:

1. **Base de datos inicializada**: `npm run init:progress` sin errores
2. **Servidor corriendo**: `npm start` sin errores  
3. **Página carga**: chat-online.html se abre sin errores en consola
4. **Progreso se trackea**: Mensajes cada 10 segundos en consola
5. **Progreso se guarda**: Datos visibles en la base de datos
6. **Módulos se desbloquean**: Al completar un video, el siguiente se activa

## 🎯 Resultado Final

Tendrás un sistema completo donde:
- ✅ El progreso del video se guarda automáticamente en PostgreSQL
- ✅ La barra de progreso se actualiza en tiempo real
- ✅ Los módulos se desbloquean progresivamente
- ✅ El usuario puede continuar desde donde lo dejó
- ✅ Datos persisten entre sesiones

¡El sistema está listo para producción! 🚀