import React from "react";
import { ThemeProvider } from "@lolyjs/core/themes";

export default function RootLayout({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider initialTheme={theme}>
      {children}
      {/* Attribution Banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
        <p>
          Implementation of{" "}
          <a
            href="https://github.com/CondorCoders/cafe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            CondorCoders - Café Virtual
          </a>{" "}
          in{" "}
          <a
            href="https://www.loly.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Loly Framework
          </a>{" "}
          <span className="text-purple-500">💜</span>
        </p>
      </div>
    </ThemeProvider>
  );
}
