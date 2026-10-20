import { SkipForward } from "lucide-react";
import { useQuizContext } from "../../contexts/quiz-context";
import { PILL_BUTTON } from "../shared/button-styles";

export function SkipQuestion({ message }: { message: string }) {
  const { skipQuestion } = useQuizContext();

  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <p className="font-semibold">{message}</p>
      <button type="button" onClick={skipQuestion} className={PILL_BUTTON}>
        <SkipForward className="size-5" aria-hidden />
        Skip
      </button>
    </div>
  );
}
