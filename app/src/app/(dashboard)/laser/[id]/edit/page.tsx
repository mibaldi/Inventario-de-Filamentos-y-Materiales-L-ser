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
import { laserGet, laserUpdate } from "@/lib/functions";
import { LASER_MATERIAL_TYPES, COMMON_THICKNESSES, type LaserMaterial, type LaserFormat, type SafeFlag } from "@/types/laser";

export default function EditLaserPage() {
  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const loadMaterial = async () => {
      try {
        const data = await laserGet(materialId);
        setFormData({
          type: data.type,
          thicknessMm: data.thicknessMm.toString(),
          format: data.format,
          widthMm: data.widthMm?.toString() ?? "",
          heightMm: data.heightMm?.toString() ?? "",
          quantityInitial: data.quantityInitial.toString(),
          safeFlag: data.safeFlag,
          thresholdQty: data.thresholdQty?.toString() ?? "",
          location: data.location ?? "",
          notes: data.notes ?? "",
        });
      } catch (error) {
        console.error("Error cargando material:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMaterial();
  }, [materialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await laserUpdate(materialId, {
        type: formData.type,
        thicknessMm: parseFloat(formData.thicknessMm),
        format: formData.format,
        widthMm: formData.widthMm ? parseFloat(formData.widthMm) : null,
        heightMm: formData.heightMm ? parseFloat(formData.heightMm) : null,
        quantityInitial: parseInt(formData.quantityInitial),
        safeFlag: formData.safeFlag,
        thresholdQty: formData.thresholdQty ? parseInt(formData.thresholdQty) : null,
        location: formData.location || null,
        notes: formData.notes || null,
      });

      toast.success("Material actualizado");
      router.push(`/laser/${materialId}`);
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
          <CardTitle>Editar Material</CardTitle>
          <CardDescription>Modifica los datos del material</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de material *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LASER_MATERIAL_TYPES.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thicknessMm">Espesor (mm) *</Label>
                <Select value={formData.thicknessMm} onValueChange={(value) => setFormData({ ...formData, thicknessMm: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COMMON_THICKNESSES.map((t) => (<SelectItem key={t} value={t.toString()}>{t} mm</SelectItem>))}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Formato *</Label>
                <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value as LaserFormat })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="SHEET">Hojas</SelectItem><SelectItem value="PCS">Piezas</SelectItem></SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="safeFlag">Seguridad laser *</Label>
                <Select value={formData.safeFlag} onValueChange={(value) => setFormData({ ...formData, safeFlag: value as SafeFlag })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Input id="widthMm" type="number" min="1" step="1" value={formData.widthMm} onChange={(e) => setFormData({ ...formData, widthMm: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heightMm">Alto (mm)</Label>
                    <Input id="heightMm" type="number" min="1" step="1" value={formData.heightMm} onChange={(e) => setFormData({ ...formData, heightMm: e.target.value })} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="quantityInitial">Cantidad inicial *</Label>
                <Input id="quantityInitial" type="number" min="1" step="1" value={formData.quantityInitial} onChange={(e) => setFormData({ ...formData, quantityInitial: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thresholdQty">Umbral de alerta</Label>
                <Input id="thresholdQty" type="number" min="1" step="1" value={formData.thresholdQty} onChange={(e) => setFormData({ ...formData, thresholdQty: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicacion</Label>
                <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar Cambios"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
