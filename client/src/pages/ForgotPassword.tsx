import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiFetch<{ message: string; resetToken?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast({ title: "Check your email", description: data.message });
      if (data.resetToken) {
        setToken(data.resetToken);
        setStep("reset");
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      toast({ title: "Password updated", description: "You can now log in." });
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl border bg-card/70 backdrop-blur-xl">
        <h1 className="text-2xl font-bold mb-4">Forgot password</h1>
        {step === "request" ? (
          <form onSubmit={requestReset} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        ) : (
          <form onSubmit={reset} className="space-y-4">
            <div>
              <Label>Reset token (dev)</Label>
              <Input value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
            <div>
              <Label>New password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Update password</Button>
          </form>
        )}
        <Link href="/auth" className="text-sm text-primary mt-4 inline-block hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
