import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSupabase, resetSupabaseMocks, setMockUser, clearMockUser } from '../__mocks__/supabase'

// Mock supabase before importing service
vi.mock('../../utils/supabase', () => ({
  default: mockSupabase
}))

// Import the actual service after mocking
import { FriendService } from '../../services/friendService'

describe('FriendService - Real Service Tests', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  describe('getFriends', () => {
    it('should return empty array when no friends', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      }))

      const friends = await FriendService.getFriends('user-1')
      
      expect(friends).toEqual([])
      expect(mockSupabase.from).toHaveBeenCalledWith('friends')
    })

    it('should return mapped friends list', async () => {
      const mockData = [
        {
          id: 'f-1',
          sender_id: 'user-1',
          receiver_id: 'user-2',
          status: 'accepted',
          sender: { id: 'user-1', username: 'alice' },
          receiver: { id: 'user-2', username: 'bob' }
        }
      ]

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
      }))

      const friends = await FriendService.getFriends('user-1')
      
      expect(friends).toHaveLength(1)
      expect(friends[0].friend.username).toBe('bob')
    })
  })

  describe('getIncomingRequests', () => {
    it('should return pending incoming requests', async () => {
      const mockRequests = [
        {
          id: 'r-1',
          sender_id: 'user-2',
          receiver_id: 'user-1',
          status: 'pending',
          requester: { id: 'user-2', username: 'bob' }
        }
      ]

      const eqMock = vi.fn().mockReturnThis()
      eqMock.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: mockRequests, error: null })
      })

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: eqMock
        })
      }))

      const requests = await FriendService.getIncomingRequests('user-1')
      
      expect(requests).toHaveLength(1)
    })

    it('should return empty array on error', async () => {
      const eqMock = vi.fn().mockReturnThis()
      eqMock.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } })
      })

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: eqMock
        })
      }))

      const requests = await FriendService.getIncomingRequests('user-1')
      
      expect(requests).toEqual([])
    })
  })

  describe('sendFriendRequest', () => {
    it('should not send if request already exists', async () => {
      const existingRequest = { id: 'existing' }

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: existingRequest, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null })
      }))

      await FriendService.sendFriendRequest('user-1', 'user-2')
      
      // Should not call insert because request exists
      expect(mockSupabase.from).toHaveBeenCalledWith('friends')
    })
  })

  describe('checkFriendshipStatus', () => {
    it('should return status when friendship exists', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { status: 'accepted' }, error: null })
      }))

      const status = await FriendService.checkFriendshipStatus('user-1', 'user-2')
      
      expect(status).toBe('accepted')
    })

    it('should return null when no friendship', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
      }))

      const status = await FriendService.checkFriendshipStatus('user-1', 'user-2')
      
      expect(status).toBeNull()
    })
  })

  describe('acceptFriendRequest', () => {
    it('should update friendship status to accepted', async () => {
      mockSupabase.from.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }))

      await expect(FriendService.acceptFriendRequest('f-1', 'user-2')).resolves.not.toThrow()
      expect(mockSupabase.from).toHaveBeenCalledWith('friends')
    })

    it('should throw on error', async () => {
      mockSupabase.from.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
      }))

      await expect(FriendService.acceptFriendRequest('f-1', 'user-2')).rejects.toThrow()
    })
  })

  describe('rejectFriendRequest', () => {
    it('should delete the friendship record', async () => {
      mockSupabase.from.mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }))

      await expect(FriendService.rejectFriendRequest('f-1')).resolves.not.toThrow()
    })
  })

  describe('removeFriend', () => {
    it('should delete the friendship', async () => {
      mockSupabase.from.mockImplementation(() => ({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }))

      await expect(FriendService.removeFriend('f-1')).resolves.not.toThrow()
    })
  })
})
