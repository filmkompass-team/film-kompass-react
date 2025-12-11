import { useEffect, useState, type FormEvent } from "react";
import supabase from "../utils/supabase";
import { FriendService } from "../services/friendService";
import UserSearch from "../components/UserSearch";

export default function ProfilePage() {
  // TİP HATALARINI GİDERMEK İÇİN 'any' KULLANIYORUZ
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [isSavingUsername, setIsSavingUsername] = useState<boolean>(false);

  // İstatistikler
  const [totalWatched, setTotalWatched] = useState<number>(0);
  const [favoriteGenre, setFavoriteGenre] = useState<string>("Unknown");
  const [totalRatings, setTotalRatings] = useState<number>(0);

  // Listeler - HATA VEREN KISIMLARI <any[]> YAPARAK ÇÖZDÜK
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watchedList, setWatchedList] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [friendList, setFriendList] = useState<any[]>([]);

  // ---- LOADERS ----
  const loadRatings = async (userId: string) => {
    const { data } = await supabase.from("ratings").select("id").eq("user_id", userId);
    setTotalRatings(data?.length || 0);
  };

  const loadWatched = async (userId: string) => {
    const { data } = await supabase.from("user_movie_lists").select("movie_id").eq("user_id", userId).eq("list_type", "watched");
    setTotalWatched(data?.length || 0);
  };

  const loadFavoriteGenre = async (userId: string) => {
    const { data } = await supabase.from("user_movie_lists").select("movie_id, movies(genres)").eq("user_id", userId).eq("list_type", "watched");
    if (!data) return;
    const genreCount: Record<string, number> = {};
    data.forEach((item: any) => {
      const genres = item.movies?.genres;
      if (Array.isArray(genres)) {
        genres.forEach((g: string) => genreCount[g] = (genreCount[g] || 0) + 1);
      }
    });
    const fav = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
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

  const loadMovieList = async (userId: string, listType: "favorites" | "watched" | "wishlist") => {
    const { data } = await supabase
      .from("user_movie_lists")
      .select("movies(title, poster_url)")
      .eq("user_id", userId)
      .eq("list_type", listType);
    return data ? data.map((item: any) => item.movies) : [];
  };

  const loadFriends = async (userId: string) => {
    try {
      const friends = await FriendService.getFriends(userId);
      setFriendList(friends || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);
      setUsername(user.user_metadata?.username || user.email?.split("@")[0] || "User");

      await Promise.all([
        loadRatings(user.id), loadWatched(user.id), loadFavoriteGenre(user.id),
        loadRecentActivity(user.id), loadFriends(user.id)
      ]);
      setFavorites(await loadMovieList(user.id, "favorites"));
      setWatchedList(await loadMovieList(user.id, "watched"));
      setWishlist(await loadMovieList(user.id, "wishlist"));
    };
    fetchUser();
  }, []);

  const handleUsernameSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingUsername(true);
    await supabase.auth.updateUser({ data: { username } });
    await supabase.from('profiles').update({ username }).eq('id', user.id);
    setIsSavingUsername(false);
    alert("Username updated!");
  };

  if (!user) return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-800 p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl text-white">
          <img src={user.user_metadata?.avatar_url || "https://via.placeholder.com/150"} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white/20 object-cover shadow-xl" />
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-bold">{username}</h1>
              <p className="text-indigo-100/80 text-sm">{user.email}</p>
            </div>
            <form onSubmit={handleUsernameSave} className="flex gap-3 justify-center md:justify-start">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 w-full md:w-64" />
              <button type="submit" disabled={isSavingUsername} className="px-5 py-2 rounded-xl bg-white text-indigo-700 font-bold hover:bg-gray-100">Save</button>
            </form>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatsCard title="Watched" value={totalWatched} icon="🎬" />
              <StatsCard title="Fav Genre" value={favoriteGenre} icon="🍿" truncate />
              <StatsCard title="Ratings" value={totalRatings} icon="⭐" />
            </div>
            {/* Friends */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">👥 Friends ({friendList.length})</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {friendList.length > 0 ? friendList.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">{f.receiver?.username?.substring(0, 2).toUpperCase()}</div>
                    <span className="font-bold text-gray-700">{f.receiver?.username}</span>
                    <span className="text-xs text-gray-500 capitalize ml-auto">{f.status}</span>
                  </div>
                )) : <p className="text-gray-400 text-center py-4">No friends yet.</p>}
              </div>
            </div>
          </div>
          {/* Search */}
          <div className="lg:col-span-4 h-full">
            <UserSearch />
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div>
          <h3 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2">📝 Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((item: any, idx: number) => (
              <div key={idx} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-5 hover:shadow-md transition">
                <img src={item.movies?.poster_url || ""} className="w-14 h-20 rounded-lg object-cover" alt="Poster" />
                <div>
                  <p className="font-bold text-lg text-gray-800">{item.movies?.title || "Unknown"}</p>
                  <p className="text-sm text-indigo-500 font-medium">Added to {item.list_type}</p>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-8">No recent actions.</p>}
          </div>
        </div>

        {/* LISTS */}
        <div className="space-y-16 pt-6">
          <ListPreview title="Favorites" movies={favorites} icon="❤️" />
          <ListPreview title="Watched" movies={watchedList} icon="✅" />
          <ListPreview title="Wishlist" movies={wishlist} icon="🎁" />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, truncate }: any) {
  return <div className="bg-white border border-gray-200 p-5 rounded-2xl text-center shadow-sm"><span className="text-3xl block mb-2">{icon}</span><p className={`text-2xl font-bold ${truncate ? 'truncate' : ''}`}>{value}</p><p className="text-gray-400 text-xs font-bold uppercase mt-1">{title}</p></div>;
}

function ListPreview({ title, movies, icon }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><span>{icon}</span> {title}</h3>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {movies.length > 0 ? movies.map((m: any, i: number) => (
          <div key={i} className="flex-shrink-0 w-36"><img src={m.poster_url || ""} className="w-full h-52 object-cover rounded-xl shadow-md" /><p className="mt-2 text-sm font-bold truncate text-center">{m.title}</p></div>
        )) : <p className="text-gray-400 w-full text-center py-8 bg-gray-50 rounded-xl border border-dashed">Empty list.</p>}
      </div>
    </div>
  );
}