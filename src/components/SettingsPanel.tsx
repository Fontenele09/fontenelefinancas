import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Moon, Sun, CircleDot, Lock, Unlock, Upload, Trash2 } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { useAvatar } from "@/components/AvatarMenu";

const themes: { id: Theme; label: string; desc: string; icon: any; preview: string[] }[] = [
  { id: "midnight", label: "Midnight", desc: "Preto e prata. Padrão.", icon: Moon, preview: ["#0a0a0a", "#1a1a1a", "#c0c0c0"] },
  { id: "arctic", label: "Arctic", desc: "Branco puro, ar e luz.", icon: Sun, preview: ["#fafafa", "#ffffff", "#1a1a1a"] },
  { id: "silver", label: "Silver", desc: "Cinza médio, fosco.", icon: CircleDot, preview: ["#3a3a3a", "#505050", "#e8e8e8"] },
];

export function SettingsPanel({
  hasPin, onSetPin, onRemovePin,
}: {
  hasPin: boolean;
  onSetPin: (pin: string) => Promise<void>;
  onRemovePin: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const { src: avatar, update: setAvatar } = useAvatar();
  const [pinDraft, setPinDraft] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 800_000) return toast.error("Imagem muito grande (máx 800KB)");
    const r = new FileReader();
    r.onload = () => setAvatar(r.result as string);
    r.readAsDataURL(f);
  };

  const savePin = async () => {
    if (pinDraft.length < 4 || pinDraft.length > 6) return toast.error("PIN deve ter 4 a 6 dígitos");
    if (pinDraft !== pinConfirm) return toast.error("PINs não conferem");
    await onSetPin(pinDraft);
    setPinDraft(""); setPinConfirm("");
    toast.success("PIN ativado");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-surface p-6">
        <h3 className="font-display text-lg">Tema visual</h3>
        <p className="mt-1 text-sm text-muted-foreground">Escolha a aparência do app.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative rounded-xl border p-4 text-left transition ${
                  active ? "border-silver bg-surface-2" : "border-border bg-surface hover:border-silver/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-silver" />
                  {active && <Check className="h-4 w-4 text-money" />}
                </div>
                <p className="mt-3 font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
                <div className="mt-3 flex gap-1">
                  {t.preview.map((c) => (
                    <div key={c} className="h-5 w-5 rounded-full border border-border" style={{ background: c }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="border-border bg-surface p-6">
        <h3 className="font-display text-lg">Avatar</h3>
        <p className="mt-1 text-sm text-muted-foreground">Personalize sua foto no header.</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2">
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">Sem foto</span>}
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 text-sm hover:border-silver">
                <Upload className="h-3.5 w-3.5" /> Enviar
              </span>
            </label>
            {avatar && (
              <Button variant="ghost" size="sm" onClick={() => setAvatar(null)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="border-border bg-surface p-6">
        <h3 className="font-display text-lg flex items-center gap-2">
          {hasPin ? <Lock className="h-4 w-4 text-money" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
          PIN de proteção
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasPin ? "PIN ativo. O app pede o código a cada nova sessão." : "Adicione um PIN de 4 a 6 dígitos para proteger o acesso."}
        </p>
        {hasPin ? (
          <Button variant="ghost" className="mt-4 text-loss hover:text-loss" onClick={() => { onRemovePin(); toast.success("PIN removido"); }}>
            Remover PIN
          </Button>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Novo PIN</Label>
              <Input inputMode="numeric" maxLength={6} value={pinDraft} onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, ""))} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Confirmar</Label>
              <Input inputMode="numeric" maxLength={6} value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))} className="mt-1.5" />
            </div>
            <Button onClick={savePin} className="sm:col-span-2 bg-gradient-premium text-primary-foreground">Ativar PIN</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
