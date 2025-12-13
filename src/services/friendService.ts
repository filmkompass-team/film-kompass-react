import supabase from "../utils/supabase";

export interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
}

export const FriendService = {
    // --- MEVCUT FONKSİYONLAR ---

    async searchUsers(query: string) {
        if (!query) return [];
        const { data, error } = await supabase.from('profiles').select('*').ilike('username', `%${query}%`).limit(5);
        if (error) return [];
        return data as Profile[];
    },

    async sendFriendRequest(receiverId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Giriş yapmalısın!");

        const { error } = await supabase.from('friendships').insert({ requester_id: user.id, receiver_id: receiverId, status: 'pending' });
        if (error) throw error;
    },

    async cancelFriendRequest(receiverId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase.from('friendships').delete().eq('requester_id', user.id).eq('receiver_id', receiverId).eq('status', 'pending');
        if (error) throw error;
    },

    async getSentRequests(userId: string) {
        const { data, error } = await supabase.from('friendships').select('receiver_id').eq('requester_id', userId).eq('status', 'pending');
        if (error) return [];
        return data.map(row => row.receiver_id);
    },

    async getIncomingRequests(userId: string) {
        const { data, error } = await supabase.from('friendships').select(`id, requester:requester_id (id, username, avatar_url)`).eq('receiver_id', userId).eq('status', 'pending');
        if (error) return [];
        return data;
    },

    async acceptFriendRequest(friendshipId: string, requesterId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error: updateError } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
        if (updateError) throw updateError;
        const { error: insertError } = await supabase.from('friendships').insert({ requester_id: user.id, receiver_id: requesterId, status: 'accepted' });
    },

    async rejectFriendRequest(friendshipId: string) {
        const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
        if (error) throw error;
    },

    async getFriends(userId: string) {
        const { data, error } = await supabase.from('friendships').select(`id, status, receiver:receiver_id (username, avatar_url)`).eq('requester_id', userId).eq('status', 'accepted');
        if (error) return [];
        return data;
    },

    // --- 🆕 YENİ EKLENENLER (Public Profile İçin) ---

    // 1. İki kişi arasındaki ilişki durumunu getir
    async getFriendshipStatus(myId: string, targetId: string) {
        // A. Ben istek attım mı? (veya arkadaş mıyız?)
        const { data: myRequest } = await supabase
            .from('friendships')
            .select('status')
            .eq('requester_id', myId)
            .eq('receiver_id', targetId)
            .maybeSingle();

        if (myRequest) {
            if (myRequest.status === 'accepted') return 'friends';
            if (myRequest.status === 'pending') return 'request_sent';
        }

        // B. O bana istek atmış mı?
        const { data: theirRequest } = await supabase
            .from('friendships')
            .select('status')
            .eq('requester_id', targetId)
            .eq('receiver_id', myId)
            .maybeSingle();

        if (theirRequest) {
            if (theirRequest.status === 'pending') return 'request_received';
            // 'accepted' durumu zaten yukarıda yakalanır (çift kayıt olduğu için)
        }

        return 'none'; // Hiçbir ilişki yok
    },

    // 2. Arkadaşlıktan Çıkar (Her iki taraftan da siler)
    async removeFriend(targetId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Hem benim onla, hem onun benle olan tüm kayıtlarını sil
        const { error } = await supabase
            .from('friendships')
            .delete()
            .or(`and(requester_id.eq.${user.id},receiver_id.eq.${targetId}),and(requester_id.eq.${targetId},receiver_id.eq.${user.id})`);

        if (error) throw error;
    }
};