import { useState, useEffect, useRef } from 'react';
import supabase from '../utils/supabase';
import { FriendService } from '../services/friendService';
import { useNavigate } from 'react-router-dom';

export default function UserSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);

    // Hangi kullanıcılara istek atılmış, ID'lerini tutuyoruz
    const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // 1. Mevcut kullanıcıyı al
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setCurrentUserId(data.user.id);
        });
    }, []);

    // 2. Arama Mantığı
    useEffect(() => {
        const searchUsers = async () => {
            if (query.trim().length === 0) {
                setResults([]);
                return;
            }

            if (!currentUserId) return;

            setIsSearching(true);

            // A. Kullanıcıları bul
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .ilike('username', `%${query}%`)
                .limit(5);

            const filteredProfiles = profiles?.filter(u => u.id !== currentUserId) || [];

            // B. Bu kullanıcılara daha önce istek atmış mıyız kontrol et
            if (filteredProfiles.length > 0) {
                const targetIds = filteredProfiles.map(u => u.id);

                const { data: existingRequests } = await supabase
                    .from('friends')
                    .select('receiver_id')
                    .eq('sender_id', currentUserId)
                    .eq('status', 'pending')
                    .in('receiver_id', targetIds);

                // İstek atılmış olanların ID'lerini bir kümeye (Set) koy
                const pendingSet = new Set(existingRequests?.map(r => r.receiver_id));
                setSentRequestIds(pendingSet);
            }

            setResults(filteredProfiles);
            setIsSearching(false);
        };

        const timeout = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeout);
    }, [query, currentUserId]);

    // 3. Arkadaş Ekleme (İstek Gönderme)
    const handleAdd = async (targetUserId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) return alert("Please login first.");

        // UI'ı hemen güncelle (Kullanıcı beklemesin)
        setSentRequestIds(prev => { const n = new Set(prev); n.add(targetUserId); return n; });

        try {
            await FriendService.sendFriendRequest(currentUserId, targetUserId);
        } catch (err) {
            console.error(err);
            alert("Error sending request.");
            // Hata olursa geri al
            setSentRequestIds(prev => { const n = new Set(prev); n.delete(targetUserId); return n; });
        }
    };

    // 4. İsteği İptal Etme (YENİ EKLENDİ)
    const handleCancel = async (targetUserId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) return;

        // UI'ı hemen güncelle (Cancel butonunu kaldır)
        setSentRequestIds(prev => { const n = new Set(prev); n.delete(targetUserId); return n; });

        try {
            await FriendService.cancelFriendRequest(currentUserId, targetUserId);
        } catch (err) {
            console.error(err);
            alert("Error canceling request.");
            // Hata olursa geri ekle
            setSentRequestIds(prev => { const n = new Set(prev); n.add(targetUserId); return n; });
        }
    };

    return (
        <div ref={searchContainerRef} className="relative z-50">

            {/* --- MOR ARAMA KUTUSU --- */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-xl text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🔍 Find Friends</h3>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Type a username..."
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-indigo-200 rounded-xl px-4 py-3 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition shadow-inner"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-3.5 animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    )}
                </div>
            </div>

            {/* --- SONUÇLAR (BEYAZ SAYFA) --- */}
            {query.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                    {results.length > 0 ? (
                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {results.map(user => {
                                // Bu kullanıcıya istek atılmış mı?
                                const isPending = sentRequestIds.has(user.id);

                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => navigate(`/user/${user.id}`)}
                                        className="flex items-center justify-between p-3 hover:bg-indigo-50 rounded-xl cursor-pointer group transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                alt={user.username}
                                            />
                                            <div>
                                                <p className="font-bold text-gray-800">{user.username}</p>
                                                <p className="text-xs text-gray-400">View Profile</p>
                                            </div>
                                        </div>

                                        {/* DURUMA GÖRE BUTON (ADD veya CANCEL) */}
                                        {isPending ? (
                                            <button
                                                onClick={(e) => handleCancel(user.id, e)}
                                                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-red-200"
                                            >
                                                Cancel
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => handleAdd(user.id, e)}
                                                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                                            >
                                                Add +
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-400">
                            {!isSearching && <p>No users found named "{query}"</p>}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}