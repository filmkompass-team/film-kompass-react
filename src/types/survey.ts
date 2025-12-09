export type DurationPref = "short" | "medium" | "long" | "any";
export type Year = "2020s" | "2000s" | "80s_90s" | "classic" | "any";
export type Region = "hollywood" | "european" | "asian" | "turkish" | "world" | "any";
export type Population = "blockbuster" | "cult" | "hidden_gems" | "festival" | "any";

export interface SurveyAnswers {
  mood: string;
  socialContext: string;
  duration?: DurationPref;
  year?: Year;
  region?: Region;
  population?: Population;
}
