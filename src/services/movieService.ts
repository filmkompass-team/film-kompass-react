import supabase from "../utils/supabase";
import type { Movie, MovieFilters, PaginationInfo } from "../types/movie";

// TMDB Ayarları (Yeni Eklendi)
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export class MovieService {

  // 1. MEVCUT LİSTELEME (Supabase'den çeker - Browse Sayfası İçin)
  static async getMovies(
    page: number = 1,
    itemsPerPage: number = 20,
    filters?: MovieFilters
  ): Promise<{ movies: Movie[]; pagination: PaginationInfo }> {
    try {
      // 'films_sorted' view'ını kullanıyorsun, bu kalabilir.
      // Eğer view yoksa 'films' veya 'movies' tablosunu kullanmalısın.
      let query = supabase
        .from("films_sorted")
        .select("*", { count: "exact" });

      if (filters?.kidsOnly) {
        query = query.eq("adult", false);
        query = query.or(
          "genres.cs.{Children},genres.cs.{Animation},genres.cs.{Family}"
        );
      }

      if (filters?.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query
          .gte("release_date", startDate)
          .lte("release_date", endDate);
      }

      if (filters?.genre) {
        query = query.contains("genres", [filters.genre]);
      }

      // Bu arama SADECE senin veritabanında kayıtlı filmleri arar
      if (filters?.search) {
        const searchTerm = filters.search.trim();
        if (searchTerm.length > 0) {
          query = query.ilike("title", `%${searchTerm}%`);
        }
      }

      // Pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      const pagination: PaginationInfo = {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage,
      };

      return {
        movies: (data as Movie[]) || [],
        pagination,
      };
    } catch (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
  }

  // 2. YENİ EKLENEN: GLOBAL FİLM ARAMA (TMDB API - Add Movie Modalı İçin)
  static async searchMovies(query: string) {
    if (!query) return [];

    if (!TMDB_API_KEY) {
      console.error("MovieService: API Key eksik! .env dosyasını kontrol et.");
      return [];
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&include_adult=false`
      );

      if (!response.ok) throw new Error("TMDB Arama hatası");

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Film arama servisi hatası:", error);
      return [];
    }
  }

  // 3. ID İLE FİLM GETİR (Detay Sayfası İçin)
  static async getMovieById(tmdbId: number): Promise<Movie | null> {
    try {
      // Önce kendi veritabanına bak
      const { data, error } = await supabase
        .from("films") // Veya 'movies' tablosu, projendeki ana tablo adı neyse
        .select("*")
        .eq("tmdb_id", tmdbId)
        .single();

      if (error) {
        // Eğer veritabanında yoksa ve hata 'bulunamadı' ise, 
        // istersen burada TMDB'den çekip dönebilirsin (Opsiyonel Geliştirme)
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data as Movie;
    } catch (error) {
      console.error("Error fetching movie by ID:", error);
      return null;
    }
  }

  // 4. FİLTRELER İÇİN GENRELER
  static async getGenres(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("genres_view")
        .select("genre")
        .order("genre", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map((row: { genre: string }) => row.genre);

    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  }

  // 5. FİLTRELER İÇİN YILLAR
  static async getReleaseYears(): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from("years_view")
        .select("year")
        .order("year", { ascending: false });
      if (error) {
        throw error;
      }

      return data.map((row: { year: number }) => row.year);
    } catch (error) {
      console.error("Error fetching release years:", error);
      return [];
    }
  }

  // 6. ÖNERİ SİSTEMİ
  static async getRecommendationsForUser(userId: string): Promise<Movie[]> {
    try {
      // 1. Önce ID listesini çek
      const { data: recData, error: recError } = await supabase
        .from('recommendations')
        .select('suggested_movies')
        .eq('user_id', userId)
        .maybeSingle();

      if (recError) throw recError;

      // Liste boşsa boş dön
      if (!recData || !recData.suggested_movies || recData.suggested_movies.length === 0) {
        return [];
      }

      const movieIds: number[] = recData.suggested_movies;

      // 2. Sonra filmleri çek
      const { data: moviesData, error: moviesError } = await supabase
        .from('films')
        .select('*')
        .in('tmdb_id', movieIds);

      if (moviesError) throw moviesError;

      return (moviesData as Movie[]) || [];

    } catch (error) {
      console.error("Öneri servisi hatası:", error);
      return [];
    }
  }
}