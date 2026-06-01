import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";

export function PinGate({ onVerify }: { onVerify: (pin: string) => Promise<boolean> }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;
    setBusy(true);
    const ok = await onVerify(pin);
    if (!ok) { toast.error("PIN incorreto"); setPin(""); ref.current?.focus(); }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-xs space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border">
          <Lock className="h-6 w-6 text-silver" />
        </div>
        <div>
          <h1 className="font-display text-2xl">App bloqueado</h1>
          <p className="mt-1 text-sm text-muted-foreground">Digite seu PIN para continuar</p>
        </div>
        <input
          ref={ref}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="h-14 w-full rounded-xl border border-border bg-surface text-center text-3xl tracking-[0.5em] font-display text-foreground outline-none focus:border-silver"
          disabled={busy}
        />
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">4 a 6 dígitos</p>
      </form>
    </div>
  );
}
