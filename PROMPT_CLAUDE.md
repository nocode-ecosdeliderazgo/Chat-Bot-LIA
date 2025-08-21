Necesito que arregles un problema en mi página web de cursos. El mensaje de bienvenida "Bienvenido [Nombre]" no se ve correctamente en modo claro.

PROBLEMA:
- En modo oscuro funciona bien
- En modo claro, el texto "Bienvenido [Nombre]" no es visible
- El JavaScript está aplicando estilos inline que interfieren con los CSS del tema claro

ARCHIVOS INVOLUCRADOS:
1. src/scripts/courses.js - función hydrateUserHeader() (línea ~235)
2. src/styles/courses.css - estilos para modo claro

LO QUE YA INTENTÉ:
- Agregué estilos CSS con !important para sobrescribir estilos inline
- Modifiqué el JavaScript para detectar el tema y remover estilos inline en modo claro
- Agregué múltiples selectores CSS para #welcomeTitle

SOLUCIÓN REQUERIDA:
1. Revisa la función hydrateUserHeader() en courses.js
2. Asegúrate de que en modo claro NO se apliquen estilos inline
3. Verifica que los estilos CSS en courses.css funcionen correctamente
4. El texto debe verse en color azul (#0066CC) con negritas en modo claro
5. El texto debe verse en color original en modo oscuro

POR FAVOR:
- Revisa ambos archivos
- Identifica exactamente dónde está el conflicto
- Proporciona una solución completa que funcione
- Asegúrate de que el nombre del usuario se muestre correctamente en ambos modos
