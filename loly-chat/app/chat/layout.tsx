import { ChatLogout } from "@/components/shared/ChatLogout";

export default function ChatLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { id: string; name: string };
}) {
  const isAuthenticated = user.id && user.name;

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-gradient-to-br from-accent via-background to-primary/5 overflow-hidden">
      <div className="w-full bg-accent p-4">
      <div className="flex justify-between items-center w-full md:w-1/2 mx-auto px-2">
        <h1 className="text-xl font-bold text-center">
          Global chat - {user.name || "Anonymous"}
        </h1>
        {isAuthenticated && <ChatLogout />}
      </div>
      </div>
      {children}
    </div>
  );
}
