# Configuración de Storage en Supabase para client-assets

## 🔴 Problema Común

El error "Error al subir archivo. Asegúrate de que el bucket 'client-assets' exista en Supabase" puede ocurrir incluso si el bucket existe, generalmente por:

1. **Políticas RLS (Row Level Security) no configuradas** en el bucket
2. **Permisos insuficientes** para usuarios autenticados
3. **Bucket no configurado como público** (si es necesario)

## ✅ Solución: Configurar Políticas de Storage

### ⚠️ IMPORTANTE: No uses SQL Editor

**NO intentes crear políticas directamente con SQL Editor** - obtendrás el error "must be owner of table objects". 

En Supabase, las políticas de Storage se configuran **SOLO a través de la interfaz web**.

### Paso 1: Verificar que el bucket existe

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Storage** en el menú lateral
3. Verifica que el bucket `client-assets` existe
4. Si no existe, créalo:
   - Haz clic en **"New bucket"** o **"Nuevo bucket"**
   - Nombre: `client-assets`
   - **Public bucket**: Actívalo si quieres que los archivos sean accesibles públicamente
   - Haz clic en **"Create bucket"** o **"Crear bucket"**

### Paso 2: Configurar Políticas RLS (Interfaz Web)

1. En Supabase Dashboard, ve a **Storage**
2. Haz clic en el bucket `client-assets`
3. Ve a la pestaña **"Policies"** (o **"Políticas"**)
4. Haz clic en **"New Policy"** o **"Nueva Política"**

#### ⚠️ IMPORTANTE: Usa el nombre EXACTO del bucket

**El nombre del bucket en las políticas debe coincidir EXACTAMENTE con el nombre real del bucket.**

Si tu bucket se llama **"CLIENT-ASSETS"** (en mayúsculas), debes usar **`'CLIENT-ASSETS'`** en las expresiones.  
Si se llama **"client-assets"** (en minúsculas), usa **`'client-assets'`**.

**🔍 Cómo verificar el nombre exacto:**
1. Ve a **Storage** → **Buckets**
2. El nombre que aparece ahí es el que debes usar en las políticas

#### Configurar cada política una por una:

**Política 1: Lectura (SELECT)**

1. Haz clic en **"New Policy"**
2. Selecciona **"For full customization"** o **"Create a policy from scratch"**
3. Configura:
   - **Policy name:** `Allow authenticated users to read files`
   - **Allowed operation:** `SELECT`
   - **Target roles:** Marca `authenticated`
   - **USING expression:** `bucket_id = 'CLIENT-ASSETS'` ⚠️ **Reemplaza con el nombre EXACTO de tu bucket**
4. Haz clic en **"Review"** y luego **"Save policy"**

**Política 2: Inserción/Subida (INSERT)**

1. Haz clic en **"New Policy"**
2. Selecciona **"For full customization"**
3. Configura:
   - **Policy name:** `Allow authenticated users to upload files`
   - **Allowed operation:** `INSERT`
   - **Target roles:** Marca `authenticated`
   - **WITH CHECK expression:** `bucket_id = 'CLIENT-ASSETS'` ⚠️ **Reemplaza con el nombre EXACTO de tu bucket**
4. Haz clic en **"Review"** y luego **"Save policy"**

**Política 3: Actualización (UPDATE)**

1. Haz clic en **"New Policy"**
2. Selecciona **"For full customization"**
3. Configura:
   - **Policy name:** `Allow authenticated users to update files`
   - **Allowed operation:** `UPDATE`
   - **Target roles:** Marca `authenticated`
   - **USING expression:** `bucket_id = 'CLIENT-ASSETS'` ⚠️ **Reemplaza con el nombre EXACTO de tu bucket**
   - **WITH CHECK expression:** `bucket_id = 'CLIENT-ASSETS'` ⚠️ **Reemplaza con el nombre EXACTO de tu bucket**
4. Haz clic en **"Review"** y luego **"Save policy"**

**Política 4: Eliminación (DELETE)**

1. Haz clic en **"New Policy"**
2. Selecciona **"For full customization"**
3. Configura:
   - **Policy name:** `Allow authenticated users to delete files`
   - **Allowed operation:** `DELETE`
   - **Target roles:** Marca `authenticated`
   - **USING expression:** `bucket_id = 'CLIENT-ASSETS'` ⚠️ **Reemplaza con el nombre EXACTO de tu bucket**
4. Haz clic en **"Review"** y luego **"Save policy"**

### Paso 3: Verificar la Configuración

1. Asegúrate de que **RLS está habilitado** en el bucket (debería estar por defecto)
2. Verifica que todas las 4 políticas estén activas (deben aparecer en la lista)
3. Cada política debe tener el estado **"Active"** o **"Activa"**

### Paso 4: Verificar que el bucket es público (si es necesario)

Si quieres que los archivos sean accesibles sin autenticación:

1. Ve a Storage → `client-assets`
2. Haz clic en el icono de configuración (⚙️) o en **"Settings"**
3. Activa **"Public bucket"** o **"Bucket público"**
4. Guarda los cambios

**Nota:** Incluso si el bucket es público, necesitas las políticas RLS para que los usuarios autenticados puedan subir archivos.

## 🔧 Solución Alternativa: Usar Service Role Key (Solo para desarrollo)

Si estás en desarrollo y necesitas una solución temporal, puedes usar la Service Role Key en lugar de la Anon Key. **⚠️ NUNCA uses esto en producción.**

1. Ve a **Settings** → **API** en Supabase
2. Copia la **Service Role Key** (NO la Anon Key)
3. Úsala temporalmente en tu `.env`:
   ```
   VITE_SUPABASE_ANON_KEY=tu_service_role_key_aqui
   ```

**⚠️ ADVERTENCIA:** La Service Role Key bypass todas las políticas RLS. Solo úsala para desarrollo y nunca la expongas en el frontend en producción.

## 🧪 Prueba

Después de configurar las políticas:

1. Recarga la aplicación
2. Intenta subir un archivo desde "Detalles del Cliente"
3. Si aún hay errores:
   - Abre la consola del navegador (F12)
   - Revisa el error específico en la pestaña "Console"
   - El código mejorado ahora mostrará mensajes de error más descriptivos

## 📝 Notas Importantes

- **NO uses SQL Editor** para crear políticas de Storage - siempre usa la interfaz web
- Las políticas RLS son necesarias incluso si el bucket es público
- Los usuarios deben estar autenticados para subir archivos
- Si cambias las políticas, los cambios se aplican inmediatamente
- El error "must be owner of table objects" es normal - significa que debes usar la interfaz web

## 🆘 Si sigues teniendo problemas

1. Verifica que estás autenticado en la aplicación
2. Verifica que la sesión de Supabase está activa
3. Revisa la consola del navegador para ver el error específico
4. Asegúrate de que el bucket `client-assets` existe y está visible en Storage
5. Verifica que las 4 políticas están creadas y activas
