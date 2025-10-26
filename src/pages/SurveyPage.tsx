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
    // Şimdilik Movies sayfasına yönlendiriyoruz;
    // İstersen burada API çağırıp önerileri bu sayfada da listeleyebilirsin.
    navigate("/movies");
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Survey initial={initial} onSubmit={handleSubmit} />
      <p className="text-sm text-gray-500 mt-4">
        Not: Cevapların kaydedildi. Movies sayfasında filtreleri buna göre önceden doldurabiliriz.
      </p>
    </div>
  );
}
