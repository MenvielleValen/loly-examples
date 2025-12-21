import { useState } from "react";
import { useRouter } from "@lolyjs/core/hooks";
import { revalidate } from "@lolyjs/core/client-cache";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Gamepad2 } from "lucide-react";

type HomePageProps = {
  appName?: string;
  navigation?: Array<{ href: string; label: string }>;
}

export default function HomePage(props: HomePageProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to setup user");
      }

      // Revalidate server data to pick up the new cookie
      await revalidate();
      
      // Navigate to lobby
      router.push("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/10 to-transparent opacity-60" />
      
      <div className="relative w-full max-w-md mx-auto px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/90 to-primary shadow-lg shadow-primary/20 mb-6">
            <Gamepad2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-3">
            Tic Tac Toe
          </h1>
          <p className="text-lg text-muted-foreground">
            Play in real-time with friends or challenge the bot
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Enter your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              disabled={loading}
              className={cn(
                "w-full h-12 px-4 rounded-lg border border-input bg-background",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error && "border-destructive"
              )}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || !name.trim()}
            className="w-full h-12 text-base font-medium"
          >
            {loading ? "Setting up..." : "Play"}
          </Button>
        </form>
      </div>
    </main>
  );
}
