import { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { ListService } from "../services/listService";
import { MovieService } from "../services/movieService";
import type { Movie } from "../types/movie";

interface Props {
  listId?: string; // Custom list
  listType?: "favorites" | "watched" | "wishlist"; // Standard list
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMovieModal({
  listId,
  listType,
  onClose,
  onSuccess,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  // ✅ DB-only search function
  const searchMovies = async (searchText: string) => {
    const q = searchText.trim();

    if (q.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { movies } = await MovieService.getMovies(1, 30, { search: q });
      setResults((movies as Movie[]) || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debounce: search while typing (no Enter needed)
  useEffect(() => {
    const t = setTimeout(() => {
      searchMovies(query);
    }, 500);

    return () => clearTimeout(t);
  }, [query]);

  const handleAddMovie = async (movie: Movie) => {
    const tmdbId = movie.tmdb_id;
    if (!tmdbId) {
      alert("This movie has no tmdb_id in DB, cannot add.");
      return;
    }

    setAddingId(tmdbId);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      // ✅ Custom list
      if (listId) {
        await ListService.addMovieToList(listId, tmdbId);
      }
      // ✅ Standard list
      else if (listType) {
        const { error: relErr } = await supabase.from("user_movie_lists").upsert({
          user_id: user.id,
          movie_id: tmdbId,
          list_type: listType,
        });

        if (relErr) throw relErr;
      } else {
        throw new Error("Neither listId nor listType provided.");
      }

      alert(`${movie.title} added! ✅`);
      onSuccess();
    } catch (error) {
      console.error("Error adding movie:", error);
      alert(
        "Error adding movie: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <h3 className="text-xl font-bold">Add Movie to List</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* ✅ Search input (typing triggers search) */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search in database..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
          />
          <div
            className="bg-indigo-600 text-white px-4 py-2 rounded opacity-80 select-none"
            title="Searching happens automatically while typing"
            style={{ display: "flex", alignItems: "center" }}
          >
            {loading ? "..." : "Search"}
          </div>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {results.map((movie) => (
            <div
              key={movie.tmdb_id}
              className="flex items-center p-2 border-b hover:bg-gray-50"
            >
              <img
                src={movie.poster_url || "https://via.placeholder.com/50"}
                alt={movie.title}
                className="w-12 h-16 object-cover rounded mr-3"
              />

              <div className="flex-1">
                <div className="font-bold text-sm">{movie.title}</div>
                <div className="text-xs text-gray-500">
                  {movie.release_date?.split("-")[0]}
                </div>
              </div>

              <button
                onClick={() => handleAddMovie(movie)}
                disabled={addingId === movie.tmdb_id}
                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {addingId === movie.tmdb_id ? "Adding..." : "+ Add"}
              </button>
            </div>
          ))}

          {results.length === 0 && !loading && query.trim().length > 0 && (
            <p className="text-center text-gray-500 mt-4">No results found.</p>
          )}

          {query.trim().length === 0 && (
            <p className="text-center text-gray-400 mt-4">
              Start typing to search…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    width: "500px",
    maxHeight: "80vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
  },
};

