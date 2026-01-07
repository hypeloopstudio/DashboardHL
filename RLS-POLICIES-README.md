# Row Level Security (RLS) Policies para Leads

Este documento explica cómo configurar las políticas RLS para la tabla `leads` en Supabase.

## ¿Qué son las políticas RLS?

Row Level Security (RLS) es una característica de seguridad de Supabase que permite controlar el acceso a los datos a nivel de fila. Sin estas políticas, los usuarios no podrán realizar operaciones (SELECT, UPDATE, DELETE) en las tablas.

## Pasos para aplicar las políticas

### 1. Acceder al SQL Editor de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New Query**

### 2. Ejecutar el script SQL

1. Abre el archivo `supabase-rls-policies.sql` en este proyecto
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### 3. Verificar las políticas

Para verificar que las políticas se crearon correctamente:

1. En Supabase Dashboard, ve a **Database** → **Tables** → **leads**
2. Haz clic en la pestaña **Policies**
3. Deberías ver 3 políticas:
   - `Usuarios autenticados pueden leer leads` (SELECT)
   - `Usuarios autenticados pueden editar leads` (UPDATE)
   - `Usuarios autenticados pueden eliminar leads` (DELETE)

## Políticas incluidas

### SELECT Policy
Permite a todos los usuarios autenticados leer todos los leads de la tabla.

```sql
CREATE POLICY "Usuarios autenticados pueden leer leads"
ON leads FOR SELECT
TO authenticated
USING (true);
```

### UPDATE Policy
Permite a todos los usuarios autenticados actualizar cualquier lead de la tabla.

```sql
CREATE POLICY "Usuarios autenticados pueden editar leads"
ON leads FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

### DELETE Policy
Permite a todos los usuarios autenticados eliminar cualquier lead de la tabla.

```sql
CREATE POLICY "Usuarios autenticados pueden eliminar leads"
ON leads FOR DELETE
TO authenticated
USING (true);
```

## Personalización avanzada

Si necesitas políticas más restrictivas (por ejemplo, que los usuarios solo puedan editar sus propios leads), puedes modificar las condiciones `USING` y `WITH CHECK`.

### Ejemplo: Solo editar leads propios

Si tu tabla tiene una columna `user_id` o `created_by`:

```sql
CREATE POLICY "Usuarios solo pueden editar sus propios leads"
ON leads FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## Solución de problemas

### Error: "permission denied for table leads"

**Causa**: RLS está habilitado pero no hay políticas que permitan la operación.

**Solución**: Ejecuta el script SQL proporcionado para crear las políticas necesarias.

### Error: "new row violates row-level security policy"

**Causa**: La política `WITH CHECK` está rechazando la inserción/actualización.

**Solución**: Verifica que la política `WITH CHECK` permita la operación que intentas realizar.

## Notas importantes

- **Seguridad**: Las políticas actuales permiten que CUALQUIER usuario autenticado edite/elimine CUALQUIER lead. Si necesitas más control, modifica las políticas según tus necesidades.
- **Performance**: Las políticas RLS se evalúan en cada consulta, por lo que condiciones complejas pueden afectar el rendimiento.
- **Testing**: Siempre prueba las políticas en un entorno de desarrollo antes de aplicarlas en producción.

## Recursos adicionales

- [Documentación oficial de RLS en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Guía de políticas RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

