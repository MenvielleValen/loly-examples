import { useState, useEffect } from "react";
import { ChatMessage } from "../ChatMessage";
import { ChatInput } from "../ChatInput";
import { Socket } from "socket.io-client";
import { lolySocket } from "@lolyjs/core/sockets";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

type ChatProps = {
  user: {
    id: string;
    name: string;
  };
};

export const Chat = ({ user }: ChatProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Connect to namespace with auth
    const ws = lolySocket("/chat", {});

    setSocket(ws);
    setIsConnected(false);

    ws.on("connect", () => {
      console.log("Connected to chat namespace");
      setIsConnected(true);
    });

    ws.on("disconnect", () => {
      setIsConnected(false);
    });

    ws.on("message", (data) => {
      console.log("message", data);
      setMessages((prev) => {
        // Avoid duplicates by checking if message with same id already exists
        const exists = prev.some((msg) => msg.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    // Listen for framework errors
    ws.on("__loly:error", (error) => {
      console.error("Error:", error.code, error.message);
    });

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [user]);

  const handleSendMessage = (message: string) => {
    if (socket && socket.connected) {
      socket.emit("message", {
        content: message,
        timestamp: new Date(),
        id: crypto.randomUUID(),
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] bg-gradient-to-br from-accent via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Conectando al chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
              userName={message.userName}
              isUser={message.userId === user.id}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} />
          <p className="text-xs text-muted-foreground text-center py-2">
            {user.id}
          </p>
        </div>
      </div>
    </>
  );
};
