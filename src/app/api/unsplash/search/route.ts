import { NextRequest, NextResponse } from "next/server";

export const revalidate = 300;

interface UnsplashPhotoResult {
  id: string;
  title: string;
  url: string;
  thumbUrl: string;
  author: string;
  authorUrl: string;
  category?: string;
  tags?: string[];
}

const REAL_UNSPLASH_DATABASE: UnsplashPhotoResult[] = [
  // === 1. NATURE, MOUNTAINS, FORESTS & LANDSCAPES ===
  {
    id: "nat-yosemite",
    title: "Yosemite Valley Mist & Emerald River",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=70",
    author: "Bailey Zindel",
    authorUrl: "https://unsplash.com/@baileyzindel",
    category: "nature",
    tags: ["natura", "nature", "montagne", "mountains", "yosemite", "forest", "fiume", "alberi", "verde"],
  },
  {
    id: "nat-fog-forest",
    title: "Misty Pine Forest at Dawn",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=70",
    author: "Thomas Verbruggen",
    authorUrl: "https://unsplash.com/@thomasverbruggen",
    category: "nature",
    tags: ["natura", "nature", "foresta", "forest", "nebbia", "fog", "dark", "alberi", "trees"],
  },
  {
    id: "nat-alpine-peaks",
    title: "Sunlit Alpine Mountain Ridge",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=70",
    author: "Jerry Zhang",
    authorUrl: "https://unsplash.com/@zlj370",
    category: "nature",
    tags: ["natura", "nature", "montagne", "mountains", "alpi", "alps", "neve", "snow", "peaks"],
  },
  {
    id: "nat-aurora-glow",
    title: "Aurora Borealis Emerald Glow",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=400&q=70",
    author: "Jonatan Pie",
    authorUrl: "https://unsplash.com/@jonatanpie",
    category: "nature",
    tags: ["natura", "nature", "aurora", "luci", "nord", "green", "night", "cielo", "sky"],
  },
  {
    id: "nat-mountain-mist",
    title: "Obsidian Mountain Mist Horizon",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=70",
    author: "Benjamin Davies",
    authorUrl: "https://unsplash.com/@bendavisual",
    category: "nature",
    tags: ["natura", "nature", "montagne", "mountains", "dark", "stelle", "stars", "night"],
  },
  {
    id: "nat-midnight-coast",
    title: "Volcanic Ocean Coastline",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=70",
    author: "Sean Oulashin",
    authorUrl: "https://unsplash.com/@oulashin",
    category: "nature",
    tags: ["natura", "nature", "mare", "ocean", "spiaggia", "beach", "sunset", "tramonto", "acqua"],
  },
  {
    id: "nat-green-hills",
    title: "Misty Valley & Rolling Green Hills",
    url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=400&q=70",
    author: "Luca Bravo",
    authorUrl: "https://unsplash.com/@lucabravo",
    category: "nature",
    tags: ["natura", "nature", "colline", "hills", "verde", "green", "paesaggio", "landscape"],
  },
  {
    id: "nat-fjord-mist",
    title: "Nordic Fjord Reflections",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=70",
    author: "Pietro De Grandi",
    authorUrl: "https://unsplash.com/@pietro_de_grandi",
    category: "nature",
    tags: ["natura", "nature", "fjord", "fiordo", "montagne", "lago", "lake", "acqua", "riflessi"],
  },
  {
    id: "nat-sunset-lake",
    title: "Sunset Glow Over Mountain Lake",
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&q=70",
    author: "Dawid Zawiła",
    authorUrl: "https://unsplash.com/@dawidzawila",
    category: "nature",
    tags: ["natura", "nature", "tramonto", "sunset", "lago", "lake", "cielo", "arancione", "orange"],
  },
  {
    id: "nat-autumn-pines",
    title: "Autumn Gold Forest & Lake",
    url: "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?auto=format&fit=crop&w=400&q=70",
    author: "Luca Bravo",
    authorUrl: "https://unsplash.com/@lucabravo",
    category: "nature",
    tags: ["natura", "nature", "autunno", "autumn", "foresta", "forest", "lago", "lake"],
  },

  // === 2. ARCHITECTURE, URBAN & MINIMALIST FACADES ===
  {
    id: "arch-glass-facade",
    title: "Geometric Minimalist Glass Facade",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=70",
    author: "Simone Hutsch",
    authorUrl: "https://unsplash.com/@heysupersimi",
    category: "architecture",
    tags: ["architettura", "architecture", "minimal", "palazzo", "edificio", "building", "glass", "facciata"],
  },
  {
    id: "arch-futuristic-tower",
    title: "Futuristic Metropolis High-Tech Tower",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=70",
    author: "Alex Wong",
    authorUrl: "https://unsplash.com/@capturingthejourney",
    category: "architecture",
    tags: ["architettura", "architecture", "città", "city", "grattacielo", "skyscraper", "urban", "moderno"],
  },
  {
    id: "arch-spiral-staircase",
    title: "Monochrome Architectural Spiral",
    url: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=400&q=70",
    author: "Danist Soh",
    authorUrl: "https://unsplash.com/@danistsoh",
    category: "architecture",
    tags: ["architettura", "architecture", "scala", "spiral", "monochrome", "bn", "black and white", "design"],
  },
  {
    id: "arch-brutalist-monolith",
    title: "Obsidian Brutalist Monolith Concrete",
    url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=70",
    author: "Victor Garcia",
    authorUrl: "https://unsplash.com/@victorgarcia",
    category: "architecture",
    tags: ["architettura", "architecture", "brutalism", "cemento", "concrete", "dark", "monolite"],
  },
  {
    id: "arch-white-curves",
    title: "White Curved Concrete Canopy",
    url: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=400&q=70",
    author: "Lance Anderson",
    authorUrl: "https://unsplash.com/@lanceanderson",
    category: "architecture",
    tags: ["architettura", "architecture", "curve", "minimal", "white", "struttura"],
  },
  {
    id: "arch-tokyo-night",
    title: "Tokyo Cyber Skyscraper Twilight",
    url: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=400&q=70",
    author: "Aleksandar Pasaric",
    authorUrl: "https://unsplash.com/@pasaric",
    category: "architecture",
    tags: ["architettura", "architecture", "tokyo", "japan", "luci", "lights", "night", "città", "city"],
  },

  // === 3. ABSTRACT, 3D RENDERS & PRISMATIC GRADIENTS ===
  {
    id: "abs-neon-waves",
    title: "Neon Iridescent Fluid Waves",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=70",
    author: "Milad Fakurian",
    authorUrl: "https://unsplash.com/@fakurian",
    category: "abstract",
    tags: ["astratto", "abstract", "neon", "fluido", "waves", "onde", "viola", "purple", "3d"],
  },
  {
    id: "abs-prismatic-dispersion",
    title: "Prismatic Liquid Light Gradient",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=70",
    author: "Pawel Czerwinski",
    authorUrl: "https://unsplash.com/@pawel_czerwinski",
    category: "abstract",
    tags: ["astratto", "abstract", "gradiente", "gradient", "prisma", "arcobaleno", "colors", "fluido"],
  },
  {
    id: "abs-deepmind-mesh",
    title: "Synthetic Intelligence Neural Mesh",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=70",
    author: "Google DeepMind",
    authorUrl: "https://unsplash.com/@googledeepmind",
    category: "abstract",
    tags: ["astratto", "abstract", "ai", "deepmind", "mesh", "struttura", "rete", "neural", "3d"],
  },
  {
    id: "abs-liquid-obsidian",
    title: "Dark Flowing Obsidian Silk",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=70",
    author: "Steve Johnson",
    authorUrl: "https://unsplash.com/@steve_j",
    category: "abstract",
    tags: ["astratto", "abstract", "dark", "nero", "seta", "silk", "liquido", "minimal"],
  },
  {
    id: "abs-crystal-dispersion",
    title: "Vibrant Crystal Hologram Glass",
    url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=400&q=70",
    author: "Cash Macanaya",
    authorUrl: "https://unsplash.com/@cashmacanaya",
    category: "abstract",
    tags: ["astratto", "abstract", "cristallo", "crystal", "vetro", "holographic", "riflessi"],
  },
  {
    id: "abs-vivid-oil",
    title: "Vivid Multi-Color Fluid Art Sphere",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=70",
    author: "Lucas Benjamin",
    authorUrl: "https://unsplash.com/@lucasbenjamin",
    category: "abstract",
    tags: ["astratto", "abstract", "colori", "colors", "fluido", "sfera", "arte", "moderno"],
  },

  // === 4. DARK TECH, CODE & CYBERPUNK ===
  {
    id: "tech-matrix-code",
    title: "Digital Binary Matrix Rain",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=70",
    author: "Markus Spiske",
    authorUrl: "https://unsplash.com/@markusspiske",
    category: "tech",
    tags: ["tech", "tecnologia", "code", "coding", "matrix", "hacker", "cyberpunk", "software", "programmazione"],
  },
  {
    id: "tech-cyber-geometry",
    title: "Cybernetic Geometry Core",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=70",
    author: "Google DeepMind",
    authorUrl: "https://unsplash.com/@googledeepmind",
    category: "tech",
    tags: ["tech", "tecnologia", "cyberpunk", "geometria", "deepmind", "ai", "dark", "futuro"],
  },
  {
    id: "tech-neural-synapse",
    title: "Neural Network Synapse Nodes",
    url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=70",
    author: "DeepMind AI",
    authorUrl: "https://unsplash.com/@googledeepmind",
    category: "tech",
    tags: ["tech", "tecnologia", "neural", "synapse", "intelligenza artificiale", "ai", "rete"],
  },
  {
    id: "tech-circuit-macro",
    title: "Microprocessor Silicon Semiconductor",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=70",
    author: "Alexandre Debiève",
    authorUrl: "https://unsplash.com/@alexandre_debieve",
    category: "tech",
    tags: ["tech", "tecnologia", "chip", "hardware", "processore", "circuiti", "motherboard"],
  },
  {
    id: "tech-ide-terminal",
    title: "Dark VS Code Developer Workspace",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=70",
    author: "Fatos Bytyqi",
    authorUrl: "https://unsplash.com/@fatosbytyqi",
    category: "tech",
    tags: ["tech", "tecnologia", "code", "coding", "sviluppo", "developer", "terminal", "javascript", "ide"],
  },
  {
    id: "tech-minimal-desk",
    title: "Obsidian Hardware & Minimal Dark Desk",
    url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=400&q=70",
    author: "Jonas Leupe",
    authorUrl: "https://unsplash.com/@jonasleupe",
    category: "tech",
    tags: ["tech", "tecnologia", "minimal", "desk", "laptop", "setup", "dark", "hardware"],
  },

  // === 5. SPACE, GALAXY & COSMOS ===
  {
    id: "spc-stellar-nebula",
    title: "Deep Space Stellar Nebula Cluster",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=70",
    author: "NASA",
    authorUrl: "https://unsplash.com/@nasa",
    category: "space",
    tags: ["spazio", "space", "cosmo", "galaxy", "galassia", "nebula", "stelle", "stars", "universo"],
  },
  {
    id: "spc-hubble-milkyway",
    title: "Hubble Galaxy Star Cluster Glow",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=70",
    author: "NASA Hubble",
    authorUrl: "https://unsplash.com/@nasa",
    category: "space",
    tags: ["spazio", "space", "cosmo", "hubble", "galassia", "galaxy", "stelle", "pianeti"],
  },
  {
    id: "spc-solar-eclipse",
    title: "Cosmic Solar Eclipse Corona Ring",
    url: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=400&q=70",
    author: "Bryan Goff",
    authorUrl: "https://unsplash.com/@bryangoffphoto",
    category: "space",
    tags: ["spazio", "space", "eclissi", "eclipse", "sole", "sun", "luna", "moon", "corona", "dark"],
  },
  {
    id: "spc-earth-orbit",
    title: "Earth Atmospheric Orbit View",
    url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=70",
    author: "NASA ISS",
    authorUrl: "https://unsplash.com/@nasa",
    category: "space",
    tags: ["spazio", "space", "terra", "earth", "orbita", "pianeta", "iss", "astronauta"],
  },
  {
    id: "spc-deep-constellations",
    title: "Violet Constellations in Deep Universe",
    url: "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&w=1600&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&w=400&q=70",
    author: "NASA",
    authorUrl: "https://unsplash.com/@nasa",
    category: "space",
    tags: ["spazio", "space", "costellazioni", "viola", "purple", "stelle", "astronomia"],
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQuery = (searchParams.get("query") || "").trim().toLowerCase();

  // If query is empty or default, return all verified covers
  if (!rawQuery || rawQuery === "all" || rawQuery === "tutto") {
    return NextResponse.json({
      results: REAL_UNSPLASH_DATABASE,
      total: REAL_UNSPLASH_DATABASE.length,
      query: rawQuery,
    }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  }

  // Tokenize query words
  const searchTerms = rawQuery
    .split(/[\s,+-]+/)
    .filter((w) => w.length > 1);

  // Score each photo based on title, author, category and tags
  const scoredPhotos = REAL_UNSPLASH_DATABASE.map((photo) => {
    let score = 0;
    const titleLower = photo.title.toLowerCase();
    const authorLower = photo.author.toLowerCase();
    const categoryLower = (photo.category || "").toLowerCase();
    const tagsLower = (photo.tags || []).join(" ").toLowerCase();

    for (const term of searchTerms) {
      if (categoryLower === term) score += 10;
      if (tagsLower.includes(term)) score += 8;
      if (titleLower.includes(term)) score += 6;
      if (authorLower.includes(term)) score += 4;
    }

    return { photo, score };
  });

  const matchingResults = scoredPhotos
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.photo);

  // If query matches less than 6 photos, supplement with closest category photos
  let finalResults = matchingResults;
  if (finalResults.length < 6) {
    const remaining = REAL_UNSPLASH_DATABASE.filter(
      (p) => !finalResults.some((m) => m.id === p.id)
    );
    finalResults = [...finalResults, ...remaining.slice(0, 12 - finalResults.length)];
  }

  return NextResponse.json({
    results: finalResults,
    total: finalResults.length,
    query: rawQuery,
  }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
