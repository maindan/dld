"use client";

import { useState, type FormEvent } from "react";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function AtualizarSenhaPage() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) {
      setErro("O link expirou ou é inválido. Peça um novo link de recuperação.");
      return;
    }
    setOk(true);
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6 [background:radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(129,140,248,0.1),transparent)]">
      <div className="flex w-full max-w-[360px] flex-col gap-[22px]">
        <div className="flex items-center gap-2.5">
          <div className="flex size-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-[#818cf8] to-[#6366f1] text-background">
            <Terminal size={17} />
          </div>
          <div className="font-mono text-[19px] font-semibold">
            <span className="text-primary">~/</span>danlimadev
          </div>
        </div>

        {ok ? (
          <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-6">
            <div className="text-sm font-semibold">Senha atualizada</div>
            <div className="text-[12.5px] leading-relaxed text-muted-foreground">
              Sua senha foi trocada. Já pode entrar com ela.
            </div>
            <Button onClick={() => window.location.assign("/login")}>Ir para o login</Button>
          </div>
        ) : (
          <form
            onSubmit={salvar}
            className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-6"
          >
            <div className="text-sm font-semibold">Nova senha</div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            {erro && <div className="text-[12.5px] text-destructive">{erro}</div>}
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
