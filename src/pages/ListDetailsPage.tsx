import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ListService } from "../services/listService";
import AddMovieModal from "../components/AddMovieModal";
import MovieCard from "../components/MovieCard";
import { MovieService } from "../services/movieService";
import type { Movie } from "../types/movie";

export default function ListDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      console.log("🔍 ListDetailsPage - Fetching list with ID:", id);
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("📡 Calling ListService.getListDetails with ID:", id);
      
      const result = await ListService.getListDetails(id!);
      
      console.log("✅ ListService result:", result);
      
      if (!result.list) {
        console.error("❌ List not found or no access");
        setError("List not found or you don't have access to it.");
        setList(null);
        setMovies([]);
        setLoading(false);
        return;
      }
      
      setList(result.list);
      const items = result.items || [];
      
      console.log("📋 List items:", items);

      // Movie ID'leri al
      const movieIds = items.map((i: any) => i.movie_id);

      if (movieIds.length === 0) {
        console.log("📭 No movies in this list");
        setMovies([]);
        setLoading(false);
        return;
      }

      console.log("🎬 Fetching movie details for IDs:", movieIds);

      // Film detaylarını getir
      const moviePromises = movieIds.map(async (movieId: number) => {
        try {
          return await MovieService.getMovieById(movieId);
        } catch (err) {
          console.error(`Error fetching movie ${movieId}:`, err);
          return null;
        }
      });

      const results = await Promise.all(moviePromises);
      const validMovies = results.filter((movie): movie is Movie => movie !== null);
      
      console.log("✅ Successfully loaded movies:", validMovies.length);
      setMovies(validMovies);

    } catch (error) {
      console.error("❌ Error in fetchDetails:", error);
      setError(`Error loading list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading list...</p>
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">List Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The list you're looking for doesn't exist or you don't have access to it."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/profile")}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Back to Profile
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex-1">
            <button
              onClick={() => navigate("/profile")}
              className="text-gray-500 hover:text-gray-800 mb-2 text-sm flex items-center gap-1"
            >
              ← Back to Profile
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
              {list.title}
              {list.is_shared && (
                <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
                  Shared
                </span>
              )}
            </h1>
            {list.description && (
              <p className="text-gray-600 mt-2">{list.description}</p>
            )}
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-lg">+</span>
            <span>Add Movie</span>
          </button>
        </div>

        {/* --- MOVIE LIST --- */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.tmdb_id}
                movie={movie}
                onClick={(m) => navigate(`/movie/${m.tmdb_id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-gray-500 mb-4 text-lg">
              No movies in this list yet.
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="text-indigo-600 font-bold hover:underline"
            >
              Add your first movie
            </button>
          </div>
        )}

        {/* --- MODAL --- */}
        {isAddModalOpen && id && (
          <AddMovieModal
            listId={id}
            onClose={() => setAddModalOpen(false)}
            onSuccess={() => {
              setAddModalOpen(false);
              fetchDetails();
            }}
          />
        )}
      </div>
    </div>
  );
}