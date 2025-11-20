export type DurationPref = "short" | "medium" | "long" | "any";
export type Region = "USA" | "Europe" | "Asia" | "World Cinema" | "any";
export type Year = "2020s" | "2000s" | "80s_90s" | "classic" | "any";
export type Popularity = "high" | "low" | "any";
export interface SurveyAnswers {
  genres: string[];       // ['action','drama',...]
  duration?: DurationPref;
  region?: Region;
  year?: Year;
  popularity?: Popularity;
}
