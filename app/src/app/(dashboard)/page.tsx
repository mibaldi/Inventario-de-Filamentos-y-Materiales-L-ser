"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { spoolsList, laserList } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import type { Spool } from "@/types/spool";
import type { LaserMaterial } from "@/types/laser";

function SpoolIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" strokeOpacity="0.4" />
    </svg>
  );
}

function LaserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeOpacity="0.4" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="url(#dash-spinner)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="dash-spinner" x1="12" y1="2" x2="22" y2="12">
          <stop stopColor="oklch(0.72 0.17 50)" />
          <stop offset="1" stopColor="oklch(0.68 0.14 195)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const statusBadgeClass: Record<string, string> = {
  NEW: "badge-new",
  IN_USE: "badge-in-use",
  LOW: "badge-low",
  EMPTY: "badge-empty",
  ARCHIVED: "badge-archived",
};

export default function DashboardPage() {
  const { isOwner } = useAuth();
  const [criticalSpools, setCriticalSpools] = useState<Spool[]>([]);
  const [criticalLaser, setCriticalLaser] = useState<LaserMaterial[]>([]);
  const [totalSpools, setTotalSpools] = useState(0);
  const [totalLaser, setTotalLaser] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [allSpools, allLaser] = await Promise.all([
        spoolsList(),
        laserList(),
      ]);

      setTotalSpools(allSpools.filter(s => s.status !== "ARCHIVED").length);
      setTotalLaser(allLaser.length);

      const critical = allSpools
        .filter((s) => s.status === "LOW" || s.status === "EMPTY")
        .slice(0, 5);
      setCriticalSpools(critical);

      const criticalMat = allLaser
        .filter((m) => {
          const threshold = m.thresholdQty ?? 2;
          return m.quantityRemaining <= threshold;
        })
        .slice(0, 5);
      setCriticalLaser(criticalMat);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) {
      loadData();
    }
  }, [isOwner, loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <SpinnerIcon className="h-10 w-10 mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground text-sm">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  const totalAlerts = criticalSpools.length + criticalLaser.length;

  return (
    <div className="space-y-8 animate-title">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de inventario y alertas de stock
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/spools/new">
            <Button className="btn-filament gap-2 h-10 px-4">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Bobina</span>
            </Button>
          </Link>
          <Link href="/laser/new">
            <Button className="btn-laser gap-2 h-10 px-4">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Material</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card stat-card-filament">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-filament-muted">
              <SpoolIcon className="h-5 w-5 text-filament" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSpools}</p>
              <p className="text-sm text-muted-foreground">Bobinas activas</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-laser">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-laser-muted">
              <LaserIcon className="h-5 w-5 text-laser" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLaser}</p>
              <p className="text-sm text-muted-foreground">Materiales laser</p>
            </div>
          </div>
        </div>

        <div className={`stat-card ${totalAlerts > 0 ? 'border-l-3 border-l-destructive' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${totalAlerts > 0 ? 'bg-destructive/15' : 'bg-muted'}`}>
              <AlertIcon className={`h-5 w-5 ${totalAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAlerts}</p>
              <p className="text-sm text-muted-foreground">Alertas de stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Items */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Critical Spools */}
        <div className="card-industrial">
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-filament-muted">
                  <SpoolIcon className="h-5 w-5 text-filament" />
                </div>
                <div>
                  <h2 className="font-semibold">Filamentos Criticos</h2>
                  <p className="text-sm text-muted-foreground">Stock bajo o agotado</p>
                </div>
              </div>
              <Link href="/spools" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="p-4">
            {criticalSpools.length === 0 ? (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                  <SpoolIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No hay bobinas con stock bajo
                </p>
              </div>
            ) : (
              <div className="space-y-2 stagger-in">
                {criticalSpools.map((spool) => (
                  <Link
                    key={spool.id}
                    href={`/spools/${spool.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="spool-ring w-10 h-10 flex-shrink-0"
                        style={{
                          '--spool-percent': spool.remainingPct ? spool.remainingPct * 100 : 0,
                          '--spool-color': spool.status === 'EMPTY' ? 'oklch(0.58 0.20 25)' : 'oklch(0.72 0.16 85)'
                        } as React.CSSProperties}
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{spool.label}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {spool.material} - {spool.color}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-mono">
                          {spool.remainingG?.toFixed(0) ?? "?"} g
                        </p>
                        {spool.remainingPct != null && (
                          <p className="text-xs text-muted-foreground">
                            {(spool.remainingPct * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                      <span className={statusBadgeClass[spool.status]}>
                        {spool.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Critical Laser Materials */}
        <div className="card-industrial">
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-laser-muted">
                  <LaserIcon className="h-5 w-5 text-laser" />
                </div>
                <div>
                  <h2 className="font-semibold">Materiales Laser Criticos</h2>
                  <p className="text-sm text-muted-foreground">Stock bajo de materiales</p>
                </div>
              </div>
              <Link href="/laser" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="p-4">
            {criticalLaser.length === 0 ? (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                  <LaserIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No hay materiales con stock bajo
                </p>
              </div>
            ) : (
              <div className="space-y-2 stagger-in">
                {criticalLaser.map((material) => {
                  const pct = material.quantityRemaining / material.quantityInitial;
                  return (
                    <Link
                      key={material.id}
                      href={`/laser/${material.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{material.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.thicknessMm}mm - {material.format === "SHEET" ? "Hojas" : "Piezas"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-mono">
                            {material.quantityRemaining} / {material.quantityInitial}
                          </p>
                          <div className="w-16 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pct < 0.2 ? 'bg-destructive' : pct < 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${pct * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className={material.quantityRemaining === 0 ? 'badge-empty' : 'badge-low'}>
                          {material.quantityRemaining === 0 ? 'AGOTADO' : 'BAJO'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
