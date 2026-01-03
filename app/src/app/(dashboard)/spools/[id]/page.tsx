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
import { spoolsGet, spoolsGetWeighIns, spoolsAddWeighIn, spoolsArchive, spoolsDelete, type EstimateRemainingResult } from "@/lib/functions";
import type { Spool, WeighIn, SpoolStatus } from "@/types/spool";
import { WeightEstimator } from "@/components/weight-estimator";

const statusColors: Record<SpoolStatus, "default" | "secondary" | "destructive" | "outline"> = {
  NEW: "outline",
  IN_USE: "default",
  LOW: "secondary",
  EMPTY: "destructive",
  ARCHIVED: "outline",
};

export default function SpoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spoolId = params.id as string;

  const [spool, setSpool] = useState<Spool | null>(null);
  const [weighIns, setWeighIns] = useState<WeighIn[]>([]);
  const [loading, setLoading] = useState(true);

  const [weighInOpen, setWeighInOpen] = useState(false);
  const [weighInLoading, setWeighInLoading] = useState(false);
  const [weightG, setWeightG] = useState("");
  const [weighInNote, setWeighInNote] = useState("");
  const [useAiEstimation, setUseAiEstimation] = useState(false);
  const [lastEstimate, setLastEstimate] = useState<EstimateRemainingResult | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [spoolData, weighInsData] = await Promise.all([
        spoolsGet(spoolId),
        spoolsGetWeighIns(spoolId),
      ]);
      setSpool(spoolData);
      setWeighIns(weighInsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setSpool(null);
    } finally {
      setLoading(false);
    }
  }, [spoolId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleWeighIn = async () => {
    if (!weightG) return;
    setWeighInLoading(true);

    try {
      await spoolsAddWeighIn(spoolId, {
        weightG: parseFloat(weightG),
        note: weighInNote || undefined,
      });
      toast.success("Pesada registrada");
      setWeighInOpen(false);
      setWeightG("");
      setWeighInNote("");
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al registrar pesada";
      toast.error(message);
    } finally {
      setWeighInLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      await spoolsArchive(spoolId);
      toast.success("Bobina archivada");
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al archivar";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await spoolsDelete(spoolId);
      toast.success("Bobina eliminada");
      router.push("/spools");
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

  if (!spool) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Bobina no encontrada</p>
          <Button asChild className="mt-4">
            <Link href="/spools">Volver al listado</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            {spool.colorHex && (
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: spool.colorHex }}
                title={spool.color}
              />
            )}
            <h1 className="text-2xl font-bold">{spool.label}</h1>
            <Badge variant={statusColors[spool.status]}>{spool.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            {spool.brand && `${spool.brand} · `}{spool.material} - {spool.color} - {spool.diameter}mm
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={weighInOpen} onOpenChange={(open) => {
            setWeighInOpen(open);
            if (!open) {
              setUseAiEstimation(false);
              setLastEstimate(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>Registrar Pesada</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Pesada</DialogTitle>
                <DialogDescription>
                  Pesa la bobina completa (con carrete) e introduce el valor
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Toggle para estimación IA */}
                <div className="flex items-center gap-2 pb-2 border-b">
                  <input
                    type="checkbox"
                    id="useAiEstimation"
                    checked={useAiEstimation}
                    onChange={(e) => setUseAiEstimation(e.target.checked)}
                    className="rounded border-input"
                  />
                  <Label htmlFor="useAiEstimation" className="text-sm cursor-pointer">
                    Usar estimación IA (incluye insights)
                  </Label>
                </div>

                {useAiEstimation ? (
                  <WeightEstimator
                    brand={spool.brand}
                    netInitialG={spool.netInitialG}
                    tareG={spool.tareG}
                    onEstimate={(result) => {
                      setLastEstimate(result);
                      // Calcular peso total desde el restante estimado
                      const totalWeight = result.remainingG + result.usedTareG;
                      setWeightG(totalWeight.toString());
                    }}
                  />
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="weightG">Peso total en bascula (g)</Label>
                    <Input
                      id="weightG"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="850"
                      value={weightG}
                      onChange={(e) => setWeightG(e.target.value)}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Tara de la bobina: {spool.tareG}g
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="weighInNote">Nota (opcional)</Label>
                  <Input
                    id="weighInNote"
                    placeholder="Despues de imprimir pieza X"
                    value={weighInNote}
                    onChange={(e) => setWeighInNote(e.target.value)}
                  />
                </div>

                {/* Mostrar insight de IA si existe */}
                {lastEstimate?.aiInsights && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="text-muted-foreground italic">{lastEstimate.aiInsights}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWeighInOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleWeighIn} disabled={weighInLoading || !weightG}>
                  {weighInLoading ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button asChild variant="outline">
            <Link href={`/spools/${spoolId}/edit`}>Editar</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informacion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peso neto inicial</span>
              <span>{spool.netInitialG} g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tara (carrete)</span>
              <span>{spool.tareG} g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Restante</span>
              <span className="font-medium">
                {spool.remainingG != null ? `${spool.remainingG.toFixed(0)} g` : "Sin pesar"}
                {spool.remainingPct != null && (
                  <span className="text-muted-foreground ml-1">
                    ({(spool.remainingPct * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>
            {spool.thresholdG && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Umbral alerta</span>
                <span>{spool.thresholdG} g</span>
              </div>
            )}
            {spool.location && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ubicacion</span>
                <span>{spool.location}</span>
              </div>
            )}
            {spool.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Notas</p>
                <p className="text-sm">{spool.notes}</p>
              </div>
            )}
            {spool.remainingPct != null && (
              <div className="pt-3">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      spool.remainingPct < 0.2
                        ? "bg-red-500"
                        : spool.remainingPct < 0.4
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${spool.remainingPct * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {spool.status !== "ARCHIVED" && (
              <Button variant="outline" className="w-full justify-start" onClick={handleArchive}>
                Archivar bobina
              </Button>
            )}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start">
                  Eliminar bobina
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar bobina</DialogTitle>
                  <DialogDescription>
                    Esta accion no se puede deshacer. Se eliminara la bobina y todo su historial.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? "Eliminando..." : "Eliminar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pesadas</CardTitle>
          <CardDescription>{weighIns.length} registro{weighIns.length !== 1 && "s"}</CardDescription>
        </CardHeader>
        <CardContent>
          {weighIns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay pesadas registradas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Peso Total</TableHead>
                  <TableHead className="text-right">Restante</TableHead>
                  <TableHead>Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weighIns.map((w) => {
                  const remaining = Math.max(0, w.weightG - spool.tareG);
                  const pct = spool.netInitialG > 0 ? remaining / spool.netInitialG : 0;
                  return (
                    <TableRow key={w.id}>
                      <TableCell>
                        {new Date(w.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">{w.weightG} g</TableCell>
                      <TableCell className="text-right">
                        {remaining.toFixed(0)} g ({(pct * 100).toFixed(0)}%)
                      </TableCell>
                      <TableCell className="text-muted-foreground">{w.note || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
