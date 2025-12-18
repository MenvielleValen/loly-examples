import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { revalidate } from "@lolyjs/core/client-cache";
import { Loader2 } from "lucide-react";

export const ChatLogin = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  const handleSubmit = async () => {
    setIsLoading(true);
    const response = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      revalidate();
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen w-full mx-auto">
      <h1 className="text-2xl font-bold">Chat Login</h1>
      <input
        ref={ref}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        disabled={isLoading}
        className="w-full max-w-xs p-2 border border-gray-300 rounded-md"
      />
      <Button
        className="w-full max-w-xs p-2"
        onClick={handleSubmit}
        disabled={isLoading || !name?.trim()}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
      </Button>
    </div>
  );
};
