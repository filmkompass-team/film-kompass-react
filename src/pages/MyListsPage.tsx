import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserListService } from "../services/userListService";
import { MovieService } from "../services/movieService";
import type { Movie } from "../types/movie";
import MovieCard from "../components/MovieCard";
import supabase from "../utils/supabase";

export default function MyListsPage() {
  const { listType } = useParams<{ listType: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [activeList, setActiveList] = useState<
    "favorites" | "watched" | "wishlist"
  >("favorites");
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log("MyListsPage - User check:", user);
        setUser(user);

        if (!user) {
          console.log("MyListsPage - No user, redirecting to login");
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("MyListsPage - Error checking user:", error);
        setError("Error checking authentication");
      }
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    const fetchMoviesFromList = async () => {
      console.log("MyListsPage - fetchMoviesFromList called with:", {
        user: !!user,
        listType: listType || activeList,
      });

      if (!user) {
        console.log("MyListsPage - Missing user or listType, skipping fetch");
        return;
      }
      const currentListType = listType || activeList;
      try {
        setLoading(isInitialLoad.current);
        setError(null);
        console.log(
          "MyListsPage - Starting to fetch movies from list:",
          currentListType
        );

        // Get movie IDs from the list
        const movieIds = await UserListService.getMoviesFromList(
          currentListType as "favorites" | "watched" | "wishlist"
        );

        console.log("MyListsPage - Movie IDs from list:", movieIds);

        if (movieIds.length === 0) {
          console.log("MyListsPage - No movies in list");
          setMovies([]);
          setLoading(false);
          return;
        }

        // Fetch movie details for each ID
        const moviePromises = movieIds.map(async (movieId) => {
          try {
            return await MovieService.getMovieById(movieId);
          } catch (error) {
            console.error(`Error fetching movie ${movieId}:`, error);
            return null;
          }
        });

        const movieResults = await Promise.all(moviePromises);
        const validMovies = movieResults.filter(
          (movie): movie is Movie => movie !== null
        );

        console.log("MyListsPage - Valid movies found:", validMovies.length);
        setMovies(validMovies);
      } catch (error) {
        console.error("MyListsPage - Error fetching movies from list:", error);
        setError("Failed to load movies from your list.");
      } finally {
        isInitialLoad.current = false;
        setLoading(false);
      }
    };

    if (user) {
      fetchMoviesFromList();
    }
  }, [user, listType, activeList]);

  const getListTitle = () => {
    const currentListType = listType || activeList;
    switch (currentListType) {
      case "favorites":
        return "❤️ My Favorites";
      case "watched":
        return "✅ Watched Movies";
      case "wishlist":
        return "📝 My Wishlist";
      default:
        return "My Lists";
    }
  };

  const getListDescription = () => {
    switch (listType) {
      case "favorites":
        return "Movies you've marked as favorites";
      case "watched":
        return "Movies you've watched";
      case "wishlist":
        return "Movies you want to watch";
      default:
        return "Your personal movie lists";
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
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getListTitle()}
          </h1>
          <p className="text-xl text-gray-600">{getListDescription()}</p>

          {!listType && (
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setActiveList("favorites")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeList === "favorites"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ♥️ Favorites
              </button>
              <button
                onClick={() => setActiveList("watched")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeList === "watched"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ✅ Watched
              </button>
              <button
                onClick={() => setActiveList("wishlist")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeList === "wishlist"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📝 Wishlist
              </button>
            </div>
          )}
        </div>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.tmdb_id}
                movie={movie}
                onClick={(movie) => navigate(`/movie/${movie.tmdb_id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {listType || (activeList === "favorites" && "❤️")}
              {listType || (activeList === "watched" && "✅")}
              {listType || (activeList === "wishlist" && "📝")}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No movies in your {activeList || listType} list yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding movies to your {activeList || listType} list by
              browsing our collection.
            </p>
            <button
              onClick={() => navigate("/movies")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
