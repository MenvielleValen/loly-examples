import { Image, Link } from "@lolyjs/core/components";
import { ThemeSwitch } from "@/components/shared/theme-switch";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserProfile } from "@/components/auth/UserProfile";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type HomePageProps = {
  // Props from page server.hook.ts (specific to this page)
  // Props from layout server.hook.ts (available in all pages!)
  appName?: string;
  navigation?: Array<{ href: string; label: string }>;
  user?: User | null;
  session?: any;
};

export default function HomePage({
  appName = "My App",
  navigation,
  user,
  session,
}: HomePageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-24 px-8 sm:px-16 md:py-32">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <Image
            className="dark:invert"
            src="/assets/logo.svg"
            alt={`${appName} logo`}
            width={100}
            height={50}
          />
          <ThemeSwitch />
        </div>

        {/* Hero Section */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Welcome to{" "}
              <span className="bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                {appName}
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A modern full-stack React application built with{" "}
              <span className="font-semibold text-foreground">
                Loly Framework
              </span>
              . Experience server-side rendering, API routes, WebSockets, and
              more.
            </p>
          </div>

          {/* Navigation Links */}
          {navigation && navigation.length > 0 && (
            <nav className="flex flex-wrap items-center justify-center gap-4">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {/* Authentication Section */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {user ? (
              <UserProfile user={user} />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-muted-foreground">Sign in to get started</p>
                <SignInButton />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col gap-4 text-base font-medium sm:flex-row">
            {user ? (
              <Link
                href="/dashboard"
                rel="noopener noreferrer"
                className="flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                <Image
                  className="dark:invert"
                  src="/assets/mini-logo.svg"
                  alt="Loly logomark"
                  width={16}
                  height={16}
                />
                Dashboard
              </Link>
            ) : (
              <a
                href="https://www.loly.dev/docs/getting-started?from=template"
                className="flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                Get Started
              </a>
            )}
            <a
              href="https://loly.dev/?from=template"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 min-w-[180px] items-center justify-center rounded-full border border-solid border-black/8 px-6 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Documentation
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full space-y-2 text-center text-sm text-muted-foreground">
          <p>Powered by Loly Framework</p>
          <p className="text-xs">Ready to build something amazing?</p>
        </div>
      </main>
    </div>
  );
}
