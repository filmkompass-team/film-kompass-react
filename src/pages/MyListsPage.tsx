import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserListService } from "../services/userListService";
import { MovieService } from "../services/movieService";
import type { Movie } from "../types/movie";
import MovieCard from "../components/MovieCard";
import supabase from "../utils/supabase";
import AddMovieModal from "../components/AddMovieModal";

export default function MyListsPage() {
  const { listType } = useParams<{ listType: string }>();
  const navigate = useNavigate();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeList, setActiveList] = useState<"favorites" | "watched" | "wishlist">("favorites");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (!user) {
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setError("Error checking authentication");
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (listType && listType !== activeList) {
      setActiveList(listType as "favorites" | "watched" | "wishlist");
    } else if (!listType) {
      navigate("/my-lists/favorites", { replace: true });
    }
  }, [listType, activeList, navigate]);

  useEffect(() => {
    const fetchMoviesFromList = async () => {
      if (!user) return;
      const currentListType = listType || activeList;
      try {
        if (isInitialLoad.current) {
          setLoading(true);
        } else {
          setIsTransitioning(true);
        }
        setError(null);

        const movieIds = await UserListService.getMoviesFromList(
          currentListType as "favorites" | "watched" | "wishlist"
        );

        if (movieIds.length === 0) {
          setMovies([]);
          setLoading(false);
          setIsTransitioning(false);
          return;
        }

        const moviePromises = movieIds.map(async (movieId) => {
          try {
            return await MovieService.getMovieById(movieId);
          } catch (error) {
            console.error(`Error fetching movie ${movieId}:`, error);
            return null;
          }
        });

        const movieResults = await Promise.all(moviePromises);
        const validMovies = movieResults.filter((movie): movie is Movie => movie !== null);

        setMovies(validMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Failed to load movies from your list.");
      } finally {
        isInitialLoad.current = false;
        setLoading(false);
        setIsTransitioning(false);
      }
    };

    if (user) {
      fetchMoviesFromList();
    }
  }, [user, listType, activeList]);

  const getListTitle = () => {
    const currentListType = listType || activeList;
    switch (currentListType) {
      case "favorites": return "❤️ My Favorites";
      case "watched": return "✅ Watched Movies";
      case "wishlist": return "📝 My Wishlist";
      default: return "My Lists";
    }
  };

  const getListDescription = () => {
    const currentListType = listType || activeList;
    switch (currentListType) {
      case "favorites": return "Movies you've marked as favorites";
      case "watched": return "Movies you've watched";
      case "wishlist": return "Movies you want to watch";
      default: return "Your personal movie lists";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 list-transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {getListTitle()}
            </h1>
            <p className="text-xl text-gray-600">{getListDescription()}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
          >
            + Add Movie
          </button>
        </div>

        {isTransitioning && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-600">Loading...</span>
            </div>
          </div>
        )}

        {!isTransitioning && movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 transition-all duration-300 grid-transition">
            {movies.map((movie) => {
              // HATA ÇÖZÜMÜ: 'tmdb_id' yoksa 'id'yi kullan, TypeScript'e 'any' diyerek güven ver.
              const validId = movie.tmdb_id || (movie as any).id;
              return (
                <MovieCard
                  key={validId}
                  movie={movie}
                  onClick={() => navigate(`/movie/${validId}`)}
                />
              );
            })}
          </div>
        ) : !isTransitioning && movies.length === 0 ? (
          <div className="text-center py-12 transition-all duration-300 list-transition">
            <div className="text-6xl mb-4">
              {(listType || activeList) === "favorites" && "❤️"}
              {(listType || activeList) === "watched" && "✅"}
              {(listType || activeList) === "wishlist" && "📝"}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No movies in your {listType || activeList} list yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding movies to your {listType || activeList} list.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 font-medium transform hover:scale-105"
            >
              Add Your First Movie
            </button>
          </div>
        ) : null}

        {isModalOpen && (
          <AddMovieModal
            listType={listType || activeList}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}