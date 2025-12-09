import { useNavigate } from "react-router-dom";
import Survey from "../components/Survey";
import { saveSurvey, loadSurvey } from "../services/surveyService";
import type { SurveyAnswers } from "../types/survey";
import { useMemo } from "react";

export default function SurveyPage() {
  const navigate = useNavigate();
  const initial = useMemo(() => loadSurvey() ?? undefined, []);

  const handleSubmit = (answers: SurveyAnswers) => {
    saveSurvey(answers);
    const aiPrompt = `Recommend me a movie that makes me feel ${answers.mood}.
    I am watching with ${answers.socialContext}. Preferred duration is ${answers.duration || "any"}. Era: ${answers.year || "any"}. ${answers.region && answers.region !== "any" ? `Prefer films from ${answers.region} region. ` : ""} ${answers.population && answers.population !== "any" ? `Looking for ${answers.population} type films.` : ""}`;

     const params = new URLSearchParams();
     params.set("aiRecommendation", aiPrompt);

     navigate(`/movies?${params.toString()}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Survey initial={initial} onSubmit={handleSubmit} />
    </div>
  );
}
