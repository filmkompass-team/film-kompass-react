import moviesData from '../data/movies.json';
import type { Movie, MovieFilters, PaginationInfo } from '../types/movie';

export class MovieService {
  static getMovies(
    page: number = 1,
    itemsPerPage: number = 20,
    filters?: MovieFilters
  ): { movies: Movie[]; pagination: PaginationInfo } {
    let filteredMovies = [...(moviesData as Movie[])];

    // Apply filters
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredMovies = filteredMovies.filter(movie =>
        movie.title && typeof movie.title === 'string' && movie.title.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.genre) {
      filteredMovies = filteredMovies.filter(movie =>
        movie.genres && Array.isArray(movie.genres) && movie.genres.includes(filters.genre!)
      );
    }

    if (filters?.year) {
      filteredMovies = filteredMovies.filter(movie => {
        if (!movie.release_date) return false;
        const movieYear = new Date(movie.release_date).getFullYear();
        return movieYear === filters.year;
      });
    }


    // Sort by vote count (descending)
    filteredMovies.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

    // Apply pagination
    const totalItems = filteredMovies.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage,
    };

    return {
      movies: paginatedMovies,
      pagination,
    };
  }

  static getMovieById(tmdbId: number): Movie | null {
    const movie = (moviesData as any[]).find((m: any) => m.tmdb_id === tmdbId);
    return movie as Movie || null;
  }

  static getGenres(): string[] {
    const allGenres = new Set<string>();
    
    (moviesData as any[]).forEach((movie: any) => {
      if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach((genre: string) => allGenres.add(genre));
      }
    });

    return Array.from(allGenres).sort();
  }

  static getReleaseYears(): number[] {
    const years = new Set<number>();
    
    (moviesData as any[]).forEach((movie: any) => {
      if (movie.release_date) {
        const year = new Date(movie.release_date).getFullYear();
        if (year > 1900) { // Filter out invalid dates
          years.add(year);
        }
      }
    });

    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }

  static getFeaturedMovies(): Movie[] {
    const featuredTitles = [
      'The Shawshank Redemption',
      'The Matrix',
      'Interstellar',
      'The Lion King',
      'The Godfather',
      'Parasite'
    ];

    // Find movies by title
    const featuredMovies = featuredTitles
      .map(title => (moviesData as any[]).find((movie: any) => movie.title === title))
      .filter(movie => movie !== undefined) as Movie[];

    return featuredMovies;
  }
}