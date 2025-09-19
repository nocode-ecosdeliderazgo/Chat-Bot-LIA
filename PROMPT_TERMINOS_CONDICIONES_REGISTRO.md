# 🔐 PROMPT - CORREGIR TÉRMINOS Y CONDICIONES EN REGISTRO

## 🔴 PROBLEMA IDENTIFICADO

Los usuarios **NO pueden crear cuentas** a pesar de marcar el checkbox de términos y condiciones. El problema está en una **desconexión entre nombres de campos**.

## 📍 UBICACIÓN DEL PROBLEMA

### PROBLEMA DE NOMBRES DE CAMPOS:

**HTML** (`src/login/new-auth.html` línea 283):
```html
<input type="checkbox" id="acceptAllTerms" name="accept_all_terms" required>
```

**JavaScript** (`src/login/new-auth.js` línea 951):
```javascript
accept_terms: formData.get('accept_terms') === 'on'  // ← INCORRECTO
```

**Validación** (`src/login/new-auth.js` línea 1131):
```javascript
if (!accept_terms) {
    showNotification('Debes aceptar los Términos y Condiciones', 'error');
    return false;
}
```

## 🎯 SOLUCIONES ESPECÍFICAS

### ⚡ SOLUCIÓN 1: CORREGIR NOMBRE DE CAMPO EN JAVASCRIPT

**Archivo**: `src/login/new-auth.js` línea 951

**CAMBIAR DE**:
```javascript
accept_terms: formData.get('accept_terms') === 'on'
```

**CAMBIAR A**:
```javascript
accept_terms: formData.get('accept_all_terms') === 'on'
```

### ⚡ SOLUCIÓN 2: MEJORAR VALIDACIÓN DE TÉRMINOS

**Archivo**: `src/login/new-auth.js` líneas 1131-1134

**REEMPLAZAR**:
```javascript
if (!accept_terms) {
    showNotification('Debes aceptar los Términos y Condiciones', 'error');
    return false;
}
```

**CON**:
```javascript
// Validación mejorada de términos y condiciones
if (!accept_terms) {
    console.error('❌ Términos no aceptados:', accept_terms);
    console.error('🔍 Verificando checkbox directamente...');
    
    // Verificación directa del checkbox como fallback
    const acceptAllTermsCheckbox = document.getElementById('acceptAllTerms');
    const isCheckedDirectly = acceptAllTermsCheckbox ? acceptAllTermsCheckbox.checked : false;
    
    console.error('📊 Estado checkbox directo:', isCheckedDirectly);
    
    if (!isCheckedDirectly) {
        showNotification('Debes aceptar los Términos y Condiciones para crear tu cuenta', 'error');
        
        // Resaltar el checkbox visualmente
        if (acceptAllTermsCheckbox) {
            acceptAllTermsCheckbox.style.outline = '2px solid #dc3545';
            setTimeout(() => {
                acceptAllTermsCheckbox.style.outline = '';
            }, 3000);
        }
        
        return false;
    } else {
        console.log('✅ Checkbox marcado directamente - Continuando registro');
        // Si el checkbox está marcado pero formData no lo detectó, continuar
    }
}
```

### ⚡ SOLUCIÓN 3: AGREGAR DEBUG DETALLADO PARA TÉRMINOS

**Archivo**: `src/login/new-auth.js`

**AGREGAR** después de la línea 954 (después de `devLog('Parsed userData:', userData);`):

```javascript
// DEBUG ESPECÍFICO PARA TÉRMINOS Y CONDICIONES
console.log('🔍 === DEBUG TÉRMINOS Y CONDICIONES ===');
console.log('📊 FormData accept_all_terms:', formData.get('accept_all_terms'));
console.log('📊 FormData accept_terms:', formData.get('accept_terms'));
console.log('📊 userData.accept_terms:', userData.accept_terms);

// Verificación directa del checkbox
const acceptAllTermsCheckbox = document.getElementById('acceptAllTerms');
if (acceptAllTermsCheckbox) {
    console.log('📊 Checkbox encontrado:', {
        id: acceptAllTermsCheckbox.id,
        name: acceptAllTermsCheckbox.name,
        checked: acceptAllTermsCheckbox.checked,
        value: acceptAllTermsCheckbox.value,
        required: acceptAllTermsCheckbox.required
    });
} else {
    console.error('❌ Checkbox acceptAllTerms NO encontrado en DOM');
}

// Verificar localStorage de términos aceptados
const termsAcceptedLS = localStorage.getItem('termsAccepted');
const termsDateLS = localStorage.getItem('termsAcceptedDate');
console.log('📊 LocalStorage termsAccepted:', termsAcceptedLS);
console.log('📊 LocalStorage termsAcceptedDate:', termsDateLS);

console.log('🔍 === FIN DEBUG TÉRMINOS ===');
```

