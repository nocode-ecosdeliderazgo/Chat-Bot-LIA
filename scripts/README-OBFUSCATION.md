# Sistema de Ofuscación JavaScript

Este sistema ofusca automáticamente todos los archivos JavaScript para proteger el código fuente en producción.

## 🚀 Uso

### Ofuscar todos los archivos JavaScript
```bash
npm run obfuscate
# o directamente
node scripts/obfuscate.js
```

### Restaurar archivos originales
```bash
npm run obfuscate -- --restore
```

### Build para producción (incluye ofuscación)
```bash
npm run build
```

## 📁 Directorios Procesados

- `src/` - Todos los archivos JavaScript del frontend
- `netlify/` - Netlify Functions (ambas ubicaciones)
- `src/netlify/` - Funciones duplicadas de Netlify

## 🔧 Configuración de Ofuscación

El archivo `scripts/obfuscate.js` usa `javascript-obfuscator` con estas configuraciones:

- **Control Flow Flattening**: Hace el código más difícil de seguir
- **Dead Code Injection**: Inyecta código muerto para confundir
- **String Array**: Codifica strings en arrays ofuscados
- **Identifier Names**: Usa nombres hexadecimales para variables
- **Self Defending**: El código se protege contra debugging
- **Transform Object Keys**: Ofusca las claves de objetos

## 🛡️ Características de Seguridad

- ✅ **Backup automático**: Crea `.backup` de archivos originales
- ✅ **Restauración segura**: Comando para volver al código original
- ✅ **Exclusión inteligente**: Ignora node_modules, tests, etc.
- ✅ **Netlify compatible**: Funciona en ambas carpetas de Netlify
- ✅ **Production ready**: Optimizado para despliegue

## ⚠️ Archivos Excluidos

- `node_modules/`
- `coverage/`
- `__tests__/`
- `*.min.js`
- `*.backup`
- Archivos de configuración

## 🔄 Proceso de Despliegue

1. **Desarrollo**: Trabaja con código original
2. **Pre-commit**: Ejecuta `npm run build` (ofusca automáticamente)
3. **Commit**: Solo el código ofuscado va a GitHub
4. **Netlify**: Deploya automáticamente el código ofuscado
5. **Local**: Usa `--restore` si necesitas debugging

## 🐛 Debugging

Si algo falla después de la ofuscación:

```bash
# Restaurar código original
npm run obfuscate -- --restore

# Hacer cambios necesarios
# ...

# Volver a ofuscar
npm run obfuscate
```

## 📝 Notas Importantes

- Los archivos `.backup` NO se suben a GitHub (están en .gitignore)
- La ofuscación se ejecuta automáticamente en `npm run build`
- El código ofuscado es funcional pero muy difícil de leer
- Siempre mantén una copia local sin ofuscar para desarrollo