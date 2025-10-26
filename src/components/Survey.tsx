import { useState } from "react";
import type { SurveyAnswers, DurationPref, Mood } from "../types/survey";

type Props = {
  initial?: Partial<SurveyAnswers>;
  onSubmit: (answers: SurveyAnswers) => void;
};

const GENRES = [
  { key: "action", label: "Aksiyon" },
  { key: "comedy", label: "Komedi" },
  { key: "drama", label: "Dram" },
  { key: "sci-fi", label: "Bilim Kurgu" },
  { key: "romance", label: "Romantik" },
  { key: "horror", label: "Korku" },
  { key: "thriller", label: "Gerilim" },
  { key: "documentary", label: "Belgesel" },
];

export default function Survey({ initial, onSubmit }: Props) {
  const [answers, setAnswers] = useState<SurveyAnswers>({
    genres: initial?.genres ?? [],
    mood: initial?.mood,
    duration: initial?.duration,
    company: initial?.company,
    language: initial?.language ?? "tr",
  });

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
      <h2 className="text-xl font-semibold mb-4">Mini Anket 🎬</h2>

      {/* Türler */}
      <div className="mb-4">
        <p className="font-medium mb-2">1) Hangi türleri seversin?</p>
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

      {/* Mood */}
      <div className="mb-4">
        <p className="font-medium mb-2">2) Şu an ruh halin?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.mood ?? ""}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, mood: (e.target.value || undefined) as Mood }))
          }
        >
          <option value="">Seç...</option>
          <option value="happy">Keyifli</option>
          <option value="sad">Hüzünlü</option>
          <option value="calm">Sakin</option>
          <option value="romantic">Romantik</option>
          <option value="excited">Heyecanlı</option>
        </select>
      </div>

      {/* Süre */}
      <div className="mb-4">
        <p className="font-medium mb-2">3) Ne kadar uzunluk?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.duration ?? ""}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, duration: (e.target.value || undefined) as DurationPref }))
          }
        >
          <option value="">Farketmez</option>
          <option value="short">⏱️ &lt; 90 dk</option>
          <option value="medium">🎬 90–120 dk</option>
          <option value="long">🕓 120+ dk</option>
        </select>
      </div>

      {/* Ortam */}
      <div className="mb-4">
        <p className="font-medium mb-2">4) Kiminle izliyorsun?</p>
        <select
          className="border rounded p-2 w-full"
          value={answers.company ?? ""}
          onChange={(e) =>
            setAnswers((p) => ({ ...p, company: (e.target.value || undefined) as SurveyAnswers["company"] }))
          }
        >
          <option value="">Seç...</option>
          <option value="solo">Tek başıma</option>
          <option value="partner">Partnerimle</option>
          <option value="family">Ailemle</option>
          <option value="friends">Arkadaşlarımla</option>
        </select>
      </div>

      {/* Dil */}
      <div className="mb-6">
        <p className="font-medium mb-2">5) Dil/Ülke tercihi?</p>
        <input
          className="border rounded p-2 w-full"
          placeholder="tr, en, ko, fr, de... (boş bırak: fark etmez)"
          value={answers.language ?? ""}
          onChange={(e) => setAnswers((p) => ({ ...p, language: e.target.value }))}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
        onClick={() => onSubmit(answers)}
        disabled={answers.genres.length === 0}
        title={answers.genres.length === 0 ? "En az bir tür seçmelisin" : "Gönder"}
      >
        Önerileri Göster
      </button>
    </div>
  );
}
