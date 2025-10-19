import supabase from "../utils/supabase";

export class UserListService {
  static async addToList(
    movieId: number,
    listType: "favorites" | "watched" | "wishlist"
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not found");
    }
    const { data, error } = await supabase.from("user_movie_lists").insert({
      user_id: user.id,
      movie_id: movieId,
      list_type: listType,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
  static async removeFromList(
    movieId: number,
    listType: "favorites" | "watched" | "wishlist"
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not found");
    }
    const { error } = await supabase
      .from("user_movie_lists")
      .delete()
      .eq("user_id", user.id)
      .eq("movie_id", movieId)
      .eq("list_type", listType);
    if (error) {
      throw error;
    }
  }
  static async getUserLists() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not found");
    }
    const { data, error } = await supabase
      .from("user_movie_lists")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      throw error;
    }
    return data;
  }
  static async getMoviesFromList(
    listType: "favorites" | "watched" | "wishlist"
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not found");
    }
    const { data, error } = await supabase
      .from("user_movie_lists")
      .select("movie_id")
      .eq("user_id", user.id)
      .eq("list_type", listType);
    if (error) {
      throw error;
    }
    return data?.map((item) => item.movie_id) || [];
  }

  static async checkMovieInList(
    movieId: number,
    listType: "favorites" | "watched" | "wishlist"
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }
    const { data, error } = await supabase
      .from("user_movie_lists")
      .select("id")
      .eq("user_id", user.id)
      .eq("movie_id", movieId)
      .eq("list_type", listType)
      .single();

    return !error && data !== null;
  }
}
