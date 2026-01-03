"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { spoolsGet, spoolsUpdate } from "@/lib/functions";
import { FILAMENT_MATERIALS, FILAMENT_DIAMETERS, type Spool, type SpoolStatus } from "@/types/spool";

const SPOOL_STATUSES: SpoolStatus[] = ["NEW", "IN_USE", "LOW", "EMPTY", "ARCHIVED"];

export default function EditSpoolPage() {
  const params = useParams();
  const router = useRouter();
  const spoolId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    material: "",
    color: "",
    diameter: "1.75",
    netInitialG: "",
    tareG: "",
    status: "NEW" as SpoolStatus,
    thresholdG: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    const loadSpool = async () => {
      try {
        const data = await spoolsGet(spoolId);
        setFormData({
          label: data.label,
          material: data.material,
          color: data.color,
          diameter: data.diameter.toString(),
          netInitialG: data.netInitialG.toString(),
          tareG: data.tareG.toString(),
          status: data.status,
          thresholdG: data.thresholdG?.toString() ?? "",
          location: data.location ?? "",
          notes: data.notes ?? "",
        });
      } catch (error) {
        console.error("Error cargando bobina:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSpool();
  }, [spoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await spoolsUpdate(spoolId, {
        label: formData.label,
        material: formData.material,
        color: formData.color,
        diameter: parseFloat(formData.diameter),
        netInitialG: parseFloat(formData.netInitialG),
        tareG: parseFloat(formData.tareG),
        status: formData.status,
        thresholdG: formData.thresholdG ? parseFloat(formData.thresholdG) : null,
        location: formData.location || null,
        notes: formData.notes || null,
      });

      toast.success("Bobina actualizada");
      router.push(`/spools/${spoolId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al actualizar";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Bobina</CardTitle>
          <CardDescription>Modifica los datos de la bobina</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="label">Nombre / Etiqueta *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material *</Label>
                <Select
                  value={formData.material}
                  onValueChange={(value) => setFormData({ ...formData, material: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILAMENT_MATERIALS.map((mat) => (
                      <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diameter">Diametro (mm) *</Label>
                <Select
                  value={formData.diameter}
                  onValueChange={(value) => setFormData({ ...formData, diameter: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILAMENT_DIAMETERS.map((d) => (
                      <SelectItem key={d} value={d.toString()}>{d} mm</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="netInitialG">Peso neto inicial (g) *</Label>
                <Input
                  id="netInitialG"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.netInitialG}
                  onChange={(e) => setFormData({ ...formData, netInitialG: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tareG">Tara de la bobina (g) *</Label>
                <Input
                  id="tareG"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.tareG}
                  onChange={(e) => setFormData({ ...formData, tareG: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as SpoolStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPOOL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thresholdG">Umbral de alerta (g)</Label>
                <Input
                  id="thresholdG"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.thresholdG}
                  onChange={(e) => setFormData({ ...formData, thresholdG: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicacion</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
