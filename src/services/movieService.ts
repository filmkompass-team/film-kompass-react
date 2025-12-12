import supabase from "../utils/supabase";
import type { Movie, MovieFilters, PaginationInfo } from "../types/movie";

export class MovieService {

  static async getMovies(
    page: number = 1,
    itemsPerPage: number = 20,
    filters?: MovieFilters
  ): Promise<{ movies: Movie[]; pagination: PaginationInfo }> {
    try {
      let query = supabase
        .from("films_sorted")
        .select("*", { count: "exact" });

      if (filters?.kidsOnly) {
        query = query.eq("adult", false);
        query = query.or(
          "genres.cs.{Children},genres.cs.{Animation},genres.cs.{Family}"
        );
      }

      if (filters?.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query
          .gte("release_date", startDate)
          .lte("release_date", endDate);
      }

      if (filters?.genre) {
        query = query.contains("genres", [filters.genre]);
      }

      if (filters?.search) {
        const searchTerm = filters.search.trim();
        if (searchTerm.length > 0) {
          query = query.ilike("title", `%${searchTerm}%`);
        }
      }

      // Pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      const pagination: PaginationInfo = {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage,
      };

      return {
        movies: (data as Movie[]) || [],
        pagination,
      };
    } catch (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
  }

  static async getMovieById(tmdbId: number): Promise<Movie | null> {
    try {
      const { data, error } = await supabase
        .from("films")
        .select("*")
        .eq("tmdb_id", tmdbId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No rows found
        }
        throw error;
      }

      return data as Movie;
    } catch (error) {
      console.error("Error fetching movie by ID:", error);
      return null;
    }
  }

  static async getGenres(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("genres_view")
        .select("genre")
        .order("genre", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map((row: { genre: string }) => row.genre);

    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  }

  static async getReleaseYears(): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from("years_view")
        .select("year")
        .order("year", { ascending: false });
      if (error) {
        throw error;
      }

      return data.map((row: { year: number }) => row.year);
    } catch (error) {
      console.error("Error fetching release years:", error);
      return [];
    }
  }
static async getRecommendationsForUser(userId: string): Promise<Movie[]> {
    try {
      // 1. Önce ID listesini çek
      const { data: recData, error: recError } = await supabase
        .from('recommendations')
        .select('suggested_movies')
        .eq('user_id', userId)
        .maybeSingle();

      if (recError) throw recError;

      // Liste boşsa boş dön
      if (!recData || !recData.suggested_movies || recData.suggested_movies.length === 0) {
        return [];
      }

      const movieIds: number[] = recData.suggested_movies;

      // 2. Sonra filmleri çek
      const { data: moviesData, error: moviesError } = await supabase
        .from('films')
        .select('*')
        .in('tmdb_id', movieIds);

      if (moviesError) throw moviesError;

      return (moviesData as Movie[]) || [];

    } catch (error) {
      console.error("Öneri servisi hatası:", error);
      return [];
    }
  }
}

