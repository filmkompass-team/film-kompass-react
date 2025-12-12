import supabase from "../utils/supabase";

export interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
}

export const FriendService = {
    // 🔍 Kullanıcı Arama 
    async searchUsers(query: string) {
        if (!query) return [];

        // 'profiles' tablosunda arama yap
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', `%${query}%`)
            .limit(5);

        if (error) {
            console.error("Arama hatası:", error);
            return [];
        }
        return data as Profile[];
    },

    // ➕ Arkadaş İsteği Gönder
    async sendFriendRequest(receiverId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Giriş yapmalısın!");

        const { error } = await supabase
            .from('friendships')
            .insert({
                requester_id: user.id,
                receiver_id: receiverId,
                status: 'pending'
            });

        if (error) throw error;
    },

    // 📋 Arkadaş Listesini Getir 
    async getFriends(userId: string) {
        const { data, error } = await supabase
            .from('friendships')
            .select(`
        id,
        status,
        receiver:receiver_id (username, avatar_url)
      `)
            .eq('requester_id', userId);



        if (error) {
            console.error("Arkadaş listesi hatası:", error);
            return [];
        }
        return data;
    }
};