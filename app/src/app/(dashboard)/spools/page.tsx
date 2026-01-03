"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { spoolsList } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Spool, SpoolStatus } from "@/types/spool";
import { FILAMENT_MATERIALS } from "@/types/spool";

function SpoolIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" strokeOpacity="0.4" />
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

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="url(#sp-spin)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="sp-spin" x1="12" y1="2" x2="22" y2="12">
          <stop stopColor="oklch(0.72 0.17 50)" />
          <stop offset="1" stopColor="oklch(0.68 0.14 195)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const statusBadgeClass: Record<SpoolStatus, string> = {
  NEW: "badge-new",
  IN_USE: "badge-in-use",
  LOW: "badge-low",
  EMPTY: "badge-empty",
  ARCHIVED: "badge-archived",
};

export default function SpoolsPage() {
  const { isOwner } = useAuth();
  const [spools, setSpools] = useState<Spool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const loadSpools = useCallback(async () => {
    try {
      const spools = await spoolsList();
      setSpools(spools);
    } catch (error) {
      console.error("Error cargando bobinas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) {
      loadSpools();
    }
  }, [isOwner, loadSpools]);

  const filteredSpools = spools.filter((spool) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matches =
        spool.label.toLowerCase().includes(searchLower) ||
        spool.material.toLowerCase().includes(searchLower) ||
        spool.color.toLowerCase().includes(searchLower);
      if (!matches) return false;
    }

    if (materialFilter !== "all" && spool.material !== materialFilter) {
      return false;
    }

    if (statusFilter === "active" && spool.status === "ARCHIVED") {
      return false;
    }
    if (statusFilter === "archived" && spool.status !== "ARCHIVED") {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <SpinnerIcon className="h-10 w-10 mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground text-sm">Cargando bobinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-title">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-filament-muted">
            <SpoolIcon className="h-7 w-7 text-filament" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Filamentos</h1>
            <p className="text-muted-foreground">
              {filteredSpools.length} bobina{filteredSpools.length !== 1 && "s"}
              {statusFilter === "archived" && " archivada" + (filteredSpools.length !== 1 ? "s" : "")}
            </p>
          </div>
        </div>
        <Link href="/spools/new">
          <Button className="btn-filament gap-2 h-10 px-5">
            <PlusIcon className="h-4 w-4" />
            Nueva Bobina
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar bobinas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-64 bg-card border-border"
          />
        </div>
        <Select value={materialFilter} onValueChange={setMaterialFilter}>
          <SelectTrigger className="w-40 bg-card border-border">
            <SelectValue placeholder="Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los materiales</SelectItem>
            {FILAMENT_MATERIALS.map((mat) => (
              <SelectItem key={mat} value={mat}>
                {mat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-card border-border">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="archived">Archivadas</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {filteredSpools.length === 0 ? (
        <div className="card-industrial py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <SpoolIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No hay bobinas que mostrar</p>
          <Link href="/spools/new">
            <Button className="btn-filament">Crear primera bobina</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-in">
          {filteredSpools.map((spool) => (
            <Link key={spool.id} href={`/spools/${spool.id}`}>
              <div className="card-industrial card-hover h-full p-5 group">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="spool-ring w-12 h-12 flex-shrink-0"
                      style={{
                        '--spool-percent': spool.remainingPct ? spool.remainingPct * 100 : (spool.status === 'NEW' ? 100 : 0),
                        '--spool-color': spool.colorHex ?? (spool.status === 'EMPTY' ? 'oklch(0.58 0.20 25)' :
                          spool.status === 'LOW' ? 'oklch(0.72 0.16 85)' : 'oklch(0.65 0.18 145)')
                      } as React.CSSProperties}
                    />
                    <div className="min-w-0 flex items-center gap-2">
                      {spool.colorHex && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: spool.colorHex }}
                          title={spool.color}
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {spool.label}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {spool.material} - {spool.color}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={statusBadgeClass[spool.status]}>
                    {spool.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diametro</span>
                    <span className="font-mono">{spool.diameter} mm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Restante</span>
                    <span className="font-mono">
                      {spool.remainingG != null
                        ? `${spool.remainingG.toFixed(0)} g`
                        : "Sin pesar"}
                      {spool.remainingPct != null && (
                        <span className="text-muted-foreground ml-1.5">
                          ({(spool.remainingPct * 100).toFixed(0)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  {spool.location && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <LocationIcon className="h-3.5 w-3.5" />
                        Ubicacion
                      </span>
                      <span className="truncate max-w-[120px]">{spool.location}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {spool.remainingPct != null && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all progress-animate ${
                          spool.remainingPct < 0.2
                            ? "bg-destructive"
                            : spool.remainingPct < 0.4
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${spool.remainingPct * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
