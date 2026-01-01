Fase 0 — Preparación

Crear Firebase Project

Configurar Auth (Google)

Definir OWNER_UID (se obtiene tras tu primer login)

Inicializar Firestore + Functions

Fase 1 — Base técnica (vertical slice)

Next.js + Firebase Auth

Protecciones de rutas (solo autenticado; y solo OWNER)

Firestore Rules aplicadas

Primera Function callable “ping/health” con check de owner

Fase 2 — Filamentos MVP

Colecciones + functions CRUD spools

Function spools.addWeighIn que:

crea documento en subcolección weighIns

recalcula y persiste remainingG/remainingPct/lastWeightG/lastWeighInAt

UI: listado, detalle, crear/editar, registrar pesada, dashboard críticos

Fase 3 — Láser MVP

CRUD de laserMaterials

Function laser.adjustStock que:

inserta movements con delta

actualiza quantityRemaining

UI: listado, detalle, crear/editar, registrar consumo/reponer, dashboard críticos

Fase 4 — Endurecimiento y entrega

Validación de payloads en functions (Zod)

Manejo de errores y UX (empty states, confirmaciones)

README + guía operativa