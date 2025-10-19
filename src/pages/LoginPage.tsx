import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import supabase from "../utils/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type === "signup") {
      setMessage("✅ Email successfully verified. Please log in again.");
      setMessageType("success");
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessageType("error");
      // Handle specific login errors
      if (error.message.includes("Invalid login credentials")) {
        setMessage(
          "❌ Invalid email or password. Please check your credentials."
        );
      } else if (error.message.includes("Email not confirmed")) {
        setMessage("❌ Please verify your email before logging in.");
      } else {
        setMessage(`❌ ${error.message}`);
      }
    } else {
      navigate("/movies");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">🎬</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-indigo-700">Login</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {message && (
          <div
            className={`mb-4 text-center text-sm font-medium p-3 rounded-lg ${
              messageType === "success"
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">Don't have an account?</p>
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
