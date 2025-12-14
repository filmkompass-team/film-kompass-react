import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../utils/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 1️⃣ Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessageType("error");
      setMessage("❌ Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // 2️⃣ Domain whitelist kontrolü
    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "icloud.com",
      "hotmail.com",
    ];
    const userDomain = email.split("@")[1];
    if (!allowedDomains.includes(userDomain)) {
      setMessageType("error");
      setMessage("❌ Please use a valid email address.");
      setLoading(false);
      return;
    }

    if (username.trim().length < 3) {
      setMessageType("error");
      setMessage("❌ Username must be at least 3 characters long.");
      setLoading(false);
      return;
    }

    // 3️⃣ Şifre kontrolleri
    if (password.length < 6) {
      setMessageType("error");
      setMessage("❌ Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("❌ Passwords do not match.");
      setLoading(false);
      return;
    }

    // 4️⃣ Supabase kayıt isteği
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verified`, // localhost:5173/verified
        data: {
          username: username.trim(),
        },
      },
    });

    // 5️⃣ Hata kontrolü
    if (error) {
      setMessageType("error");

      if (
        error.message.includes("User already registered") ||
        error.message.includes("already exists") ||
        error.message.includes("duplicate") ||
        error.message.includes("already been registered")
      ) {
        setMessage(
          "❌ This email is already registered. Please try logging in instead."
        );
      } else if (error.message.includes("Password should be at least")) {
        setMessage("❌ Password must be at least 6 characters long.");
      } else if (error.message.includes("Invalid email")) {
        setMessage("❌ Please enter a valid email address.");
      } else {
        setMessage(`❌ ${error.message}`);
      }
    }
    // 6️⃣ Eğer aynı e-posta varsa ama hata dönmediyse (Supabase’in özel davranışı)
    else if (data.user && data.user.identities?.length === 0) {
      setMessageType("error");
      setMessage(
        "❌ This email is already registered. Please try logging in instead."
      );
    }
    // 7️⃣ Gerçekten yeni kayıt
    else {
      setMessageType("success");
      setMessage("📩 Registration successful! Please verify your email.");
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
          <h1 className="text-3xl font-extrabold text-indigo-700">Sign Up</h1>
          <p className="text-gray-600 mt-2">Create a new account</p>
        </div>

        {/* 🧾 Kullanıcıya mesaj */}
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

        {/* 📝 Kayıt formu */}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

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
            minLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">Already have an account?</p>
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
