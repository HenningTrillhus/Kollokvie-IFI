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
    background_color: "#16181a",
    theme_color: "#16181a",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
