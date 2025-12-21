import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { revalidate } from "@lolyjs/core/client-cache";
import { Loader2 } from "lucide-react";

interface UserLoginProps {
  onLogin: (user: { id: string; name: string }) => void;
}

export function UserLogin({ onLogin }: UserLoginProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (asAnonymous: boolean = false) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(asAnonymous ? {} : { name: name.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          revalidate();
          onLogin(data.user);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterAsAnonymous = () => {
    handleSubmit(true);
  };

  const handleEnterWithName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      handleSubmit(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen w-full mx-auto p-4 bg-background">
      <div className="flex flex-col gap-6 items-center w-full max-w-md p-8 rounded-xl border bg-card shadow-lg">
        <h1 className="text-3xl font-bold">Virtual Office</h1>
        <p className="text-muted-foreground text-center">
          Enter your name or join as anonymous
        </p>

        <form onSubmit={handleEnterWithName} className="w-full flex flex-col gap-4">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name (optional)"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            maxLength={50}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Enter with Name"
            )}
          </Button>
        </form>

        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-sm text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleEnterAsAnonymous}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            "Enter as Anonymous"
          )}
        </Button>
      </div>
    </div>
  );
}

