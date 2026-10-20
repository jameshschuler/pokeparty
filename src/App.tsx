import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { LeaderboardProvider } from "./contexts/leaderboard-context";
import { TeamsProvider } from "./contexts/teams-context";
import { ThemeProvider } from "./contexts/theme-context";
import { ToastProvider } from "./contexts/toast-context";
import type { createAppRouter } from "./router";

type AppProps = {
  router: ReturnType<typeof createAppRouter>;
  queryClient: QueryClient;
};

export function App({ router, queryClient }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <TeamsProvider>
            <LeaderboardProvider>
              <RouterProvider router={router} />
            </LeaderboardProvider>
          </TeamsProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
