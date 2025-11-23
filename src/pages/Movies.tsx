import { useState, useEffect, useCallback, useRef } from "react";
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
import { AiRecommendationService } from "../services/aiRecommendationService";

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
    const kidsOnly = searchParams.get("kidsOnly");
    const ai = searchParams.get("aiRecommendation");

    if (ai) urlFilters.aiRecommendation = ai;
    if (search) urlFilters.search = search;
    if (genre) urlFilters.genre = genre;
    if (year) urlFilters.year = parseInt(year);
    if (kidsOnly === "true") urlFilters.kidsOnly = true;
    return urlFilters;
  });
  const [genres, setGenres] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Movie[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const fetchMovies = useCallback(
    async (page: number = 1, isInitialLoad: boolean = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setIsTransitioning(true);
        }
        setError(null);
        const result = await MovieService.getMovies(page, 20, filters);
        setMovies(result.movies);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Failed to load movies. Please try again.");
      } finally {
        setLoading(false);
        setIsTransitioning(false);
      }
    },
    [filters]
  );

  const fetchFilters = async () => {
    try {
      const [genresData, yearsData] = await Promise.all([
        MovieService.getGenres(),
        MovieService.getReleaseYears(),
      ]);
      setGenres(genresData);
      setYears(yearsData);
    } catch (err) {
      console.error("Error fetching filters:", err);
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
    fetchMovies(targetPage, true);
  }, [filters, searchParams, fetchMovies]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  //Adding cache for AI Recommendations
  const lastAiQueryRef = useRef<string>("");
  const aiRecommendationsCacheRef = useRef<Movie[]>([]);

  //New UseEffect for AI Recommendation
  useEffect(() => {
    const currentQuery = filters.aiRecommendation?.trim() || "";

    if (!currentQuery) {
      setAiRecommendations([]);
      lastAiQueryRef.current = "";
      aiRecommendationsCacheRef.current = [];
      setIsLoadingAI(false);
      return;
    }

    // Check service cache first for immediate restoration
    const cachedRecommendations = AiRecommendationService.getCached(currentQuery);
    if (cachedRecommendations) {
      setAiRecommendations(cachedRecommendations);
      aiRecommendationsCacheRef.current = cachedRecommendations;
      lastAiQueryRef.current = currentQuery;
      setIsLoadingAI(false);
      return;
    }

    if (
      currentQuery === lastAiQueryRef.current &&
      aiRecommendationsCacheRef.current.length > 0
    ) {
      setAiRecommendations(aiRecommendationsCacheRef.current);
      setIsLoadingAI(false);
      return;
    }

    // Yeni query için debounce ile API çağrısı yap
    setIsLoadingAI(true);
    const timeoutId = setTimeout(async () => {
      try {
        const result = await AiRecommendationService.getRecommendations(
          currentQuery
        );
        if (result.error) {
          setError(result.error);
          setAiRecommendations([]);
          aiRecommendationsCacheRef.current = [];
        } else {
          setAiRecommendations(result.movies);
          aiRecommendationsCacheRef.current = result.movies;
          lastAiQueryRef.current = currentQuery;
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching AI recommendations:", error);
        setError("Failed to get AI recommendations. Please try again.");
        setAiRecommendations([]);
        aiRecommendationsCacheRef.current = [];
      } finally {
        setIsLoadingAI(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [filters.aiRecommendation]);

  const handlePageChange = (page: number) => {
    fetchMovies(page, false);
    // Update URL with new page number while preserving current filters
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.year) params.set("year", filters.year.toString());
    if (filters.kidsOnly) params.set("kidsOnly", "true");
    if (filters.aiRecommendation)
      params.set("aiRecommendation", filters.aiRecommendation);

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
    if (newFilters.kidsOnly) params.set("kidsOnly", "true");
    if (newFilters.aiRecommendation)
      params.set("aiRecommendation", newFilters.aiRecommendation);
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
    if (filters.kidsOnly) params.set("kidsOnly", "true");
    if (filters.aiRecommendation)
      params.set("aiRecommendation", filters.aiRecommendation);
    navigate(`/movie/${movie.tmdb_id}?${params.toString()}`);
  };

  const displayMovies = filters.aiRecommendation ? aiRecommendations : movies;

  const displayLoading = filters.aiRecommendation
    ? isLoadingAI
    : loading || isTransitioning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Movies</h1>
          <p className="text-xl text-gray-600">
            Discover your next favorite film with AI-powered recommendations,
            smart search, and filters. Browse our collection of 80.000+ movies
            or describe what you want to watch in natural language.
          </p>
        </div>

        {/* Filters */}
        <MovieFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          genres={genres}
          years={years}
          isLoading={loading || isLoadingAI}
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

        {/* Transition Loading Indicator */}
        {displayLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-600">
                {filters.aiRecommendation
                  ? "Getting AI recommendations..."
                  : "Loading..."}
              </span>
            </div>
          </div>
        )}

        {/* Movies Grid */}
        {!error && !displayLoading && (
          <>
            {filters.aiRecommendation && (
              <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-800">
                  <span className="font-semibold">AI Recommendation:</span> "
                  {filters.aiRecommendation}"
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8 grid-transition">
              {displayMovies.map((movie) => (
                <MovieCard
                  key={movie.tmdb_id}
                  movie={movie}
                  onClick={handleMovieClick}
                />
              ))}
            </div>

            {/* Empty State */}
            {displayMovies.length === 0 && !displayLoading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {filters.aiRecommendation
                    ? "No recommendations found"
                    : "No movies found"}
                </h3>
                <p className="text-gray-600">
                  {filters.aiRecommendation
                    ? "Try adjusting your query or check back later."
                    : "Try adjusting your filters to find more movies."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {!filters.aiRecommendation && displayMovies.length > 0 && (
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
