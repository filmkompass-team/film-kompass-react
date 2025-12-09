export type DurationPref = "short" | "medium" | "long" | "any";
export type Year = "2020s" | "2000s" | "80s_90s" | "classic" | "any";

export interface SurveyAnswers {
  mood: string;
  socialContext: string;
  duration?: DurationPref;
  year?: Year;
}
