import type { QuizMode } from "../../lib/quiz";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const QUIZ_MODE_DETAILS: Record<
  QuizMode,
  {
    label: string;
    description: string;
    difficulty: Difficulty;
    prompt?: string;
  }
> = {
  sprite: {
    label: "Sprite",
    description: "See the Pokémon, pick its name.",
    difficulty: "beginner",
  },
  silhouette: {
    label: "Silhouette",
    description: "Only the shadow. Who's that Pokémon?",
    difficulty: "beginner",
  },
  region: {
    label: "Region",
    description: "See the Pokémon, pick the region it's from.",
    difficulty: "intermediate",
    prompt: "Which region is it from?",
  },
  dex: {
    label: "Dex number",
    description: "See the number, pick the Pokémon.",
    difficulty: "advanced",
    prompt: "Which Pokémon is this?",
  },
};
