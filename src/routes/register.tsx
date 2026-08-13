import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authAPI, setToken } from "@/lib/api/client";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register – DearMemory" }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(formData);
      
      if (response.id) {
        alert("Registration successful! Logging you in...");
        const loginResponse = await authAPI.login(formData.email, formData.password);
        if (loginResponse.access_token) {
          setToken(loginResponse.access_token);
          navigate({ to: "/dashboard" });
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleRegister = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const response = await authAPI.register(formData);
  //     if (response.id) {
  //       alert("Registration successful! Logging you in...");
  //       // Auto-login after registration
  //       const loginResponse = await authAPI.login(formData.email, formData.password);
  //       if (loginResponse.access_token) {
  //         setToken(loginResponse.access_token);
  //         navigate({ to: "/dashboard" });
  //       }
  //     }
  //   }       catch (err) {
  //     console.error("Full error object:", err);
      
  //     if (err instanceof Error) {
  //       setError(err.message);
  //     } else {
  //       setError("Registration failed. Check console for details.");
  //     }
  //   }

  // };
      
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#e8e4de] p-8 w-full max-w-md shadow-lg">
        <h1 className="text-3xl font-bold text-[#1c1a18] mb-2">Create Account</h1>
        <p className="text-[#a09c98] mb-8">Join DearMemory today</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1c1a18] mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-[#e8e4de] rounded-lg focus:outline-none focus:border-[#4A7C6A]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1a18] mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-[#e8e4de] rounded-lg focus:outline-none focus:border-[#4A7C6A]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1a18] mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border border-[#e8e4de] rounded-lg focus:outline-none focus:border-[#4A7C6A]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1a18] mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-[#e8e4de] rounded-lg focus:outline-none focus:border-[#4A7C6A]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A7C6A] text-white py-2 rounded-lg font-semibold hover:bg-[#3d6b5a] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#a09c98]">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="text-[#4A7C6A] font-semibold hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}