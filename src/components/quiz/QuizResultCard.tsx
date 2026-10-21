import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { DEFAULT_QUIZ_MODE } from "../../lib/quiz";
import { quizResultUrl, type QuizResult } from "../../lib/quiz-result";
import { CopyLinkButton } from "../share/CopyLinkButton";
import { ShareButton } from "../share/ShareButton";
import { PRIMARY_BUTTON, TEXT_LINK } from "../shared/button-styles";
import { QuizScore } from "./QuizScore";

export function QuizResultCard({ result }: { result: QuizResult | null }) {
  if (!result) {
    return (
      <section className="flex flex-col items-center gap-4 py-12 text-center">
        <h1 className="text-2xl font-bold">This link doesn't have a result</h1>
        <Link
          to="/quiz"
          search={{ mode: DEFAULT_QUIZ_MODE }}
          className={TEXT_LINK}
        >
          Play Who's That Pokémon?
        </Link>
      </section>
    );
  }

  const url = quizResultUrl(result, window.location.origin);

  return (
    <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
      <h1 className="text-3xl font-bold">Who's That Pokémon?</h1>
      <QuizScore result={result} />
      <div className="flex items-center gap-3">
        <CopyLinkButton url={url} />
        <ShareButton url={url} title="Can you beat my score?" />
      </div>
      <Link
        to="/quiz/play"
        search={{ mode: result.mode, clock: result.clock }}
        className={PRIMARY_BUTTON}
      >
        <Play className="size-5" aria-hidden />
        Play this mode
      </Link>
    </section>
  );
}
