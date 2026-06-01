import { useEffect, useState, useCallback } from "react";

const KEY = "fontenele-pin-hash";
const UNLOCK_KEY = "fontenele-pin-unlocked";

async function hash(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`fontenele-salt:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function usePin() {
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [unlocked, setUnlocked] = useState<boolean>(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      const hp = !!stored;
      setHasPin(hp);
      // unlock state is session-based (sessionStorage)
      const sessionUnlocked = sessionStorage.getItem(UNLOCK_KEY) === "1";
      setUnlocked(!hp || sessionUnlocked);
    } catch {}
    setReady(true);
  }, []);

  const setPin = useCallback(async (pin: string) => {
    const h = await hash(pin);
    localStorage.setItem(KEY, h);
    sessionStorage.setItem(UNLOCK_KEY, "1");
    setHasPin(true);
    setUnlocked(true);
  }, []);

  const removePin = useCallback(() => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(UNLOCK_KEY);
    setHasPin(false);
    setUnlocked(true);
  }, []);

  const verify = useCallback(async (pin: string) => {
    const stored = localStorage.getItem(KEY);
    if (!stored) return true;
    const h = await hash(pin);
    if (h === stored) {
      sessionStorage.setItem(UNLOCK_KEY, "1");
      setUnlocked(true);
      return true;
    }
    return false;
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(UNLOCK_KEY);
    setUnlocked(false);
  }, []);

  return { ready, hasPin, unlocked, setPin, removePin, verify, lock };
}
