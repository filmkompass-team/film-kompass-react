import supabase from "../utils/supabase";

export const RatingService = {
  /**
   * @param movieId Filmin TMDB ID'si
   * @param rating Verilen puan (1-5)
   */
  submitRating: async (movieId: number, rating: number): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must login to vote!");
    }

    const { error } = await supabase.from("ratings").upsert(
      {
        movie_id: movieId,
        user_id: user.id,
        rating: rating,
      },
      {
        onConflict: "user_id, movie_id",
      }
    );

    if (error) {
      console.error("Error submitting rating:", error);
      throw error;
    }
  },

  /**
   * @param movieId Filmin TMDB ID'si
   * @returns Kullanıcının verdiği puanı veya null döner.
   */
  getUserRatingForMovie: async (movieId: number): Promise<number | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("ratings")
      .select("rating")
      .eq("user_id", user.id)
      .eq("movie_id", movieId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user rating:", error);
      throw error;
    }

    return data ? data.rating : null;
  },

  /**
   * Returns all ratings of a user
   * @returns {movie_id: rating}
   */
  getAllUserRatings: async (): Promise<Record<number, number>> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return {};
    const { data, error } = await supabase
      .from("ratings")
      .select("movie_id, rating")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching user ratings:", error);
      return {};
    }

    const ratingsMap: Record<number, number> = {};
    data?.forEach((item) => {
      ratingsMap[item.movie_id] = item.rating;
    });
    return ratingsMap;
  },
};
