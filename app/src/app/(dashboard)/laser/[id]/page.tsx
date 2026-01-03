"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { laserGet, laserGetMovements, laserAdjustStock, laserDelete } from "@/lib/functions";
import type { LaserMaterial, Movement, SafeFlag } from "@/types/laser";

const safeFlagColors: Record<SafeFlag, "default" | "secondary" | "destructive"> = {
  OK: "default",
  CAUTION: "secondary",
  NO: "destructive",
};

const safeFlagLabels: Record<SafeFlag, string> = {
  OK: "Seguro",
  CAUTION: "Precaucion",
  NO: "No usar",
};

export default function LaserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<LaserMaterial | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustMode, setAdjustMode] = useState<"consume" | "add">("consume");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [materialData, movementsData] = await Promise.all([
        laserGet(materialId),
        laserGetMovements(materialId),
      ]);
      setMaterial(materialData);
      setMovements(movementsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setMaterial(null);
    } finally {
      setLoading(false);
    }
  }, [materialId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdjust = async () => {
    if (!adjustQty) return;
    setAdjustLoading(true);

    const delta = adjustMode === "consume"
      ? -Math.abs(parseInt(adjustQty))
      : Math.abs(parseInt(adjustQty));

    try {
      await laserAdjustStock(materialId, { delta, note: adjustNote || undefined });
      toast.success(adjustMode === "consume" ? "Consumo registrado" : "Stock agregado");
      setAdjustOpen(false);
      setAdjustQty("");
      setAdjustNote("");
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al ajustar stock";
      toast.error(message);
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await laserDelete(materialId);
      toast.success("Material eliminado");
      router.push("/laser");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al eliminar";
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!material) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Material no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/laser">Volver al listado</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isLow = material.thresholdQty
    ? material.quantityRemaining <= material.thresholdQty
    : material.quantityRemaining <= 2;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{material.type}</h1>
            <Badge variant={safeFlagColors[material.safeFlag]}>
              {safeFlagLabels[material.safeFlag]}
            </Badge>
            {isLow && <Badge variant="destructive">Stock bajo</Badge>}
          </div>
          <p className="text-muted-foreground">
            {material.thicknessMm} mm - {material.format === "SHEET" ? "Hojas" : "Piezas"}
            {material.widthMm && material.heightMm && (
              <span> - {material.widthMm} x {material.heightMm} mm</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setAdjustMode("consume"); setAdjustOpen(true); }} variant="destructive">
            Consumir
          </Button>
          <Button onClick={() => { setAdjustMode("add"); setAdjustOpen(true); }} variant="outline">
            Reponer
          </Button>
          <Button asChild variant="outline">
            <Link href={`/laser/${materialId}/edit`}>Editar</Link>
          </Button>
        </div>
      </div>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{adjustMode === "consume" ? "Consumir Material" : "Reponer Stock"}</DialogTitle>
            <DialogDescription>
              {adjustMode === "consume" ? "Registra cuantas unidades has consumido" : "Registra cuantas unidades agregas al stock"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adjustQty">Cantidad</Label>
              <Input id="adjustQty" type="number" min="1" step="1" placeholder="1" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} autoFocus />
              <p className="text-xs text-muted-foreground">Stock actual: {material.quantityRemaining}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustNote">Nota (opcional)</Label>
              <Input id="adjustNote" placeholder="Proyecto X, pedido #123..." value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdjust} disabled={adjustLoading || !adjustQty} variant={adjustMode === "consume" ? "destructive" : "default"}>
              {adjustLoading ? "Guardando..." : adjustMode === "consume" ? "Consumir" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Imagen del material si existe */}
      {material.imageUrl && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={material.imageUrl}
                alt={material.type}
                className="w-32 h-32 object-contain rounded-lg border bg-white"
              />
              <div className="flex-1">
                {material.brand && (
                  <p className="text-lg font-semibold">{material.brand}</p>
                )}
                {material.model && (
                  <p className="text-muted-foreground">Modelo: {material.model}</p>
                )}
                {material.barcode && (
                  <p className="text-sm text-muted-foreground font-mono mt-1">{material.barcode}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informacion</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {material.brand && !material.imageUrl && (
              <div className="flex justify-between"><span className="text-muted-foreground">Marca</span><span>{material.brand}</span></div>
            )}
            {material.model && !material.imageUrl && (
              <div className="flex justify-between"><span className="text-muted-foreground">Modelo</span><span>{material.model}</span></div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{material.type}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Espesor</span><span>{material.thicknessMm} mm</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Formato</span><span>{material.format === "SHEET" ? "Hojas" : "Piezas"}</span></div>
            {material.widthMm && material.heightMm && (
              <div className="flex justify-between"><span className="text-muted-foreground">Dimensiones</span><span>{material.widthMm} x {material.heightMm} mm</span></div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Stock</span><span className={`font-medium ${isLow ? "text-red-500" : ""}`}>{material.quantityRemaining} / {material.quantityInitial}</span></div>
            {material.thresholdQty && (<div className="flex justify-between"><span className="text-muted-foreground">Umbral alerta</span><span>{material.thresholdQty}</span></div>)}
            {material.location && (<div className="flex justify-between"><span className="text-muted-foreground">Ubicacion</span><span>{material.location}</span></div>)}
            {material.barcode && !material.imageUrl && (
              <div className="flex justify-between"><span className="text-muted-foreground">Codigo barras</span><span className="font-mono text-sm">{material.barcode}</span></div>
            )}
            {material.notes && (<div className="pt-2 border-t"><p className="text-sm text-muted-foreground">Notas</p><p className="text-sm">{material.notes}</p></div>)}
            <div className="pt-3">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full transition-all ${material.quantityRemaining / material.quantityInitial < 0.2 ? "bg-red-500" : material.quantityRemaining / material.quantityInitial < 0.4 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${(material.quantityRemaining / material.quantityInitial) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild><Button variant="destructive" className="w-full justify-start">Eliminar material</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Eliminar material</DialogTitle><DialogDescription>Esta accion no se puede deshacer.</DialogDescription></DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? "Eliminando..." : "Eliminar"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Historial de Movimientos</CardTitle><CardDescription>{movements.length} registro{movements.length !== 1 && "s"}</CardDescription></CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay movimientos registrados</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead>Tipo</TableHead><TableHead>Nota</TableHead></TableRow></TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{new Date(m.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</TableCell>
                    <TableCell className="text-right"><span className={m.deltaQty < 0 ? "text-red-500" : "text-green-500"}>{m.deltaQty > 0 ? "+" : ""}{m.deltaQty}</span></TableCell>
                    <TableCell>{m.deltaQty < 0 ? "Consumo" : "Reposicion"}</TableCell>
                    <TableCell className="text-muted-foreground">{m.note || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
