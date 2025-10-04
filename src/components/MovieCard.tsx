import type { Movie } from "../types/movie";

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const formatRuntime = (minutes: number | null) => {
    if (!minutes || typeof minutes !== "number" || minutes <= 0) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return "bg-gray-500";
    if (rating >= 8) return "bg-green-500";
    if (rating >= 7) return "bg-yellow-500";
    if (rating >= 6) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
      onClick={() => onClick?.(movie)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster_url || "/placeholder-movie.jpg"}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://via.placeholder.com/300x450/1f2937/ffffff?text=No+Image";
          }}
        />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3">
          <div
            className={`${getRatingColor(
              movie.vote_average
            )} text-white px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1`}
          >
            <span>⭐</span>
            <span>{movie.vote_average?.toFixed(1) || "N/A"}</span>
          </div>
        </div>

        {/* Year Badge */}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-lg text-sm font-medium">
          {formatDate(movie.release_date)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {movie.title}
        </h3>

        {/* Genres */}
        {movie.genres &&
          Array.isArray(movie.genres) &&
          movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {movie.genres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                >
                  {genre}
                </span>
              ))}
              {movie.genres.length > 3 && (
                <span className="text-gray-500 text-xs px-2 py-1">
                  +{movie.genres.length - 3} more
                </span>
              )}
            </div>
          )}

        {/* Overview */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {movie.overview || "No description available."}
        </p>

        {/* Movie Details - Only show if there's valid data */}
        {(() => {
          const hasValidRuntime =
            movie.runtime !== null &&
            movie.runtime !== undefined &&
            movie.runtime !== 0 &&
            typeof movie.runtime === "number" &&
            movie.runtime > 0;

          const hasValidLanguages =
            movie.spoken_languages &&
            Array.isArray(movie.spoken_languages) &&
            movie.spoken_languages.length > 0;

          if (!hasValidRuntime && !hasValidLanguages) {
            return null;
          }

          return (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                {hasValidRuntime && (
                  <span className="flex items-center gap-1">
                    <span>🕒</span>
                    <span>{formatRuntime(movie.runtime!)}</span>
                  </span>
                )}
                {hasValidLanguages && (
                  <span className="flex items-center gap-1">
                    <span>🗣️</span>
                    <span>{movie.spoken_languages![0]}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
