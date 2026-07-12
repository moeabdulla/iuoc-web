import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <Image
        src="/brand/iuoc-logo-light@3x.png"
        alt="Project IUoC"
        width={44}
        height={44}
        className="block h-full w-full object-contain dark:hidden"
        priority
      />
      <Image
        src="/brand/iuoc-logo-dark@3x.png"
        alt="Project IUoC"
        width={44}
        height={44}
        className="hidden h-full w-full object-contain dark:block"
        priority
      />
    </span>
  );
}
