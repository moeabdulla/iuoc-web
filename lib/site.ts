export const siteConfig = {
  name: "Project IUoC",
  description:
    "Free, high-quality Islamic educational content - from Quran and Science to Philosophy and Psychology - for everyone, worldwide.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  links: {
    youtube: "https://www.youtube.com/@ProjectIUoC",
    instagram: "https://www.instagram.com/projectiuoc/",
    tiktok: "https://www.tiktok.com/@project_iuoc",
    patreon: "https://patreon.com/ProjectIUoC",
    gofundme: "https://gofund.me/6e6a068a",
    paypal: "https://www.paypal.com/donate/?hosted_button_id=ETKBVGRVFKXYE",
  },
  nav: [
    { href: "/app", label: "App" },
    { href: "/videos", label: "Videos" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
  ],
} as const;
