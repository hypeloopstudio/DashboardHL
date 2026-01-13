# Configuración de Storage en Supabase para client-assets

## 🔴 Problema Común

El error "Error al subir archivo. Asegúrate de que el bucket 'client-assets' exista en Supabase" puede ocurrir incluso si el bucket existe, generalmente por:

1. **Políticas RLS (Row Level Security) no configuradas** en el bucket
2. **Permisos insuficientes** para usuarios autenticados
3. **Bucket no configurado como público** (si es necesario)

## ✅ Solución: Configurar Políticas de Storage

### Paso 1: Verificar que el bucket existe

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Storage** en el menú lateral
3. Verifica que el bucket `client-assets` existe
4. Si no existe, créalo:
   - Haz clic en **"New bucket"**
   - Nombre: `client-assets`
   - **Public bucket**: Actívalo si quieres que los archivos sean accesibles públicamente
   - Haz clic en **"Create bucket"**

### Paso 2: Configurar Políticas RLS para el bucket

1. En la página de Storage, haz clic en el bucket `client-assets`
2. Ve a la pestaña **"Policies"** (o **"Políticas"**)
3. Haz clic en **"New Policy"** o **"Nueva Política"**

#### Política 1: Permitir lectura (SELECT) para usuarios autenticados

```sql
-- Nombre de la política: "Allow authenticated users to read files"
-- Operación: SELECT

CREATE POLICY "Allow authenticated users to read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'client-assets');
```

#### Política 2: Permitir inserción (INSERT) para usuarios autenticados

```sql
-- Nombre de la política: "Allow authenticated users to upload files"
-- Operación: INSERT

CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-assets');
```

#### Política 3: Permitir actualización (UPDATE) para usuarios autenticados

```sql
-- Nombre de la política: "Allow authenticated users to update files"
-- Operación: UPDATE

CREATE POLICY "Allow authenticated users to update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-assets')
WITH CHECK (bucket_id = 'client-assets');
```

#### Política 4: Permitir eliminación (DELETE) para usuarios autenticados

```sql
-- Nombre de la política: "Allow authenticated users to delete files"
-- Operación: DELETE

CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-assets');
```

### Paso 3: Configuración Alternativa (Más Restrictiva)

Si quieres que los usuarios solo puedan subir/eliminar sus propios archivos (basado en el path):

```sql
-- Política para INSERT con restricción de path
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para DELETE con restricción de path
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Nota:** Esta configuración requiere que el path del archivo incluya el `user_id` del usuario autenticado.

### Paso 4: Verificar la Configuración

1. Asegúrate de que **RLS está habilitado** en el bucket
2. Verifica que todas las políticas estén activas (deben aparecer en la lista)
3. Prueba subir un archivo desde la aplicación

## 🔧 Solución Rápida (SQL Editor)

Si prefieres ejecutar todo de una vez, puedes usar el SQL Editor de Supabase:

1. Ve a **SQL Editor** en Supabase Dashboard
2. Crea un nuevo query
3. Pega el siguiente código:

```sql
-- Habilitar RLS en storage.objects (si no está habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;

-- Crear políticas para el bucket client-assets
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'client-assets');

CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-assets');

CREATE POLICY "Allow authenticated users to update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-assets')
WITH CHECK (bucket_id = 'client-assets');

CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-assets');
```

4. Ejecuta el query
5. Verifica que no haya errores

## ⚠️ Verificaciones Adicionales

### 1. Verificar que el bucket es público (si es necesario)

Si quieres que los archivos sean accesibles sin autenticación:

1. Ve a Storage → `client-assets`
2. En la configuración del bucket, activa **"Public bucket"**
3. Esto permite que cualquiera pueda leer los archivos usando la URL pública

### 2. Verificar autenticación

Asegúrate de que:
- El usuario está autenticado en la aplicación
- La sesión de Supabase está activa
- Las credenciales de Supabase están correctamente configuradas en `.env`

### 3. Verificar tamaño de archivo

Si el archivo es muy grande, puede haber límites:
- Verifica los límites de tamaño en la configuración del bucket
- El código ahora incluye mejor manejo de errores para identificar este problema

## 🧪 Prueba

Después de configurar las políticas:

1. Recarga la aplicación
2. Intenta subir un archivo desde "Detalles del Cliente"
3. Si aún hay errores, revisa la consola del navegador (F12) para ver el error específico
4. El código mejorado ahora mostrará mensajes de error más descriptivos

## 📝 Notas

- Las políticas RLS son necesarias incluso si el bucket es público
- Los usuarios deben estar autenticados para subir archivos
- Si cambias las políticas, los cambios se aplican inmediatamente
