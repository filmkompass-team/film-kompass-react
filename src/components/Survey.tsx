import { useState } from "react";
import type { SurveyAnswers, DurationPref, Year, Region, Population } from "../types/survey";

type Props = {
  initial?: Partial<SurveyAnswers>;
  onSubmit: (answers: SurveyAnswers) => void;
};

const MOODS = [
  {key : "inspired", label : "💡 Inspired (Motivation)"},
  {key : "mind-blown", label : "🤯 Mind-Blown (Twists)"},
  {key : "emotional", label : "😢 Emotional (Cry)" },
  {key : "thrilled", label : "😨 Thrilled (Tense)"},
  {key : "happy", label : "🥰 Heart-Warmed (Feel Good)"},
  {key : "entertained", label: "🍿 Just Entertained (Fun)"},
  {key : "neutral", label : "😐 Neutral (No Preference)"}
];

const SOCIAL_CONTEXTS = [
  { key: "alone", label: "👤 Watching Alone" },
  { key: "date", label: "💘 Date Night / Partner" },
  { key: "friends", label: "🍻 With Friends" },
  { key: "family", label: "👨‍👩‍👧 Family Night" },
  { key: "neutral", label: "😐 No Preference" },
];

const REGIONS = [
  { key : "hollywood", label: "🇺🇸 Hollywood (USA)"},
  { key : "european", label: "🇪🇺 European Cinema"},
  { key : "asian", label: "🌏 Asian Cinema (Korea, Japan, India)"},
  { key : "turkish", label: "🇹🇷 Turkish Films"},
  { key : "world", label: "🌍 World Cinema (Mixed)"},
  { key: "any", label: "😐 No Preference"}
];

const POPULATIONS = [
  { key : "blockbuster", label: "🎬 Blockbuster / Mainstream"},
  { key : "cult", label: "🎭 Cult Classics"},
  { key : "hidden_gems", label: "💎 Hidden Gems (Underrated)"},
  { key : "festival", label: "🏆 Festival Favorites (Award-winning)"},
  { key :  "any", label : "😐 No Preference"}
];
  

export default function Survey({ onSubmit }: Props) {
  const [answers, setAnswers] = useState<SurveyAnswers>({
    mood: "",
    socialContext: "",
    year: undefined,
    duration: undefined,
    region: undefined,
    population: undefined,
  });

// Submit Control
  const validateSurvey = (a: SurveyAnswers) => {
    return (
      a.mood !== "" &&
      a.socialContext !== "" &&
      a.year &&
      a.duration &&
      a.region &&
      a.population
    );
  };

  const handleSubmit = () => {
    if (!validateSurvey(answers)) {
      alert("Please answer all questions before continuing.");
      return;
    }

    onSubmit(answers);
    console.log("All good!", answers);
  };


  return (
    <div className="p-6 rounded-2xl shadow bg-white page-transition">
      <h2 className="text-xl font-semibold mb-4">Mini Survey🎬</h2>
      {/* Q1: MOOD */}
      <div className="mb-4">
        <p className="font-medium mb-2">1) How do you want to feel after watching?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.mood}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, mood: e.target.value }))
          }
        >
          <option value="" disabled hidden>
            Select a mood...
          </option>
          {MOODS.map((m) => (
            <option key={m.key} value={m.label}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      {/* Q2: SOCIAL CONTEXT*/}
      <div className="mb-4">
        <p className="font-medium mb-2">2) Who are you watching with?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.socialContext}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, socialContext: e.target.value }))
          }
        >
          <option value="" disabled hidden>
            Select context...
          </option>
          {SOCIAL_CONTEXTS.map((s) => (
            <option key={s.key} value={s.label}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {/* Q3: Years */}
      <div className="mb-4">
        <p className="font-medium mb-2">3) Film Era?</p>
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
      {/* Q4: Duration */}
      <div className="mb-4">
        <p className="font-medium mb-2">4) Duration preference?</p>
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
      {/* Q5: Region */}
      <div className="mb-4">
        <p className="font-medium mb-2">5) Film Origin / Region?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.region ?? ""}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, region: (e.target.value || undefined) as Region }))
          }
        >
          <option value="" disabled hidden>
            Select region...
          </option>
          {REGIONS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
       {/* Q6: Population */}
      <div className="mb-4">
        <p className="font-medium mb-2">6) Film Popularity?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.population ?? ""}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, population: (e.target.value || undefined) as Population }))
          }
        >
          <option value="" disabled hidden>
            Select type...
          </option>
          {POPULATIONS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md w-full font-bold"
        onClick={handleSubmit}
      >
        Get AI Recommendations 🤖
      </button>
    </div>
  );
}
