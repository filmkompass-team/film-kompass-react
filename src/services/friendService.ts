import supabase from "../utils/supabase";

export const FriendService = {
    // 1. Arkadaşları Getir
    async getFriends(userId: string) {
        const { data, error } = await supabase
            .from('friends')
            .select('*, receiver:receiver_id(username, avatar_url), sender:sender_id(username, avatar_url)')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .eq('status', 'accepted');

        if (error) return [];

        return data.map(f => ({
            ...f,
            friend: f.sender_id === userId ? f.receiver : f.sender,
            receiver_id: f.sender_id === userId ? f.receiver_id : f.sender_id
        }));
    },

    // 2. Gelen İstekleri Getir (ProfilePage.tsx bunu çağırıyor)
    async getIncomingRequests(userId: string) {
        const { data, error } = await supabase
            .from('friends')
            .select('*, requester:sender_id(id, username, avatar_url)')
            .eq('receiver_id', userId)
            .eq('status', 'pending');

        if (error) return [];
        return data;
    },

    // 3. İstek Gönder
    async sendFriendRequest(senderId: string, receiverId: string) {
        const { data } = await supabase
            .from('friends')
            .select('*')
            .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
            .maybeSingle();

        if (data) return;

        const { error } = await supabase
            .from('friends')
            .insert({ sender_id: senderId, receiver_id: receiverId, status: 'pending' });

        if (error) throw error;
    },

    // 4. İsteği İptal Et
    async cancelFriendRequest(senderId: string, receiverId: string) {
        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('sender_id', senderId)
            .eq('receiver_id', receiverId)
            .eq('status', 'pending');

        if (error) throw error;
    },

    // 5. Durum Kontrolü
    async checkFriendshipStatus(currentUserId: string, targetUserId: string) {
        const { data } = await supabase
            .from('friends')
            .select('status')
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`)
            .maybeSingle();

        return data ? data.status : null;
    },

    // 6. Kabul Et 
    // DÜZELTME: Senin ProfilePage.tsx kodun 2 parametre gönderiyor (id, requesterId).
    // Burayı 2 parametre alacak şekilde güncelledim ki hata vermesin.
    async acceptFriendRequest(friendshipId: string, requesterId: string) {
        const { error } = await supabase.from('friends').update({ status: 'accepted' }).eq('id', friendshipId);
        if (error) throw error;
    },

    // 7. Reddet
    async rejectFriendRequest(friendshipId: string) {
        const { error } = await supabase.from('friends').delete().eq('id', friendshipId);
        if (error) throw error;
    },

    // 8. Arkadaşlıktan Çıkar
    async removeFriend(friendshipId: string) {
        const { error } = await supabase.from('friends').delete().eq('id', friendshipId);
        if (error) throw error;
    }
};