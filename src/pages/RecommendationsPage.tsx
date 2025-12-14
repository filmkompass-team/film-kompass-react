import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { MovieService } from '../services/movieService';
import type { Movie } from '../types/movie';
import MovieCard from '../components/MovieCard';

// NOT: Navbar'ı buradan kaldırdık çünkü App.tsx'te zaten var.

const RecommendationsPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  // 1. Kullanıcı Giriş Kontrolü
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // Giriş yapmamışsa ana sayfaya gönder
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  // 2. Önerileri Getir
  useEffect(() => {
    const fetchRecs = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const data = await MovieService.getRecommendationsForUser(userId);
        setMovies(data);
      } catch (error) {
        console.error("Öneriler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [userId]);

  // Karta tıklama işlemi
  const handleMovieClick = (movie: Movie) => {
    window.scrollTo(0, 0);
    navigate(`/movie/${movie.tmdb_id}`);
  };

  return (
    // DÜZELTME 1: Arka planı 'Movies.tsx' ile aynı yaptık (Açık renk gradient)
    // DÜZELTME 2: Yazı rengini koyu yaptık (text-gray-900)
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 page-transition">

      <div className="max-w-7xl mx-auto">

        {/* Başlık ve Geri Dön Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            // DÜZELTME 3: Buton renklerini açık temaya uygun hale getirdik
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 self-start sm:self-auto font-medium"
          >
            <span className="text-xl">←</span> Go back
          </button>

          <div className="flex items-center gap-2">
            <span className="text-3xl" role="img" aria-label="sparkles">✨</span>
            <div>
              {/* DÜZELTME 4: Başlık rengi koyu gri/siyah */}
              <h1 className="text-3xl font-bold text-gray-900">Recommended for you.</h1>
              <p className="text-gray-600 text-sm mt-1">
                Generated based on your viewing history and preferences.
              </p>
            </div>
          </div>
        </div>

        {/* İçerik Alanı */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
             {/* Loading rengini indigo yaptık */}
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
             <p className="text-gray-600">Preparing your personalized list...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-200 shadow-sm">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No recommendations found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Please rate or add more movies to your lists for us to provide personalized recommendations.
            </p>
            <button
                onClick={() => navigate('/')}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition shadow-md"
            >
                Start Exploring Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in">
            {movies.map((movie) => (
              <MovieCard
                key={movie.tmdb_id}
                movie={movie}
                onClick={handleMovieClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
