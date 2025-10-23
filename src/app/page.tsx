import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { headers } from "next/headers";

const Page = async () => {
  await requireAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(JSON.stringify(session));

  const data = await caller.getUsers();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      protected page
      {JSON.stringify(data)}
    </div>
  );
};

export default Page;
