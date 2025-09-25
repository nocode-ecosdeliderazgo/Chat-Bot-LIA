# Prompt para Claude: Implementar Fotos de Perfil en Comentarios del Modal de Posts

## Contexto del Problema

En el archivo `src/Community/community-view.html`, específicamente en el modal de posts donde los usuarios pueden comentar, actualmente solo aparece un icono genérico de usuario (`fas fa-user`) en lugar de mostrar las fotos de perfil reales de los usuarios que comentan.

## Análisis de la Estructura Actual

### 1. Modal de Posts (líneas 1139-1150)
```html
<div class="post-modal" id="postModal">
    <div class="post-modal-card">
        <div class="post-modal-head">
            <strong id="modalPostUser">Publicación</strong>
            <button class="chat-send" id="closePostModal">Cerrar</button>
        </div>
        <div class="post-modal-body" id="modalPostBody"></div>
        <div class="post-modal-foot">
            <input id="modalCommentInput" class="comment-input" type="text" placeholder="Escribe un comentario...">
            <button id="modalSendComment" class="chat-send">Enviar</button>
        </div>
    </div>
</div>
```

### 2. Función commentTemplate (líneas 2561-2564)
**PROBLEMA IDENTIFICADO**: Esta función solo muestra iconos genéricos:
```javascript
function commentTemplate(c){
    if(typeof c === 'string') return `<div class='comment-item'><div class='comment-avatar'><i class="fas fa-user"></i></div><div class='comment-bubble'><div class='comment-head'><span class='comment-name'>Usuario</span><span class='comment-time'>ahora</span></div><div>${c}</div></div></div>`;
    return `<div class='comment-item'><div class='comment-avatar'><i class="fas fa-user"></i></div><div class='comment-bubble'><div class='comment-head'><span class='comment-name'>${c.user||'Usuario'}</span><span class='comment-time'>${c.time||''}</span></div><div>${c.text||c}</div></div></div>`;
}
```

### 3. Carga de Comentarios (líneas 2323-2396)
Los comentarios se cargan desde la base de datos y se obtienen datos del usuario, pero **NO se incluye la información de avatar**:
```javascript
// En la línea 2347-2349, solo se obtienen estos campos:
.select('display_name, first_name, username')
// FALTA: profile_picture_url
```

### 4. Comparación con Posts (líneas 1822-1826)
Los posts SÍ muestran avatares correctamente:
```javascript
${p.avatarUrl ?
    `<img src="${p.avatarUrl}" alt="${p.user}" class="post-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
     <i class="${p.avatar}" style="display:none;"></i>` :
    `<i class="${p.avatar}"></i>`
}
```

## Solución Requerida

### Paso 1: Modificar la consulta de datos de usuario para comentarios
En la línea 2347, cambiar:
```javascript
.select('display_name, first_name, username')
```
Por:
```javascript
.select('display_name, first_name, username, profile_picture_url')
```

### Paso 2: Actualizar la función commentTemplate
Modificar la función para incluir lógica de avatar similar a la de los posts:
```javascript
function commentTemplate(c){
    if(typeof c === 'string') {
        return `<div class='comment-item'>
            <div class='comment-avatar'>
                <i class="fas fa-user"></i>
            </div>
            <div class='comment-bubble'>
                <div class='comment-head'>
                    <span class='comment-name'>Usuario</span>
                    <span class='comment-time'>ahora</span>
                </div>
                <div>${c}</div>
            </div>
        </div>`;
    }
    
    return `<div class='comment-item'>
        <div class='comment-avatar'>
            ${c.avatarUrl ?
                `<img src="${c.avatarUrl}" alt="${c.user}" class="comment-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <i class="fas fa-user" style="display:none;"></i>` :
                `<i class="fas fa-user"></i>`
            }
        </div>
        <div class='comment-bubble'>
            <div class='comment-head'>
                <span class='comment-name'>${c.user||'Usuario'}</span>
                <span class='comment-time'>${c.time||''}</span>
            </div>
            <div>${c.text||c}</div>
        </div>
    </div>`;
}
```

### Paso 3: Actualizar la construcción del objeto comentario
En las líneas 2359-2366, agregar el campo avatarUrl:
```javascript
return {
    id: comment.id,
    user: userName,
    time: formatTimeAgo(comment.created_at),
    text: comment.content,
    created_at: comment.created_at,
    avatarUrl: userData?.profile_picture_url || null  // NUEVO CAMPO
};
```

### Paso 4: Agregar estilos CSS para comment-avatar-img
Asegurar que existan estilos similares a los de post-avatar-img:
```css
.comment-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    display: block;
}
```

## Archivos a Modificar

1. **src/Community/community-view.html** - Líneas específicas:
   - Línea 2347: Consulta de datos de usuario
   - Líneas 2359-2366: Construcción del objeto comentario
   - Líneas 2561-2564: Función commentTemplate
   - Sección CSS: Agregar estilos para .comment-avatar-img

## Resultado Esperado

Después de implementar estos cambios:
1. Los comentarios en el modal mostrarán las fotos de perfil reales de los usuarios
2. Si un usuario no tiene foto, se mostrará el icono genérico como fallback
3. La funcionalidad será consistente con cómo se muestran los avatares en los posts principales
4. Se mantendrá la compatibilidad con comentarios existentes

## Consideraciones Técnicas

- Usar el mismo patrón de fallback que ya existe en los posts
- Mantener la estructura HTML existente para evitar problemas de CSS
- Asegurar que los estilos sean consistentes con el diseño actual
- Probar tanto con usuarios que tienen foto como sin foto
