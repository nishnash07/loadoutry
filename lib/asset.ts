const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** Prefix a public/ path with the deploy base path (GitHub Pages serves under /loadoutry). */
export const asset = (p: string) => `${base}${p.startsWith("/") ? p : `/${p}`}`;
export const cdIcon = (slug: string) => asset(`/icons/cd/${slug}.webp`);
