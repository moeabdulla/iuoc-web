"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Client-only mount check without a state-setting effect: subscribes to
  // nothing, so getSnapshot's value flips from false (server) to true
  // (client) on the first client render without triggering a second commit.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    // Placeholder keeps layout stable and avoids a hydration mismatch,
    // since the resolved theme is only known on the client.
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-hidden
        tabIndex={-1}
        className="rounded-full"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="rounded-full text-foreground/70 hover:text-foreground"
    >
      <Sun className="hidden size-[1.15rem] dark:block" />
      <Moon className="block size-[1.15rem] dark:hidden" />
    </Button>
  );
}
