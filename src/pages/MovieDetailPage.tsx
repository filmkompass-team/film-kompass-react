import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import type { Movie } from "../types/movie";
import { MovieService } from "../services/movieService";
import supabase from "../utils/supabase";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const movieData = await MovieService.getMovieById(parseInt(id));

        if (movieData) {
          setMovie(movieData);
        } else {
          setError("Movie not found");
        }
      } catch (err) {
        setError("An error occurred while loading the movie");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Movie not found"}
          </h2>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Movie Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Centered Layout - Same for all screen sizes */}
          <div className="flex flex-col items-center space-y-8 p-4 md:p-8 lg:p-12">
            {/* Poster Section - Always Centered */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 hidden md:block"></div>
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
                    Array.isArray(movie.spoken_languages) &&
                    movie.spoken_languages.length > 0 && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full">
                        <span className="text-indigo-600">🗣️</span>
                        <span className="text-gray-800 font-medium">
                          {movie.spoken_languages[0]}
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
              <div className="flex flex-col sm:flex-row gap-4">
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
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
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
                <button
                  onClick={() => {
                    if (user) {
                      // User is logged in, show coming soon
                      alert("Feature coming soon!");
                    } else {
                      // User is not logged in, redirect to login
                      navigate("/login");
                    }
                  }}
                  className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-4 px-8 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {user ? "Add to Favourites" : "Login to Add Favourites"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
