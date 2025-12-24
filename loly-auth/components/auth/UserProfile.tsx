import React from "react";
import { Image } from "@lolyjs/core/components";
import { SignOutButton } from "./SignOutButton";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type UserProfileProps = {
  user: User;
};

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
      {user.image && (
        <Image
          src={user.image}
          alt={user.name || "User"}
          width={48}
          height={48}
          className="rounded-full"
        />
      )}
      <div className="flex-1">
        <p className="font-semibold text-foreground">{user.name || "User"}</p>
        {user.email && (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        )}
      </div>
      <SignOutButton />
    </div>
  );
};

