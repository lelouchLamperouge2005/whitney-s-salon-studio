import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Styled By Whitney" }, { name: "description", content: "Owner sign in for Styled By Whitney." }, { property: "og:title", content: "Sign in — Styled By Whitney" }, { property: "og:description", content: "Owner sign in." }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

const field = "w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm outline-none focus:border-primary";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg(error.message);
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
      setBusy(false);
      setMsg(error ? error.message : "Check your email to confirm your account, then sign in.");
    }
  }
  return (
    <section className="mx-auto max-w-md px-5 py-24">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-8">
        <h1 className="text-4xl">{mode === "in" ? "Owner sign in" : "Create owner account"}</h1>
        <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <input className={field} type="password" placeholder="Password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "in" ? "current-password" : "new-password"} />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button className="btn-primary w-full disabled:opacity-60" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}</button>
        <button type="button" className="w-full text-sm text-muted-foreground hover:text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "First time? Create the account" : "Have an account? Sign in"}</button>
      </form>
    </section>
  );
}
