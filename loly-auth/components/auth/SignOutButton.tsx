"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { revalidate } from "@lolyjs/core/client-cache";

export const SignOutButton: React.FC = () => {
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      await revalidate();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      window.location.href = "/";
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-block"
    >
      Sign Out
    </button>
  );
};

