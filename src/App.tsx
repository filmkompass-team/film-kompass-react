import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Movies from "./pages/Movies";
import MovieDetailPage from "./pages/MovieDetailPage";
import VerifiedPage from "./pages/VerifiedPage";
import MyListsPage from "./pages/MyListsPage";
import SurveyPage from "./pages/SurveyPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./utils/supabase";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Movies />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/verified" element={<VerifiedPage />} />
          <Route path="/my-lists" element={<MyListsPage />} />
          <Route path="/my-lists/:listType" element={<MyListsPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription}} = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/update-password");
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
}
export default App;
