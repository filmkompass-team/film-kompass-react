import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../utils/supabase";
import FilmCompassLogo from "../assets/transparan_logo.png";


export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg animate-pulse"></div>
              <div className="ml-3 h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Site Name */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/movies")}
          >
            <div className="flex items-center space-x-3">
              <img
                src={FilmCompassLogo}
                alt="Film Compass Logo"
                // Logo görselinizin boyutunu TailWind CSS ile ayarlayın
                className="h-12 sm:h-16 w-auto"
              />

            </div>
          </div>

          {/* Right side - Login/Register or User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-gray-700 font-medium text-sm sm:text-base hidden sm:block">
                  Welcome, {user.user_metadata?.username || user.email?.split("@")[0]}
                </span>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-3 py-2 sm:px-4 bg-gray-100 text-gray-700 rounded-lg
                      hover:bg-gray-200 transition-colors duration-200 font-medium
                      cursor-pointer text-sm sm:text-base"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 sm:px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium cursor-pointer text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">

                {/* Login */}
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200 font-medium cursor-pointer hover:bg-gray-50 rounded-lg"
                >
                  Login
                </button>

                {/* Sign Up */}
                <button
                  onClick={() => navigate("/register")}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Sign Up
                </button>
              </div>

            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
