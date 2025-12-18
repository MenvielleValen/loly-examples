import { Chat } from "@/components/shared/Chat";
import { ChatLogin } from "@/components/shared/ChatLogin";

type ChatPageProps = {
  user: {
    id: string;
    name: string;
  };
};

export default function ChatPage({ user }: ChatPageProps) {
  if (!user?.id || !user?.name) {
    return <ChatLogin />;
  }

  return <Chat user={user} />;
}
