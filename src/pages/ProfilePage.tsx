import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import { FriendService } from "../services/friendService";
import { ListService } from "../services/listService";
import { UserService } from "../services/userService";
import UserSearch from "../components/UserSearch";
import ShareListModal from "../components/ShareListModal";

const AVAILABLE_AVATARS = Array.from(
  { length: 24 },
  (_, i) => `/src/assets/avatars/${i}.png`
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isSavingUsername, setIsSavingUsername] = useState<boolean>(false);

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);

  // Statistics State
  const [totalWatched, setTotalWatched] = useState<number>(0);
  const [favoriteGenre, setFavoriteGenre] = useState<string>("Unknown");
  const [totalRatings, setTotalRatings] = useState<number>(0);

  // Data State
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [friendList, setFriendList] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  // List State
  const [customLists, setCustomLists] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Share Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // ---- DATA FETCHING ----
  const loadProfileData = async (userId: string) => {
    // 1. Statistics
    const { data: ratings } = await supabase
      .from("ratings")
      .select("id")
      .eq("user_id", userId);
    setTotalRatings(ratings?.length || 0);

    const { data: watched } = await supabase
      .from("user_movie_lists")
      .select("movie_id")
      .eq("user_id", userId)
      .eq("list_type", "watched");
    setTotalWatched(watched?.length || 0);

    // 2. Favorite Genre
    const { data: genreData } = await supabase
      .from("user_movie_lists")
      .select("movie_id, movies(genres)")
      .eq("user_id", userId)
      .eq("list_type", "watched");

    if (genreData) {
      const genreCount: Record<string, number> = {};
      genreData.forEach((item: any) => {
        const genres = item.movies?.genres;
        if (Array.isArray(genres)) {
          genres.forEach(
            (g: string) => (genreCount[g] = (genreCount[g] || 0) + 1)
          );
        }
      });
      setFavoriteGenre(
        Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "Unknown"
      );
    }

    // 3. Recent Activity
    const { data: recent } = await supabase
      .from("user_movie_lists")
      .select("movie_id, list_type, created_at, movies(title, poster_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentActivity(recent || []);

    // 4. Friends & Requests
    const friends = await FriendService.getFriends(userId);
    setFriendList(friends || []);
    const requests = await FriendService.getIncomingRequests(userId);
    setIncomingRequests(requests || []);

    // 5. Custom Lists
    setLoadingLists(true);
    try {
      const myLists = await ListService.getMyLists();
      setCustomLists(myLists);
    } catch (error) {
      console.error("List fetch error:", error);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      setUsername(
        user.user_metadata?.username || user.email?.split("@")[0] || "User"
      );
      setAvatarUrl(
        user.user_metadata?.avatar_url || "https://via.placeholder.com/150"
      );

      await loadProfileData(user.id);
    };
    init();
  }, []);

  // ---- ACTIONS ----
  const handleUsernameSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingUsername(true);
    try {
      await UserService.updateUsername(user.id, username);
      alert("Username updated!");
    } catch (error) {
      console.error("Username update failed", error);
      alert("Failed to update username.");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleAvatarSelect = async (newUrl: string) => {
    if (!user) return;
    try {
      setAvatarUrl(newUrl);
      setIsAvatarModalOpen(false);
      await UserService.updateAvatar(user.id, newUrl);
    } catch (error) {
      console.error("Avatar update failed", error);
      alert("Failed to update avatar.");
    }
  };

  const handleAccept = async (id: string, requesterId: string) => {
    await FriendService.acceptFriendRequest(id, requesterId);
    loadProfileData(user.id);
  };

  const handleReject = async (id: string) => {
    if (confirm("Reject request?")) {
      await FriendService.rejectFriendRequest(id);
      loadProfileData(user.id);
    }
  };

  // YENİ: ARKADAŞ SİLME FONKSİYONU
  const handleRemoveFriend = async (
    friendshipId: string,
    friendName: string
  ) => {
    if (
      confirm(
        `${friendName} adlı kişiyi arkadaşlıktan çıkarmak istediğine emin misin?`
      )
    ) {
      try {
        await FriendService.removeFriend(friendshipId);
        // Listeyi yenile
        loadProfileData(user.id);
      } catch (error) {
        console.error(error);
        alert("Silme işlemi başarısız oldu.");
      }
    }
  };

  const handleCreateList = async () => {
    const title = prompt(
      "Enter a name for your new list (e.g., 'Horror Night 🎃'):"
    );
    if (!title) return;

    try {
      await ListService.createList(title);
      alert("List created! 🎉");
      loadProfileData(user.id);
    } catch (error) {
      alert("Error creating list.");
      console.error(error);
    }
  };

  const handleOpenShareModal = (listId: string) => {
    setSelectedListId(listId);
    setIsModalOpen(true);
  };

  if (!user)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-gray-800 p-4 md:p-8 pb-24 relative">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl text-white">
          {/* SELECT AVATAR */}
          <div
            className="relative group cursor-pointer"
            onClick={() => setIsAvatarModalOpen(true)}
          >
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white/20 object-cover shadow-xl group-hover:opacity-80 transition"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="bg-black/50 p-1 rounded text-xs">Edit</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-bold">{username}</h1>
              <p className="text-indigo-100/80 text-sm">{user.email}</p>
            </div>
            <form
              onSubmit={handleUsernameSave}
              className="flex gap-3 justify-center md:justify-start"
            >
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 w-full md:w-64"
              />
              <button
                type="submit"
                disabled={isSavingUsername}
                className="px-5 py-2 rounded-xl bg-white text-indigo-700 font-bold hover:bg-gray-100"
              >
                Save
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN (Main Content) */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. STATISTICS */}
            <div className="grid grid-cols-3 gap-4">
              <StatsCard title="Watched" value={totalWatched} icon="🎬" />
              <StatsCard
                title="Fav Genre"
                value={favoriteGenre}
                icon="🍿"
                truncate
              />
              <StatsCard title="Ratings" value={totalRatings} icon="⭐" />
            </div>

            {/* 2. LISTS AREA */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  📂 My Collections
                </h3>
                <button
                  onClick={handleCreateList}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
                >
                  + Create List
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Standard System Lists */}
                <Link
                  to="/my-lists/favorites"
                  className="group bg-gradient-to-br from-pink-500 to-rose-600 text-white p-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition text-5xl">
                    ❤️
                  </div>
                  <h4 className="font-bold text-lg">Favorites</h4>
                  <p className="text-pink-100 text-sm mt-1">
                    Your all-time bests
                  </p>
                </Link>

                <Link
                  to="/my-lists/watched"
                  className="group bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition text-5xl">
                    ✅
                  </div>
                  <h4 className="font-bold text-lg">Watched</h4>
                  <p className="text-blue-100 text-sm mt-1">
                    {totalWatched} movies
                  </p>
                </Link>

                <Link
                  to="/my-lists/wishlist"
                  className="group bg-gradient-to-br from-amber-400 to-orange-500 text-white p-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition text-5xl">
                    🎁
                  </div>
                  <h4 className="font-bold text-lg">Wishlist</h4>
                  <p className="text-amber-100 text-sm mt-1">Watch later</p>
                </Link>

                {/* User's Custom Lists */}
                {customLists.map((list) => (
                  <Link
                    key={list.id}
                    to={`/lists/${list.id}`}
                    className={`group bg-white border-2 border-dashed ${list.isCollaborative
                      ? "border-blue-200 bg-blue-50"
                      : "border-indigo-100"
                      } p-5 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer relative flex flex-col justify-between`}
                  >
                    {/* Top Section */}
                    <div>
                      {list.isCollaborative && (
                        <div
                          className="absolute top-3 right-3 text-lg"
                          title="Shared with you"
                        >
                          👥
                        </div>
                      )}
                      <div className="text-3xl mb-2">📁</div>
                      <h4 className="font-bold text-gray-800 truncate pr-4">
                        {list.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <span>{list.list_items?.[0]?.count || 0} Items</span>
                        {list.isCollaborative && <span>• Shared</span>}
                      </div>
                    </div>

                    {/* SHARE BUTTON (Visible only if we are the owner) */}
                    {!list.isCollaborative && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenShareModal(list.id);
                        }}
                        className="mt-4 w-full bg-green-100 text-green-700 py-1 rounded-lg text-xs font-bold hover:bg-green-200 transition flex items-center justify-center gap-1"
                      >
                        🤝 Share
                      </button>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. INCOMING REQUESTS */}
            {incomingRequests.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-lg font-bold text-indigo-800 mb-3">
                  🔔 Friend Requests
                </h3>
                <div className="space-y-3">
                  {incomingRequests.map((req: any) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-100"
                    >
                      <span className="font-bold text-gray-700">
                        {req.requester?.username}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req.id, req.requester.id)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="bg-white border text-gray-500 px-3 py-1 rounded-lg text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FRIEND LIST (GÜNCELLENDİ) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">
                👥 Friends ({friendList.length})
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {friendList.length > 0 ? (
                  friendList.map((f: any) => (
                    // Dış Div (Kapsayıcı)
                    <div
                      key={f.id}
                      className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                    >
                      {/* TIKLANABİLİR ALAN (Profil Gitme) */}
                      <div
                        onClick={() => navigate(`/user/${f.receiver_id}`)}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                          {/* Friend Avatar */}
                          {f.receiver?.avatar_url ? (
                            <img
                              src={f.receiver.avatar_url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            f.receiver?.username?.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className="font-bold text-gray-700 hover:text-indigo-600 transition">
                          {f.receiver?.username}
                        </span>
                      </div>

                      {/* SİLME BUTONU */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Profile gitmeyi engelle
                          handleRemoveFriend(f.id, f.receiver?.username);
                        }}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Arkadaşlıktan Çıkar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                          <path
                            fillRule="evenodd"
                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No friends yet.
                  </p>
                )}
              </div>
            </div>

            {/* 5. RECENT ACTIVITY */}
            <div>
              <h3 className="text-2xl font-bold mb-4">📝 Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-100 p-3 rounded-xl flex items-center gap-4"
                  >
                    <img
                      src={item.movies?.poster_url}
                      className="w-10 h-14 rounded object-cover"
                    />
                    <div>
                      <p className="font-bold text-sm">
                        {item.movies?.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        Added to {item.list_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Search) */}
          <div className="lg:col-span-4 h-full z-0 relative">
            <UserSearch />
          </div>
        </div>
      </div>

      {/* SHARE LIST MODAL */}
      {isModalOpen && selectedListId && (
        <ShareListModal
          listId={selectedListId}
          friends={friendList}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedListId(null);
          }}
          onSuccess={() => {
            loadProfileData(user.id);
          }}
        />
      )}

      {/* AVATAR SELECTION MODAL */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl relative animate-fade-in-down">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Choose an Avatar
              </h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {AVAILABLE_AVATARS.map((avatar, index) => (
                <div
                  key={index}
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`cursor-pointer rounded-full overflow-hidden border-4 transition hover:scale-105 ${avatarUrl === avatar
                    ? "border-indigo-600 scale-105"
                    : "border-transparent hover:border-gray-200"
                    }`}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ title, value, icon, truncate }: any) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-2xl text-center shadow-sm">
      <span className="text-3xl block mb-2">{icon}</span>
      <p className={`text-2xl font-bold ${truncate ? "truncate" : ""}`}>
        {value}
      </p>
      <p className="text-gray-400 text-xs font-bold uppercase mt-1">
        {title}
      </p>
    </div>
  );
}