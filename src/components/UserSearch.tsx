import { useState, useEffect } from "react";
import { FriendService, type Profile } from "../services/friendService";

export default function UserSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    // OTOMATİK ARAMA (DEBOUNCE)
    useEffect(() => {
        // 1. Eğer kutu boşsa sonuçları temizle ve bekleme
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // 2. Kullanıcı yazmayı bitirene kadar bekle (300ms)
        const timeoutId = setTimeout(async () => {
            try {
                const users = await FriendService.searchUsers(query);
                setResults(users);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);

        // 3. Eğer 300ms dolmadan yeni harfe basarsa sayacı sıfırla
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleAdd = async (userId: string) => {
        try {
            await FriendService.sendFriendRequest(userId);
            alert("Friend request sent! ✅");
        } catch (err) {
            console.error(err);
            alert("Error sending request.");
        }
    };

    return (
        <div className="w-full relative z-50"> {/* Z-index ile üstte kalmasını sağladık */}

            {/* 1. HEADER (Sadece burası görünür) */}
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
                    {/* Arama İkonu veya Loading Spinner */}
                    <div className="absolute left-3 top-3.5 text-indigo-200">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span>👤</span>
                        )}
                    </div>

                    {/* Temizleme Butonu (X) */}
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

            {/* 2. AÇILIR LİSTE (Sadece yazı yazınca görünür) */}
            {query && (
                <div className="bg-white border-x border-b border-gray-200 rounded-b-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 absolute w-full">
                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                        {results.length > 0 ? (
                            results.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-indigo-50 rounded-xl transition group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                            {user.username?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                        <span className="font-bold text-gray-700 text-sm group-hover:text-indigo-600">
                                            {user.username}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleAdd(user.id)}
                                        className="text-xs bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition font-bold shadow-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))
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