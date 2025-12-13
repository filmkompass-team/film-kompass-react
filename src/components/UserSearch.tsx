import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <--- 1. BU LAZIM
import supabase from "../utils/supabase";
import { FriendService, type Profile } from "../services/friendService";

export default function UserSearch() {
    const navigate = useNavigate(); // <--- 2. BU LAZIM
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    const [pendingUsers, setPendingUsers] = useState<Set<string>>(new Set());
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const initData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                const sentIds = await FriendService.getSentRequests(user.id);
                setPendingUsers(new Set(sentIds));
            }
        };
        initData();
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timeoutId = setTimeout(async () => {
            try {
                const users = await FriendService.searchUsers(query);
                const filtered = users.filter(u => u.id !== currentUserId); // Kendimizi gizle
                setResults(filtered);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, currentUserId]);

    const handleAdd = async (userId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Satıra tıklamayı engelle (Sadece butona basılsın)
        setPendingUsers(prev => new Set(prev).add(userId));
        try {
            await FriendService.sendFriendRequest(userId);
        } catch (err) {
            alert("Hata.");
            setPendingUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
        }
    };

    const handleCancel = async (userId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Satıra tıklamayı engelle
        setPendingUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
        try {
            await FriendService.cancelFriendRequest(userId);
        } catch (err) {
            alert("Hata.");
            setPendingUsers(prev => new Set(prev).add(userId));
        }
    };

    // --- YÖNLENDİRME FONKSİYONU ---
    const handleUserClick = (userId: string) => {
        setQuery(""); // Giderken aramayı kapat
        navigate(`/user/${userId}`); // <--- PROFİLE GÖTÜREN KOD
    };

    return (
        <div className="w-full relative z-50">

            {/* HEADER */}
            <div className={`bg-gradient-to-r from-indigo-600 to-purple-700 p-6 shadow-xl transition-all duration-300 ${query ? 'rounded-t-3xl' : 'rounded-3xl'}`}>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    Find Friends 🔍
                </h3>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Start typing username..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-200 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:bg-white/20 transition"
                    />
                    <div className="absolute left-3 top-3.5 text-indigo-200">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span>👤</span>
                        )}
                    </div>
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-3 text-white/50 hover:text-white transition"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* SONUÇLAR LİSTESİ */}
            {query && (
                <div className="bg-white border-x border-b border-gray-200 rounded-b-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 absolute w-full">
                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {results.length > 0 ? (
                            results.map(user => {
                                const isPending = pendingUsers.has(user.id);
                                return (
                                    // --- İŞTE BURASI ÇOK ÖNEMLİ ---
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserClick(user.id)} // <--- 3. TIKLAYINCA GİT
                                        className="flex items-center justify-between p-3 hover:bg-indigo-50 rounded-xl transition group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    user.username?.charAt(0).toUpperCase() || "?"
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm group-hover:text-indigo-600">
                                                {user.username}
                                            </span>
                                        </div>

                                        {/* Butonlarda e.stopPropagation() olduğu için bunlar sayfayı değiştirmez */}
                                        {isPending ? (
                                            <button
                                                onClick={(e) => handleCancel(user.id, e)}
                                                className="text-xs bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition font-bold shadow-sm flex items-center gap-1"
                                            >
                                                Cancel ✕
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => handleAdd(user.id, e)}
                                                className="text-xs bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition font-bold shadow-sm flex items-center gap-1"
                                            >
                                                Add +
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            !loading && (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    No users found named "{query}"
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}