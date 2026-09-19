import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kollokvie@IFI",
    short_name: "Kollokvie",
    description: "Finn kollokviegruppen din på IFI",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    lang: "no",
    // Matches the icon's navy for the launch splash.
    background_color: "#202743",
    theme_color: "#f3f8fe",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
