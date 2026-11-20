export const GAME_GROUPS = [
  {
    label: "Generation 1",
    generation: 1,
    games: [
      { id: "red-blue", name: "Red, Blue & Green" },
      { id: "yellow", name: "Yellow" },
    ],
  },
  {
    label: "Generation 2",
    generation: 2,
    games: [
      { id: "gold-silver", name: "Gold & Silver" },
      { id: "crystal", name: "Crystal" },
    ],
  },
  {
    label: "Generation 3",
    generation: 3,
    games: [
      { id: "ruby-sapphire", name: "Ruby & Sapphire" },
      { id: "firered-leafgreen", name: "FireRed & LeafGreen" },
      { id: "emerald", name: "Emerald" },
    ],
  },
  {
    label: "Generation 4",
    generation: 4,
    games: [
      { id: "diamond-pearl", name: "Diamond & Pearl" },
      { id: "platinum", name: "Platinum" },
      { id: "heartgold-soulsilver", name: "HeartGold & SoulSilver" },
    ],
  },
  {
    label: "Generation 5",
    generation: 5,
    games: [
      { id: "black-white", name: "Black & White" },
      { id: "black2-white2", name: "Black 2 & White 2" },
    ],
  },
  {
    label: "Generation 6",
    generation: 6,
    games: [
      { id: "x-y", name: "X & Y" },
      { id: "omega-ruby-alpha-sapphire", name: "Omega Ruby & Alpha Sapphire" },
    ],
  },
  {
    label: "Generation 7",
    generation: 7,
    games: [
      { id: "sun-moon", name: "Sun & Moon" },
      { id: "ultra-sun-ultra-moon", name: "Ultra Sun & Ultra Moon" },
      { id: "lets-go", name: "Let's Go, Pikachu! & Let's Go, Eevee!" },
    ],
  },
  {
    label: "Generation 8",
    generation: 8,
    games: [
      { id: "sword-shield", name: "Sword & Shield" },
      {
        id: "brilliant-diamond-shining-pearl",
        name: "Brilliant Diamond & Shining Pearl",
      },
      { id: "legends-arceus", name: "Legends: Arceus" },
    ],
  },
  {
    label: "Generation 9",
    generation: 9,
    games: [
      { id: "scarlet-violet", name: "Scarlet & Violet" },
      { id: "legends-z-a", name: "Legends: Z-A" },
    ],
  },
  {
    label: "Fan games",
    generation: 3,
    games: [{ id: "heart-soul", name: "Heart & Soul" }],
  },
] as const;

export type Game = (typeof GAME_GROUPS)[number]["games"][number];

export type GameId = Game["id"];

const GAMES = GAME_GROUPS.flatMap((group): readonly Game[] => group.games);

export function findGame(id: GameId): Game {
  return GAMES.find((game) => game.id === id) as Game;
}

export function gameGeneration(gameId: GameId): number {
  const group = GAME_GROUPS.find((entry) =>
    entry.games.some((game) => game.id === gameId),
  );

  return group?.generation ?? 0;
}

export function isGameId(value: unknown): value is GameId {
  return GAMES.some((game) => game.id === value);
}
