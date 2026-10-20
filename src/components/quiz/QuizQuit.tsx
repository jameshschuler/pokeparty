import { Link } from "@tanstack/react-router";
import { Play, X } from "lucide-react";
import { useRef } from "react";
import { useQuizContext } from "../../contexts/quiz-context";
import { PILL_BUTTON, PRIMARY_BUTTON } from "../shared/button-styles";

export function QuizQuit() {
  const { mode, hold, release } = useQuizContext();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openWarning() {
    hold();
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button type="button" onClick={openWarning} className={PILL_BUTTON}>
        <X className="size-5" aria-hidden />
        Quit
      </button>
      <dialog
        ref={dialogRef}
        onClose={release}
        aria-labelledby="quit-title"
        aria-describedby="quit-description"
        className="border-ink text-ink shadow-sticker backdrop:bg-surface m-auto w-[min(24rem,calc(100%-2rem))] rounded-3xl border-[3px] bg-white p-6 text-center"
      >
        <h2 id="quit-title" className="text-2xl font-bold">
          Quit this round?
        </h2>
        <p id="quit-description" className="text-ink/70 mt-2">
          Your score will be lost. The clock is paused until you choose.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            autoFocus
            className={PRIMARY_BUTTON}
          >
            <Play className="size-5" aria-hidden />
            Keep playing
          </button>
          <Link
            to="/quiz"
            search={{ mode }}
            className="border-ink shadow-sticker-sm flex min-h-12 items-center rounded-2xl border-[3px] bg-white px-5 text-lg font-semibold"
          >
            Quit
          </Link>
        </div>
      </dialog>
    </>
  );
}
