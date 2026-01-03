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
import { laserCreate, type ScanMaterialLabelResult } from "@/lib/functions";
import { LASER_MATERIAL_TYPES, COMMON_THICKNESSES, type LaserFormat, type SafeFlag } from "@/types/laser";
import { MaterialLabelScanner } from "@/components/material-label-scanner";
import { Badge } from "@/components/ui/badge";
import { PackageIcon, XIcon } from "lucide-react";

export default function NewLaserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    thicknessMm: "",
    format: "PCS" as LaserFormat,
    widthMm: "",
    heightMm: "",
    quantityInitial: "",
    safeFlag: "OK" as SafeFlag,
    thresholdQty: "",
    location: "",
    notes: "",
    // Campos adicionales del escaner
    brand: "",
    model: "",
    barcode: "",
    imageUrl: "",
  });

  const handleScanComplete = (data: ScanMaterialLabelResult["data"]) => {
    // Buscar el espesor mas cercano en la lista de espesores comunes
    let closestThickness = "";
    if (data.thicknessMm) {
      const closest = COMMON_THICKNESSES.reduce((prev, curr) =>
        Math.abs(curr - data.thicknessMm!) < Math.abs(prev - data.thicknessMm!) ? curr : prev
      );
      closestThickness = closest.toString();
    }

    setFormData((prev) => ({
      ...prev,
      type: data.type && LASER_MATERIAL_TYPES.includes(data.type as typeof LASER_MATERIAL_TYPES[number])
        ? data.type
        : prev.type,
      thicknessMm: closestThickness || prev.thicknessMm,
      safeFlag: data.safeFlag || prev.safeFlag,
      quantityInitial: data.pcsPerPack?.toString() || prev.quantityInitial,
      brand: data.brand || "",
      model: data.model || "",
      barcode: data.barcode != null ? String(data.barcode) : "",
      imageUrl: data.imageUrl || "",
    }));

    toast.success("Datos aplicados desde la etiqueta");
  };

  const clearScannedData = () => {
    setFormData((prev) => ({
      ...prev,
      brand: "",
      model: "",
      barcode: "",
      imageUrl: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!formData.type) {
      toast.error("Selecciona un tipo de material");
      return;
    }
    if (!formData.thicknessMm) {
      toast.error("Selecciona el espesor del material");
      return;
    }
    if (!formData.quantityInitial) {
      toast.error("Indica la cantidad inicial");
      return;
    }

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
        // Campos adicionales del escaner
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        barcode: formData.barcode || undefined,
        imageUrl: formData.imageUrl || undefined,
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nuevo Material Laser</CardTitle>
              <CardDescription>
                Registra un nuevo material para corte laser
              </CardDescription>
            </div>
            <MaterialLabelScanner onScanComplete={handleScanComplete} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Material escaneado preview */}
            {formData.imageUrl && (
              <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-4">
                <img
                  src={formData.imageUrl}
                  alt={formData.model || "Material"}
                  className="w-16 h-16 object-contain rounded-lg border bg-white"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <PackageIcon className="size-4 text-primary" />
                    <span className="font-medium text-sm">{formData.brand || "Material"}</span>
                    {formData.model && (
                      <Badge variant="secondary" className="text-xs">{formData.model}</Badge>
                    )}
                  </div>
                  {formData.barcode && (
                    <p className="text-xs text-muted-foreground font-mono">{formData.barcode}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearScannedData}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            )}

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
