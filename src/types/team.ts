export type TeamMember = {
  pokemonId: number;
  shiny: boolean;
};

export type Team = {
  id: string;
  members: TeamMember[];
  createdAt: number;
  updatedAt: number;
};
