"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  settingsGetAI,
  settingsSaveAI,
  settingsTestAI,
  type AIProvider,
  type AISettingsData,
} from "@/lib/functions";
import { Loader2Icon, CheckCircleIcon, XCircleIcon, SparklesIcon } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    models?: string[];
  } | null>(null);

  const [settings, setSettings] = useState<AISettingsData>({
    provider: "lmstudio",
    perplexityApiKey: "",
    lmstudioUrl: "http://localhost:1234/v1",
    lmstudioModel: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await settingsGetAI();
      setSettings(result);
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);

    try {
      await settingsSaveAI({
        provider: settings.provider,
        perplexityApiKey: settings.perplexityApiKey || undefined,
        lmstudioUrl: settings.lmstudioUrl || undefined,
        lmstudioModel: settings.lmstudioModel || undefined,
      });
      toast.success("Configuración guardada");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al guardar";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Primero guardar la configuración actual
      await settingsSaveAI({
        provider: settings.provider,
        perplexityApiKey: settings.perplexityApiKey || undefined,
        lmstudioUrl: settings.lmstudioUrl || undefined,
        lmstudioModel: settings.lmstudioModel || undefined,
      });

      // Luego probar la conexión
      const result = await settingsTestAI();
      setTestResult({
        success: result.success,
        message: result.message,
        models: result.models,
      });

      if (result.success) {
        toast.success("Conexión exitosa");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al probar conexión";
      setTestResult({ success: false, message });
      toast.error(message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-muted-foreground">Configura las opciones de la aplicación</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="size-5" />
            Proveedor de IA
          </CardTitle>
          <CardDescription>
            Elige el servicio de IA para análisis de etiquetas y estimaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de proveedor */}
          <div className="space-y-3">
            <Label>Proveedor activo</Label>
            <div className="grid grid-cols-2 gap-3">
              <ProviderCard
                provider="lmstudio"
                title="LM Studio"
                description="IA local, sin costos"
                selected={settings.provider === "lmstudio"}
                onClick={() => setSettings({ ...settings, provider: "lmstudio" })}
              />
              <ProviderCard
                provider="perplexity"
                title="Perplexity"
                description="IA en la nube"
                selected={settings.provider === "perplexity"}
                onClick={() => setSettings({ ...settings, provider: "perplexity" })}
              />
            </div>
          </div>

          {/* Configuración de LM Studio */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Configuración de LM Studio</h4>
            <div className="space-y-2">
              <Label htmlFor="lmstudioUrl">URL del servidor</Label>
              <Input
                id="lmstudioUrl"
                placeholder="http://localhost:1234/v1"
                value={settings.lmstudioUrl}
                onChange={(e) => setSettings({ ...settings, lmstudioUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                URL de la API de LM Studio. Incluye /v1 al final.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lmstudioModel">Modelo (opcional)</Label>
              <Input
                id="lmstudioModel"
                placeholder="Detectado automáticamente"
                value={settings.lmstudioModel}
                onChange={(e) => setSettings({ ...settings, lmstudioModel: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Nombre del modelo. Si está vacío, usa el modelo cargado en LM Studio.
              </p>
            </div>
          </div>

          {/* Configuración de Perplexity */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Configuración de Perplexity</h4>
            <div className="space-y-2">
              <Label htmlFor="perplexityApiKey">API Key</Label>
              <Input
                id="perplexityApiKey"
                type="password"
                placeholder={settings.perplexityApiKeySet ? "••••••••" : "pplx-..."}
                value={settings.perplexityApiKey}
                onChange={(e) => setSettings({ ...settings, perplexityApiKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Tu API Key de Perplexity. Obtén una en perplexity.ai
              </p>
            </div>
          </div>

          {/* Resultado del test */}
          {testResult && (
            <div
              className={`p-4 rounded-lg ${
                testResult.success
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircleIcon className="size-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircleIcon className="size-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium">{testResult.message}</p>
                  {testResult.models && testResult.models.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Modelos: {testResult.models.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Probando...
                </>
              ) : (
                "Probar conexión"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProviderCard({
  provider,
  title,
  description,
  selected,
  onClick,
}: {
  provider: AIProvider;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-lg border text-left transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
      {selected && (
        <div className="mt-2">
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            Activo
          </span>
        </div>
      )}
    </button>
  );
}
