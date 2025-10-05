import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type {
  Movie,
  MovieFilters as FilterType,
  PaginationInfo,
} from "../types/movie";
import { MovieService } from "../services/movieService";
import MovieCard from "../components/MovieCard";
import MovieFilters from "../components/MovieFilters";
import Pagination from "../components/Pagination";

export default function Movies() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [filters, setFilters] = useState<FilterType>(() => {
    // Initialize filters from URL parameters
    const urlFilters: FilterType = {};
    const search = searchParams.get("search");
    const genre = searchParams.get("genre");
    const year = searchParams.get("year");

    if (search) urlFilters.search = search;
    if (genre) urlFilters.genre = genre;
    if (year) urlFilters.year = parseInt(year);

    return urlFilters;
  });
  const [genres, setGenres] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await MovieService.getMovies(page, 20, filters);
      setMovies(result.movies);
      setPagination(result.pagination);
    } catch (err) {
      setError("Failed to load movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [genresData, yearsData] = await Promise.all([
        MovieService.getGenres(),
        MovieService.getReleaseYears(),
      ]);
      setGenres(genresData);
      setYears(yearsData);
    } catch (err) {
      // Silently handle filter data errors
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    // Check if there's a page parameter in URL
    const pageParam = searchParams.get("page");
    const targetPage = pageParam ? parseInt(pageParam) : 1;
    fetchMovies(targetPage);
  }, [filters, searchParams]);

  const handlePageChange = (page: number) => {
    fetchMovies(page);
    // Update URL with new page number while preserving current filters
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.year) params.set("year", filters.year.toString());

    navigate(`/movies?${params.toString()}`, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);

    // Update URL with new filters
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.genre) params.set("genre", newFilters.genre);
    if (newFilters.year) params.set("year", newFilters.year.toString());

    // Reset to page 1 when filters change
    params.set("page", "1");

    setSearchParams(params);
  };

  const handleMovieClick = (movie: Movie) => {
    // Build query string with current filters and page
    const params = new URLSearchParams();
    params.set("page", pagination.currentPage.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.year) params.set("year", filters.year.toString());

    navigate(`/movie/${movie.tmdb_id}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Movies</h1>
          <p className="text-xl text-gray-600">
            Discover your next favorite film with AI-powered recommendations,
            smart search, and filters. Browse our collection of 8,000+ movies or
            describe what you want to watch in natural language.
          </p>
        </div>

        {/* Filters */}
        <MovieFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          genres={genres}
          years={years}
          isLoading={loading}
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading movies...</span>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.tmdb_id}
                  movie={movie}
                  onClick={handleMovieClick}
                />
              ))}
            </div>

            {/* Empty State */}
            {movies.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No movies found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters to find more movies.
                </p>
              </div>
            )}

            {/* Pagination */}
            {movies.length > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
