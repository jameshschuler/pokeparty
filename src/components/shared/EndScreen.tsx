import type { ReactNode } from "react";
import { MainMenuLink } from "./MainMenuLink";

export function EndScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      {children}
      <div className="flex justify-center">
        <MainMenuLink />
      </div>
    </div>
  );
}
