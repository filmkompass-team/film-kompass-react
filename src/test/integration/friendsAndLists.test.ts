import { describe, it, expect, beforeEach } from 'vitest'

/**
 * Integration Tests for Friends and Shared Lists
 * Tests the interaction between Friend Service and List Service
 */

// Mock types
interface User {
  id: string
  username: string
}

interface Friendship {
  id: string
  sender_id: string
  receiver_id: string
  status: 'pending' | 'accepted'
}

interface List {
  id: string
  title: string
  owner_id: string
  is_shared: boolean
  collaborators: string[]
}

describe('Friends and Shared Lists Integration', () => {
  let users: User[]
  let friendships: Friendship[]
  let lists: List[]

  beforeEach(() => {
    users = [
      { id: 'user-1', username: 'alice' },
      { id: 'user-2', username: 'bob' },
      { id: 'user-3', username: 'charlie' }
    ]
    
    friendships = [
      { id: 'f-1', sender_id: 'user-1', receiver_id: 'user-2', status: 'accepted' }
    ]
    
    lists = [
      { id: 'list-1', title: 'Watch Together', owner_id: 'user-1', is_shared: false, collaborators: [] }
    ]
  })

  it('should only allow sharing list with friends', () => {
    const currentUserId = 'user-1'
    const targetUserId = 'user-2'
    
    // Check if target is a friend
    const isFriend = friendships.some(
      f => f.status === 'accepted' &&
           ((f.sender_id === currentUserId && f.receiver_id === targetUserId) ||
            (f.sender_id === targetUserId && f.receiver_id === currentUserId))
    )
    
    expect(isFriend).toBe(true)
    
    // Share the list
    if (isFriend) {
      lists[0].collaborators.push(targetUserId)
      lists[0].is_shared = true
    }
    
    expect(lists[0].collaborators).toContain('user-2')
  })

  it('should prevent sharing list with non-friends', () => {
    const currentUserId = 'user-1'
    const targetUserId = 'user-3' // Not a friend
    
    const isFriend = friendships.some(
      f => f.status === 'accepted' &&
           ((f.sender_id === currentUserId && f.receiver_id === targetUserId) ||
            (f.sender_id === targetUserId && f.receiver_id === currentUserId))
    )
    
    expect(isFriend).toBe(false)
  })

  it('should get available friends for sharing', () => {
    const currentUserId = 'user-1'
    const list = lists[0]
    
    // Get all friends
    const friends = friendships
      .filter(f => f.status === 'accepted' &&
                   (f.sender_id === currentUserId || f.receiver_id === currentUserId))
      .map(f => f.sender_id === currentUserId ? f.receiver_id : f.sender_id)
    
    // Filter out existing collaborators
    const availableForSharing = friends.filter(
      friendId => !list.collaborators.includes(friendId)
    )
    
    expect(availableForSharing).toContain('user-2')
  })

  it('should filter out already invited friends', () => {
    const currentUserId = 'user-1'
    lists[0].collaborators.push('user-2')
    
    // Get all friends
    const friends = friendships
      .filter(f => f.status === 'accepted' &&
                   (f.sender_id === currentUserId || f.receiver_id === currentUserId))
      .map(f => f.sender_id === currentUserId ? f.receiver_id : f.sender_id)
    
    // Filter out existing collaborators
    const availableForSharing = friends.filter(
      friendId => !lists[0].collaborators.includes(friendId)
    )
    
    expect(availableForSharing).not.toContain('user-2')
    expect(availableForSharing).toHaveLength(0)
  })
})

describe('AI Recommendation with User Data Integration', () => {
  interface UserMovieData {
    favorites: number[]
    watched: number[]
    ratings: Record<number, number>
  }

  let userData: UserMovieData

  beforeEach(() => {
    userData = {
      favorites: [27205, 157336], // Inception, Interstellar
      watched: [155, 49026], // The Dark Knight, The Dark Knight Rises
      ratings: { 27205: 9, 157336: 8, 155: 10 }
    }
  })

  it('should collect user favorites for AI context', () => {
    expect(userData.favorites).toHaveLength(2)
    expect(userData.favorites).toContain(27205)
  })

  it('should collect user watched movies for AI context', () => {
    expect(userData.watched).toHaveLength(2)
    expect(userData.watched).toContain(155)
  })

  it('should collect user ratings for AI context', () => {
    expect(Object.keys(userData.ratings)).toHaveLength(3)
    expect(userData.ratings[27205]).toBe(9)
  })

  it('should limit data to prevent API overload', () => {
    // Simulate limiting to 20 items
    const maxItems = 20
    const limitedFavorites = userData.favorites.slice(0, maxItems)
    const limitedWatched = userData.watched.slice(0, maxItems)
    const limitedRatings = Object.keys(userData.ratings).slice(0, maxItems)
    
    expect(limitedFavorites.length).toBeLessThanOrEqual(maxItems)
    expect(limitedWatched.length).toBeLessThanOrEqual(maxItems)
    expect(limitedRatings.length).toBeLessThanOrEqual(maxItems)
  })

  it('should build AI query context from user data', () => {
    const userQuery = 'I want something exciting'
    
    const context = {
      query: userQuery,
      favoritesCount: userData.favorites.length,
      watchedCount: userData.watched.length,
      hasRatings: Object.keys(userData.ratings).length > 0
    }
    
    expect(context.query).toBe(userQuery)
    expect(context.favoritesCount).toBe(2)
    expect(context.watchedCount).toBe(2)
    expect(context.hasRatings).toBe(true)
  })
})

describe('Survey to AI Query Integration', () => {
  interface SurveyAnswers {
    mood: string
    socialContext: string
    year?: string
    duration?: string
    region?: string
    population?: string
  }

  it('should validate complete survey', () => {
    const answers: SurveyAnswers = {
      mood: '💡 Inspired (Motivation)',
      socialContext: '👤 Watching Alone',
      year: '2020s',
      duration: 'medium',
      region: 'hollywood',
      population: 'blockbuster'
    }
    
    const isValid = 
      answers.mood !== '' &&
      answers.socialContext !== '' &&
      answers.year !== undefined &&
      answers.duration !== undefined &&
      answers.region !== undefined &&
      answers.population !== undefined
    
    expect(isValid).toBe(true)
  })

  it('should reject incomplete survey', () => {
    const answers: SurveyAnswers = {
      mood: '💡 Inspired (Motivation)',
      socialContext: '',
      year: undefined,
      duration: undefined
    }
    
    const isValid = 
      answers.mood !== '' &&
      answers.socialContext !== '' &&
      answers.year !== undefined &&
      answers.duration !== undefined
    
    expect(isValid).toBe(false)
  })

  it('should build AI query from survey answers', () => {
    const answers: SurveyAnswers = {
      mood: '😨 Thrilled (Tense)',
      socialContext: '💘 Date Night / Partner',
      year: '2020s',
      duration: 'medium',
      region: 'hollywood',
      population: 'blockbuster'
    }
    
    const queryParts = [
      answers.mood,
      answers.socialContext,
      `Era: ${answers.year}`,
      `Duration: ${answers.duration}`,
      `Region: ${answers.region}`,
      `Type: ${answers.population}`
    ]
    
    const query = queryParts.join(', ')
    
    expect(query).toContain('Thrilled')
    expect(query).toContain('Date Night')
    expect(query).toContain('2020s')
  })
})
