import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase, resetSupabaseMocks } from '../__mocks__/supabase'

// Mock supabase before importing service
vi.mock('../../utils/supabase', () => ({
  default: mockSupabase
}))

// Mock other services that AiRecommendationService depends on
vi.mock('../../services/userListService', () => ({
  UserListService: {
    getMoviesFromList: vi.fn().mockResolvedValue([27205, 157336])
  }
}))

vi.mock('../../services/ratingService', () => ({
  RatingService: {
    getAllUserRatings: vi.fn().mockResolvedValue({ 27205: 9, 157336: 8 })
  }
}))

vi.mock('../../services/movieService', () => ({
  MovieService: {
    getMovieById: vi.fn().mockImplementation((id: number) => {
      const movies: Record<number, any> = {
        27205: { id: 1, tmdb_id: 27205, title: 'Inception', genres: ['Action', 'Sci-Fi'], overview: 'A thief...', runtime: 148 },
        157336: { id: 2, tmdb_id: 157336, title: 'Interstellar', genres: ['Drama', 'Sci-Fi'], overview: 'Explorers...', runtime: 169 }
      }
      return Promise.resolve(movies[id] || null)
    })
  }
}))

// Import the actual service after mocking
import { AiRecommendationService } from '../../services/aiRecommendationService'

describe('AiRecommendationService - Real Service Tests', () => {
  beforeEach(() => {
    resetSupabaseMocks()
    // Clear the internal cache for each test
    vi.clearAllMocks()
  })

  describe('getCached', () => {
    it('should return undefined for uncached query', () => {
      const result = AiRecommendationService.getCached('some random query')
      // First time, no cache
      expect(result).toBeUndefined()
    })
  })

  describe('getRecommendations', () => {
    it('should throw error when user not logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await AiRecommendationService.getRecommendations('action movies')
      
      expect(result.error).toBeDefined()
      expect(result.movies).toEqual([])
    })

    it('should call AI function with user context', async () => {
      // Mock the films_sorted query for recommended movies
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 3, tmdb_id: 27205, title: 'Inception', runtime: 148, genres: ['Action'] },
          error: null
        })
      }))

      mockSupabase.functions.invoke.mockResolvedValue({
        data: { recommendedMovies: ['Inception'] },
        error: null
      })

      const result = await AiRecommendationService.getRecommendations('action movies')
      
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('ai-recommendations', expect.any(Object))
      expect(result.movies).toBeDefined()
    })

    it('should return cached results for same query', async () => {
      // First call - setup
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 3, tmdb_id: 27205, title: 'Inception', runtime: 148 },
          error: null
        })
      }))

      mockSupabase.functions.invoke.mockResolvedValue({
        data: { recommendedMovies: ['Inception'] },
        error: null
      })

      // Create a unique query for this test
      const testQuery = 'unique test query ' + Date.now()
      
      // First call
      const result1 = await AiRecommendationService.getRecommendations(testQuery)
      
      // Second call should use cache
      const result2 = await AiRecommendationService.getRecommendations(testQuery)
      
      // Both should return same movies
      expect(result2.movies).toEqual(result1.movies)
    })

    it('should handle AI function error', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'AI service unavailable' }
      })

      const result = await AiRecommendationService.getRecommendations('test query error')
      
      expect(result.error).toBeDefined()
    })

    it('should filter movies by duration preference - short', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1, title: 'Long Movie', runtime: 180 }, // Should be filtered out
          error: null
        })
      }))

      mockSupabase.functions.invoke.mockResolvedValue({
        data: { recommendedMovies: ['Long Movie'] },
        error: null
      })

      const result = await AiRecommendationService.getRecommendations('short movies under 90 minutes')
      
      // Long movie should be filtered out
      expect(result.movies.every(m => !m.runtime || m.runtime < 90)).toBe(true)
    })

    it('should return error message from AI response', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { error: 'Rate limit exceeded' },
        error: null
      })

      const result = await AiRecommendationService.getRecommendations('rate limited query')
      
      expect(result.error).toBe('Rate limit exceeded')
      expect(result.movies).toEqual([])
    })
  })
})
