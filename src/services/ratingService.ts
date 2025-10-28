import supabase from "../utils/supabase";

export const RatingService = {
  /**
   * Bir film için yeni bir puan ekler veya mevcut puanı günceller.
   * @param movieId Filmin TMDB ID'si
   * @param rating Verilen puan (1-5)
   */
  submitRating: async (movieId: number, rating: number): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Puan vermek için kullanıcı girişi yapılmalı.");
    }

    // upsert: Kayıt varsa günceller, yoksa yeni kayıt oluşturur.
    // (movie_id, user_id) üzerinde UNIQUE constraint olması gerekir.
    const { error } = await supabase.from('ratings').upsert({
      movie_id: movieId,
      user_id: user.id,
      rating: rating,
    },
{
          // BU SATIRI EKLEYİN
          onConflict: 'user_id, movie_id', 
        });

    if (error) {
      console.error("Error submitting rating:", error);
      throw error;
    }
  },

  /**
   * Mevcut kullanıcının bir filme daha önce verdiği puanı getirir.
   * @param movieId Filmin TMDB ID'si
   * @returns Kullanıcının verdiği puanı veya null döner.
   */
  getUserRatingForMovie: async (movieId: number): Promise<number | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null; // Kullanıcı giriş yapmamışsa puanı yoktur.
    }

    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('user_id', user.id)
      .eq('movie_id', movieId)
      .single(); // Sadece bir kayıt veya null getirmesi için .single() kullanılır.

    // "PGRST116" kodu, Supabase'de .single() ile kayıt bulunamadığında dönen hatadır. Bu bir hata değil, beklenen bir durumdur.
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching user rating:", error);
      throw error;
    }

    return data ? data.rating : null;
  }
};