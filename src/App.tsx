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
import ProfilePage from "./pages/ProfilePage";
import RecommendationsPage from './pages/RecommendationsPage';
import PublicProfilePage from "./pages/PublicProfilePage";
import ListDetailsPage from "./pages/ListDetailsPage";

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
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/user/:userId" element={<PublicProfilePage />} />
          <Route path="/lists/:id" element={<ListDetailsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
