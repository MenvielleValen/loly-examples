import React from "react";
import { ThemeProvider } from "@lolyjs/core/themes";
import { ThemeSwitch } from "@/components/shared/theme-switch";
import { Link } from "@lolyjs/core/components";
import { Github, Sparkles } from "lucide-react";

type LayoutProps = {
  children: React.ReactNode;
  // Props from layout server.hook.ts - available in all pages
  appName?: string;
  theme?: string;
};

export default function RootLayout(props: LayoutProps) {
  const {
    children,
    appName = "Loly Tic Tac Toe",
    theme,
  } = props;

  return (
    <ThemeProvider initialTheme={theme}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-all"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-primary shadow-lg shadow-primary/20 transition-all group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                {appName}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitch />
            <Link
              href="https://github.com/MenvielleValen/loly-framework"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:border-border/60"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {children}
    </ThemeProvider>
  );
}