### ⚡ SOLUCIÓN 4: CORREGIR FUNCIÓN acceptTermsAndClose

**Archivo**: `src/login/new-auth.js` líneas 2017-2030

**MEJORAR** la función para asegurar que el checkbox se marque correctamente:

```javascript
function acceptTermsAndClose() {
    console.log('✅ Aceptando términos y cerrando modal...');
    
    // Marcar el checkbox único como aceptado
    const acceptAllTermsCheckbox = document.getElementById('acceptAllTerms');
    
    if (acceptAllTermsCheckbox) {
        acceptAllTermsCheckbox.checked = true;
        console.log('✅ Checkbox marcado como checked:', acceptAllTermsCheckbox.checked);
        
        // Disparar evento change para asegurar que se detecte
        acceptAllTermsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Remover cualquier estilo de error
        acceptAllTermsCheckbox.style.outline = '';
    } else {
        console.error('❌ No se encontró checkbox acceptAllTerms');
    }
    
    // Guardar la aceptación en localStorage
    localStorage.setItem('termsAccepted', 'true');
    localStorage.setItem('termsAcceptedDate', new Date().toISOString());
    
    console.log('💾 Términos guardados en localStorage');
    
    // Cerrar la tarjeta
    closeTermsCard();
    
    // Verificar que el botón de registro se habilite
    setTimeout(() => {
        const registerButton = document.getElementById('registerSubmit');
        if (registerButton) {
            registerButton.disabled = false;
            console.log('✅ Botón de registro habilitado');
        }
    }, 100);
}
```

### ⚡ SOLUCIÓN 5: AGREGAR VERIFICACIÓN EN TIEMPO REAL

**Archivo**: `src/login/new-auth.js`

**AGREGAR** event listener para el checkbox:

```javascript
// AGREGAR al final del DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...
    
    // NUEVO: Event listener para checkbox de términos
    const acceptAllTermsCheckbox = document.getElementById('acceptAllTerms');
    const registerButton = document.getElementById('registerSubmit');
    
    if (acceptAllTermsCheckbox && registerButton) {
        acceptAllTermsCheckbox.addEventListener('change', function() {
            console.log('📋 Checkbox términos cambiado:', this.checked);
            
            // Habilitar/deshabilitar botón según estado del checkbox
            if (this.checked) {
                registerButton.disabled = false;
                registerButton.style.opacity = '1';
                registerButton.style.cursor = 'pointer';
                console.log('✅ Botón de registro habilitado por checkbox');
            } else {
                registerButton.disabled = true;
                registerButton.style.opacity = '0.5';
                registerButton.style.cursor = 'not-allowed';
                console.log('❌ Botón de registro deshabilitado por checkbox');
            }
        });
        
        // Verificar estado inicial
        if (acceptAllTermsCheckbox.checked) {
            registerButton.disabled = false;
        } else {
            registerButton.disabled = true;
        }
        
        console.log('✅ Event listener de términos configurado');
    }
});
```

## 🔍 ORDEN DE EJECUCIÓN

1. **PRIMERO**: Corregir nombre de campo en línea 951 (`accept_all_terms`)
2. **SEGUNDO**: Mejorar validación de términos con verificación directa
3. **TERCERO**: Agregar debug detallado para términos
4. **CUARTO**: Mejorar función `acceptTermsAndClose`
5. **QUINTO**: Agregar event listener en tiempo real

## ✅ RESULTADO ESPERADO

### Console Log con Términos Funcionando:
```
🔍 === DEBUG TÉRMINOS Y CONDICIONES ===
📊 FormData accept_all_terms: on
📊 userData.accept_terms: true
📊 Checkbox encontrado: {checked: true, required: true}
📊 LocalStorage termsAccepted: true
✅ Checkbox marcado como checked: true
✅ Botón de registro habilitado por checkbox
🔍 === FIN DEBUG TÉRMINOS ===
```

### Funcionalidad Esperada:
- ✅ **Checkbox se marca** al aceptar términos
- ✅ **Botón se habilita** cuando se marcan términos
- ✅ **Validación pasa** correctamente
- ✅ **Cuenta se crea** sin problemas
- ✅ **Usuario puede registrarse** exitosamente

## 🎯 ARCHIVOS A MODIFICAR

1. **`src/login/new-auth.js`** (líneas 951, 1131-1134, después de 954)
2. **Verificar**: `src/login/new-auth.html` (línea 283 - debe estar correcto)

---

**🔑 NOTA CLAVE**: El problema principal es que el código busca `accept_terms` pero el campo se llama `accept_all_terms`. Una vez corregido esto, el registro debería funcionar perfectamente.
