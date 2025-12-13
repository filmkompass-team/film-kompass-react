// src/services/userService.ts
import supabase from "../utils/supabase";

export const UserService = {
  /**
   * Kullanıcının avatarını günceller.
   * Hem Auth metadata'sını hem de public 'profiles' tablosunu günceller.
   */
  updateAvatar: async (userId: string, avatarUrl: string): Promise<void> => {
    // 1. Supabase Auth (User Metadata) güncellemesi - Session için önemli
    const { error: authError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    });

    if (authError) throw authError;

    // 2. Public Profiles tablosu güncellemesi - Diğer kullanıcıların görmesi için
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (profileError) throw profileError;
  },

  /**
   * Kullanıcı adını günceller
   */
  updateUsername: async (userId: string, username: string): Promise<void> => {
    const { error: authError } = await supabase.auth.updateUser({
      data: { username },
    });

    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", userId);

    if (profileError) throw profileError;
  }
};