"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { laserList } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LaserMaterial, SafeFlag } from "@/types/laser";
import { LASER_MATERIAL_TYPES } from "@/types/laser";

function LaserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeOpacity="0.4" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
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

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SheetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" strokeOpacity="0.4" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="url(#ls-spin)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="ls-spin" x1="12" y1="2" x2="22" y2="12">
          <stop stopColor="oklch(0.68 0.14 195)" />
          <stop offset="1" stopColor="oklch(0.72 0.17 50)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const safeFlagBadgeClass: Record<SafeFlag, string> = {
  OK: "badge-safe-ok",
  CAUTION: "badge-safe-caution",
  NO: "badge-safe-no",
};

const safeFlagLabels: Record<SafeFlag, string> = {
  OK: "Seguro",
  CAUTION: "Precaucion",
  NO: "No usar",
};

export default function LaserPage() {
  const { isOwner } = useAuth();
  const [materials, setMaterials] = useState<LaserMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const loadMaterials = useCallback(async () => {
    try {
      const result = await laserList();
      setMaterials(result.data as LaserMaterial[]);
    } catch (error) {
      console.error("Error cargando materiales:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) {
      loadMaterials();
    }
  }, [isOwner, loadMaterials]);

  const filteredMaterials = materials.filter((mat) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matches =
        mat.type.toLowerCase().includes(searchLower) ||
        mat.location?.toLowerCase().includes(searchLower);
      if (!matches) return false;
    }

    if (typeFilter !== "all" && mat.type !== typeFilter) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <SpinnerIcon className="h-10 w-10 mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground text-sm">Cargando materiales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-title">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-laser-muted">
            <LaserIcon className="h-7 w-7 text-laser" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Materiales Laser</h1>
            <p className="text-muted-foreground">
              {filteredMaterials.length} material{filteredMaterials.length !== 1 && "es"}
            </p>
          </div>
        </div>
        <Link href="/laser/new">
          <Button className="btn-laser gap-2 h-10 px-5">
            <PlusIcon className="h-4 w-4" />
            Nuevo Material
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materiales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-64 bg-card border-border"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {LASER_MATERIAL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {filteredMaterials.length === 0 ? (
        <div className="card-industrial py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <LaserIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No hay materiales que mostrar</p>
          <Link href="/laser/new">
            <Button className="btn-laser">Crear primer material</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-in">
          {filteredMaterials.map((mat) => {
            const pct = mat.quantityRemaining / mat.quantityInitial;
            const isLow = mat.thresholdQty
              ? mat.quantityRemaining <= mat.thresholdQty
              : mat.quantityRemaining <= 2;

            return (
              <Link key={mat.id} href={`/laser/${mat.id}`}>
                <div className="card-industrial card-hover h-full p-5 group border-gradient-laser">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-lg bg-laser-muted flex-shrink-0">
                        {mat.format === "SHEET" ? (
                          <SheetIcon className="h-5 w-5 text-laser" />
                        ) : (
                          <LaserIcon className="h-5 w-5 text-laser" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-laser transition-colors">
                          {mat.type}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {mat.thicknessMm} mm - {mat.format === "SHEET" ? "Hojas" : "Piezas"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={safeFlagBadgeClass[mat.safeFlag]}>
                        {safeFlagLabels[mat.safeFlag]}
                      </span>
                      {isLow && (
                        <span className="badge-low">
                          Stock bajo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5">
                    {mat.format === "SHEET" && mat.widthMm && mat.heightMm && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dimensiones</span>
                        <span className="font-mono">{mat.widthMm} x {mat.heightMm} mm</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground">Stock</span>
                      <span className={`font-mono ${isLow ? "text-destructive font-semibold" : ""}`}>
                        {mat.quantityRemaining} / {mat.quantityInitial}
                      </span>
                    </div>
                    {mat.location && (
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <LocationIcon className="h-3.5 w-3.5" />
                          Ubicacion
                        </span>
                        <span className="truncate max-w-[120px]">{mat.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all progress-animate ${
                          pct < 0.2
                            ? "bg-destructive"
                            : pct < 0.4
                            ? "bg-yellow-500"
                            : "bg-laser"
                        }`}
                        style={{ width: `${pct * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
