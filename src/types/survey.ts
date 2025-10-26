export type Mood = "happy" | "sad" | "calm" | "romantic" | "excited";
export type DurationPref = "short" | "medium" | "long";

export interface SurveyAnswers {
  genres: string[];       // ['action','drama',...]
  mood?: Mood;
  duration?: DurationPref;
  company?: "solo" | "partner" | "family" | "friends";
  language?: string;      // 'tr','en','ko','de', ...
}
