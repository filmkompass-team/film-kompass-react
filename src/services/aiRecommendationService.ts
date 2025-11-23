import supabase from "../utils/supabase";
import { UserListService } from "./userListService";
import { RatingService } from "./ratingService";
import { MovieService } from "./movieService";
import type { Movie } from "../types/movie";

export interface AiRecommendationRequest {
  userQuery: string;
}

export interface AiRecommendationResponse {
  movies: Movie[];
  error?: string;
}

export class AiRecommendationService {
  private static cache = new Map<string, Movie[]>();

  static getCached(query: string): Movie[] | undefined {
    return this.cache.get(query);
  }

  /**
   * Generates AI recommendations for a user
   * @param userQuery User's natural language query
   * @returns AI recommendations
   */
  static async getRecommendations(
    userQuery: string
  ): Promise<AiRecommendationResponse> {
    try {
      // Check cache first (though the component should also check, double checking here is fine)
      if (this.cache.has(userQuery)) {
        return { movies: this.cache.get(userQuery)! };
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User must be logged in to get recommendations");
      }

      const [favoritesIds, watchedIds, ratings] = await Promise.all([
        UserListService.getMoviesFromList("favorites"),
        UserListService.getMoviesFromList("watched"),
        RatingService.getAllUserRatings(),
      ]);

      const [favoritesMovies, watchedMovies] = await Promise.all([
        Promise.all(
          favoritesIds.slice(0, 20).map((id) => MovieService.getMovieById(id))
        ).then((movies) => movies.filter((m): m is Movie => m !== null)),
        Promise.all(
          watchedIds.slice(0, 20).map((id) => MovieService.getMovieById(id))
        ).then((movies) => movies.filter((m): m is Movie => m !== null)),
      ]);
      const ratedMovieIds = Object.keys(ratings).map(Number).slice(0, 20);
      const ratedMovies = await Promise.all(
        ratedMovieIds.map((id) => MovieService.getMovieById(id))
      ).then((movies) => movies.filter((m): m is Movie => m !== null));

      const { data, error } = await supabase.functions.invoke(
        "ai-recommendations",
        {
          body: {
            userQuery,
            favorites: favoritesMovies.map((m) => ({
              title: m.title,
              genres: m.genres || [],
              overview: m.overview,
            })),
            watched: watchedMovies.map((m) => ({
              title: m.title,
              genres: m.genres || [],
              overview: m.overview,
            })),
            ratings: ratedMovies.map((m) => ({
              title: m.title,
              rating: ratings[m.tmdb_id],
              genres: m.genres || [],
            })),
          },
        }
      );

      if (error) {
        console.error("Error calling AI recommendations function:", error);
        throw error;
      }

      if (data.error) {
        return { movies: [], error: data.error };
      }

      const recommendedMovieTitles = data.recommendedMovies || [];
      const recommendedMovies: Movie[] = [];

      for (const title of recommendedMovieTitles) {
        try {
          //Normalize
          const normalizedTitle = title.trim().toLowerCase();

          const { data: movieData, error: searchError } = await supabase
            .from("films_sorted")
            .select("*")
            .ilike("title", `%${normalizedTitle}%`)
            .limit(1)
            .single();

          if (!searchError && movieData) {
            recommendedMovies.push(movieData as Movie);
          }
        } catch (err) {
          console.warn(`Movie not found: ${title}`);
        }
      }

      // Store in cache
      this.cache.set(userQuery, recommendedMovies);

      return { movies: recommendedMovies };
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      return {
        movies: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
