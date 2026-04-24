import { useState, FormEvent } from "react";
import { useAuth } from "../lib/auth";
import { Eye, EyeOff, Zap } from "lucide-react";

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, fullName, orgName);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">OPIX</span>
          </div>
          <p className="text-zinc-400 text-sm">Social Media Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 backdrop-blur">
          <div className="flex gap-2 mb-6 bg-zinc-800/50 rounded-lg p-1">
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === m ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}>
                {m === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Nama lengkap</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                    placeholder="John Doe" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1.5 block">Nama organisasi / agensi</label>
                  <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required
                    placeholder="Creative Studio" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition" />
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-all mt-2">
              {loading ? "Loading..." : mode === "login" ? "Masuk" : "Buat Akun"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Part of <span className="text-zinc-400">Tiranyx Platform</span>
        </p>
      </div>
    </div>
  );
}
