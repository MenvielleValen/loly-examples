import { Button } from "@/components/ui/button";
import { revalidate } from "@lolyjs/core/client-cache";
import { useRouter } from "@lolyjs/core/hooks";

export const ChatLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch("/api/user/logout", {
      method: "POST",
    });
    if (response.ok) {
      revalidate();
      router.push("/");
    }
  };

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};
