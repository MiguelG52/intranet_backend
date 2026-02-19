# Migraciones de Base de Datos

Este directorio contiene los scripts SQL para migrar y configurar la base de datos.

## Estructura de Archivos

### Scripts de Configuración Completa
- **`000-setup-complete.sql`** - Script todo-en-uno que ejecuta migración + inserción de datos

### Scripts Individuales (Ejecución manual)
- **`001-area-coordination-many-to-many.sql`** - Migración de estructura para relación many-to-many
- **`002-insert-coordinations-with-many-to-many.sql`** - Inserción de datos con nueva estructura

## Cómo Ejecutar

### Opción 1: Script Completo (Recomendado)
Ejecuta todo en una transacción:

```bash
# Windows (PowerShell)
psql -U postgres -d intranet_db -f migrations/000-setup-complete.sql

# Linux/Mac
psql -U postgres -d intranet_db -f migrations/000-setup-complete.sql
```

### Opción 2: Scripts Individuales
Ejecuta paso por paso:

```bash
# 1. Migración de estructura
psql -U postgres -d intranet_db -f migrations/001-area-coordination-many-to-many.sql

# 2. Inserción de datos
psql -U postgres -d intranet_db -f migrations/002-insert-coordinations-with-many-to-many.sql
```

### Opción 3: Desde pgAdmin
1. Abre pgAdmin
2. Conecta a la base de datos `intranet_db`
3. Herramientas → Query Tool
4. Archivo → Abrir → Selecciona `000-setup-complete.sql`
5. Ejecuta (F5)

## Qué Hace la Migración

### Cambios en la Estructura

#### ANTES (One-to-Many):
```
Area
 └─ Coordination (area_id FK)
     └─ Methodology (coordination_id FK)
```

#### DESPUÉS (Many-to-Many):
```
Area ←→ AreaCoordination ←→ Coordination
                              └─ Methodology
```

### Tablas Modificadas

1. **Nueva tabla**: `area_coordination`
   - `area_coordination_id` (PK)
   - `area_id` (FK → area)
   - `coordination_id` (FK → coordination)
   - Constraint único: `(area_id, coordination_id)`

2. **Tabla coordination**:
   - ❌ Eliminada columna `area_id`
   - ✅ Nueva relación many-to-many vía `area_coordination`

### Datos Insertados

#### Coordinaciones:
- **SecOps** - Presente en Ingeniería MX y PMO MX
- **CyberOps** - Presente en Ingeniería MX y PMO MX
- **SECOPS** - Presente en Ingeniería CO

#### Metodologías:
- **SecOps**: Zero Trust, CTEM
- **CyberOps**: NGSOC, CSIRT, PREVENTA, Zero Trust
- **SECOPS**: Zero Trust

## Verificación Post-Migración

El script incluye consultas de verificación que muestran:

1. **Coordinaciones con sus áreas**:
   ```
   coordinacion | num_areas | areas
   -------------+-----------+----------------------
   CyberOps     | 2         | Ingeniería, PMO
   SecOps       | 2         | Ingeniería, PMO
   SECOPS       | 1         | Ingeniería
   ```

2. **Áreas con sus coordinaciones**:
   ```
   country | area_name   | coordinaciones
   --------+-------------+-----------------
   MX      | Ingeniería  | SecOps, CyberOps
   MX      | PMO         | SecOps, CyberOps
   CO      | Ingeniería  | SECOPS
   ```

3. **Metodologías por coordinación**

## Rollback

Si necesitas revertir la migración (script `001` incluye sección de rollback):

```sql
BEGIN;

-- 1. Restaurar columna area_id en coordination
ALTER TABLE public.coordination ADD COLUMN area_id UUID;

-- 2. Restaurar datos (tomando la primera relación)
UPDATE public.coordination c
SET area_id = (
    SELECT ac.area_id 
    FROM public.area_coordination ac 
    WHERE ac.coordination_id = c.coordination_id 
    LIMIT 1
);

-- 3. Restaurar foreign key
ALTER TABLE public.coordination 
ADD CONSTRAINT fk_coordination_area 
FOREIGN KEY (area_id) REFERENCES public.area(area_id);

-- 4. Eliminar tabla intermedia
DROP TABLE IF EXISTS public.area_coordination CASCADE;

COMMIT;
```

## API Endpoints Disponibles

Después de la migración, estos endpoints están activos:

### Coordinaciones
- `GET /coordination` - Listar todas
- `GET /coordination/:id` - Obtener una
- `POST /coordination` - Crear
- `PUT /coordination/:id` - Actualizar
- `DELETE /coordination/:id` - Eliminar

### Relaciones Area-Coordination
- `POST /coordination/assign-area` - Asignar coordinación a área
  ```json
  { "coordinationId": "uuid", "areaId": "uuid" }
  ```
- `DELETE /coordination/:coordinationId/area/:areaId` - Remover de área
- `GET /coordination/by-area/:areaId` - Coordinaciones de un área
- `GET /coordination/:coordinationId/areas` - Áreas de una coordinación

## Notas Importantes

⚠️ **Prerequisitos**:
- Las tablas `area` y `coordination` deben existir
- Debe haber datos en la tabla `area` con los IDs especificados

⚠️ **Transaccionalidad**:
- Todos los scripts usan `BEGIN/COMMIT`
- Si algo falla, nada se aplica (rollback automático)

⚠️ **Idempotencia**:
- Los scripts pueden ejecutarse múltiples veces
- Usan `ON CONFLICT DO NOTHING` para evitar duplicados
- Verifican existencia con `IF NOT EXISTS`

## Troubleshooting

### Error: "relation area_coordination already exists"
Ya ejecutaste la migración. Usa el script 002 solo para insertar datos adicionales.

### Error: "foreign key violation"
Verifica que existan las áreas con los IDs especificados en la tabla `area`.

### No se ven los datos insertados
Verifica que la transacción se completó con `COMMIT`. Revisa errores en la salida.

## Siguiente Paso

Después de ejecutar la migración:
1. Verificar que los datos se insertaron correctamente
2. Probar los endpoints del API
3. Actualizar el frontend para soportar selección múltiple de áreas
