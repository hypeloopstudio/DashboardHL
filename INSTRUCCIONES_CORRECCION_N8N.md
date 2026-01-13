# Instrucciones: Corrección del Workflow de n8n

## ✅ Cambio Realizado

Se ha corregido el archivo `n8n_instagram_scraper_workflow.json` para que el nodo "Code (Clean Data)" pase el `id` del registro a través de todos los nodos, permitiendo que el nodo "Supabase Update" actualice correctamente el registro en la base de datos.

## 🔧 Cambios Técnicos

### Antes (Incorrecto):
El código JavaScript del nodo "Code (Clean Data)" solo devolvía:
```javascript
return {
  json: {
    username: username,
    profile_pic_url: image
  }
};
```

### Después (Corregido):
El código JavaScript ahora incluye el `id`:
```javascript
// Obtener el id del webhook original
const webhookData = $('Webhook').first().json.body;
const recordId = webhookData?.id || null;

return {
  json: {
    id: recordId,  // ← AGREGADO
    username: username,
    profile_pic_url: image
  }
};
```

## 📝 Pasos para Aplicar en n8n

### 1. Importar el Workflow Corregido

1. Abre tu instancia de n8n
2. Ve a **Workflows** → **Import from File**
3. Selecciona el archivo `n8n_instagram_scraper_workflow.json` corregido
4. Confirma la importación

### 2. Verificar el Nodo "Code (Clean Data)"

1. Haz clic en el nodo "Code (Clean Data)"
2. Verifica que el código JavaScript incluya:
   - La línea que obtiene el `id` del webhook: `const webhookData = $('Webhook').first().json.body;`
   - La línea que guarda el `id`: `const recordId = webhookData?.id || null;`
   - El objeto de retorno que incluye el `id`: `id: recordId,`

### 3. Verificar el Nodo "Supabase Update"

1. Haz clic en el nodo "Supabase Update"
2. Verifica que:
   - La operación sea **"Update"**
   - El "Update Key" sea **"id"**
   - Los campos a actualizar sean:
     - `username`: `={{ $json.username }}`
     - `profile_pic_url`: `={{ $json.profile_pic_url }}`

### 4. Configurar Credenciales de Supabase

1. En el nodo "Supabase Update", haz clic en **"Credential to connect with"**
2. Agrega o selecciona tus credenciales de Supabase:
   - **Host**: Tu URL de Supabase (ej: `https://xxxxx.supabase.co`)
   - **Service Role Secret**: Tu clave de servicio de Supabase (no la clave anónima)

### 5. Activar el Workflow

1. Haz clic en el botón **"Active"** en la esquina superior derecha
2. El workflow debería estar activo y listo para recibir webhooks

## 🧪 Prueba del Workflow

### 1. Prueba desde el Frontend

1. Ve a la página "Posibles Clientes" en tu aplicación
2. Agrega un link de Instagram (ej: `https://www.instagram.com/usuario/`)
3. Espera unos segundos
4. Verifica que el nombre de usuario y la imagen de perfil se actualicen en la tarjeta

### 2. Verificar en Supabase

1. Abre tu proyecto en Supabase Dashboard
2. Ve a **Table Editor** → **PosiblesClientes**
3. Verifica que el registro tenga:
   - `username`: El nombre de usuario de Instagram
   - `profile_pic_url`: La URL de la imagen de perfil

### 3. Verificar Logs en n8n

1. En n8n, ve a **Executions**
2. Busca la ejecución más reciente del workflow
3. Verifica que:
   - Todos los nodos se ejecutaron correctamente (verde ✓)
   - El nodo "Code (Clean Data)" devuelve el `id`
   - El nodo "Supabase Update" actualiza el registro correctamente

## ⚠️ Solución Alternativa (Si el método actual no funciona)

Si el método `$('Webhook').first()` no funciona en tu versión de n8n, puedes usar esta alternativa:

### Opción 1: Usar un nodo "Set" antes del código

1. Agrega un nodo **"Set"** entre "HTML Extract" y "Code (Clean Data)"
2. Configura el nodo "Set" para preservar el `id`:
   - Campo: `id`
   - Valor: `={{ $('Webhook').first().json.body.id }}`
3. Modifica el código JavaScript para usar: `const recordId = $input.item.json.id;`

### Opción 2: Modificar el código para usar `$input.all()`

```javascript
// Obtener el id del webhook original usando $input.all()
const allInputs = $input.all();
const webhookInput = allInputs.find(item => item.json.body?.id) || allInputs[0];
const recordId = webhookInput?.json?.body?.id || null;
```

## 🔍 Troubleshooting

### El workflow no actualiza los datos en Supabase

1. **Verifica las credenciales de Supabase**: Asegúrate de usar la Service Role Key (no la anónima)
2. **Verifica el formato del `id`**: El `id` debe ser un UUID válido
3. **Revisa los logs de n8n**: Busca errores en la ejecución del workflow
4. **Verifica RLS**: Asegúrate de que las políticas RLS permitan actualizaciones desde n8n (puede que necesites usar Service Role Key)

### El username no se extrae correctamente

- El método actual extrae el username del meta tag `og:title` de Instagram
- Si Instagram cambia su estructura HTML, es posible que necesites ajustar el código
- Considera usar servicios de scraping más robustos (como los que tienes en otros archivos JSON)

### El workflow recibe el webhook pero no procesa

- Verifica que el workflow esté activo
- Revisa que la ruta del webhook sea correcta: `/webhook-test/scrape-instagram`
- Verifica que el webhook reciba datos en el formato esperado: `{ id: "...", instagram_url: "..." }`

## 📚 Archivos Relacionados

- `n8n_instagram_scraper_workflow.json` - Workflow corregido
- `src/pages/PossibleClients.jsx` - Componente React que envía el webhook
- `create_possible_clients_table.sql` - Esquema de la base de datos
- `ANALISIS_POSIBLES_CLIENTES.md` - Análisis completo del sistema

## ✅ Checklist Final

- [ ] Workflow importado en n8n
- [ ] Nodo "Code (Clean Data)" actualizado con el código corregido
- [ ] Credenciales de Supabase configuradas
- [ ] Workflow activado
- [ ] Prueba realizada desde el frontend
- [ ] Datos verificados en Supabase
- [ ] Logs de n8n revisados
