import React from "react";
import { ThemeProvider } from "@lolyjs/core/themes";
import { ThemeSwitch } from "@/components/shared/theme-switch";
import { Link } from "@lolyjs/core/components";

export default function RootLayout({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  return <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>;
}
