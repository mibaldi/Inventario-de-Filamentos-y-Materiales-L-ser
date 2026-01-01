Repositorio y tooling

Crear Next.js App Router + TS

Configurar Tailwind (si lo quieres) y UI base

Configurar Firebase SDK (client): Auth + Firestore (read-only)

Configurar Firebase Functions (Node 20, TS) + Admin SDK

Estructura monorepo (recomendado):

/apps/web (Next.js)

/functions (Firebase Functions)

1) Autenticación y control de acceso

Implementar login Google en web

Guard de rutas:

si no logueado → /login

si logueado pero no owner → pantalla “No autorizado”

Crear mecanismo OWNER_UID:

opción simple: variable de entorno en functions (OWNER_UID=...)

Crear callable auth.assertOwner (dev) para verificar configuración

Firestore Rules:

read solo owner

write denegado a clientes

2) Filamentos — Backend (Functions)

Definir schemas Zod:

SpoolCreateInput, SpoolUpdateInput, WeighInInput

Callables:

spools.create

spools.update

spools.archive

spools.delete

spools.addWeighIn

Implementar cálculo y denormalización en spools.addWeighIn

Índices Firestore (si usas queries por status/material)

3) Filamentos — Frontend

Modelos TS y cliente de functions (httpsCallable)

Páginas:

/spools listado + filtros + búsqueda

/spools/new alta

/spools/[id] detalle + historial + acción “Registrar pesada”

/spools/[id]/edit edición

Dashboard /:

“Críticas” por remainingG <= thresholdG y/o remainingPct

Componentes UX:

Modal confirmación borrar/archivar

Toasts de éxito/error

4) Láser — Backend (Functions)

Schemas Zod:

LaserCreateInput, LaserUpdateInput, AdjustStockInput

Callables:

laser.create

laser.update

laser.adjustStock (delta ±)

laser.delete

Lógica:

quantityRemaining = max(0, quantityRemaining + delta)

insertar movement siempre (auditoría)

5) Láser — Frontend

Páginas:

/laser listado + filtros

/laser/new

/laser/[id] detalle + historial + “Consumir” / “Reponer”

/laser/[id]/edit

Dashboard:

materiales críticos por quantityRemaining <= thresholdQty

6) Calidad, DX y despliegue

ESLint + Prettier + typecheck

Manejo de errores estándar (mapear HttpsError a mensajes)

README (setup local, deploy, cómo obtener OWNER_UID)

Deploy:

Hosting (Firebase Hosting) para Next.js (o Vercel si prefieres)

Functions + Rules + Indexes