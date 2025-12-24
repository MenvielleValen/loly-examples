import React from "react";
import { Link, Image } from "@lolyjs/core/components";
import { SignOutButton } from "@/components/auth/SignOutButton";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type AdminLayoutProps = {
  children: React.ReactNode;
  user?: User | null;
};

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
              <span>Admin Panel</span>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/users"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Usuarios
              </Link>
              <Link
                href="/dashboard/analytics"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="/dashboard/settings"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Configuración
              </Link>
            </nav>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3">
                {user.image && (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.name || "User"}</p>
                  {user.email && (
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </div>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}