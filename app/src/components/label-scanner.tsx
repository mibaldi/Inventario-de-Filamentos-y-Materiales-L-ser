"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { spoolsScanLabel, type ScanLabelResult } from "@/lib/functions";
import { CameraIcon, Loader2Icon, CheckIcon, XIcon, UploadIcon } from "lucide-react";

interface LabelScannerProps {
  onScanComplete: (data: ScanLabelResult["data"]) => void;
}

export function LabelScanner({ onScanComplete }: LabelScannerProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanLabelResult["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB");
      return;
    }

    // Leer como base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setError(null);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleScan = async () => {
    if (!imagePreview) return;

    setScanning(true);
    setError(null);

    try {
      // Extraer base64 sin el prefijo data:image/...
      const base64 = imagePreview.split(",")[1];
      const result = await spoolsScanLabel({ imageBase64: base64 });

      if (result.data.success) {
        setScanResult(result.data.data);
      } else {
        setError("No se pudo analizar la etiqueta");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al escanear");
    } finally {
      setScanning(false);
    }
  };

  const handleApply = () => {
    if (scanResult) {
      onScanComplete(scanResult);
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setImagePreview(null);
    setScanResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <CameraIcon className="size-4" />
        Escanear etiqueta
      </Button>

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear etiqueta de filamento</DialogTitle>
            <DialogDescription>
              Sube una foto de la etiqueta para autorellenar los datos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Input de archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Preview o botón de selección */}
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview de etiqueta"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-2 right-2 bg-background/80"
                  onClick={() => {
                    setImagePreview(null);
                    setScanResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <UploadIcon className="size-8" />
                <span className="text-sm">Toca para seleccionar o tomar foto</span>
              </button>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            {/* Resultados del escaneo */}
            {scanResult && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">Datos detectados:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Marca:</span>{" "}
                    <span className="font-medium">{scanResult.brand ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Material:</span>{" "}
                    <span className="font-medium">{scanResult.material ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Color:</span>{" "}
                    <span className="font-medium">{scanResult.color ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peso neto:</span>{" "}
                    <span className="font-medium">
                      {scanResult.netWeightG ? `${scanResult.netWeightG}g` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Diámetro:</span>{" "}
                    <span className="font-medium">
                      {scanResult.diameter ? `${scanResult.diameter}mm` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tara sugerida:</span>{" "}
                    <span className="font-medium">{scanResult.suggestedTareG}g</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            {scanResult ? (
              <Button type="button" onClick={handleApply} className="gap-2">
                <CheckIcon className="size-4" />
                Aplicar datos
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleScan}
                disabled={!imagePreview || scanning}
                className="gap-2"
              >
                {scanning ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <CameraIcon className="size-4" />
                    Analizar etiqueta
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
