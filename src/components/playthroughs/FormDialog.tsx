import { Check } from "lucide-react";
import type { FormEvent, ReactNode, RefObject } from "react";
import { PILL_BUTTON, PRIMARY_BUTTON } from "../shared/button-styles";

type FormDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  title: string;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
};

export function FormDialog({
  dialogRef,
  title,
  error,
  onSubmit,
  onClose,
  children,
}: FormDialogProps) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label={title}
      className="border-ink text-ink shadow-sticker backdrop:bg-ink/40 m-auto w-[min(26rem,calc(100%-2rem))] rounded-3xl border-[3px] bg-white p-5"
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold break-words">{title}</h2>
        {children}
        {error && (
          <p role="alert" className="text-wrong font-semibold">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={PILL_BUTTON}
          >
            Cancel
          </button>
          <button type="submit" className={PRIMARY_BUTTON}>
            <Check className="size-5" aria-hidden />
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
