import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { headers } from "next/headers";
import { LogoutButton } from "./features/logout-button";

const Page = async () => {
  await requireAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const data = await caller.getUsers();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      <div>protected page</div>
      <div>{JSON.stringify(data, null, 2)}</div>
      <LogoutButton />
    </div>
  );
};

export default Page;
