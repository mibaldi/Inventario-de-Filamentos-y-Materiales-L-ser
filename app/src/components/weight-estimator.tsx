"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { spoolsEstimateRemaining, type EstimateRemainingResult } from "@/lib/functions";
import { getBrandNames } from "@/data/filament-brands";
import { Loader2Icon, SparklesIcon, ScaleIcon } from "lucide-react";

interface WeightEstimatorProps {
  brand: string | null;
  netInitialG: number;
  tareG: number;
  onEstimate?: (result: EstimateRemainingResult) => void;
}

export function WeightEstimator({
  brand,
  netInitialG,
  tareG,
  onEstimate,
}: WeightEstimatorProps) {
  const [currentWeight, setCurrentWeight] = useState<string>("");
  const [useCustomTare, setUseCustomTare] = useState(false);
  const [customTare, setCustomTare] = useState<string>(tareG.toString());
  const [selectedBrand, setSelectedBrand] = useState<string>(brand ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateRemainingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const brandNames = getBrandNames();

  useEffect(() => {
    // Reset result when inputs change
    setResult(null);
    setError(null);
  }, [currentWeight, customTare, selectedBrand, useCustomTare]);

  const handleEstimate = async () => {
    const weight = parseFloat(currentWeight);
    if (isNaN(weight) || weight < 0) {
      setError("Ingresa un peso válido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await spoolsEstimateRemaining({
        currentWeightG: weight,
        brand: selectedBrand || undefined,
        customTareG: useCustomTare ? parseFloat(customTare) : undefined,
        netInitialG,
      });

      setResult(response.data);
      onEstimate?.(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al estimar");
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (pct: number) => {
    if (pct > 0.4) return "bg-green-500";
    if (pct > 0.2) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Input de peso actual */}
      <div className="space-y-2">
        <Label htmlFor="currentWeight" className="flex items-center gap-2">
          <ScaleIcon className="size-4" />
          Peso actual en báscula (g)
        </Label>
        <Input
          id="currentWeight"
          type="number"
          min="0"
          step="1"
          placeholder="Ej: 850"
          value={currentWeight}
          onChange={(e) => setCurrentWeight(e.target.value)}
        />
      </div>

      {/* Selector de marca */}
      <div className="space-y-2">
        <Label htmlFor="brand">Marca (para estimar tara)</Label>
        <Select value={selectedBrand || "none"} onValueChange={(v) => setSelectedBrand(v === "none" ? "" : v)}>
          <SelectTrigger id="brand">
            <SelectValue placeholder="Selecciona marca..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin marca / Otra</SelectItem>
            {brandNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Toggle para tara personalizada */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="useCustomTare"
          checked={useCustomTare}
          onChange={(e) => setUseCustomTare(e.target.checked)}
          className="rounded border-input"
        />
        <Label htmlFor="useCustomTare" className="text-sm cursor-pointer">
          Usar tara personalizada
        </Label>
      </div>

      {useCustomTare && (
        <div className="space-y-2">
          <Label htmlFor="customTare">Tara personalizada (g)</Label>
          <Input
            id="customTare"
            type="number"
            min="0"
            step="1"
            value={customTare}
            onChange={(e) => setCustomTare(e.target.value)}
          />
        </div>
      )}

      {/* Botón de estimar */}
      <Button
        type="button"
        onClick={handleEstimate}
        disabled={!currentWeight || loading}
        className="w-full gap-2"
      >
        {loading ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Estimando...
          </>
        ) : (
          <>
            <SparklesIcon className="size-4" />
            Estimar filamento restante
          </>
        )}
      </Button>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Resultados */}
      {result && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <SparklesIcon className="size-4 text-primary" />
            Estimación IA
          </h4>

          {/* Barra de progreso */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Filamento restante</span>
              <span className="font-medium">
                {Math.round(result.remainingPct * 100)}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(result.remainingPct)}`}
                style={{ width: `${Math.min(100, result.remainingPct * 100)}%` }}
              />
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Restante:</span>{" "}
              <span className="font-medium">{Math.round(result.remainingG)}g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Metros aprox:</span>{" "}
              <span className="font-medium">~{result.estimatedMeters}m</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tara usada:</span>{" "}
              <span className="font-medium">{result.usedTareG}g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Origen tara:</span>{" "}
              <span className="font-medium capitalize">{result.tareSource}</span>
            </div>
          </div>

          {/* Insights de IA */}
          {result.aiInsights && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground italic">
                {result.aiInsights}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
