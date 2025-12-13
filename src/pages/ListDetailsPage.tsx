import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ListService } from "../services/listService";
import AddMovieModal from "../components/AddMovieModal";

export default function ListDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [list, setList] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const { list, items } = await ListService.getListDetails(id!);
            setList(list);
            setItems(items || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!list) return <div className="p-10 text-center">List not found.</div>;

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* --- HEADER --- */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 mb-2 text-sm">← Back</button>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            {list.title}
                            {list.is_shared && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Shared</span>}
                        </h1>
                    </div>

                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
                    >
                        + Add Movie
                    </button>
                </div>

                {/* --- MOVIE LIST --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((item) => {
                        const movie = item.movies || {};
                        return (
                            <div key={item.id || item.movie_id} className="flex gap-4 p-4 border border-gray-100 rounded-2xl hover:shadow-lg transition bg-white items-start">
                                <img
                                    src={movie.poster_url || "https://via.placeholder.com/100x150?text=No+Img"}
                                    alt={movie.title}
                                    className="w-20 h-28 object-cover rounded-lg shadow-sm"
                                />
                                <div className="flex flex-col justify-between h-28 py-1">
                                    <div>
                                        <h3 className="font-bold text-gray-800 line-clamp-2">{movie.title || "Unknown Title"}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{movie.release_date?.split('-')[0] || "No Date"}</p>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Added by: <span className="font-semibold text-indigo-600">{item.profiles?.username || "Unknown"}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* EMPTY STATE */}
                {items.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 mb-4 text-lg">No movies in this list yet.</p>
                        <button onClick={() => setAddModalOpen(true)} className="text-indigo-600 font-bold hover:underline">Add your first movie</button>
                    </div>
                )}

                {/* --- MODAL --- */}
                {isAddModalOpen && id && (
                    <AddMovieModal
                        listId={id} // Sadece ID gönderiyoruz, çünkü bu Özel Liste
                        onClose={() => setAddModalOpen(false)}
                        onSuccess={() => {
                            setAddModalOpen(false);
                            fetchDetails();
                        }}
                    />
                )}
            </div>
        </div>
    );
}