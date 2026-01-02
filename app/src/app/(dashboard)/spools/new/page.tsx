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
import { spoolsCreate, type ScanLabelResult } from "@/lib/functions";
import { FILAMENT_MATERIALS, FILAMENT_DIAMETERS } from "@/types/spool";
import { LabelScanner } from "@/components/label-scanner";
import { getBrandNames } from "@/data/filament-brands";

export default function NewSpoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    brand: "",
    material: "",
    color: "",
    diameter: "1.75",
    netInitialG: "",
    tareG: "",
    thresholdG: "",
    location: "",
    notes: "",
  });

  const brandNames = getBrandNames();

  const handleScanComplete = (data: ScanLabelResult["data"]) => {
    setFormData((prev) => ({
      ...prev,
      brand: data.brand ?? prev.brand,
      material: data.material ?? prev.material,
      color: data.color ?? prev.color,
      diameter: data.diameter?.toString() ?? prev.diameter,
      netInitialG: data.netWeightG?.toString() ?? prev.netInitialG,
      tareG: data.suggestedTareG?.toString() ?? prev.tareG,
      label: data.brand && data.material && data.color
        ? `${data.material} ${data.brand} ${data.color}`
        : prev.label,
    }));
    toast.success("Datos aplicados desde la etiqueta");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await spoolsCreate({
        label: formData.label,
        brand: formData.brand || undefined,
        material: formData.material,
        color: formData.color,
        diameter: parseFloat(formData.diameter),
        netInitialG: parseFloat(formData.netInitialG),
        tareG: parseFloat(formData.tareG),
        thresholdG: formData.thresholdG ? parseFloat(formData.thresholdG) : undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      });

      const data = result.data as { id: string };
      toast.success("Bobina creada correctamente");
      router.push(`/spools/${data.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al crear bobina";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Nueva Bobina</CardTitle>
              <CardDescription>
                Registra una nueva bobina de filamento
              </CardDescription>
            </div>
            <LabelScanner onScanComplete={handleScanComplete} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="label">Nombre / Etiqueta *</Label>
                <Input
                  id="label"
                  placeholder="PLA Sunlu Gris"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) =>
                    setFormData({ ...formData, brand: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Otra / Desconocida</SelectItem>
                    {brandNames.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material *</Label>
                <Select
                  value={formData.material}
                  onValueChange={(value) =>
                    setFormData({ ...formData, material: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar material" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILAMENT_MATERIALS.map((mat) => (
                      <SelectItem key={mat} value={mat}>
                        {mat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  placeholder="Gris"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diameter">Diametro (mm) *</Label>
                <Select
                  value={formData.diameter}
                  onValueChange={(value) =>
                    setFormData({ ...formData, diameter: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILAMENT_DIAMETERS.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} mm
                      </SelectItem>
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
                  placeholder="1000"
                  value={formData.netInitialG}
                  onChange={(e) =>
                    setFormData({ ...formData, netInitialG: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Peso del filamento sin bobina (normalmente 1000g)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tareG">Tara de la bobina (g) *</Label>
                <Input
                  id="tareG"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="200"
                  value={formData.tareG}
                  onChange={(e) =>
                    setFormData({ ...formData, tareG: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Peso de la bobina vacia
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thresholdG">Umbral de alerta (g)</Label>
                <Input
                  id="thresholdG"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="100"
                  value={formData.thresholdG}
                  onChange={(e) =>
                    setFormData({ ...formData, thresholdG: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Alertar cuando quede menos de este peso
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicacion</Label>
                <Input
                  id="location"
                  placeholder="Estante A-1"
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
                {loading ? "Creando..." : "Crear Bobina"}
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
