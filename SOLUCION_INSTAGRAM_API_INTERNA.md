# Solución Recomendada: API Interna de Instagram

## 🎯 Por qué esta solución

La API interna de Instagram es la mejor opción **GRATIS** para evitar el bloqueo de Cloudflare, ya que:

1. ✅ **No requiere proxies** - Usa la API oficial de Instagram
2. ✅ **Más confiable** - Menos bloqueos si usas cookies válidas
3. ✅ **Gratis** - No requiere servicios de pago
4. ⚠️ **Limitación**: Requiere renovar el `sessionid` periódicamente

## 📋 Pasos para Configurar

### 1. Obtener el Session ID de Instagram

1. **Inicia sesión en Instagram** desde tu navegador (usa Chrome o Firefox)
2. **Abre las herramientas de desarrollador**:
   - Windows/Linux: `F12` o `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`
3. **Ve a la pestaña "Application"** (o "Almacenamiento" en Firefox)
4. **En el menú izquierdo, expande "Cookies"**
5. **Selecciona `https://www.instagram.com`**
6. **Busca la cookie llamada `sessionid`**
7. **Copia el VALOR** (es un string largo tipo: `"1234567890%3Aabcd%3A1234"`)

⚠️ **IMPORTANTE**: El sessionid expira después de un tiempo. Si el workflow deja de funcionar, necesitarás renovarlo.

### 2. Configurar el Workflow en n8n

1. **Importa el workflow**: `n8n_instagram_scraper_internal_api.json` (ya corregido)
2. **Abre el nodo "HTTP Request (Internal API)"**
3. **En "Header Parameters"**, busca el parámetro "Cookie"
4. **Reemplaza** `PEGAR_TU_SESSIONID_AQUI` con tu sessionid real:
   ```
   sessionid=TU_SESSIONID_AQUI
   ```
   Ejemplo:
   ```
   sessionid=1234567890%3Aabcd%3A1234
   ```

### 3. Verificar la Configuración

El nodo "HTTP Request (Internal API)" debe tener estos headers:

```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
Cookie: sessionid=TU_SESSIONID_AQUI
x-ig-app-id: 936619501633907
x-asbd-id: 198387
x-requested-with: XMLHttpRequest
```

### 4. Activar el Workflow

1. **Haz clic en "Active"** en la esquina superior derecha de n8n
2. El workflow debería estar listo para recibir webhooks

## 🧪 Prueba del Workflow

### Desde el Frontend:

1. Ve a la página "Posibles Clientes"
2. Agrega un link de Instagram (ej: `https://www.instagram.com/cristiano/`)
3. Espera unos segundos
4. Verifica que el nombre de usuario y la imagen se actualicen

### Verificar Logs en n8n:

1. Ve a **Executions** en n8n
2. Busca la ejecución más reciente
3. Verifica que todos los nodos estén en verde ✓

### Si hay errores:

- **401 Unauthorized**: El sessionid expiró o es inválido → Renueva el sessionid
- **429 Too Many Requests**: Estás haciendo muchas peticiones → Espera unos minutos
- **403 Forbidden**: Instagram detectó automatización → Renueva el sessionid o espera

## 🔄 Renovar el Session ID

El sessionid expira después de:
- **7 días** de inactividad
- **30 días** aproximadamente de uso
- Si cambias tu contraseña
- Si Instagram detecta actividad sospechosa

**Para renovar**: Simplemente repite el proceso de obtener el sessionid y actualízalo en el workflow.

## ⚠️ Limitaciones

1. **Session ID expira**: Necesitas renovarlo periódicamente
2. **Límite de peticiones**: Instagram puede limitar si haces muchas peticiones
3. **Detecta automatización**: Puede requerir verificación adicional

## 💡 Mejoras Futuras

Si necesitas algo más robusto:

1. **Automatizar la renovación del sessionid** (usando un navegador automatizado)
2. **Usar ScraperAPI** para evitar estos problemas (pago)
3. **Rotar múltiples sessionids** para evitar límites

## 📝 Workflow Corregido

El workflow `n8n_instagram_scraper_internal_api.json` ya está corregido para:
- ✅ Pasar el `id` del registro correctamente
- ✅ Actualizar Supabase con `username` y `profile_pic_url`
- ✅ Usar la API interna de Instagram con todos los headers necesarios
