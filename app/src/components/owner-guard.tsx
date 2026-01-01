"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface OwnerGuardProps {
  children: React.ReactNode;
}

export function OwnerGuard({ children }: OwnerGuardProps) {
  const { user, loading, isOwner, checkingOwner } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !checkingOwner) {
      if (!user) {
        router.push("/login");
      } else if (!isOwner) {
        router.push("/login");
      }
    }
  }, [user, loading, isOwner, checkingOwner, router]);

  if (loading || checkingOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user || !isOwner) {
    return null;
  }

  return <>{children}</>;
}
