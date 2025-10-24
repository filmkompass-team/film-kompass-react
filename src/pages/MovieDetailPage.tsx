import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import type { Movie } from "../types/movie";
import { MovieService } from "../services/movieService";
import { UserListService } from "../services/userListService";
import supabase from "../utils/supabase";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Get the page number and filters from URL params
  const pageParam = searchParams.get("page");
  const searchParam = searchParams.get("search");
  const genreParam = searchParams.get("genre");
  const yearParam = searchParams.get("year");
  const currentPage = pageParam ? parseInt(pageParam) : 1;

  useEffect(() => {
    // Check user authentication status
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Scroll to top instantly when component mounts
    window.scrollTo(0, 0);

    const fetchMovie = async () => {
      if (!id) {
        setError("Movie ID not found");
        return;
      }

      try {
        setError(null);
        const movieData = await MovieService.getMovieById(parseInt(id));

        if (movieData) {
          setMovie(movieData);
        } else {
          setError("Movie not found");
        }
      } catch {
        setError("An error occurred while loading the movie");
      }
    };
    fetchMovie();
  }, [id]);

  // Check movie list status when movie and user are available
  useEffect(() => {
    if (movie && user) {
      checkMovieListStatus(movie.tmdb_id);
    }
  }, [movie, user]);

  const formatRuntime = (minutes: number | null) => {
    if (!minutes || typeof minutes !== "number" || minutes <= 0) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear().toString();
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return "bg-gray-500";
    if (rating >= 8) return "bg-green-500";
    if (rating >= 7) return "bg-yellow-500";
    if (rating >= 6) return "bg-orange-500";
    return "bg-red-500";
  };

  const checkMovieListStatus = async (movieId: number) => {
    try {
      const [favorite, watched, wishlist] = await Promise.all([
        UserListService.checkMovieInList(movieId, "favorites"),
        UserListService.checkMovieInList(movieId, "watched"),
        UserListService.checkMovieInList(movieId, "wishlist"),
      ]);

      setIsFavorite(favorite);
      setIsWatched(watched);
      setIsInWishlist(wishlist);
    } catch (error) {
      console.error("Error checking movie list status:", error);
    }
  };

  const handleListAction = async (
    listType: "favorites" | "watched" | "wishlist"
  ) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!movie) return;

    setListLoading(true);
    try {
      const isInList =
        listType === "favorites"
          ? isFavorite
          : listType === "watched"
          ? isWatched
          : isInWishlist;

      if (isInList) {
        await UserListService.removeFromList(movie.tmdb_id, listType);
        if (listType === "favorites") setIsFavorite(false);
        else if (listType === "watched") setIsWatched(false);
        else if (listType === "wishlist") setIsInWishlist(false);
      } else {
        await UserListService.addToList(movie.tmdb_id, listType);
        if (listType === "favorites") setIsFavorite(true);
        else if (listType === "watched") setIsWatched(true);
        else if (listType === "wishlist") setIsInWishlist(true);
      }
    } catch (error) {
      const isInList =
        listType === "favorites"
          ? isFavorite
          : listType === "watched"
          ? isWatched
          : isInWishlist;
      console.error(
        `Error ${isInList ? "removing from" : "adding to"} ${listType}:`,
        error
      );
      alert(
        `Error ${
          isInList ? "removing from" : "adding to"
        } ${listType}. Please try again.`
      );
    } finally {
      setListLoading(false);
    }
  };

  // Show transition loading while movie is loading
  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <p className="text-gray-600 mb-6">
            The movie you're looking for could not be found or an error
            occurred.
          </p>
          <button
            onClick={() => {
              // Build query string with all filters
              const params = new URLSearchParams();
              params.set("page", currentPage.toString());
              if (searchParam) params.set("search", searchParam);
              if (genreParam) params.set("genre", genreParam);
              if (yearParam) params.set("year", yearParam);
              navigate(`/movies?${params.toString()}`);
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 page-transition">
      {/* Movie Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden list-transition">
          {/* Centered Layout - Same for all screen sizes */}
          <div className="flex flex-col items-center space-y-8 p-4 md:p-8 lg:p-12">
            {/* Poster Section - Always Centered */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 hidden md:block"></div>
                <div className="relative">
                  <img
                    src={movie.poster_url || "/placeholder-movie.jpg"}
                    alt={movie.title}
                    className="w-72 h-[32rem] object-cover rounded-2xl shadow-2xl transform transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Image";
                    }}
                  />

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`${getRatingColor(
                        movie.vote_average
                      )} text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-lg shadow-lg backdrop-blur-sm`}
                    >
                      <span>⭐</span>
                      <span>{movie.vote_average?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section - Below Poster */}
            <div className="w-full max-w-4xl md:max-w-4xl space-y-8">
              {/* Title and Basic Info */}
              <div className="text-center">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  {movie.title}
                </h1>

                {/* Movie Meta Info */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 w-full px-2 md:px-0">
                  {movie.release_date && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full">
                      <span className="text-indigo-600">📅</span>
                      <span className="text-gray-800 font-medium">
                        {formatDate(movie.release_date)}
                      </span>
                    </div>
                  )}
                  {(() => {
                    const hasValidRuntime =
                      movie.runtime !== null &&
                      movie.runtime !== undefined &&
                      movie.runtime !== 0 &&
                      typeof movie.runtime === "number" &&
                      movie.runtime > 0;

                    return hasValidRuntime ? (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full">
                        <span className="text-indigo-600">⏱️</span>
                        <span className="text-gray-800 font-medium">
                          {formatRuntime(movie.runtime)}
                        </span>
                      </div>
                    ) : null;
                  })()}
                  {movie.spoken_languages &&
                    typeof movie.spoken_languages === "string" &&
                    movie.spoken_languages.trim().length > 0 && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full">
                        <span className="text-indigo-600">🗣️</span>
                        <span className="text-gray-800 font-medium">
                          {movie.spoken_languages}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Overview Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 md:p-6 lg:p-8">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  Overview
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {movie.overview || "No description available for this movie."}
                </p>
              </div>

              {/* Genres Section */}
              {movie.genres &&
                Array.isArray(movie.genres) &&
                movie.genres.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 md:p-6 lg:p-8">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {movie.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="bg-white text-indigo-800 px-4 py-2 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 border border-indigo-200 hover:bg-indigo-50"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Back to Movies Button */}
                <button
                  onClick={() => {
                    // Build query string with all filters
                    const params = new URLSearchParams();
                    params.set("page", currentPage.toString());
                    if (searchParam) params.set("search", searchParam);
                    if (genreParam) params.set("genre", genreParam);
                    if (yearParam) params.set("year", yearParam);
                    navigate(`/movies?${params.toString()}`);
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Movies
                </button>

                {/* List Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Favorites Button */}
                  <button
                    onClick={() => handleListAction("favorites")}
                    disabled={listLoading}
                    className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isFavorite
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-white border-2 border-red-600 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <span className="text-xl">❤️</span>
                    {user
                      ? isFavorite
                        ? "Favorited"
                        : "Add to Favorites"
                      : "Login for Favorites"}
                  </button>

                  {/* Watched Button */}
                  <button
                    onClick={() => handleListAction("watched")}
                    disabled={listLoading}
                    className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isWatched
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-white border-2 border-green-600 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <span className="text-xl">✅</span>
                    {user
                      ? isWatched
                        ? "Watched"
                        : "Mark as Watched"
                      : "Login for Watched"}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => handleListAction("wishlist")}
                    disabled={listLoading}
                    className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isInWishlist
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-xl">⏰</span>
                    {user
                      ? isInWishlist
                        ? "In Wishlist"
                        : "Add to Wishlist"
                      : "Login for Wishlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
