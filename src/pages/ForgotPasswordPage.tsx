import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../utils/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
               redirectTo: `${window.location.origin}/update-password`, 
            });

            if (error) throw error;

            setMessage("Check your email for the reset link!");
            
        }
        catch (err: any) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
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
          <h1 className="text-3xl font-extrabold text-indigo-700">
            Reset Password
          </h1>
          <p className="text-gray-600 mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        {message && (
          <div className="mb-4 text-center text-sm font-medium p-3 rounded-lg text-green-700 bg-green-50 border border-green-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 text-center text-sm font-medium p-3 rounded-lg text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
          >
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

