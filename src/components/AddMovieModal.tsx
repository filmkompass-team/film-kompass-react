import { useState } from 'react';
import { ListService } from '../services/listService';
import supabase from '../utils/supabase';

// TMDB API Key'ini environment'tan alıyoruz. 
// Eğer .env dosyan yoksa buraya manuel yazarak test edebilirsin: "YOUR_API_KEY"
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

interface Props {
    listId?: string;   // Özel listeler için ID (Opsiyonel)
    listType?: string; // Standart listeler için TİP (favorites, watched, wishlist) (Opsiyonel)
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMovieModal({ listId, listType, onClose, onSuccess }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState<number | null>(null);

    // 1. SEARCH FUNCTION
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        // API KEY KONTROLÜ
        if (!TMDB_API_KEY) {
            alert("API Key missing! Check your .env file.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}&language=en-US`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. ADD MOVIE LOGIC (Universal)
    const handleAddMovie = async (movie: any) => {
        setAddingId(movie.id);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            // SENARYO A: Özel Listeye Ekleme (ListDetailsPage)
            if (listId) {
                await ListService.addMovieToList(listId, movie.id);
            }
            // SENARYO B: Standart Listeye Ekleme (MyListsPage)
            else if (listType) {
                // Önce filmi veritabanına kaydet/kontrol et (Supabase'de 'movies' tablosuna)
                // Not: Eğer movieService'in varsa onu kullan, yoksa manuel ekleme:
                const { error: movieErr } = await supabase.from('movies').upsert({
                    id: movie.id,
                    title: movie.title,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    release_date: movie.release_date,
                    vote_average: movie.vote_average
                });

                if (!movieErr) {
                    // Sonra ilişkiyi kur (user_movie_lists tablosu)
                    await supabase.from('user_movie_lists').upsert({
                        user_id: user.id,
                        movie_id: movie.id,
                        list_type: listType
                    });
                }
            }

            alert(`${movie.title} added! ✅`);
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Error adding movie.");
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.content}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h3 className="text-xl font-bold">Add Movie to List</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
                </div>

                {/* Search Input */}
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Search for a movie..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                    />
                    <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? '...' : 'Search'}
                    </button>
                </form>

                {/* Results */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {results.map(movie => (
                        <div key={movie.id} className="flex items-center p-2 border-b hover:bg-gray-50">
                            <img
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/50'}
                                alt={movie.title}
                                className="w-12 h-16 object-cover rounded mr-3"
                            />
                            <div className="flex-1">
                                <div className="font-bold text-sm">{movie.title}</div>
                                <div className="text-xs text-gray-500">{movie.release_date?.split('-')[0]}</div>
                            </div>
                            <button
                                onClick={() => handleAddMovie(movie)}
                                disabled={addingId === movie.id}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {addingId === movie.id ? 'Adding...' : '+ Add'}
                            </button>
                        </div>
                    ))}
                    {results.length === 0 && !loading && query && <p className="text-center text-gray-500 mt-4">No results found.</p>}
                </div>
            </div>
        </div>
    );
}

const modalStyles = {
    overlay: {
        position: 'fixed' as 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    content: {
        backgroundColor: 'white', padding: '20px', borderRadius: '12px',
        width: '500px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' as 'column'
    }
};