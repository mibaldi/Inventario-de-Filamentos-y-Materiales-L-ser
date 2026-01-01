"use client";

import { OwnerGuard } from "@/components/owner-guard";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OwnerGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </div>
    </OwnerGuard>
  );
}
