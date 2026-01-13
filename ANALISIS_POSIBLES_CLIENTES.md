# Análisis: Automatización de Posibles Clientes - Instagram

## 📋 Resumen Ejecutivo

El sistema actual tiene una arquitectura funcional pero presenta un **problema crítico** en el workflow de n8n que impide que los datos extraídos de Instagram se actualicen correctamente en Supabase.

## 🔍 Estado Actual

### Frontend (React)
- ✅ **PossibleClients.jsx**: Funciona correctamente
  - Agrega links de Instagram a la base de datos
  - Muestra los clientes con sus datos (username, profile_pic_url)
  - Envía el webhook a n8n con `id` e `instagram_url`
  - URL del webhook: `https://n8n.srv1257372.hstgr.cloud/webhook-test/scrape-instagram`

### Base de Datos (Supabase)
- ✅ **Tabla `PosiblesClientes`**: Estructura correcta
  - Campos: `id`, `instagram_url`, `status`, `username`, `profile_pic_url`, `scraped_data`
  - RLS habilitado para usuarios autenticados

### Workflow n8n (Problema identificado)
- ⚠️ **Problema crítico**: El workflow NO pasa el `id` del registro a través de los nodos
  - El nodo "Code (Clean Data)" solo devuelve `username` y `profile_pic_url`
  - El nodo "Supabase Update" no recibe el `id`, por lo que no puede actualizar el registro correcto

## 🐛 Problema Detectado

### Flujo actual (NO funciona):
```
1. Webhook recibe: { id: "xxx", instagram_url: "https://..." }
2. HTTP Request hace scraping (pierde el id)
3. HTML Extract extrae datos (pierde el id)
4. Code (Clean Data) devuelve: { username: "...", profile_pic_url: "..." } ❌ SIN ID
5. Supabase Update intenta actualizar sin ID → FALLA
```

### Flujo necesario (corregido):
```
1. Webhook recibe: { id: "xxx", instagram_url: "https://..." }
2. HTTP Request hace scraping (preserva el id del webhook original)
3. HTML Extract extrae datos (preserva el id)
4. Code (Clean Data) devuelve: { id: "xxx", username: "...", profile_pic_url: "..." } ✅ CON ID
5. Supabase Update actualiza el registro usando el ID → ÉXITO
```

## 🔧 Solución Propuesta

### 1. Modificar el nodo "Code (Clean Data)" en n8n

El código actual solo devuelve `username` y `profile_pic_url`. Necesita también devolver el `id` del registro.

**Código actual (incorrecto):**
```javascript
return {
  json: {
    username: username,
    profile_pic_url: image
  }
};
```

**Código corregido:**
```javascript
// Obtener el id del webhook original (puede estar en diferentes rutas según n8n)
const id = $input.item.json.body?.id || $input.all()[0].json.body?.id || $('Webhook').first().json.body.id;

return {
  json: {
    id: id,  // ← AGREGAR ESTE CAMPO
    username: username,
    profile_pic_url: image
  }
};
```

### 2. Alternativa: Usar nodo "Set" antes del código

Una alternativa más robusta es usar un nodo "Set" antes del código para preservar el `id`:

**Agregar nodo "Set" después del HTML Extract:**
- Campo: `id`
- Valor: `={{ $('Webhook').first().json.body.id }}`

Luego el código puede acceder al `id` directamente desde `$input.item.json.id`.

### 3. Mejor solución: Pasar datos entre nodos

La mejor práctica es modificar el nodo HTTP Request para preservar los datos del webhook original usando "Options" → "Keep Only Set Fields" deshabilitado, o usar nodos intermedios para preservar datos.

## 📝 Recomendaciones Adicionales

### 1. Manejo de errores
- Agregar nodo "Error Trigger" para capturar errores
- Registrar errores en Supabase o enviar notificaciones

### 2. Validación de datos
- Validar que el username no esté vacío
- Validar formato de URL de imagen
- Manejar casos donde Instagram no devuelve datos

### 3. Extracción mejorada del username
- El código actual intenta extraer el username del meta tag `og:title`
- Considerar usar API de Instagram (si está disponible) o servicios de scraping más robustos

### 4. Actualización del workflow
El archivo `n8n_instagram_scraper_workflow.json` necesita ser actualizado con la corrección del código JavaScript.

## ✅ Checklist de Implementación

- [ ] Modificar el código del nodo "Code (Clean Data)" para incluir el `id`
- [ ] Probar el workflow completo con un link real de Instagram
- [ ] Verificar que los datos se actualicen correctamente en Supabase
- [ ] Agregar manejo de errores
- [ ] Documentar el proceso de configuración del workflow en n8n

## 🔗 Referencias

- Archivo del workflow: `n8n_instagram_scraper_workflow.json`
- Componente React: `src/pages/PossibleClients.jsx`
- Schema SQL: `create_possible_clients_table.sql`
