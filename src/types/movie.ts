export interface Movie {
  tmdb_id: number;
  title: string;
  vote_average: number | null;
  vote_count: number | null;
  status: string | null;
  release_date: string | null;
  revenue: number | null;
  runtime: number | null;
  adult: boolean | null;
  backdrop_path: string | null;
  budget: number | null;
  homepage: string | null;
  imdb_id: string | null;
  original_language: string | null;
  original_title: string | null;
  overview: string | null;
  popularity: number | null;
  poster_url: string | null;
  tagline: string | null;
  genres: string[] | null;
  production_companies: string | null;
  production_countries: string | null;
  spoken_languages: string | null;
  keywords: string | null;
  movieLens_id: number | null;
}

export interface MovieFilters {
  genre?: string;
  year?: number;
  search?: string;
  aiRecommendation?: string;
  kidsOnly?: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface UserMovieList {
  id: string;
  user_id: string;
  movie_id: number;
  list_type: "favorites" | "watched" | "wishlist";
  added_at: string;
}

export interface MovieWithListStatus extends Movie {
  isFavorite?: boolean;
  isWatched?: boolean;
  isInWishlist?: boolean;
}
