interface ChatMessageProps {
  content: string;
  timestamp: Date;
  userName: string;
  isUser: boolean;
}

export const ChatMessage = ({
  content,
  userName,
  timestamp,
  isUser,
}: ChatMessageProps) => {
  const formatTime = (date: Date | string) => {
    if (typeof date === "string") {
      date = new Date(date);
    }

    return date.toLocaleTimeString("es", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-fade-in-up`}
    >
      <div
        className={`flex flex-col max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "bg-chat-user text-chat-user-foreground rounded-br-md"
              : "bg-card text-card-foreground rounded-bl-md border border-border"
          }`}
        >
          <p className="text-sm md:text-base leading-relaxed">{content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1.5 px-2 text-center">
          {formatTime(timestamp)} - {isUser ? "You" : userName}
        </span> 
      </div>
    </div>
  );
};
