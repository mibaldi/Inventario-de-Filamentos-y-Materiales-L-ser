"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { laserCreate } from "@/lib/functions";
import { LASER_MATERIAL_TYPES, COMMON_THICKNESSES, type LaserFormat, type SafeFlag } from "@/types/laser";

export default function NewLaserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    thicknessMm: "",
    format: "SHEET" as LaserFormat,
    widthMm: "",
    heightMm: "",
    quantityInitial: "",
    safeFlag: "OK" as SafeFlag,
    thresholdQty: "",
    location: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await laserCreate({
        type: formData.type,
        thicknessMm: parseFloat(formData.thicknessMm),
        format: formData.format,
        widthMm: formData.widthMm ? parseFloat(formData.widthMm) : undefined,
        heightMm: formData.heightMm ? parseFloat(formData.heightMm) : undefined,
        quantityInitial: parseInt(formData.quantityInitial),
        safeFlag: formData.safeFlag,
        thresholdQty: formData.thresholdQty ? parseInt(formData.thresholdQty) : undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      });

      toast.success("Material creado correctamente");
      router.push(`/laser/${result.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al crear material";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Material Laser</CardTitle>
          <CardDescription>
            Registra un nuevo material para corte laser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de material *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {LASER_MATERIAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thicknessMm">Espesor (mm) *</Label>
                <Select
                  value={formData.thicknessMm}
                  onValueChange={(value) =>
                    setFormData({ ...formData, thicknessMm: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar espesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_THICKNESSES.map((t) => (
                      <SelectItem key={t} value={t.toString()}>
                        {t} mm
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Formato *</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) =>
                    setFormData({ ...formData, format: value as LaserFormat })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHEET">Hojas</SelectItem>
                    <SelectItem value="PCS">Piezas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="safeFlag">Seguridad laser *</Label>
                <Select
                  value={formData.safeFlag}
                  onValueChange={(value) =>
                    setFormData({ ...formData, safeFlag: value as SafeFlag })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OK">OK - Seguro para laser</SelectItem>
                    <SelectItem value="CAUTION">Precaucion - Usar con cuidado</SelectItem>
                    <SelectItem value="NO">NO - No usar en laser</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.format === "SHEET" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="widthMm">Ancho (mm)</Label>
                    <Input
                      id="widthMm"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="300"
                      value={formData.widthMm}
                      onChange={(e) =>
                        setFormData({ ...formData, widthMm: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heightMm">Alto (mm)</Label>
                    <Input
                      id="heightMm"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="200"
                      value={formData.heightMm}
                      onChange={(e) =>
                        setFormData({ ...formData, heightMm: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="quantityInitial">Cantidad inicial *</Label>
                <Input
                  id="quantityInitial"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="10"
                  value={formData.quantityInitial}
                  onChange={(e) =>
                    setFormData({ ...formData, quantityInitial: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thresholdQty">Umbral de alerta</Label>
                <Input
                  id="thresholdQty"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="2"
                  value={formData.thresholdQty}
                  onChange={(e) =>
                    setFormData({ ...formData, thresholdQty: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Alertar cuando quede menos de esta cantidad
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicacion</Label>
                <Input
                  id="location"
                  placeholder="Estante B-2"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                placeholder="Observaciones..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Material"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
