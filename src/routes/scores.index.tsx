import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_CLOCK_SETTING, DEFAULT_QUIZ_MODE } from "../lib/quiz";

export const Route = createFileRoute("/scores/")({
  beforeLoad: () => {
    throw redirect({
      to: "/scores/quiz",
      search: { mode: DEFAULT_QUIZ_MODE, clock: DEFAULT_CLOCK_SETTING },
      replace: true,
    });
  },
});
