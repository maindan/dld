"use client";

import { useState, type FormEvent } from "react";
import { Terminal, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "rec" | "sent";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    window.location.assign("/inicio");
  }

  async function enviarRec(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/atualizar-senha`,
    });
    setLoading(false);
    if (error) {
      setErro("Não foi possível enviar o link agora.");
      return;
    }
    setMode("sent");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6 [background:radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(129,140,248,0.1),transparent)]">
      <div className="flex w-full max-w-[360px] flex-col gap-[22px]">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-background">
              <Terminal size={17} />
            </div>
            <div className="font-mono text-[19px] font-semibold">
              <span className="text-primary">~/</span>danlimadev
            </div>
          </div>
          <div className="text-[13px] text-muted-foreground">
            Sistema de gerenciamento de freelas
          </div>
        </div>

        {mode === "login" && (
          <form
            onSubmit={entrar}
            className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-6"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            {erro && <div className="text-[12.5px] text-destructive">{erro}</div>}
            <Button type="submit" disabled={loading} className="mt-1">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("rec")}
              className="cursor-pointer p-1.5 text-center text-[12.5px] text-muted-foreground hover:text-primary"
            >
              Esqueci minha senha
            </button>
          </form>
        )}

        {mode === "rec" && (
          <form
            onSubmit={enviarRec}
            className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-6"
          >
            <div className="text-sm font-semibold">Recuperar senha</div>
            <div className="text-[12.5px] leading-relaxed text-muted-foreground">
              Enviaremos um link de redefinição para o seu e-mail.
            </div>
            <Input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {erro && <div className="text-[12.5px] text-destructive">{erro}</div>}
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="cursor-pointer p-1.5 text-center text-[12.5px] text-muted-foreground hover:text-primary"
            >
              Voltar ao login
            </button>
          </form>
        )}

        {mode === "sent" && (
          <div className="flex flex-col items-center gap-3.5 rounded-[14px] border border-border bg-card p-6 text-center">
            <div className="flex size-[42px] items-center justify-center rounded-full border border-success/40 bg-success/10 text-success">
              <CircleCheck size={20} />
            </div>
            <div className="text-sm font-semibold">Link enviado</div>
            <div className="text-[12.5px] leading-relaxed text-muted-foreground">
              Confira sua caixa de entrada em{" "}
              <span className="font-mono text-[#c9d1dc]">{email}</span>
            </div>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="cursor-pointer p-1.5 text-[12.5px] text-primary"
            >
              Voltar ao login
            </button>
          </div>
        )}

        <div className="text-center font-mono text-[11px] text-[#55606e]">
          acesso restrito · sem registro de novos usuários
        </div>
      </div>
    </div>
  );
}
