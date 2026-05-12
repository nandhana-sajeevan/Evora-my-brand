import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiErrorDetail } from "../lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main data-testid="register-page" className="pt-32 md:pt-40 pb-24 container-fluid">
      <div className="grid md:grid-cols-12 gap-12 max-w-6xl mx-auto">
        <div className="md:col-span-6 hidden md:block">
          <div className="aspect-[4/5] overflow-hidden bg-secondary">
            <img
              src="https://images.unsplash.com/photo-1649624963958-554d32e28c55"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="md:col-span-6 md:pl-8 flex flex-col justify-center">
          <p className="text-eyebrow opacity-60">Account</p>
          <h1 className="font-serif text-5xl md:text-6xl font-light mt-3">Join the house.</h1>
          <p className="mt-3 opacity-70 text-sm">Create your account for early access and seasonal invitations.</p>

          <form onSubmit={submit} className="mt-10 space-y-5 max-w-md">
            <div>
              <label className="text-eyebrow opacity-60 block mb-2">Name</label>
              <input
                data-testid="register-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="text-eyebrow opacity-60 block mb-2">Email</label>
              <input
                data-testid="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="text-eyebrow opacity-60 block mb-2">Password</label>
              <input
                data-testid="register-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </div>
            {err && <p className="text-sm text-destructive" data-testid="register-error">{err}</p>}
            <button
              data-testid="register-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-4 text-eyebrow hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
            <p className="text-sm opacity-70">
              Already with us? <Link to="/login" className="underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
