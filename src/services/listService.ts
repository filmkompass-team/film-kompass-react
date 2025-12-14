import supabase from "../utils/supabase";

// DİKKAT: Başında "export const" var.
export const ListService = {
  async createList(title: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Giriş yapmalısın.");

    const { data, error } = await supabase
      .from("lists")
      .insert({ title, owner_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMyLists() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: myLists } = await supabase
      .from("lists")
      .select("*, list_collaborators(count), list_items(count)")
      .eq("owner_id", user.id);

    const { data: sharedWithMe } = await supabase
      .from("list_collaborators")
      .select("list_id, lists(*, list_items(count))")
      .eq("user_id", user.id);

    const sharedLists =
      sharedWithMe?.map((item: any) => ({
        ...item.lists,
        isCollaborative: true,
      })) || [];

    return [...(myLists || []), ...sharedLists];
  },

  async addMovieToList(listId: string, movieId: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("list_items")
      .insert({ list_id: listId, movie_id: movieId, added_by: user.id });

    if (error) throw error;
  },

  async addCollaborator(listId: string, friendId: string) {
    await supabase.from("lists").update({ is_shared: true }).eq("id", listId);

    const { error } = await supabase
      .from("list_collaborators")
      .insert({ list_id: listId, user_id: friendId });

    if (error) throw error;
  },
  async findUserByUsername(username: string) {
    const { data, error } = await supabase
      .from("profiles") // 'profiles' tablon olduğunu varsayıyoruz
      .select("id, username")
      .eq("username", username)
      .single();

    if (error) return null;
    return data;
  },

  async getListDetails(listId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // 1) Listeyi owner olarak çekmeyi dene
    const { data: ownedList, error: ownedErr } = await supabase
      .from("lists")
      .select("*")
      .eq("id", listId)
      .maybeSingle();

    if (ownedErr) throw ownedErr;

    let list = ownedList;

    // 2) Owner değilse collaborator olarak çekmeyi dene (shared listler için)
    if (!list) {
      const { data: collabRow, error: collabErr } = await supabase
        .from("list_collaborators")
        .select("lists(*)")
        .eq("list_id", listId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (collabErr) throw collabErr;

      list = (collabRow as any)?.lists ?? null;
    }

    // Liste hâlâ yoksa erken dön
    if (!list) {
      return { list: null, items: [] };
    }

    // 3) Liste item’larını çek + movies join (film bilgisi gelsin)
    const { data: items, error: itemsErr } = await supabase
      .from("list_items")
      .select("id, movie_id, added_at, added_by")
      .eq("list_id", listId)
      .order("added_at", { ascending: false });

    if (itemsErr) throw itemsErr;

    return { list, items: items || [] };
  },

  async deleteList(listId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Sadece owner silebilsin (shared listlerde güvenlik)
    const { data: list, error: listErr } = await supabase
      .from("lists")
      .select("id, owner_id")
      .eq("id", listId)
      .single();

    if (listErr) throw listErr;
    if (list.owner_id !== user.id)
      throw new Error("You can only delete your own lists.");

    // Önce ilişkili kayıtları sil
    const { error: itemsErr } = await supabase
      .from("list_items")
      .delete()
      .eq("list_id", listId);
    if (itemsErr) throw itemsErr;

    const { error: collabErr } = await supabase
      .from("list_collaborators")
      .delete()
      .eq("list_id", listId);
    if (collabErr) throw collabErr;

    // En son listeyi sil
    const { error: delErr } = await supabase
      .from("lists")
      .delete()
      .eq("id", listId);
    if (delErr) throw delErr;

    return true;
  },
};