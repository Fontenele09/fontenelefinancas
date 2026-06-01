import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value, format, duration = 900, className,
}: { value: number; format: (n: number) => string; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) { setDisplay(to); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
