"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const LogoutButton = () => {
  const logout = () => authClient.signOut();

  return <Button onClick={logout}>Logout</Button>;
};
