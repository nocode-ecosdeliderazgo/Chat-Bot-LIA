# PROMPT: Arreglar Diseño de Burbujas de Chat y Recuadros

## 🎯 **PROBLEMA IDENTIFICADO**

El diseño de las burbujas de chat y los elementos de la interfaz se ve mal. Específicamente:

### **Problemas Visuales Observados:**
1. **Recuadros/Contenedores mal diseñados**: Las burbujas de chat tienen recuadros o bordes que se ven poco profesionales
2. **Alineación incorrecta**: Los avatares y las burbujas no están bien alineados
3. **Espaciado inconsistente**: Los elementos tienen espaciados irregulares
4. **Colores y sombras**: Los colores de fondo y sombras no se ven bien
5. **Texto vertical**: En algunos casos el texto aparece orientado verticalmente (cada letra en una línea)
6. **Bordes y outlines**: Hay bordes azules de debug que se ven en producción

## 🔧 **TAREAS ESPECÍFICAS A REALIZAR**

### **1. Limpiar CSS de Burbujas de Chat**
- Eliminar bordes de debug (outlines azules)
- Mejorar el diseño de las burbujas de mensaje
- Ajustar colores de fondo y texto
- Corregir sombras y efectos visuales

### **2. Arreglar Alineación de Avatares**
- Asegurar que los avatares estén correctamente alineados con las burbujas
- Corregir el espaciado entre avatar y mensaje
- Verificar que los avatares se muestren en el tamaño correcto

### **3. Corregir Orientación del Texto**
- Asegurar que el texto siempre aparezca horizontalmente
- Revisar CSS que pueda estar causando orientación vertical
- Verificar propiedades de `writing-mode` o `text-orientation`

### **4. Mejorar Diseño General**
- Aplicar un diseño más moderno y limpio
- Usar colores consistentes con el tema (#0066CC como color principal)
- Mejorar la tipografía y legibilidad

## 📁 **ARCHIVOS A REVISAR Y MODIFICAR**

### **Archivos CSS Principales:**
```
src/styles/chat.css
src/styles/main.css
src/Community/community.css
src/Chat-Online/chat-online.css
src/ChatGeneral/chat-general.css
```

### **Archivos HTML que contienen burbujas:**
```
src/chat.html
src/Community/community-view.html
src/Chat-Online/chat-online.html
src/ChatGeneral/chat-general.html
```

### **Archivos JavaScript que generan HTML:**
```
src/scripts/main.js
src/Community/community.js
src/Chat-Online/chat-online.js
```

## 🎨 **REQUERIMIENTOS DE DISEÑO**

### **Burbujas de Mensaje:**
- **Fondo**: Color sólido sin bordes de debug
- **Bordes**: Redondeados suaves (border-radius: 12px)
- **Sombras**: Sombra sutil y profesional
- **Espaciado**: Padding interno adecuado (12-16px)
- **Colores**: 
  - Mensajes del usuario: #0066CC con texto blanco
  - Mensajes de LIA: Gris oscuro (#2a2a2a) con texto blanco

### **Avatares:**
- **Tamaño**: 40px para mensajes, 50px para header
- **Forma**: Circular perfecta
- **Borde**: Borde blanco sutil (2px)
- **Alineación**: Centrado verticalmente con la burbuja

### **Layout General:**
- **Espaciado**: 8px entre mensajes
- **Márgenes**: 16px desde los bordes
- **Responsive**: Funcionar bien en móviles y desktop

## 🚫 **PROBLEMAS A ELIMINAR**

1. **Outlines de debug**: Eliminar cualquier `outline: 2px solid blue`
2. **Bordes innecesarios**: Quitar bordes que no aporten al diseño
3. **Texto vertical**: Corregir cualquier CSS que cause orientación vertical
4. **Espaciados irregulares**: Estandarizar todos los espaciados
5. **Colores inconsistentes**: Usar la paleta de colores definida

## ✅ **CRITERIOS DE ÉXITO**

### **El diseño debe verse:**
- ✅ Limpio y profesional
- ✅ Sin bordes de debug visibles
- ✅ Texto siempre horizontal
- ✅ Avatares bien alineados
- ✅ Burbujas con diseño moderno
- ✅ Colores consistentes
- ✅ Responsive en todos los dispositivos

### **Funcionalidad:**
- ✅ Los mensajes se muestren correctamente
- ✅ Los avatares se carguen sin problemas
- ✅ El scroll funcione suavemente
- ✅ No haya elementos superpuestos

## 🔍 **PASOS SUGERIDOS**

1. **Auditar CSS actual**: Revisar todos los archivos CSS para identificar problemas
2. **Eliminar código de debug**: Quitar outlines y bordes de desarrollo
3. **Rediseñar burbujas**: Crear un diseño limpio y moderno
4. **Corregir alineaciones**: Ajustar posicionamiento de elementos
5. **Probar responsividad**: Verificar en diferentes tamaños de pantalla
6. **Validar colores**: Asegurar consistencia con el tema

## 📝 **NOTAS ADICIONALES**

- **Color principal**: #0066CC (definido en las memorias del usuario)
- **Tema**: Modo oscuro por defecto
- **Compatibilidad**: Funcionar en navegadores modernos
- **Performance**: CSS optimizado para carga rápida

---

**IMPORTANTE**: Este prompt debe ejecutarse paso a paso, primero diagnosticando los problemas específicos y luego aplicando las correcciones de manera sistemática. El usuario prefiere que se trabaje de forma metódica y no se quede estancado en un problema.
