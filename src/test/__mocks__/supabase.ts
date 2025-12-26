import { vi } from 'vitest'

/**
 * Supabase Mock for Testing
 * This mock simulates Supabase client behavior for unit/integration tests
 */

// Mock user for auth
const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  user_metadata: { username: 'testuser' }
}

// Chainable query builder mock
const createQueryBuilder = (data: any = null, error: any = null) => {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    then: (resolve: any) => resolve({ data, error })
  }
  
  // Make builder thenable for async/await
  Object.defineProperty(builder, 'then', {
    value: (resolve: any) => Promise.resolve({ data, error }).then(resolve)
  })
  
  return builder
}

// Mock Supabase client
export const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'test-token' } },
      error: null
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
  },
  from: vi.fn((table: string) => createQueryBuilder()),
  functions: {
    invoke: vi.fn().mockResolvedValue({
      data: { recommendedMovies: ['Inception', 'Interstellar'] },
      error: null
    })
  }
}

// Helper to set mock responses
export const setMockResponse = (table: string, data: any, error: any = null) => {
  mockSupabase.from.mockImplementation((t: string) => {
    if (t === table) {
      return createQueryBuilder(data, error)
    }
    return createQueryBuilder()
  })
}

// Helper to set auth user
export const setMockUser = (user: any) => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user },
    error: null
  })
}

// Helper to clear auth (logged out state)
export const clearMockUser = () => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null
  })
}

// Reset all mocks
export const resetSupabaseMocks = () => {
  vi.clearAllMocks()
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null
  })
  mockSupabase.from.mockImplementation(() => createQueryBuilder())
}

export default mockSupabase
