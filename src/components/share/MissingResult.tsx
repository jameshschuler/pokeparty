import type { ReactNode } from "react";

export function MissingResult({ playLink }: { playLink: ReactNode }) {
  return (
    <section className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-2xl font-bold">This link doesn't have a result</h1>
      {playLink}
    </section>
  );
}
