import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

export default function VerifiedPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Sign out user after email verification
    const handleEmailVerification = async () => {
      try {
        // Sign out the user
        await supabase.auth.signOut();
      } catch (error) {
        // Silently handle sign out errors
      }
    };

    handleEmailVerification();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md mx-4 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ Email Successfully Verified
        </h1>
        <p className="text-gray-700 mb-4">Please log in again.</p>
        <p className="text-sm text-gray-500">
          You will be redirected to the login page in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}
