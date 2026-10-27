import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <Image
        src="/brand/iuoc-emblem.png"
        alt="Project IUoC"
        width={192}
        height={192}
        className="block h-full w-full object-contain"
        priority
      />
    </span>
  );
}
