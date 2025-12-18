import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
    const [message, setMessage] = useState("")
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (message.trim()) {
        onSendMessage(message)
        setMessage("")
      }
    }
  
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-full bg-card border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm md:text-base"
        />
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 rounded-full bg-chat-button hover:bg-chat-button/90 text-chat-button-foreground shadow-md transition-all hover:scale-105 active:scale-95"
          disabled={!message.trim()}
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    )
  }