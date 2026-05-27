import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Terminal, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/types";

export default function Login() {
  const [, setLocation] = useLocation();
  const { setUser, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ token: string; refreshToken?: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setUser(data.user, data.token, data.refreshToken);
      setLocation("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl border bg-card/70 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center gap-2 text-primary font-display font-bold text-2xl mb-6">
          <Terminal className="w-8 h-8" />
          Python Edition
        </div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm mb-6">Adaptive & Interactive Learning Assistant</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>
        <div className="flex justify-between text-sm mt-4">
          <Link href="/auth/forgot" className="text-primary hover:underline">Forgot password?</Link>
          <Link href="/auth/signup" className="text-primary hover:underline">Create account</Link>
        </div>
      </motion.div>
    </div>
  );
}
