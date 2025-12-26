import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MovieCard from '../../components/MovieCard'
import type { Movie } from '../../types/movie'

// Test movie data
const mockMovie: Movie = {
  id: 1,
  tmdb_id: 27205,
  title: 'Inception',
  overview: 'A thief who steals corporate secrets through dream-sharing technology.',
  poster_url: 'https://example.com/poster.jpg',
  backdrop_url: 'https://example.com/backdrop.jpg',
  release_date: '2010-07-16',
  vote_average: 8.8,
  vote_count: 30000,
  runtime: 148,
  genres: ['Action', 'Sci-Fi', 'Thriller'],
  spoken_languages: 'English',
  created_at: '2024-01-01'
}

describe('MovieCard Component', () => {
  it('should render movie title', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('should render movie genres', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
  })

  it('should render movie rating', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    expect(screen.getByText('8.8')).toBeInTheDocument()
  })

  it('should render release year', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    expect(screen.getByText('2010')).toBeInTheDocument()
  })

  it('should render runtime', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    expect(screen.getByText('2h 28m')).toBeInTheDocument()
  })

  it('should render movie overview', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    )
    expect(screen.getByText(/thief who steals corporate secrets/i)).toBeInTheDocument()
  })
})
