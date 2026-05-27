import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Terminal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; refreshToken?: string; user: import("@/types").User }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify(form) }
      );
      setUser(data.user, data.token, data.refreshToken);
      setLocation("/dashboard");
      toast({ title: "Welcome!", description: "Your learning journey starts now." });
    } catch (err: unknown) {
      toast({ title: "Signup failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center gap-2 text-primary font-display font-bold text-2xl mb-6">
          <Terminal className="w-8 h-8" />
          Python Edition
        </div>
        <h1 className="text-2xl font-bold mb-1">Create account</h1>
        <p className="text-muted-foreground text-sm mb-6">Start your adaptive Python journey</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign up"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Have an account? <Link href="/auth" className="text-primary hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
