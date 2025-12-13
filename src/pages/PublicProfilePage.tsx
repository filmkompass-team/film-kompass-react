import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../utils/supabase";
import { FriendService } from "../services/friendService";

export default function PublicProfilePage() {
    const { userId } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [friendStatus, setFriendStatus] = useState<string>("none");
    const [loadingAction, setLoadingAction] = useState(false);

    // İstatistikler & Listeler
    const [totalWatched, setTotalWatched] = useState(0);
    const [favoriteGenre, setFavoriteGenre] = useState("Unknown");
    const [totalRatings, setTotalRatings] = useState(0);
    const [friendList, setFriendList] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [watchedList, setWatchedList] = useState<any[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);

    useEffect(() => {
        if (!userId) return;

        const loadData = async () => {
            // 1. Mevcut Kullanıcı ve İlişki Durumu
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            let status = "none";

            if (currentUser) {
                setCurrentUserId(currentUser.id);
                if (currentUser.id !== userId) {
                    try {
                        status = await FriendService.getFriendshipStatus(currentUser.id, userId);
                        setFriendStatus(status);
                    } catch (e) { console.log("Servis hatası"); }
                } else {
                    // Kendi profiline bakıyorsa arkadaş gibi davran (her şeyi gör)
                    status = "friends";
                    setFriendStatus("self");
                }
            }

            // 2. Profil Bilgisi (Herkese Açık)
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
            setProfile(profileData);

            // --- GİZLİLİK KONTROLÜ ---
            // Sadece arkadaşsak veya kendimizsek verileri çek
            if (status === 'friends' || status === 'self') {
                // 3. İstatistikler
                const { data: ratings } = await supabase.from("ratings").select("id").eq("user_id", userId);
                setTotalRatings(ratings?.length || 0);

                const { data: watched } = await supabase.from("user_movie_lists").select("movie_id").eq("user_id", userId).eq("list_type", "watched");
                setTotalWatched(watched?.length || 0);

                const { data: genreData } = await supabase.from("user_movie_lists").select("movie_id, movies(genres)").eq("user_id", userId).eq("list_type", "watched");
                if (genreData) {
                    const genreCount: Record<string, number> = {};
                    genreData.forEach((item: any) => {
                        const genres = item.movies?.genres;
                        if (Array.isArray(genres)) genres.forEach((g: string) => genreCount[g] = (genreCount[g] || 0) + 1);
                    });
                    setFavoriteGenre(Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown");
                }

                // 4. Arkadaş Listesi
                const friends = await FriendService.getFriends(userId);
                setFriendList(friends || []);

                // 5. Film Listeleri
                const loadList = async (type: string) => {
                    const { data } = await supabase.from("user_movie_lists").select("movies(title, poster_url)").eq("user_id", userId).eq("list_type", type);
                    return data ? data.map((d: any) => d.movies) : [];
                };

                setFavorites(await loadList("favorites"));
                setWatchedList(await loadList("watched"));
                setWishlist(await loadList("wishlist"));
            }
        };

        loadData();
    }, [userId]);

    // --- AKSİYONLAR ---
    const handleAddFriend = async () => {
        if (!userId) return;
        setLoadingAction(true);
        try { await FriendService.sendFriendRequest(userId); setFriendStatus("request_sent"); }
        catch (err) { alert("İstek gönderilemedi."); } finally { setLoadingAction(false); }
    };

    const handleCancelRequest = async () => {
        if (!userId) return;
        setLoadingAction(true);
        try { await FriendService.cancelFriendRequest(userId); setFriendStatus("none"); }
        catch (err) { alert("İptal edilemedi."); } finally { setLoadingAction(false); }
    };

    const handleRemoveFriend = async () => {
        if (!userId || !confirm("Emin misin?")) return;
        setLoadingAction(true);
        try {
            await FriendService.removeFriend(userId);
            setFriendStatus("none");
            // Verileri temizle (Gizlilik modu devreye girsin)
            setTotalWatched(0); setFavorites([]); setWatchedList([]);
        }
        catch (err) { alert("Silinemedi."); } finally { setLoadingAction(false); }
    };

    if (!profile) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div></div>;

    // Gizlilik Kontrolü: Arkadaş mı? (Veya kendisi mi?)
    const canViewContent = friendStatus === 'friends' || friendStatus === 'self';

    return (
        <div className="min-h-screen bg-white text-gray-800 p-4 md:p-8 pb-24">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* HEADER (ProfilePage ile aynı tasarım) */}
                <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-white/30 rounded-full blur opacity-50"></div>
                        <img src={profile.avatar_url || "https://via.placeholder.com/150"} className="relative w-32 h-32 rounded-full border-4 border-white/20 object-cover shadow-xl" />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-3 z-10">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">{profile.username}</h1>
                            <p className="text-indigo-100/80 text-sm">{profile.email}</p>
                        </div>

                        {/* Buton Alanı */}
                        {currentUserId && currentUserId !== userId && (
                            <div className="mt-4 flex justify-center md:justify-start">
                                {friendStatus === 'none' && (
                                    <button onClick={handleAddFriend} disabled={loadingAction} className="bg-white text-indigo-700 px-6 py-2 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2">
                                        {loadingAction ? "..." : "Add Friend +"}
                                    </button>
                                )}
                                {friendStatus === 'request_sent' && (
                                    <button onClick={handleCancelRequest} disabled={loadingAction} className="bg-indigo-800/50 text-indigo-100 border border-indigo-400/30 px-6 py-2 rounded-xl font-bold hover:bg-indigo-800 transition shadow-lg">
                                        {loadingAction ? "..." : "Cancel Request ✕"}
                                    </button>
                                )}
                                {friendStatus === 'friends' && (
                                    <div className="flex items-center gap-3">
                                        <span className="bg-green-400/20 text-green-100 px-4 py-2 rounded-xl font-bold border border-green-400/30 backdrop-blur-sm">Friends ✅</span>
                                        <button onClick={handleRemoveFriend} disabled={loadingAction} className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-xl font-bold hover:bg-red-500/80 hover:border-red-500/0 transition">
                                            {loadingAction ? "..." : "Unfriend"}
                                        </button>
                                    </div>
                                )}
                                {friendStatus === 'request_received' && (
                                    <div className="bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm">
                                        👋 Sent you a request!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- İÇERİK (Gizlilik Kontrolü) --- */}
                {canViewContent ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Tek sütun veya genişletilmiş alan */}
                            <div className="lg:col-span-12 space-y-8">
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <StatsCard title="Watched" value={totalWatched} icon="🎬" />
                                    <StatsCard title="Fav Genre" value={favoriteGenre} icon="🍿" truncate />
                                    <StatsCard title="Ratings" value={totalRatings} icon="⭐" />
                                </div>

                                {/* Arkadaş Listesi */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-xl font-bold mb-4">👥 Friends ({friendList.length})</h3>
                                    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                                        {friendList.length > 0 ? friendList.map((f: any) => (
                                            <div key={f.id} className="flex-shrink-0 flex flex-col items-center w-20 group cursor-default">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mb-2 shadow-md group-hover:scale-105 transition">
                                                    {f.receiver?.username?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-xs text-center truncate w-full font-medium text-gray-700">{f.receiver?.username}</span>
                                            </div>
                                        )) : <span className="text-gray-400 text-sm">No friends added yet.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Listeler */}
                        <div className="space-y-16 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ListPreview title="Favorites" movies={favorites} icon="❤️" />
                            <ListPreview title="Watched" movies={watchedList} icon="✅" />
                            <ListPreview title="Wishlist" movies={wishlist} icon="🎁" />
                        </div>
                    </>
                ) : (
                    // --- GİZLİ PROFİL UYARISI ---
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-4xl text-gray-400 mb-2">
                            🔒
                        </div>
                        <h2 className="text-2xl font-bold text-gray-700">This Account is Private</h2>
                        <p className="text-gray-500 max-w-md">
                            You need to be friends with <span className="font-bold text-gray-700">{profile.username}</span> to see their movie lists, stats, and friends.
                        </p>
                        {/* İpucu: Yukarıdaki butona basması için yönlendirme */}
                        {friendStatus === 'none' && (
                            <p className="text-indigo-600 text-sm font-bold animate-pulse">
                                ☝️ Add them as a friend above!
                            </p>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

// Yardımcılar (Değişiklik yok)
function StatsCard({ title, value, icon, truncate }: any) {
    return <div className="bg-white border border-gray-200 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition"><span className="text-4xl block mb-2">{icon}</span><p className={`text-3xl font-bold text-gray-800 ${truncate ? 'truncate' : ''}`}>{value}</p><p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">{title}</p></div>;
}

function ListPreview({ title, movies, icon }: any) {
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="bg-indigo-100 p-2 rounded-lg text-xl">{icon}</span> {title}
            </h3>
            <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-2 custom-scrollbar snap-x">
                {movies.length > 0 ? movies.map((m: any, i: number) => (
                    <div key={i} className="snap-start flex-shrink-0 w-40 group">
                        <div className="rounded-xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300">
                            <img src={m.poster_url} className="w-full h-60 object-cover" />
                        </div>
                        <p className="mt-3 text-sm font-bold truncate text-center text-gray-700 group-hover:text-indigo-700 transition">{m.title}</p>
                    </div>
                )) : (
                    <div className="w-full py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 text-sm">
                        User hasn't added any movies to this list.
                    </div>
                )}
            </div>
        </div>
    );
}