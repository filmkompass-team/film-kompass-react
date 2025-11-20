export type Mood = "happy" | "sad" | "calm" | "romantic" | "excited";
export type DurationPref = "short" | "medium" | "long";
export type Region = "USA" | "Europe" | "Asia" | "World Cinema";
export type Year = "2020s" | "2000s" | "80s_90s" | "classic" | "any";
export interface SurveyAnswers {
  genres: string[];       // ['action','drama',...]
  mood?: Mood;
  duration?: DurationPref;
  company?: "solo" | "partner" | "family" | "friends";
  region?: Region;
  year?: Year;
}
