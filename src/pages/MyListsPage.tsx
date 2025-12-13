import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserListService } from "../services/userListService";
import { MovieService } from "../services/movieService";
import type { Movie } from "../types/movie";
import MovieCard from "../components/MovieCard";
import supabase from "../utils/supabase";
import AddMovieModal from "../components/AddMovieModal";

export default function MyListsPage() {
  const { listType } = useParams<{ listType: string }>();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeList, setActiveList] = useState<"favorites" | "watched" | "wishlist">("favorites");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (!user) { navigate("/login"); return; }
      } catch (error) { setError("Error checking authentication"); }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (listType && listType !== activeList) { setActiveList(listType as "favorites" | "watched" | "wishlist"); }
    else if (!listType) { navigate("/my-lists/favorites", { replace: true }); }
  }, [listType, activeList, navigate]);

  useEffect(() => {
    const fetchMoviesFromList = async () => {
      if (!user) return;
      const currentListType = listType || activeList;
      try {
        if (isInitialLoad.current) setLoading(true); else setIsTransitioning(true);
        setError(null);
        const movieIds = await UserListService.getMoviesFromList(currentListType as "favorites" | "watched" | "wishlist");
        if (movieIds.length === 0) { setMovies([]); setLoading(false); setIsTransitioning(false); return; }
        const moviePromises = movieIds.map(async (movieId) => { try { return await MovieService.getMovieById(movieId); } catch (error) { return null; } });
        const movieResults = await Promise.all(moviePromises);
        setMovies(movieResults.filter((movie): movie is Movie => movie !== null));
      } catch (error) { setError("Failed to load movies from your list."); }
      finally { isInitialLoad.current = false; setLoading(false); setIsTransitioning(false); }
    };
    if (user) fetchMoviesFromList();
  }, [user, listType, activeList]);

  const getListTitle = () => {
    const currentListType = listType || activeList;
    switch (currentListType) {
      case "favorites": return "❤️ My Favorites";
      case "watched": return "✅ Watched Movies";
      case "wishlist": return "📝 My Wishlist";
      default: return "My Lists";
    }
  };

  const getListDescription = () => {
    const currentListType = listType || activeList;
    switch (currentListType) {
      case "favorites": return "Movies you've marked as favorites";
      case "watched": return "Movies you've watched";
      case "wishlist": return "Movies you want to watch";
      default: return "Your personal movie lists";
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 list-transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div><h1 className="text-4xl font-bold text-gray-900 mb-2">{getListTitle()}</h1><p className="text-xl text-gray-600">{getListDescription()}</p></div>
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2">+ Add Movie</button>
        </div>
        {isTransitioning && <div className="flex justify-center items-center py-8">Loading...</div>}
        {!isTransitioning && movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 transition-all duration-300 grid-transition">
            {movies.map((movie) => (
              <MovieCard
                // HATA ÇÖZÜLDÜ: any cast ile id'ye erişim
                key={movie.tmdb_id || (movie as any).id}
                movie={movie}
                onClick={(movie) => navigate(`/movie/${movie.tmdb_id || (movie as any).id}`)}
              />
            ))}
          </div>
        ) : !isTransitioning && movies.length === 0 ? (
          <div className="text-center py-12 transition-all duration-300 list-transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No movies in your {listType || activeList} list yet</h3>
            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 font-medium transform hover:scale-105">Add Your First Movie</button>
          </div>
        ) : null}
        {isModalOpen && (<AddMovieModal listType={listType || activeList} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); window.location.reload(); }} />)}
      </div>
    </div>
  );
}