import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase, resetSupabaseMocks } from '../__mocks__/supabase'

// Mock supabase before importing service
vi.mock('../../utils/supabase', () => ({
  default: mockSupabase
}))

// Import the actual service after mocking
import { ListService } from '../../services/listService'

describe('ListService - Real Service Tests', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  describe('createList', () => {
    it('should create a new list', async () => {
      const mockList = { id: 'list-1', title: 'My List', owner_id: 'test-user-id-123' }

      mockSupabase.from.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockList, error: null })
      }))

      const result = await ListService.createList('My List')
      
      expect(result).toEqual(mockList)
      expect(mockSupabase.from).toHaveBeenCalledWith('lists')
    })

    it('should throw error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      await expect(ListService.createList('My List')).rejects.toThrow('Giriş yapmalısın.')
    })

    it('should throw error on database error', async () => {
      mockSupabase.from.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
      }))

      await expect(ListService.createList('My List')).rejects.toThrow()
    })
  })

  describe('getMyLists', () => {
    it('should return empty array when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const lists = await ListService.getMyLists()
      
      expect(lists).toEqual([])
    })

    it('should combine owned and shared lists', async () => {
      const mockOwnedLists = [{ id: 'list-1', title: 'My List' }]
      const mockSharedLists = [{ list_id: 'list-2', lists: { id: 'list-2', title: 'Shared List' } }]

      let callCount = 0
      mockSupabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: owned lists
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: mockOwnedLists, error: null })
          }
        } else {
          // Second call: shared lists
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: mockSharedLists, error: null })
          }
        }
      })

      const lists = await ListService.getMyLists()
      
      expect(lists.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('addMovieToList', () => {
    it('should add movie to list', async () => {
      mockSupabase.from.mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ error: null })
      }))

      await expect(ListService.addMovieToList('list-1', 27205)).resolves.not.toThrow()
      expect(mockSupabase.from).toHaveBeenCalledWith('list_items')
    })

    it('should do nothing when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      await ListService.addMovieToList('list-1', 27205)
      // Should return early without error
    })

    it('should throw on insert error', async () => {
      mockSupabase.from.mockImplementation(() => ({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } })
      }))

      await expect(ListService.addMovieToList('list-1', 27205)).rejects.toThrow()
    })
  })

  describe('addCollaborator', () => {
    it('should add collaborator and mark list as shared', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'lists') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null })
        }
      })

      await expect(ListService.addCollaborator('list-1', 'user-2')).resolves.not.toThrow()
    })

    it('should throw on collaborator insert error', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'lists') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } })
        }
      })

      await expect(ListService.addCollaborator('list-1', 'user-2')).rejects.toThrow()
    })
  })

  describe('findUserByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = { id: 'user-2', username: 'bob' }

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
      }))

      const user = await ListService.findUserByUsername('bob')
      
      expect(user).toEqual(mockUser)
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should return null when user not found', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      }))

      const user = await ListService.findUserByUsername('nonexistent')
      
      expect(user).toBeNull()
    })
  })

  describe('deleteList', () => {
    it('should delete list when user is owner', async () => {
      const mockList = { id: 'list-1', owner_id: 'test-user-id-123' }

      let callCount = 0
      mockSupabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Get list
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockList, error: null })
          }
        }
        // Delete operations
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null })
        }
      })

      const result = await ListService.deleteList('list-1')
      
      expect(result).toBe(true)
    })

    it('should throw when user is not owner', async () => {
      const mockList = { id: 'list-1', owner_id: 'other-user-id' }

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockList, error: null })
      }))

      await expect(ListService.deleteList('list-1')).rejects.toThrow('You can only delete your own lists.')
    })
  })
})
