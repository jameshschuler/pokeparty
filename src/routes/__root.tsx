import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "../components/layout/Header";
import { Toast } from "../components/layout/Toast";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Header />
      <Toast />
      <main className="mx-auto max-w-5xl px-4 pt-4 pb-40">
        <Outlet />
      </main>
    </>
  );
}
