import { createTRPCRouter } from "../init";
import { workflowsRouter } from "@/app/features/workflows/server/routers";
import { credentialsRouter } from "@/app/features/credentials/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
});

export type AppRouter = typeof appRouter;
