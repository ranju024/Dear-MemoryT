import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authAPI, setToken } from "@/lib/api/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login – DearMemory" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  // const [email, setEmail] = useState("photographer@test.com");
  // const [password, setPassword] = useState("password123");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);
      if (response.access_token) {
        setToken(response.access_token);
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#e8e4de] p-8 w-full max-w-md shadow-lg">
        <h1 className="text-3xl font-bold text-[#1c1a18] mb-2">DearMemory</h1>
        <p className="text-[#a09c98] mb-8">Sign in to your account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1c1a18] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              suppressHydrationWarning
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#e8e4de] rounded-lg focus:outline-none focus:border-[#4A7C6A]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A7C6A] text-white py-2 rounded-lg font-semibold hover:bg-[#3d6b5a] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}