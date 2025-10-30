# Film Compass

A modern movie discovery app built with React, TypeScript, and TailwindCSS. Features AI-powered recommendations, smart search, and filtering for a collection of 80.000+ movies.

## Contributing

This project is in active development. Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Routing**: React Router DOM
- **Backend**: Supabase (authentication, database)
- **AI/ML**: Python (film recommendations)
- **Build Tool**: Vite
- **Data**: 80.000+ movies from TMDB

## Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/         # Page components
├── services/      # API services
├── types/         # TypeScript definitions
├── utils/         # Utility functions
```

## Features (WIP)

- [x] Movie browsing with pagination
- [x] Search and filtering (genre, year)
- [x] Responsive design
- [x] Movie detail pages
- [x] User authentication (email verification)
- [x] User watchlists (planned)
- [ ] AI recommendations (planned)
- [ ] Reviews and ratings (planned)

## Getting Started

1. **Clone and install:**

   ```bash
   git clone https://github.com/filmkompass-team/film-kompass-react.git
   cd film-kompass-react
   npm install
   ```

2. **Environment Setup**

This project uses environment variables for configuration.
To set up your local environment, follow these steps carefully:

Duplicate the `.env.example` file included in the repository and rename it to `.env`:
Open the .env file and replace the placeholder values with the real keys.

3. **Run development server:**

   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```
