"use client";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Waves } from "lucide-react";
import { useMotionPreference } from "@/lib/courtyard/use-motion-preference";
const subscribe = () => () => {};
export function CourtyardPreferences() {
  const { theme, setTheme } = useTheme();
  const { reduced, toggle } = useMotionPreference();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <div className="courtyard-preferences">
      <div role="group" aria-label="Appearance">
        <span>
          <Sun size={16} aria-hidden="true" />
          Appearance
        </span>
        <div>
          {["light", "dark", "system"].map((t) => (
            <button
              key={t}
              aria-pressed={mounted && theme === t}
              onClick={() => setTheme(t)}
            >
              {t === "system" ? "Auto" : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div role="group" aria-label="Motion">
        <span>
          <Waves size={16} aria-hidden="true" />
          Motion
        </span>
        <div>
          <button
            aria-pressed={mounted && !reduced}
            onClick={() => {
              if (reduced) toggle();
            }}
          >
            Normal
          </button>
          <button
            aria-pressed={mounted && reduced}
            onClick={() => {
              if (!reduced) toggle();
            }}
          >
            Reduced
          </button>
        </div>
      </div>
    </div>
  );
}
