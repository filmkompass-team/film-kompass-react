import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import { FriendService } from "../services/friendService";

export default function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [lists, setLists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [friendStatus, setFriendStatus] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [totalMovies, setTotalMovies] = useState(0);
    const [friendList, setFriendList] = useState<any[]>([]);

    useEffect(() => {
        if (userId) loadPageData();
    }, [userId]);

    const loadPageData = async () => {
        // HATA ÇÖZÜMÜ: Eğer userId yoksa işlemi durdur (TypeScript hatasını çözer)
        if (!userId) return;

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            if (user && user.id === userId) {
                navigate("/profile");
                return;
            }

            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
            setProfile(profileData);

            let status = null;
            if (user) {
                status = await FriendService.checkFriendshipStatus(user.id, userId);
                setFriendStatus(status);
            }

            if (status === 'accepted') {
                const { data: userLists } = await supabase.from('lists').select('*, list_items(count)').eq('owner_id', userId);
                setLists(userLists || []);
                let count = 0;
                (userLists || []).forEach((l: any) => { if (l.list_items && l.list_items[0]) count += l.list_items[0].count; });
                setTotalMovies(count);
                const friends = await FriendService.getFriends(userId);
                setFriendList(friends || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async () => {
        if (!currentUserId || !userId) return alert("Please login first.");
        try {
            await FriendService.sendFriendRequest(currentUserId, userId);
            setFriendStatus('pending');
        } catch (error) {
            alert("Error sending request.");
        }
    };

    const handleCancelRequest = async () => {
        if (!currentUserId || !userId) return;
        try {
            await FriendService.cancelFriendRequest(currentUserId, userId);
            setFriendStatus(null);
        } catch (error) {
            alert("Failed to cancel.");
        }
    };

    const handleRemoveFriend = async () => {
        if (confirm("Unfriend this user?")) {
            setFriendStatus(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!profile) return <div className="p-10 text-center">User not found.</div>;

    const isFriend = friendStatus === 'accepted';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-600 p-8 md:p-12 rounded-3xl shadow-2xl text-white relative overflow-hidden m-4 md:m-8">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    <div className="relative group">
                        <img src={profile.avatar_url || "https://via.placeholder.com/150"} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white/20 object-cover shadow-2xl" />
                        {!isFriend && <div className="absolute bottom-2 right-2 bg-gray-900 text-white p-2 rounded-full border border-white shadow-lg text-lg">🔒</div>}
                    </div>
                    <div className="flex flex-col gap-4">
                        <div><h1 className="text-4xl md:text-5xl font-bold mb-2">{profile.username}</h1><p className="text-purple-200 text-lg font-medium">{isFriend ? "Movie Enthusiast 🎬" : "Private Account"}</p></div>
                        <div className="flex justify-center md:justify-start gap-3 mt-2">
                            {friendStatus === 'accepted' ? (
                                <>
                                    <button className="bg-white text-purple-900 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 cursor-default">Friends ✅</button>
                                    <button onClick={handleRemoveFriend} className="bg-purple-800/50 hover:bg-purple-900/50 text-white px-5 py-3 rounded-xl font-bold transition text-sm border border-purple-400/30">Unfriend</button>
                                </>
                            ) : friendStatus === 'pending' ? (
                                <button onClick={handleCancelRequest} className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-red-600 transition"><span>⏳ Request Sent</span><span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">Cancel ✕</span></button>
                            ) : (
                                <button onClick={handleSendRequest} className="bg-white text-purple-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition flex items-center gap-2 transform active:scale-95">Add Friend ➕</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                {!isFriend ? (
                    <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-100 flex flex-col items-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-6"><div className="text-7xl">🔒</div></div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-3">This Account is Private</h2>
                        <p className="text-gray-500 max-w-lg mx-auto mb-8 text-lg">You need to be friends with <span className="font-bold text-gray-800">{profile.username}</span> to see their content.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center"><span className="text-4xl mb-3 block">📺</span><div className="text-3xl font-bold text-gray-900">{totalMovies}</div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Movies Watched</div></div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center"><span className="text-4xl mb-3 block">🍿</span><div className="text-3xl font-bold text-gray-900">Unknown</div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Fav Genre</div></div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center"><span className="text-4xl mb-3 block">⭐</span><div className="text-3xl font-bold text-gray-900">0</div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Ratings</div></div>
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100"><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">👥 Friends ({friendList.length})</h3><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{friendList.map(f => (<div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-purple-50 transition cursor-pointer" onClick={() => navigate(`/user/${f.friend?.id}`)}><img src={f.friend?.avatar_url || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full object-cover" /><span className="font-bold text-gray-700 truncate">{f.friend?.username}</span></div>))}</div></div>
                    </div>
                )}
            </div>
        </div>
    );
}