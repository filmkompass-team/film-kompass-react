# Film Compass

A modern movie discovery app built with React, TypeScript, and TailwindCSS. Features AI-powered recommendations, smart search, and filtering for a collection of 8,000+ movies.

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
- **Data**: Static JSON (8,000+ movies from TMDB)

## Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/         # Page components
├── services/      # API services
├── types/         # TypeScript definitions
├── utils/         # Utility functions
└── data/          # Static movie data
```

## Features (WIP)

- [x] Movie browsing with pagination
- [x] Search and filtering (genre, year)
- [x] Responsive design
- [x] Movie detail pages
- [x] User authentication (email verification)
- [ ] AI recommendations (planned)
- [ ] User watchlists (planned)
- [ ] Reviews and ratings (planned)

## Getting Started

1. **Clone and install:**

   ```bash
   git clone https://github.com/berkekucuk/film-compass.git
   cd film-compass
   npm install
   ```

2. **Supabase Setup (Required for contributors):**

   This project uses Supabase for authentication and database functionality. To contribute, you'll need to set up your own Supabase project:

   a. **Create a Supabase project:**

   - Go to [supabase.com](https://supabase.com)
   - Create a new account or sign in
   - Create a new project
   - Wait for the project to be ready

   b. **Get your project credentials:**

   - Go to the connect section in the navbar
   - Select App Frameworks → React → Vite
   - Copy your Project URL and anon key

   c. **Create environment file:**
   Create a `.env` file in the project root and add your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

   d. **Set up authentication (optional for basic development):**

   - Go to Authentication → Settings in your Supabase dashboard
   - Configure email settings if you want to test authentication features
   - The app will work without authentication for basic movie browsing

3. **Run development server:**

   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```
