import { useState } from "react";
import { UserLogin } from "@/components/shared/UserLogin";
import { OfficeCanvas } from "@/components/office/OfficeCanvas";
import { revalidate } from "@lolyjs/core/client-cache";

interface HomePageProps {
  user?: {
    id: string;
    name: string;
  };
}

export default function HomePage({ user: initialUser }: HomePageProps) {
  const [user, setUser] = useState<{ id: string; name: string } | null>(
    initialUser?.id ? initialUser : null
  );

  // Handle login from UserLogin component
  const handleLogin = (loggedInUser: { id: string; name: string }) => {
    setUser(loggedInUser);
    // Revalidate to refresh the page with new user data
    revalidate();
  };

  // If no user, show login screen
  if (!user || !user.id) {
    return <UserLogin onLogin={handleLogin} />;
  }

  // User is logged in, show office
  return <OfficeCanvas user={user} />;
}
