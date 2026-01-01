"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#login-logo-grad)" />
      <circle cx="32" cy="32" r="16" fill="oklch(0.13 0.008 260)" opacity="0.3" />
      <circle cx="32" cy="32" r="10" fill="oklch(0.13 0.008 260)" />
      <circle cx="32" cy="32" r="5" fill="url(#login-logo-grad)" />
      <defs>
        <linearGradient id="login-logo-grad" x1="4" y1="4" x2="60" y2="60">
          <stop stopColor="oklch(0.78 0.18 45)" />
          <stop offset="1" stopColor="oklch(0.65 0.15 60)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="url(#spinner-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="spinner-grad" x1="12" y1="2" x2="22" y2="12">
          <stop stopColor="oklch(0.72 0.17 50)" />
          <stop offset="1" stopColor="oklch(0.68 0.14 195)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { user, loading, isOwner, checkingOwner, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !checkingOwner && user && isOwner) {
      router.push("/");
    }
  }, [user, loading, isOwner, checkingOwner, router]);

  // Loading state
  if (loading || checkingOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background surface-grid">
        <div className="text-center animate-title">
          <SpinnerIcon className="h-12 w-12 mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (user && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background surface-grid">
        <div className="w-full max-w-md animate-title">
          <div className="card-industrial p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
                <svg className="h-8 w-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Acceso Denegado</h1>
              <p className="text-muted-foreground mt-2">
                No tienes permisos para acceder a esta aplicacion
              </p>
            </div>

            {/* Info */}
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  Esta aplicacion es privada y solo el propietario puede acceder.
                </p>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Tu UID:</p>
                  <code className="block text-xs bg-background/50 px-3 py-2 rounded border border-border font-mono break-all">
                    {user.uid}
                  </code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Si eres el propietario, configura este UID como OWNER_UID en Firebase Functions.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={signOut}
                variant="outline"
                className="flex-1"
              >
                Cerrar sesion
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 btn-filament"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login state
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 surface-grid opacity-50" />

      {/* Gradient orbs */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.72 0.17 50), transparent)' }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.68 0.14 195), transparent)' }}
      />

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="animate-title">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <LogoIcon className="h-20 w-20 mx-auto mb-6 drop-shadow-lg" />
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              <span className="text-gradient-filament">Workshop</span>
              <span className="text-muted-foreground font-light ml-2">Inventory</span>
            </h1>
            <p className="text-muted-foreground">
              Sistema de inventario para filamentos 3D y materiales laser
            </p>
          </div>

          {/* Login Card */}
          <div className="card-industrial p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold">Iniciar sesion</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Accede con tu cuenta de Google autorizada
                </p>
              </div>

              <Button
                onClick={signInWithGoogle}
                size="lg"
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium transition-all hover:shadow-lg"
              >
                <GoogleIcon className="h-5 w-5 mr-3" />
                Continuar con Google
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Solo usuarios autorizados pueden acceder a esta aplicacion
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-filament" />
                <span>Filamentos 3D</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-laser" />
                <span>Materiales Laser</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
