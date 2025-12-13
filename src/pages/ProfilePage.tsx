import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import { FriendService } from "../services/friendService";
import { ListService } from '../services/listService';
import UserSearch from "../components/UserSearch";
// 1. IMPORT EKLENDİ
import ShareListModal from '../components/ShareListModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [isSavingUsername, setIsSavingUsername] = useState<boolean>(false);

  // İstatistikler
  const [totalWatched, setTotalWatched] = useState<number>(0);
  const [favoriteGenre, setFavoriteGenre] = useState<string>("Unknown");
  const [totalRatings, setTotalRatings] = useState<number>(0);

  // Veriler
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [friendList, setFriendList] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  // LİSTELER
  const [customLists, setCustomLists] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // 2. MODAL STATE'LERİ EKLENDİ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // ---- VERİ ÇEKME ----
  const loadProfileData = async (userId: string) => {
    // 1. İstatistikler
    const { data: ratings } = await supabase.from("ratings").select("id").eq("user_id", userId);
    setTotalRatings(ratings?.length || 0);

    const { data: watched } = await supabase.from("user_movie_lists").select("movie_id").eq("user_id", userId).eq("list_type", "watched");
    setTotalWatched(watched?.length || 0);

    // 2. Favori Tür
    const { data: genreData } = await supabase.from("user_movie_lists").select("movie_id, movies(genres)").eq("user_id", userId).eq("list_type", "watched");
    if (genreData) {
      const genreCount: Record<string, number> = {};
      genreData.forEach((item: any) => {
        const genres = item.movies?.genres;
        if (Array.isArray(genres)) genres.forEach((g: string) => genreCount[g] = (genreCount[g] || 0) + 1);
      });
      setFavoriteGenre(Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown");
    }

    // 3. Son Aktiviteler
    const { data: recent } = await supabase.from("user_movie_lists").select("movie_id, list_type, created_at, movies(title, poster_url)").eq("user_id", userId).order("created_at", { ascending: false }).limit(5);
    setRecentActivity(recent || []);

    // 4. Arkadaşlar ve İstekler
    const friends = await FriendService.getFriends(userId);
    setFriendList(friends || []);
    const requests = await FriendService.getIncomingRequests(userId);
    setIncomingRequests(requests || []);

    // 5. ÖZEL LİSTELERİ ÇEK
    setLoadingLists(true);
    try {
      const myLists = await ListService.getMyLists();
      setCustomLists(myLists);
    } catch (error) {
      console.error("Liste çekme hatası:", error);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);
      setUsername(user.user_metadata?.username || user.email?.split("@")[0] || "User");

      await loadProfileData(user.id);
    };
    init();
  }, []);

  // ---- AKSİYONLAR ----
  const handleUsernameSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingUsername(true);
    await supabase.auth.updateUser({ data: { username } });
    await supabase.from('profiles').update({ username }).eq('id', user.id);
    setIsSavingUsername(false);
    alert("Username updated!");
  };

  const handleAccept = async (id: string, requesterId: string) => {
    await FriendService.acceptFriendRequest(id, requesterId);
    loadProfileData(user.id);
  };
  const handleReject = async (id: string) => {
    if (confirm("Reddet?")) { await FriendService.rejectFriendRequest(id); loadProfileData(user.id); }
  };

  const handleCreateList = async () => {
    const title = prompt("Enter a name for your new list (e.g., 'Horror Night 🎃'):");
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

  // 3. PAYLAŞ BUTONU FONKSİYONU
  const handleOpenShareModal = (listId: string) => {
    setSelectedListId(listId);
    setIsModalOpen(true);
  };

  if (!user) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-white text-gray-800 p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <img src={user.user_metadata?.avatar_url || "https://via.placeholder.com/150"} alt="Profile" className="relative w-32 h-32 rounded-full border-4 border-white/20 object-cover shadow-xl" />
          <div className="flex-1 text-center md:text-left space-y-4 z-10">
            <div><h1 className="text-4xl font-bold">{username}</h1><p className="text-indigo-100/80 text-sm">{user.email}</p></div>
            <form onSubmit={handleUsernameSave} className="flex gap-3 justify-center md:justify-start mt-2">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-white/10 border border-white/20 text-white placeholder-indigo-200 rounded-xl px-4 py-2 w-full md:w-64" />
              <button type="submit" disabled={isSavingUsername} className="px-5 py-2 rounded-xl bg-white text-indigo-700 font-bold hover:bg-gray-100">Save</button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SOL KOLON (Ana İçerik) */}
          <div className="lg:col-span-8 space-y-10">

            {/* 1. İSTATİSTİKLER */}
            <div className="grid grid-cols-3 gap-4">
              <StatsCard title="Watched" value={totalWatched} icon="🎬" />
              <StatsCard title="Fav Genre" value={favoriteGenre} icon="🍿" truncate />
              <StatsCard title="Ratings" value={totalRatings} icon="⭐" />
            </div>

            {/* 2. LİSTELER ALANI */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">📂 My Collections</h3>
                <button
                  onClick={handleCreateList}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
                >
                  + Create List
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Standart Sistem Listeleri */}
                <Link to="/my-lists/favorites" className="group bg-gradient-to-br from-pink-500 to-rose-600 text-white p-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition text-5xl">❤️</div>
                  <h4 className="font-bold text-lg">Favorites</h4>
                  <p className="text-pink-100 text-sm mt-1">Your all-time bests</p>
                </Link>

                <Link to="/my-lists/watched" className="group bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition text-5xl">✅</div>
                  <h4 className="font-bold text-lg">Watched</h4>
                  <p className="text-blue-100 text-sm mt-1">{totalWatched} movies</p>
                </Link>

                <Link to="/my-lists/wishlist" className="group bg-gradient-to-br from-amber-400 to-orange-500 text-white p-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition text-5xl">🎁</div>
                  <h4 className="font-bold text-lg">Wishlist</h4>
                  <p className="text-amber-100 text-sm mt-1">Watch later</p>
                </Link>

                {/* Kullanıcının Özel Listeleri */}
                {customLists.map((list) => (
                  <Link
                    key={list.id}
                    to={`/lists/${list.id}`}
                    className={`group bg-white border-2 border-dashed ${list.isCollaborative ? 'border-blue-200 bg-blue-50' : 'border-indigo-100'} p-5 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer relative flex flex-col justify-between`}
                  >

                    {/* Üst Kısım */}
                    <div>
                      {list.isCollaborative && <div className="absolute top-3 right-3 text-lg" title="Shared with you">👥</div>}
                      <div className="text-3xl mb-2">📁</div>
                      <h4 className="font-bold text-gray-800 truncate pr-4">{list.title}</h4>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <span>{list.list_items?.[0]?.count || 0} Items</span>
                        {list.isCollaborative && <span>• Shared</span>}
                      </div>
                    </div>

                    {/* PAYLAŞ BUTONU (Sadece bizim listemizse görünür) */}
                    {!list.isCollaborative && (
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Link'e tıklamayı engelle
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

            {/* 3. GELEN İSTEKLER */}
            {incomingRequests.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-lg font-bold text-indigo-800 mb-3">🔔 Friend Requests</h3>
                <div className="space-y-3">
                  {incomingRequests.map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-100">
                      <span className="font-bold text-gray-700">{req.requester?.username}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(req.id, req.requester.id)} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Confirm</button>
                        <button onClick={() => handleReject(req.id)} className="bg-white border text-gray-500 px-3 py-1 rounded-lg text-xs font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ARKADAŞ LİSTESİ */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">👥 Friends ({friendList.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {friendList.map((f: any) => (
                  <Link to={`/user/${f.receiver_id}`} key={f.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl hover:bg-indigo-50 transition border border-transparent hover:border-indigo-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {f.receiver?.username?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-700 truncate">{f.receiver?.username}</span>
                  </Link>
                ))}
                {friendList.length === 0 && <p className="text-gray-400 text-sm col-span-3">No friends yet.</p>}
              </div>
            </div>

            {/* 5. SON AKTİVİTELER */}
            <div>
              <h3 className="text-2xl font-bold mb-4">📝 Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-100 p-3 rounded-xl flex items-center gap-4">
                    <img src={item.movies?.poster_url} className="w-10 h-14 rounded object-cover" />
                    <div><p className="font-bold text-sm">{item.movies?.title}</p><p className="text-xs text-gray-400">Added to {item.list_type}</p></div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SAĞ KOLON (Arama) */}
          <div className="lg:col-span-4">
            <div className="sticky top-4"><UserSearch /></div>
          </div>
        </div>
      </div>

      {/* 4. MODAL BİLEŞENİ EKLENDİ */}
      {isModalOpen && selectedListId && (
        <ShareListModal
          listId={selectedListId}
          friends={friendList} // <--- EKLEMEMİZ GEREKEN TEK KISIM BU
          onClose={() => {
            setIsModalOpen(false);
            setSelectedListId(null);
          }}
          onSuccess={() => {
            loadProfileData(user.id);
          }}
        />
      )}
    </div>
  );
}

function StatsCard({ title, value, icon, truncate }: any) {
  return <div className="bg-white border border-gray-200 p-5 rounded-2xl text-center shadow-sm"><span className="text-3xl block mb-2">{icon}</span><p className={`text-2xl font-bold ${truncate ? 'truncate' : ''}`}>{value}</p><p className="text-gray-400 text-xs font-bold uppercase mt-1">{title}</p></div>;
}