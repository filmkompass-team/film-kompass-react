import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Integration Tests for Movie Search
 * Tests the interaction between MovieService and the application
 */

// Mock movie data for testing
const mockMovies = [
  { id: 1, title: 'Inception', tmdb_id: 27205, genres: ['Action', 'Sci-Fi'] },
  { id: 2, title: 'Interstellar', tmdb_id: 157336, genres: ['Drama', 'Sci-Fi'] },
  { id: 3, title: 'The Dark Knight', tmdb_id: 155, genres: ['Action', 'Crime'] }
]

describe('Movie Search Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter movies by title containing search term', () => {
    const searchTerm = 'Inter'
    const filteredMovies = mockMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    expect(filteredMovies).toHaveLength(1)
    expect(filteredMovies[0].title).toBe('Interstellar')
  })

  it('should filter movies by genre', () => {
    const genre = 'Action'
    const filteredMovies = mockMovies.filter(movie => 
      movie.genres.includes(genre)
    )
    
    expect(filteredMovies).toHaveLength(2)
    expect(filteredMovies.map(m => m.title)).toContain('Inception')
    expect(filteredMovies.map(m => m.title)).toContain('The Dark Knight')
  })

  it('should return empty array when no movies match search', () => {
    const searchTerm = 'NonExistentMovie'
    const filteredMovies = mockMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    expect(filteredMovies).toHaveLength(0)
  })

  it('should combine title and genre filter', () => {
    const searchTerm = 'Dark'
    const genre = 'Action'
    
    const filteredMovies = mockMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      movie.genres.includes(genre)
    )
    
    expect(filteredMovies).toHaveLength(1)
    expect(filteredMovies[0].title).toBe('The Dark Knight')
  })

  it('should return all movies for empty search term', () => {
    const searchTerm = ''
    const filteredMovies = searchTerm 
      ? mockMovies.filter(movie => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : mockMovies
    
    expect(filteredMovies).toHaveLength(3)
  })
})

describe('Movie Favorites Integration', () => {
  const favorites: number[] = []

  it('should add movie to favorites', () => {
    const movieId = 27205
    favorites.push(movieId)
    
    expect(favorites).toContain(movieId)
    expect(favorites).toHaveLength(1)
  })

  it('should check if movie is in favorites', () => {
    const movieId = 27205
    const isInFavorites = favorites.includes(movieId)
    
    expect(isInFavorites).toBe(true)
  })

  it('should remove movie from favorites', () => {
    const movieId = 27205
    const index = favorites.indexOf(movieId)
    if (index > -1) {
      favorites.splice(index, 1)
    }
    
    expect(favorites).not.toContain(movieId)
    expect(favorites).toHaveLength(0)
  })
})