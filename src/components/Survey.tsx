import { useState } from "react";
import type { SurveyAnswers, DurationPref, Year } from "../types/survey";

type Props = {
  initial?: Partial<SurveyAnswers>;
  onSubmit: (answers: SurveyAnswers) => void;
};

const GENRES = [
  { key: "action", label: "Action 🔥" },
  { key: "comedy", label: "Comedy 😂" },
  { key: "drama", label: "Drama 😭" },
  { key: "sci-fi", label: "Sci-Fi 👽" },
  { key: "romance", label: "Romance 💘" },
  { key: "horror", label: "Horror 😱" },
  { key: "thriller", label: "Thriller 👀" },
  { key: "documentary", label: "Documentary 📺" },
  {key: "animation", label: "Animation 🐭"},
  {key: "fantasy", label: "Fantasy 🦄"},
  {key: "mystery", label: "Mystery 🕵️"},
  {key: "crime", label: "Crime 👮"},
  {key: "adventure", label: "Adventure 🏔️"},
  {key: "biography", label: "Biography 📖"},
  {key: "history", label: "History 📜"},
  {key: "musical", label: "Musical 🎵"},
  {key: "western", label: "Western 🤠"},
  {key: "family", label: "Family 👪"},
  {key: "war", label: "War ⚔️"},
  {key: "sport", label: "Sport ⚽"},
  {key: "any", label: "No Preference"},
  
];

export default function Survey({ onSubmit }: Props) {
  const [answers, setAnswers] = useState<SurveyAnswers>({
    genres: [],
    year: undefined,
    duration: undefined,
    popularity: undefined,
    region: undefined,
  });

// Submit Kontrolü
  const validateSurvey = (a: SurveyAnswers) => {
    return (
      a.genres.length > 0 &&
      a.year &&
      a.duration &&
      a.popularity &&
      a.region
    );
  };

  const handleSubmit = () => {
    if (!validateSurvey(answers)) {
      alert("Please answer all questions before continuing.");
      return;
    }

    onSubmit(answers);
    // ✔ Valid → AI önerilerine gönder
    console.log("All good!", answers);
  };





  const toggleGenre = (g: string) => {
    setAnswers((prev) => ({
      ...prev,
      genres: prev.genres.includes(g)
        ? prev.genres.filter((x) => x !== g)
        : [...prev.genres, g],
    }));
  };

  return (
    <div className="p-6 rounded-2xl shadow bg-white page-transition">
      <h2 className="text-xl font-semibold mb-4">Mini Survey🎬</h2>

      {/* Türler */}
      <div className="mb-4">
        <p className="font-medium mb-2">1) What kind of movies interest you today?</p>
        <div className="grid grid-cols-2 gap-2">
          {GENRES.map((g) => (
            <label key={g.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={answers.genres.includes(g.key)}
                onChange={() => toggleGenre(g.key)}
              />
              <span>{g.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Years */}
      <div className="mb-4">
        <p className="font-medium mb-2">2) Film Era?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.year ?? ""}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, year: (e.target.value || undefined) as Year }))
          }
        >
          <option value="" disabled hidden>
          Select...
          </option>

          <option value="2020s">New (2020+)</option>
          <option value="2000s">2000-2019</option>
          <option value="80s_90s">80-90s</option>
          <option value="classic">Classic</option>
          <option value="any">No Preference</option>
        </select>
      </div>

      {/* Süre */}
      <div className="mb-4">
        <p className="font-medium mb-2">3) How long of a movie would you like to watch?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.duration ?? ""}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, duration: (e.target.value || undefined) as DurationPref }))
          }
        >
          <option value="" disabled hidden>
          Select...
          </option>

          <option value="short">⏱️ &lt; 90 min</option>
          <option value="medium">🎬 90–120 min</option>
          <option value="long">🕓 120+ min</option>
          <option value="any">No Preference</option>
        </select>
      </div>

      {/* Popülerlik */}
      <div className="mb-4">
        <p className="font-medium mb-2">4) Film popularity preference?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.popularity ?? ""}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, popularity: (e.target.value || undefined) as SurveyAnswers["popularity"] }))
          }
        >
          <option value="" disabled hidden>
          Select...
          </option>

          <option value="high">⭐ Popular & high-rated films</option>
          <option value="low">🔍 Underrated / lesser-known films</option>
          <option value="any">⚖️ No preference (mixed)</option>
        </select>
      </div>

      {/* Bölge */}
      <div className="mb-6">
        <p className="font-medium mb-2">5) Region Preference?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.region ?? ""}
          onChange={(e) => 
            setAnswers((p) => ({ ...p, region: (e.target.value || undefined) as SurveyAnswers["region"] }))
          }
          > 
            <option value="" disabled hidden>
            Select...
            </option>
            
            <option value="USA">USA</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
            <option value="World Cinema">World Cinema</option>
            <option value="any">No Preference</option>        
            </select>
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
        onClick={handleSubmit}
        //disabled={answers.genres.length === 0}
        //title={answers.genres.length === 0 ? "En az bir tür seçmelisin" : "Gönder"}
      >
        Get Recommendations
      </button>
    </div>
  );
}
