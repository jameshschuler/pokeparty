import { useToastContext } from "../../contexts/toast-context";

export function Toast() {
  const { toast } = useToastContext();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-44 z-50 flex justify-center px-4"
    >
      {toast && (
        <p
          key={toast.key}
          className="border-ink bg-accent shadow-sticker motion-safe:animate-toast rounded-full border-[3px] px-5 py-2 font-semibold"
        >
          {toast.message}
        </p>
      )}
    </div>
  );
}
