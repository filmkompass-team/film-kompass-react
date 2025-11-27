import type { SurveyAnswers } from "../types/survey";

const KEY = "filmkompass_survey";

export function saveSurvey(answers: SurveyAnswers) {
  localStorage.setItem(KEY, JSON.stringify(answers));
}

export function loadSurvey(): SurveyAnswers | null {
  const raw = localStorage.getItem(KEY);
  try { return raw ? (JSON.parse(raw) as SurveyAnswers) : null; }
  catch { return null; }
}

// İleride backend bağlamak istersen:
// export async function submitSurvey(answers: SurveyAnswers) {
//   return fetch("/api/survey", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(answers) })
//     .then(r => r.json());
// }
