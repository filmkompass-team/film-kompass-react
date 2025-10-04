export interface Movie {
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  release_date: string | null;
  runtime: number | null;
  genres: string[] | null; 
  overview: string | null;
  vote_average: number | null;
  vote_count: number | null;
  popularity: number | null;
  poster_url: string | null;
  spoken_languages: string[] | null; 
}

export interface MovieFilters {
  genre?: string;
  year?: number;
  search?: string;
  aiRecommendation?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
