import { ChatLogout } from "@/components/shared/ChatLogout";

type ChatLayoutProps = {
  children: React.ReactNode;
  user: { id: string; name: string };
};

/**
 * Chat layout component.
 * 
 * Provides the chat interface layout with:
 * - Header showing user name
 * - Logout button for authenticated users
 * - Chat content area
 * 
 * @param children - Chat page content
 * @param user - User object with id and name
 */
export default function ChatLayout({ children, user }: ChatLayoutProps) {
  const isAuthenticated = Boolean(user.id && user.name);

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
