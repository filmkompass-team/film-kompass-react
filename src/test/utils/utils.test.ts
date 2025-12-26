import { describe, it, expect } from 'vitest'
import { formatRuntime, formatDate, getRatingColor } from '../../utils/movieUtils'

/**
 * Unit Tests for Utility Functions
 * These tests verify the correct behavior of helper functions used across the application
 * Testing the actual exported functions from src/utils/movieUtils.ts
 */

// formatRuntime - converts minutes to hours and minutes display format
describe('formatRuntime', () => {
  it('should return N/A for null', () => {
    expect(formatRuntime(null)).toBe('N/A')
  })

  it('should return N/A for zero', () => {
    expect(formatRuntime(0)).toBe('N/A')
  })

  it('should return N/A for negative numbers', () => {
    expect(formatRuntime(-10)).toBe('N/A')
  })

  it('should format 120 minutes as 2h 0m', () => {
    expect(formatRuntime(120)).toBe('2h 0m')
  })

  it('should format 90 minutes as 1h 30m', () => {
    expect(formatRuntime(90)).toBe('1h 30m')
  })

  it('should format 45 minutes as 45m', () => {
    expect(formatRuntime(45)).toBe('45m')
  })

  it('should format 148 minutes (Inception runtime) as 2h 28m', () => {
    expect(formatRuntime(148)).toBe('2h 28m')
  })
})

// formatDate - extracts year from date string
describe('formatDate', () => {
  it('should return N/A for null', () => {
    expect(formatDate(null)).toBe('N/A')
  })

  it('should extract year from date string', () => {
    expect(formatDate('2010-07-16')).toBe(2010)
  })

  it('should extract year from another date', () => {
    expect(formatDate('2023-12-25')).toBe(2023)
  })
})

// getRatingColor - returns appropriate color class based on rating
describe('getRatingColor', () => {
  it('should return gray for null rating', () => {
    expect(getRatingColor(null)).toBe('bg-gray-500')
  })

  it('should return green for rating >= 8', () => {
    expect(getRatingColor(8.5)).toBe('bg-green-500')
    expect(getRatingColor(8)).toBe('bg-green-500')
    expect(getRatingColor(10)).toBe('bg-green-500')
  })

  it('should return yellow for rating >= 7 and < 8', () => {
    expect(getRatingColor(7.5)).toBe('bg-yellow-500')
    expect(getRatingColor(7)).toBe('bg-yellow-500')
  })

  it('should return orange for rating >= 6 and < 7', () => {
    expect(getRatingColor(6.5)).toBe('bg-orange-500')
    expect(getRatingColor(6)).toBe('bg-orange-500')
  })

  it('should return red for rating < 6', () => {
    expect(getRatingColor(5)).toBe('bg-red-500')
    expect(getRatingColor(3)).toBe('bg-red-500')
  })
})
