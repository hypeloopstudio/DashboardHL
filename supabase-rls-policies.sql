-- =====================================================
-- Row Level Security (RLS) Policies para la tabla leads
-- =====================================================
-- 
-- Este archivo contiene las políticas RLS necesarias para permitir
-- que los usuarios autenticados puedan leer, editar y eliminar datos
-- de la tabla leads.
--
-- INSTRUCCIONES:
-- 1. Abre tu proyecto en Supabase Dashboard
-- 2. Ve a SQL Editor
-- 3. Copia y pega este contenido
-- 4. Ejecuta el script
-- =====================================================

-- Paso 1: Habilitar Row Level Security en la tabla leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Paso 2: Política para SELECT (Leer leads)
-- Permite a usuarios autenticados ver todos los leads
CREATE POLICY "Usuarios autenticados pueden leer leads"
ON leads
FOR SELECT
TO authenticated
USING (true);

-- Paso 3: Política para UPDATE (Editar leads)
-- Permite a usuarios autenticados actualizar cualquier lead
CREATE POLICY "Usuarios autenticados pueden editar leads"
ON leads
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Paso 4: Política para DELETE (Eliminar leads)
-- Permite a usuarios autenticados eliminar cualquier lead
CREATE POLICY "Usuarios autenticados pueden eliminar leads"
ON leads
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- OPCIONAL: Si también quieres permitir INSERT
-- Descomenta la siguiente política:
-- =====================================================
-- CREATE POLICY "Usuarios autenticados pueden crear leads"
-- ON leads
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

