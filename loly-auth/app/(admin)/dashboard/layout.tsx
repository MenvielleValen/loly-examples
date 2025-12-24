"use client";

import React, { useState, useEffect } from "react";
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

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Get current path from window location
    setCurrentPath(window.location.pathname);
    
    // Listen for navigation changes
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
      setIsMobileMenuOpen(false);
    };

    // Close mobile menu on route change
    window.addEventListener("popstate", handleRouteChange);
    
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center gap-4 lg:gap-8">
              <Link 
                href="/" 
                className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
              >
                <span>Admin Panel</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        active
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "hover:bg-accent/50 hover:text-accent-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User Info and Mobile Menu Button */}
            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                  {user.image && (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-border"
                    />
                  )}
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium leading-tight">{user.name || "User"}</p>
                    {user.email && (
                      <p className="text-xs text-muted-foreground leading-tight truncate max-w-[150px]">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Sign Out Button - Hidden on mobile, shown on desktop */}
              <div className="hidden md:block">
                <SignOutButton />
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
              <nav className="px-2 pt-2 pb-4 space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 text-base font-medium rounded-md transition-all duration-200 ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50 hover:text-accent-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                
                {/* Mobile User Info */}
                {user && (
                  <div className="px-3 py-2 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      {user.image && (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Mobile Sign Out Button */}
                <div className="px-3 pt-2">
                  <SignOutButton />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}