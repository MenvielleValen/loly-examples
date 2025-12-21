import React from "react";
import { ThemeProvider } from "@lolyjs/core/themes";

export default function RootLayout({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  return <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>;
}
