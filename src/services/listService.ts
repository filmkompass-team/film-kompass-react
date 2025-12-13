import supabase from "../utils/supabase";

// DİKKAT: Başında "export const" var.
export const ListService = {

    async createList(title: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Giriş yapmalısın.");

        const { data, error } = await supabase
            .from('lists')
            .insert({ title, owner_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getMyLists() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: myLists } = await supabase
            .from('lists')
            .select('*, list_collaborators(count), list_items(count)')
            .eq('owner_id', user.id);

        const { data: sharedWithMe } = await supabase
            .from('list_collaborators')
            .select('list_id, lists(*, list_items(count))')
            .eq('user_id', user.id);

        const sharedLists = sharedWithMe?.map((item: any) => ({
            ...item.lists,
            isCollaborative: true
        })) || [];

        return [...(myLists || []), ...sharedLists];
    },

    async addMovieToList(listId: string, movieId: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('list_items')
            .insert({ list_id: listId, movie_id: movieId, added_by: user.id });

        if (error) throw error;
    },

    async addCollaborator(listId: string, friendId: string) {
        await supabase.from('lists').update({ is_shared: true }).eq('id', listId);

        const { error } = await supabase
            .from('list_collaborators')
            .insert({ list_id: listId, user_id: friendId });

        if (error) throw error;
    },
    async findUserByUsername(username: string) {
        const { data, error } = await supabase
            .from('profiles') // 'profiles' tablon olduğunu varsayıyoruz
            .select('id, username')
            .eq('username', username)
            .single();

        if (error) return null;
        return data;
    },

    async getListDetails(listId: string) {
        const { data: list } = await supabase.from('lists').select('*').eq('id', listId).single();

        const { data: items } = await supabase
            .from('list_items')
            .select(`
            movie_id, 
            added_at,
            added_by,
            profiles:added_by(username, avatar_url) 
        `)
            .eq('list_id', listId)
            .order('added_at', { ascending: false });

        return { list, items };
    }
};