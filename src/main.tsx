import { QueryClient } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { createAppRouter } from "./router";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App router={createAppRouter()} queryClient={queryClient} />
  </StrictMode>,
);
