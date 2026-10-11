
import { useEffect, useState } from "react";

const API_KEY = "e43d1a7e";

const HOME_MOVIES = [
  { title: "Guardians of the Galaxy Vol. 2", id: "tt3896198" },
  { title: "Avengers: Endgame", id: "tt4154796" },
  { title: "Avatar", id: "tt0499549" },
  { title: "Interstellar", id: "tt0816692" },
  { title: "Inception", id: "tt1375666" },
  { title: "The Dark Knight", id: "tt0468569" },
  { title: "Spider-Man: No Way Home", id: "tt10872600" },
  { title: "Iron Man", id: "tt0371746" },
  { title: "Doctor Strange", id: "tt1211837" },
  { title: "Jurassic Park", id: "tt0107290" },
];

const PLACEHOLDER =
  "https://placehold.co/400x600/171717/ffffff?text=No+Poster";

function App() {
  const [search, setSearch] = useState("");
  const [homeMovies, setHomeMovies] = useState([]);
  const [results, setResults] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Fetch homepage movies
  useEffect(() => {
    let cancelled = false;

    async function loadHomeMovies() {
      const movies = await Promise.all(
        HOME_MOVIES.map(async (item) => {
          try {
            const response = await fetch(
              `https://www.omdbapi.com/?i=${item.id}&apikey=${API_KEY}`
            );
            const data = await response.json();

            return data.Response === "True"
              ? data
              : { ...item, Title: item.title, Poster: "N/A" };
          } catch {
            return { ...item, Title: item.title, Poster: "N/A" };
          }
        })
      );

      if (!cancelled) setHomeMovies(movies);
    }

    loadHomeMovies();

    return () => {
      cancelled = true;
    };
  }, []);

  // Search movies by title
  async function searchMovies(e) {
    e.preventDefault();

    const query = search.trim();
    if (!query) return;

    setSearched(true);
    setLoading(true);
    setError("");
    setMovie(null);
    setResults([]);

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(
          query
        )}&apikey=${API_KEY}`
      );
      const data = await response.json();

      if (data.Response === "True") {
        setResults(data.Search || []);
      } else {
        setError(data.Error || "No movies found.");
      }
    } catch {
      setError("Unable to fetch movies. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch full movie details
  async function selectMovie(imdbID) {
    setLoading(true);
    setError("");
    setMovie(null);

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`
      );
      const data = await response.json();

      if (data.Response === "True") {
        setMovie(data);
      } else {
        setError(data.Error || "Movie details not found.");
      }
    } catch {
      setError("Unable to load movie details.");
    } finally {
      setLoading(false);
    }
  }

  // Return to homepage
  function goHome() {
    setSearch("");
    setMovie(null);
    setResults([]);
    setError("");
    setSearched(false);
    setLoading(false);
  }

  // Return to search results or homepage
  function goBackFromDetails() {
    setMovie(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <button
            onClick={goHome}
            className="text-2xl font-black tracking-tight"
          >
            Cine<span className="text-red-600">Scope</span>
          </button>

          <form
            onSubmit={searchMovies}
            className="flex w-full gap-2 sm:w-auto"
          >
            <input
              id="movie-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="min-w-0 flex-1 rounded-lg border border-white/20 bg-[#171717] px-4 py-2.5 outline-none transition focus:border-red-500 sm:w-64"
            />

            <button
              type="submit"
              disabled={!search.trim() || loading}
              className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Search
            </button>
          </form>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Homepage */}
        {!searched && !movie && (
          <>
            <section className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-[#291014] to-[#101010] p-8 sm:p-14">
              <div className="relative z-10 max-w-2xl">
                <p className="font-bold uppercase tracking-[0.3em] text-red-400">
                  Welcome to CineScope
                </p>

                <h1 className="mt-4 text-4xl font-black sm:text-6xl">
                  Unlimited Movies.
                  <span className="block text-red-500">
                    Endless Stories.
                  </span>
                </h1>

                <p className="mt-5 leading-7 text-gray-300">
                  Discover movies, explore their stories, check ratings,
                  and find your next favourite film.
                </p>

                <button
                  onClick={() =>
                    document.getElementById("movie-search")?.focus()
                  }
                  className="mt-7 rounded-lg bg-red-600 px-6 py-3 font-bold transition hover:bg-red-700"
                >
                  Explore Movies ↓
                </button>
              </div>
            </section>

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Popular Picks
              </h2>
              <span className="text-sm text-gray-500">
                {homeMovies.length} movies
              </span>
            </div>

            {homeMovies.length === 0 ? (
              <LoadingMessage text="Loading movie collection..." />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {homeMovies.map((item) => (
                  <MovieCard
                    key={item.imdbID || item.id}
                    movie={item}
                    onClick={() => {
                      setSearched(false);
                      selectMovie(item.imdbID || item.id);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Search Results */}
        {searched && !movie && !loading && !error && (
          <section>
            <button
              onClick={goHome}
              className="mb-6 text-sm text-gray-400 transition hover:text-white"
            >
              ← Back to Home
            </button>

            <h1 className="mb-6 text-2xl font-bold sm:text-3xl">
              Search Results for "{search}"
            </h1>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.map((item) => (
                  <MovieCard
                    key={item.imdbID}
                    movie={item}
                    onClick={() => selectMovie(item.imdbID)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                No results available. Try searching for another movie.
              </p>
            )}
          </section>
        )}

        {/* Loading */}
        {loading && (
          <LoadingMessage text="Loading movie details..." />
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-20 text-center">
            <p className="text-5xl">🎬</p>
            <h2 className="mt-4 text-2xl font-bold">Oops!</h2>
            <p className="mt-2 text-gray-400">{error}</p>

            <button
              onClick={goHome}
              className="mt-6 rounded-lg bg-red-600 px-5 py-3 font-bold transition hover:bg-red-700"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Selected movie details */}
        {!loading && movie && (
          <MovieDetails
            movie={movie}
            onBack={goBackFromDetails}
          />
        )}
      </main>

      <footer className="mt-12 border-t border-white/10 px-5 py-6 text-center text-sm text-gray-500">
        Movie data provided by Vishal.
      </footer>
    </div>
  );
}

// Reusable movie card
function MovieCard({ movie, onClick }) {
  const poster =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : PLACEHOLDER;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-w-0 text-left focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171717] transition duration-300 group-hover:-translate-y-1 group-hover:border-red-500/70">
        <img
          src={poster}
          alt={movie.Title || movie.title}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <h3 className="mt-3 line-clamp-2 font-bold transition group-hover:text-red-400">
        {movie.Title || movie.title}
      </h3>

      <p className="mt-1 text-sm text-gray-400">
        {movie.Year || movie.year || "Year unavailable"}
      </p>
    </button>
  );
}

// Netflix-inspired movie details page
function MovieDetails({ movie, onBack }) {
  const poster =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : PLACEHOLDER;

  return (
    <section className="min-h-screen">
      <button
        onClick={onBack}
        className="mb-6 rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-300 transition hover:border-red-500 hover:bg-white/10 hover:text-white"
      >
        ← Back
      </button>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141414]">
        {/* Blurred background */}
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-xl"
          style={{ backgroundImage: `url("${poster}")` }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/20" />

        <div className="relative grid items-start gap-8 p-6 sm:p-10 md:grid-cols-[280px_1fr] md:p-14">
          {/* Poster */}
          <div className="mx-auto w-full max-w-[280px]">
            <img
              src={poster}
              alt={movie.Title}
              className="w-full rounded-2xl shadow-2xl"
            />

            <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-sm text-gray-300">IMDb Rating</p>
              <p className="mt-1 text-2xl font-black text-yellow-400">
                ⭐ {movie.imdbRating || "N/A"}
                <span className="text-sm text-gray-400"> / 10</span>
              </p>
            </div>
          </div>

          {/* Movie information */}
          <div className="min-w-0">
            <p className="font-bold uppercase tracking-[0.3em] text-red-400">
              CINESCOPE • MOVIE DETAILS
            </p>

            <h1 className="mt-4 break-words text-4xl font-black sm:text-5xl lg:text-6xl">
              {movie.Title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <span>{movie.Year}</span>
              <span>•</span>
              <span>{movie.Runtime || "Runtime unavailable"}</span>
              <span className="rounded border border-white/30 px-2 py-1">
                {movie.Rated && movie.Rated !== "N/A"
                  ? movie.Rated
                  : "Not Rated"}
              </span>
              <span>{movie.Released || "Release date unavailable"}</span>
            </div>

            {/* Genre tags */}
            <div className="mt-5 flex flex-wrap gap-2">
              {(movie.Genre && movie.Genre !== "N/A"
                ? movie.Genre
                : "Genre unavailable"
              )
                .split(",")
                .map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-300"
                  >
                    {genre.trim()}
                  </span>
                ))}
            </div>

            {/* Plot */}
            <h2 className="mt-8 text-xl font-bold">Story / Overview</h2>
            <p className="mt-3 max-w-3xl leading-8 text-gray-300">
              {movie.Plot && movie.Plot !== "N/A"
                ? movie.Plot
                : "Story details are not available."}
            </p>

            {/* Additional details */}
            <h2 className="mt-8 text-xl font-bold">Movie Information</h2>

            <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Info label="Director" value={movie.Director} />
              <Info label="Writer" value={movie.Writer} />
              <Info label="Cast / Actors" value={movie.Actors} />
              <Info label="Language" value={movie.Language} />
              <Info label="Country" value={movie.Country} />
              <Info label="Awards" value={movie.Awards} />
              <Info label="Box Office" value={movie.BoxOffice} />
              <Info label="Metascore" value={movie.Metascore} />
              <Info label="IMDb Votes" value={movie.imdbVotes} />
              <Info label="IMDb ID" value={movie.imdbID} />
            </div>

            {/* Ratings */}
            <h2 className="mt-10 text-xl font-bold">Ratings</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {movie.Ratings?.length > 0 ? (
                movie.Ratings.map((rating) => (
                  <div
                    key={rating.Source}
                    className="rounded-xl border border-white/10 bg-black/40 p-4"
                  >
                    <p className="text-sm text-gray-400">
                      {rating.Source}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-yellow-400">
                      {rating.Value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">
                  No additional ratings available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Reusable information item
function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-gray-200">
        {value && value !== "N/A" ? value : "N/A"}
      </p>
    </div>
  );
}

// Reusable loading spinner
function LoadingMessage({ text }) {
  return (
    <div className="flex flex-col items-center py-24">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-red-500" />
      <p className="mt-4 text-gray-400">{text}</p>
    </div>
  );
}

export default App;
