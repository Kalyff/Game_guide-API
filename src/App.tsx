import { useEffect, useState } from "react";
import {
  Book,
  MessageSquare,
  ThumbsUp,
  Eye,
  Gamepad2,
  Target,
  Wrench,
  Package,
  ArrowLeft,
  Send,
} from "lucide-react";

interface Game {
  id: string;
  title: string;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface Guide {
  id: string;
  title: string;
  content: string;
  category: string;
  rating: number;
  views: number;
  tags: string[];
}

interface GuideDetails extends Guide {
  gameId: string;
  userId: string;
  createdAt: string;
}

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  // 'list', 'details', 'create'
  const [view, setView] = useState<"list" | "details" | "create">("list");
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [guideDetails, setGuideDetails] = useState<{
    guide: GuideDetails;
    comments: Comment[];
  } | null>(null);

  // Form states for creating guide
  const [newGuide, setNewGuide] = useState({
    title: "",
    content: "",
    category: "Walkthrough",
    tags: "",
  });

  // Form state for creating comment
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        if (data.length > 0) {
          setSelectedGameId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedGameId && view === "list") {
      setLoading(true);
      fetch(`/api/games/${selectedGameId}/guides`)
        .then((res) => res.json())
        .then((data) => {
          setGuides(data.guides);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [selectedGameId, view]);

  useEffect(() => {
    if (view === "details" && selectedGuideId) {
      setLoading(true);
      fetch(`/api/guides/${selectedGuideId}`)
        .then((res) => res.json())
        .then((data) => {
          setGuideDetails(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [view, selectedGuideId]);

  const handleCreateGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGameId,
          userId: "JogadorExemplo", // mocked
          title: newGuide.title,
          content: newGuide.content,
          category: newGuide.category,
          tags: newGuide.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        setView("list");
        setNewGuide({
          title: "",
          content: "",
          category: "Walkthrough",
          tags: "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuideId || !newComment.trim()) return;
    try {
      const res = await fetch(`/api/guides/${selectedGuideId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "JogadorVisitante",
          content: newComment,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuideDetails((prev) => {
          if (!prev) return prev;
          return { ...prev, comments: [...prev.comments, data.comment] };
        });
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!selectedGuideId) return;
    try {
      const res = await fetch(`/api/guides/${selectedGuideId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuideDetails((prev) => {
          if (!prev) return prev;
          return { ...prev, guide: { ...prev.guide, rating: data.rating } };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Conquistas":
        return <Target className="w-4 h-4" />;
      case "Modding":
        return <Wrench className="w-4 h-4" />;
      case "Loot":
        return <Package className="w-4 h-4" />;
      default:
        return <Book className="w-4 h-4" />;
    }
  };

  const selectedGameObj = games.find((g) => g.id === selectedGameId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setView("list")}
        >
          <Gamepad2 className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold font-mono tracking-tight text-white hidden sm:block">
            Hub de Guias
          </h1>
        </div>

        {games.length > 0 && view === "list" && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400 hidden sm:block">
              Jogo:
            </label>
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none"
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {view === "list" && (
          <>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold mb-2 text-white">
                  Guias de {selectedGameObj?.title}
                </h2>
                <p className="text-slate-400">
                  Explore dicas, tutoriais e mods da comunidade.
                </p>
              </div>
              <button
                onClick={() => setView("create")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap w-fit"
              >
                Criar Guia
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : guides.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800">
                <Book className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhum guia encontrado
                </h3>
                <p className="text-slate-400">
                  Seja o primeiro a ajudar a comunidade criando um guia para
                  este jogo!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {guides.map((guide) => (
                  <div
                    key={guide.id}
                    onClick={() => {
                      setSelectedGuideId(guide.id);
                      setView("details");
                    }}
                    className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold ring-1 ring-inset ring-indigo-500/20">
                        {getCategoryIcon(guide.category)}
                        {guide.category}
                      </div>
                    </div>

                    <h3 className="text-xl font-medium text-white mb-3 group-hover:text-indigo-300 transition-colors">
                      {guide.title}
                    </h3>

                    <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-grow">
                      {guide.content.replace(/^#\s.*\n/, "")}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {guide.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500 pt-4 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-medium">{guide.rating}</span>
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                        <Eye className="w-4 h-4" />
                        <span>{guide.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "create" && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para lista
            </button>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Escrever Novo Guia para {selectedGameObj?.title}
              </h2>
              <form onSubmit={handleCreateGuide} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Título do Guia
                  </label>
                  <input
                    required
                    type="text"
                    value={newGuide.title}
                    onChange={(e) =>
                      setNewGuide({ ...newGuide, title: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                    placeholder="Ex: Como platinar em 10 horas..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Categoria
                    </label>
                    <select
                      value={newGuide.category}
                      onChange={(e) =>
                        setNewGuide({ ...newGuide, category: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                    >
                      <option value="Conquistas">🏆 Conquistas</option>
                      <option value="Modding">🔧 Modding</option>
                      <option value="Walkthrough">📖 Walkthrough</option>
                      <option value="Loot">📦 Loot & Itens</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={newGuide.tags}
                      onChange={(e) =>
                        setNewGuide({ ...newGuide, tags: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                      placeholder="speedrun, platina, glitch"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Conteúdo do Guia (Markdown suportado)
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={newGuide.content}
                    onChange={(e) =>
                      setNewGuide({ ...newGuide, content: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none font-mono text-sm leading-relaxed"
                    placeholder="# Introdução\nEscreva seu guia aqui..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    Publicar Guia
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === "details" && (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para lista
            </button>

            {loading || !guideDetails ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div>
                {/* Guide Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 cursor-default mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-sm font-semibold ring-1 ring-inset ring-indigo-500/20">
                      {getCategoryIcon(guideDetails.guide.category)}
                      {guideDetails.guide.category}
                    </span>
                    <div className="flex gap-2">
                      {guideDetails.guide.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                    {guideDetails.guide.title}
                  </h1>

                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <div>
                      Por{" "}
                      <span className="text-slate-200 font-medium">
                        {guideDetails.guide.userId}
                      </span>
                    </div>
                    <div>
                      Postado em{" "}
                      {new Date(
                        guideDetails.guide.createdAt,
                      ).toLocaleDateString()}
                    </div>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {guideDetails.guide.views}{" "}
                        views
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />{" "}
                        {guideDetails.guide.rating} avaliações
                      </span>
                    </div>
                  </div>
                </div>

                {/* Guide Content */}
                <div className="prose prose-invert prose-indigo max-w-none bg-slate-900/30 p-8 rounded-2xl border border-slate-800 mb-8 font-sans leading-relaxed whitespace-pre-wrap text-slate-300">
                  {guideDetails.guide.content}
                </div>

                {/* Rating Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/60 p-6 rounded-xl border border-slate-800 mb-12">
                  <div className="text-slate-300 font-medium text-center sm:text-left">
                    Este guia foi útil para você?
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVote("downvote")}
                      className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    >
                      <ThumbsUp className="w-5 h-5 rotate-180" />
                    </button>
                    <div className="text-2xl font-bold font-mono text-white min-w-[3ch] text-center">
                      {guideDetails.guide.rating > 0
                        ? `+${guideDetails.guide.rating}`
                        : guideDetails.guide.rating}
                    </div>
                    <button
                      onClick={() => handleVote("upvote")}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-semibold">
                        Avaliar Positivamente
                      </span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-indigo-400" />
                    Comentários ({guideDetails.comments.length})
                  </h3>

                  {/* Add comment */}
                  <form onSubmit={handleCreateComment} className="mb-8">
                    <div className="relative">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicione um comentário..."
                        className="w-full bg-slate-900/60 border border-slate-700 text-white rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-4 pr-16 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>

                  {/* Comment List */}
                  <div className="space-y-4">
                    {guideDetails.comments.map((c) => (
                      <div
                        key={c.id}
                        className="bg-slate-900/40 p-5 rounded-xl border border-slate-800/50"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                            {c.userId.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-200 text-sm">
                              {c.userId}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-slate-300 leading-relaxed text-sm">
                          {c.content}
                        </div>
                      </div>
                    ))}

                    {guideDetails.comments.length === 0 && (
                      <div className="text-center py-8 text-slate-500 italic bg-slate-900/20 rounded-xl border border-slate-800/50">
                        Nenhum comentário ainda. Seja o primeiro a participar!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
