export interface Guide {
  id: string;
  gameId: string;
  userId: string;
  title: string;
  content: string;
  category: "Conquistas" | "Modding" | "Walkthrough" | "Loot";
  tags: string[];
  views: number;
  rating: number; // upvotes - downvotes
  createdAt: Date;
}

export interface Comment {
  id: string;
  guideId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface Game {
  id: string;
  title: string;
}

// Bando de dados fake (Mock em memória para nosso MVC)
export const guidesDB: Guide[] = [
  {
    id: "g1",
    gameId: "game1",
    userId: "user1",
    title: "100% Conquistas - Skyrim",
    content: "# Guia Completo\nAqui você encontra todos os segredos...",
    category: "Conquistas",
    tags: ["platinado", "skyrim", "rpg"],
    views: 120,
    rating: 45,
    createdAt: new Date(),
  },
  {
    id: "g2",
    gameId: "game1",
    userId: "user2",
    title: "Melhores Mods de Gráficos",
    content: "# Modding Básico\nInstale ENB e Skyrim 202X...",
    category: "Modding",
    tags: ["mods", "graficos"],
    views: 530,
    rating: 89,
    createdAt: new Date(),
  }
];

export const commentsDB: Comment[] = [];
export const gamesDB: Game[] = [
  { id: "game1", title: "The Elder Scrolls V: Skyrim" },
  { id: "game2", title: "Cyberpunk 2077" }
];
