import type { QuizMode } from "../../lib/quiz";

export const QUIZ_MODE_DETAILS: Record<
  QuizMode,
  { label: string; description: string; prompt?: string }
> = {
  sprite: {
    label: "Sprite",
    description: "See the Pokémon, pick its name.",
  },
  silhouette: {
    label: "Silhouette",
    description: "Only the shadow. Who's that Pokémon?",
  },
  region: {
    label: "Region",
    description: "See the Pokémon, pick the region it's from.",
    prompt: "Which region is it from?",
  },
};
