import { buttonVariants } from "@/components/ui/button";

import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@lolyjs/core/components";

type HomePageProps = {
  // Props from page server.hook.ts (specific to this page)
  // Props from layout server.hook.ts (available in all pages!)
  appName?: string;
  navigation?: Array<{ href: string; label: string }>;
  githubUrl?: string;
};

export default function HomePage(props: HomePageProps) {
  const { githubUrl = "https://github.com/MenvielleValen/loly-framework" } =
    props;
  return (
    <main className="h-[calc(100vh-4.5rem)] bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/10 to-transparent opacity-60" />
        <div className="relative mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-accent/50 px-4 py-1.5 text-sm text-accent-foreground backdrop-blur-sm">
              <Sparkles className="size-4" />
              Built with Loly Framework
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-balance text-foreground sm:text-7xl leading-[1.1]">
              The Modern Chat Application for{" "}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Real-Time Communication
              </span>
            </h1>
            <p className="mt-8 text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
              A production-ready example showcasing Loly Framework's native WebSocket
              support, route-level middlewares, and enterprise-grade features. Built
              with real-time communication, authentication, and modern React patterns.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link
                href="/chat"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base font-medium"
                )}
              >
                Go to Chat Room
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="https://loly-framework.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg", variant: "default" }),
                  "h-12 px-8 text-base font-medium"
                )}
              >
                Explore Loly Framework
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 px-8 text-base font-medium"
                )}
              >
                View on GitHub
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
