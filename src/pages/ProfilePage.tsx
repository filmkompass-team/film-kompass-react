import { useEffect, useState, FormEvent } from "react";
import supabase from "../utils/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  // Username state
  const [username, setUsername] = useState<string>("");
  const [isSavingUsername, setIsSavingUsername] = useState<boolean>(false);

  // Stats states
  const [totalWatched, setTotalWatched] = useState<number>(0);
  const [favoriteGenre, setFavoriteGenre] = useState<string>("Unknown");
  const [totalRatings, setTotalRatings] = useState<number>(0);

  // Activity & lists
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watchedList, setWatchedList] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // ---- LOADERS ----

  const loadRatings = async (userId: string) => {
    const { data } = await supabase
      .from("ratings")
      .select("id")
      .eq("user_id", userId);

    setTotalRatings(data?.length || 0);
  };

  const loadWatched = async (userId: string) => {
    const { data } = await supabase
      .from("user_movie_lists")
      .select("movie_id")
      .eq("user_id", userId)
      .eq("list_type", "watched");

    setTotalWatched(data?.length || 0);
  };

  const loadFavoriteGenre = async (userId: string) => {
    const { data } = await supabase
      .from("user_movie_lists")
      .select("movie_id, movies(genres)")
      .eq("user_id", userId)
      .eq("list_type", "watched");

    if (!data) return;

    const genreCount: Record<string, number> = {};

    data.forEach((item: any) => {
      item.movies?.genres?.forEach((g: string) => {
        genreCount[g] = (genreCount[g] || 0) + 1;
      });
    });

    const fav =
      Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Unknown";

    setFavoriteGenre(fav);
  };

  const loadRecentActivity = async (userId: string) => {
    const { data } = await supabase
      .from("user_movie_lists")
      .select("movie_id, list_type, created_at, movies(title, poster_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentActivity(data || []);
  };

  const loadMovieList = async (
    userId: string,
    listType: "favorites" | "watched" | "wishlist"
  ) => {
    const { data } = await supabase
      .from("user_movie_lists")
      .select("movies(title, poster_url)")
      .eq("user_id", userId)
      .eq("list_type", listType);

    if (!data) return [];

    return data.map((item: any) => item.movies);
  };

  // ---- EFFECT: session & user ----

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
      }
    };

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      setUser(data.user);

      // initial username
      const initialUsername =
        data.user.user_metadata?.username ||
        data.user.user_metadata?.full_name ||
        (data.user.email ? data.user.email.split("@")[0] : "User");

      setUsername(initialUsername);

      // stats & lists
      await loadRatings(data.user.id);
      await loadWatched(data.user.id);
      await loadFavoriteGenre(data.user.id);
      await loadRecentActivity(data.user.id);

      const fav = await loadMovieList(data.user.id, "favorites");
      setFavorites(fav);

      const watch = await loadMovieList(data.user.id, "watched");
      setWatchedList(watch);

      const wish = await loadMovieList(data.user.id, "wishlist");
      setWishlist(wish);
    };

    checkSession();
    fetchUser();
  }, []);

  // ---- USERNAME SAVE ----

  const handleUsernameSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSavingUsername(true);

    const { data, error } = await supabase.auth.updateUser({
      data: { username },
    });

    setIsSavingUsername(false);

    if (error) {
      console.error("Error updating username:", error);
      alert("Could not save username. Please try again.");
      return;
    }

    if (data?.user) {
      setUser(data.user);
    }
  };

  // ---- RENDER ----

  if (!user) {
    return <p className="text-white p-6">Loading profile...</p>;
  }

  return (
    <div className="p-6 text-white max-w-5xl mx-auto space-y-12">
      {/* HEADER */}
      <div className="flex items-center gap-6">
        <img
          src={user.user_metadata?.avatar_url || "https://via.placeholder.com/120"}
          alt="User Avatar"
          className="w-28 h-28 rounded-full border-2 border-purple-400"
        />

        <div className="space-y-2">
          {/* Username form */}
          <form
            onSubmit={handleUsernameSave}
            className="flex items-center gap-2 flex-wrap"
          >
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-purple-900/40 border border-purple-500 rounded-lg px-3 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Username"
            />
            <button
              type="submit"
              disabled={isSavingUsername}
              className="px-3 py-1 rounded-lg bg-purple-500 text-sm font-semibold hover:bg-purple-600 disabled:opacity-60"
            >
              {isSavingUsername ? "Saving..." : "Save"}
            </button>
          </form>

          <p className="text-gray-300 text-sm">{user.email}</p>
        </div>
      </div>

      {/* USER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-purple-600/20 p-4 rounded-xl">
          <p className="text-4xl font-bold">{totalWatched}</p>
          <p className="text-gray-300">Watched Movies</p>
        </div>

        <div className="bg-purple-600/20 p-4 rounded-xl">
          <p className="text-2xl font-bold break-words">{favoriteGenre}</p>
          <p className="text-gray-300">Favorite Genre</p>
        </div>

        <div className="bg-purple-600/20 p-4 rounded-xl">
          <p className="text-4xl font-bold">{totalRatings}</p>
          <p className="text-gray-300">Ratings</p>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <ul className="space-y-3 text-gray-200">
          {recentActivity.length > 0 ? (
            recentActivity.map((item, idx) => (
              <li
                key={idx}
                className="bg-purple-800/30 p-3 rounded-lg flex items-center gap-4"
              >
                {/* Poster */}
                <img
                  src={item.movies?.poster_url || "https://via.placeholder.com/50"}
                  className="w-12 h-16 rounded-md object-cover"
                  alt={item.movies?.title || "Movie"}
                />

                {/* Text */}
                <div>
                  <p className="font-bold">
                    {item.movies?.title || "Unknown Movie"}
                  </p>
                  <p className="text-sm text-purple-300">
                    {item.list_type.toUpperCase()}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p>No recent actions yet 🥱</p>
          )}
        </ul>
      </div>

      {/* MY LISTS PREVIEW */}
      <div className="mt-10 space-y-10">
        <ListPreview title="Favorites" movies={favorites} />
        <ListPreview title="Watched" movies={watchedList} />
        <ListPreview title="Wishlist" movies={wishlist} />
      </div>
    </div>
  );

  // Nested helper component
  function ListPreview({ title, movies }: { title: string; movies: any[] }) {
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold">{title}</h3>
          <a
            href={`/my-lists/${title.toLowerCase()}`}
            className="text-purple-400 text-sm"
          >
            See all →
          </a>
        </div>

        <div className="flex gap-3 overflow-x-auto">
          {movies.length > 0 ? (
            movies.map((movie, index) => (
              <img
                key={index}
                src={movie.poster_url || "https://via.placeholder.com/80"}
                alt={movie.title}
                className="w-24 h-36 rounded-lg object-cover"
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No movies yet 🚀</p>
          )}
        </div>
      </div>
    );
  }
}
