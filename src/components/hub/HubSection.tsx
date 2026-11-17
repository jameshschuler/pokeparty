import { useId, type ReactNode } from "react";

export function HubSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-2xl font-bold">
        {title}
      </h2>
      <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2">{children}</ul>
    </section>
  );
}
