SPEC
1) Objetivo

Aplicación web privada para:

Registrar bobinas de filamento y su restante estimado únicamente por pesada.

Registrar materiales de láser (hojas/piezas) con stock restante.

Garantizar que, aunque esté desplegada online, nadie salvo tú pueda modificar datos.

2) Alcance funcional (MVP)
2.1 Filamentos (Bobinas)

CRUD bobinas (Owner only)

Crear/editar/archivar/eliminar.

Campos mínimos:

label (ej. “PLA Sunlu Gris”)

material (PLA/PETG/ABS/ASA/TPU…)

color (texto)

diameter (1.75 / 2.85)

netInitialG (g)

tareG (g)

status (NEW, IN_USE, LOW, EMPTY, ARCHIVED)

location (opcional)

notes (opcional)

thresholdG (opcional; para alertas)

Movimientos

Solo pesadas:

Registrar pesada: WEIGH_IN con weightG (peso actual en báscula).

Cálculo restante (source of truth):

remainingG = max(0, lastWeightG - tareG)

remainingPct = remainingG / netInitialG

Pantallas

Dashboard: bobinas críticas (por thresholdG o remainingPct si lo añades).

Listado de bobinas (filtros por material/estado).

Detalle bobina (última pesada, restante, histórico de pesadas).

Formularios alta/edición.

Acción rápida: “Registrar pesada”.

2.2 Láser (Hojas/Piezas)

CRUD materiales láser (Owner only)

Campos mínimos:

type (plywood/MDF/acrílico/cartón/cuero/corcho/etc.)

thicknessMm

format (SHEET | PCS) (equivalente a hojas/piezas)

widthMm, heightMm (si es hoja; si es pieza, opcional)

quantityInitial

quantityRemaining

safeFlag (OK, CAUTION, NO)

location (opcional)

notes (opcional)

thresholdQty (opcional)

Movimientos

Consumo: decrementa quantityRemaining (p.ej. “-1 hoja”).

(Opcional MVP) Alta de stock: “+N unidades” (reposición).

Pantallas

Listado materiales (filtros por tipo/espesor/estado).

Detalle material (stock + historial).

Formularios alta/edición.

Dashboard: materiales críticos.

3) Usuarios y seguridad (decisiones cerradas)

Solo Owner accede a la app (login Google).

No existe modo público.

Cliente no escribe en Firestore. Todas las mutaciones se hacen por Firebase Functions.

Firestore Rules:

read: solo request.auth != null y request.auth.uid == OWNER_UID

write: siempre false desde cliente

Functions validan context.auth.uid == OWNER_UID para cualquier operación.

Ventaja: aunque alguien inspeccione la app, no podrá escribir ni siquiera con SDK, porque:

Firestore bloquea escritura por reglas

Functions bloquean por UID

4) Arquitectura
Frontend

Next.js (App Router) + React + TypeScript

Firebase Auth (Google)

Firebase Functions callable (httpsCallable) para mutaciones

Firestore (SDK cliente) solo lectura (o lectura también vía functions, pero no es necesario si rules limitan read al owner)

Backend

Firebase Cloud Functions (Node 20) + Admin SDK

Endpoints callable (recomendado para auth integrada):

spools.create

spools.update

spools.archive

spools.delete

spools.addWeighIn

laser.create

laser.update

laser.adjustStock (±qty)

laser.delete

5) Modelo de datos (Firestore)

/spools/{spoolId}

ownerUid: string

label: string

material: string

color: string

diameter: number

netInitialG: number

tareG: number

status: "NEW"|"IN_USE"|"LOW"|"EMPTY"|"ARCHIVED"

thresholdG?: number

location?: string

notes?: string

lastWeighInAt?: timestamp

lastWeightG?: number

remainingG?: number (denormalizado por functions para listados rápidos)

remainingPct?: number (denormalizado)

createdAt, updatedAt: timestamp

/spools/{spoolId}/weighIns/{weighInId}

weightG: number

createdAt: timestamp

createdBy: uid

note?: string

/laserMaterials/{materialId}

ownerUid

type

thicknessMm

format: "SHEET"|"PCS"

widthMm?: number

heightMm?: number

quantityInitial: number

quantityRemaining: number

thresholdQty?: number

safeFlag: "OK"|"CAUTION"|"NO"

location?: string

notes?: string

createdAt, updatedAt

/laserMaterials/{materialId}/movements/{movementId}

deltaQty: number (ej. -1, +5)

createdAt

createdBy

note?: string

Nota técnica: denormalizar remainingG/remainingPct/lastWeightG en /spools mejora rendimiento y simplifica UI.

6) Reglas de negocio clave

Registrar pesada requiere weightG >= tareG (si no, se permite pero marca warning y remaining=0).

status puede auto-derivarse:

EMPTY si remainingG == 0

LOW si remainingG <= thresholdG (si existe)

si no, IN_USE/NEW según selección

Recomendación: mantener status editable, y además mostrar “estado calculado”.