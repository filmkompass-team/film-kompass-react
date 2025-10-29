import supabase from "../utils/supabase";
import type { Movie, MovieFilters, PaginationInfo } from "../types/movie";

export class MovieService {
  static async getMovies(
    page: number = 1,
    itemsPerPage: number = 20,
    filters?: MovieFilters
  ): Promise<{ movies: Movie[]; pagination: PaginationInfo }> {
    try {
      let query = supabase.from("films").select("*", { count: "exact" });

      // Apply filters
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      if (filters?.genre) {
        query = query.contains("genres", [filters.genre]);
      }

      if (filters?.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query
          .gte("release_date", startDate)
          .lte("release_date", endDate);
      }

      if (filters?.kidsOnly) {
        query = query.eq("adult", false);
        query = query.or(
          "genres.cs.{Children},genres.cs.{Animation},genres.cs.{Family}"
        );
      }

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      query = query.order("vote_count", { ascending: false }).range(from, to);

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
      const { data, error } = await supabase.rpc("get_unique_genres");

      if (error) {
        throw error;
      }

      return data.map((row: any) => row.genre);
    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  }

  static async getReleaseYears(): Promise<number[]> {
    try {
      const { data, error } = await supabase.rpc("get_unique_years");

      if (error) {
        throw error;
      }

      return data.map((row: any) => row.year);
    } catch (error) {
      console.error("Error fetching release years:", error);
      return [];
    }
  }

  static async getFeaturedMovies(): Promise<Movie[]> {
    try {
      const featuredTitles = [
        "The Shawshank Redemption",
        "The Matrix",
        "Interstellar",
        "The Lion King",
        "The Godfather",
        "Parasite",
      ];

      const { data, error } = await supabase
        .from("films")
        .select("*")
        .in("title", featuredTitles);

      if (error) {
        throw error;
      }

      return (data as Movie[]) || [];
    } catch (error) {
      console.error("Error fetching featured movies:", error);
      return [];
    }
  }
}
