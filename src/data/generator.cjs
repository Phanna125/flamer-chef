const fs = require('fs');
const path = require('path');

const baseRecipes = [
  {
    id: "amok-trey",
    name: { en: "Fish Amok", km: "អាម៉ុកត្រី" },
    image: "/images/amok.png",
    category: "Soup & Stew",
    difficulty: "medium",
    prepTime: 20,
    cookTime: 40,
    servings: 4,
    rating: 4.8,
    dietary: ["pescatarian", "gluten-free"],
    ingredients: [
      { name: "Fish fillet (Snakehead or Catfish)", amount: "500g", essential: true },
      { name: "Coconut milk", amount: "400ml", essential: true },
      { name: "Kroeung (Lemongrass paste)", amount: "3 tbsp", essential: true },
      { name: "Kaffir lime leaves", amount: "4 leaves", essential: false },
      { name: "Fish sauce", amount: "2 tbsp", essential: true },
      { name: "Sugar", amount: "1 tbsp", essential: false },
      { name: "Egg", amount: "1", essential: false }
    ],
    steps: [
      { instruction: "Slice the fish into bite-sized pieces.", timer: null, tip: "Use a firm white fish like snakehead or snapper." },
      { instruction: "Mix coconut milk, kroeung, fish sauce, and egg in a bowl.", timer: null, tip: null },
      { instruction: "Gently fold the fish into the mixture.", timer: null, tip: null },
      { instruction: "Pour the mixture into banana leaf bowls (or ramekins).", timer: null, tip: null },
      { instruction: "Steam for 30-40 minutes until set.", timer: 2400, tip: "Check with a toothpick to ensure it's cooked through." }
    ]
  },
  {
    id: "beef-lok-lak",
    name: { en: "Beef Lok Lak", km: "ឡុកឡាក់សាច់គោ" },
    image: "/images/loklak.png",
    category: "Stir-fry",
    difficulty: "easy",
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    rating: 4.9,
    dietary: ["dairy-free"],
    ingredients: [
      { name: "Beef tenderloin", amount: "300g", essential: true },
      { name: "Soy sauce", amount: "2 tbsp", essential: true },
      { name: "Oyster sauce", amount: "1 tbsp", essential: true },
      { name: "Tomato", amount: "1", essential: false },
      { name: "Lettuce", amount: "1 head", essential: false },
      { name: "Kampot pepper", amount: "1 tsp", essential: true },
      { name: "Lime", amount: "1", essential: true },
      { name: "Garlic", amount: "3 cloves", essential: true }
    ],
    steps: [
      { instruction: "Marinate the beef with soy sauce, oyster sauce, and minced garlic for 15 mins.", timer: 900, tip: null },
      { instruction: "Prepare the dipping sauce: mix lime juice, Kampot pepper, and a pinch of salt.", timer: null, tip: "Kampot pepper is key to authentic flavor." },
      { instruction: "Sear the beef quickly in a hot pan.", timer: 180, tip: "Don't overcook, keep it tender." },
      { instruction: "Serve over a bed of fresh lettuce and sliced tomatoes.", timer: null, tip: null }
    ]
  },
  {
    id: "samlor-korko",
    name: { en: "Samlor Korko", km: "សម្លកកូរ" },
    image: "/images/korko.png",
    category: "Soup & Stew",
    difficulty: "hard",
    prepTime: 30,
    cookTime: 45,
    servings: 6,
    rating: 4.7,
    dietary: ["dairy-free"],
    ingredients: [
      { name: "Pork belly or Fish", amount: "300g", essential: true },
      { name: "Prahok", amount: "1 tbsp", essential: true },
      { name: "Kroeung", amount: "3 tbsp", essential: true },
      { name: "Roasted ground rice", amount: "2 tbsp", essential: true },
      { name: "Green papaya", amount: "1 cup", essential: false },
      { name: "Pumpkin", amount: "1 cup", essential: false },
      { name: "Holy basil", amount: "1/2 cup", essential: false }
    ],
    steps: [
      { instruction: "Stir-fry kroeung and prahok until fragrant.", timer: 300, tip: null },
      { instruction: "Add meat and brown on all sides.", timer: 300, tip: null },
      { instruction: "Add roasted ground rice and stir well.", timer: null, tip: "This thickens the soup and adds a nutty flavor." },
      { instruction: "Add water to cover and simmer.", timer: 900, tip: null },
      { instruction: "Add vegetables sequentially based on their cooking time (hardest first).", timer: null, tip: null },
      { instruction: "Simmer until all vegetables are tender. Garnish with basil.", timer: 900, tip: null }
    ]
  },
  {
    id: "nom-banh-chok",
    name: { en: "Nom Banh Chok", km: "នំបញ្ចុក" },
    image: "/images/nombanhchok.png",
    category: "Noodles",
    difficulty: "medium",
    prepTime: 40,
    cookTime: 30,
    servings: 4,
    rating: 4.8,
    dietary: ["pescatarian", "dairy-free"],
    ingredients: [
      { name: "Fresh rice noodles", amount: "500g", essential: true },
      { name: "Snakehead fish or Tilapia", amount: "400g", essential: true },
      { name: "Kroeung", amount: "4 tbsp", essential: true },
      { name: "Coconut milk", amount: "1 cup", essential: true },
      { name: "Banana blossom", amount: "1/2 cup", essential: false },
      { name: "Cucumber", amount: "1", essential: false },
      { name: "Mint leaves", amount: "1 bunch", essential: false }
    ],
    steps: [
      { instruction: "Boil the fish until cooked, then debone and lightly pound the meat.", timer: 600, tip: null },
      { instruction: "Stir-fry kroeung in a pan until fragrant, then add the pounded fish.", timer: 300, tip: null },
      { instruction: "Add coconut milk and water, simmer into a light green gravy.", timer: 1200, tip: "Adjust consistency with water." },
      { instruction: "Serve noodles in a bowl, pour the hot gravy over.", timer: null, tip: null },
      { instruction: "Top with fresh shredded banana blossom, cucumber, and mint.", timer: null, tip: null }
    ]
  },
  {
    id: "bai-sach-chrouk",
    name: { en: "Bai Sach Chrouk", km: "បាយសាច់ជ្រូក" },
    image: "/images/baisachchrouk.png",
    category: "Rice",
    difficulty: "easy",
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    rating: 4.9,
    dietary: ["dairy-free"],
    ingredients: [
      { name: "Pork neck or shoulder", amount: "300g", essential: true },
      { name: "Garlic", amount: "4 cloves", essential: true },
      { name: "Soy sauce", amount: "2 tbsp", essential: true },
      { name: "Palm sugar", amount: "1 tbsp", essential: true },
      { name: "Broken rice", amount: "2 cups", essential: true },
      { name: "Cucumber", amount: "1", essential: false },
      { name: "Daikon radish", amount: "1/2", essential: false }
    ],
    steps: [
      { instruction: "Marinate thinly sliced pork with garlic, soy sauce, and palm sugar.", timer: 1800, tip: "Overnight marination yields the best results." },
      { instruction: "Grill pork slices over hot coals until caramelized and cooked.", timer: 600, tip: null },
      { instruction: "Cook the broken rice to a fluffy consistency.", timer: null, tip: null },
      { instruction: "Quickly pickle sliced cucumber and daikon in a vinegar-sugar mix.", timer: null, tip: null },
      { instruction: "Serve grilled pork over rice with pickled vegetables.", timer: null, tip: null }
    ]
  }
];

const recipesFile = path.join(__dirname, 'recipes.js');
const publicImagesDir = path.join(__dirname, '..', '..', 'public', 'images');
const generatedImagesDir = path.join(publicImagesDir, 'generated');
const publicImgDir = path.join(__dirname, '..', '..', 'public', 'img');
const supportedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg']);
const customImageRoots = [
  { dir: publicImgDir, urlPrefix: '/img' },
  { dir: publicImagesDir, urlPrefix: '/images' },
];

let customRecipeImagesCache = null;

function loadExistingRecipes() {
  if (!fs.existsSync(recipesFile)) {
    return new Map();
  }

  const raw = fs.readFileSync(recipesFile, 'utf8');
  const match = raw.match(/^export const recipes = (.*);\s*$/s);

  if (!match) {
    return new Map();
  }

  try {
    const parsed = JSON.parse(match[1]);
    return new Map(parsed.map((recipe) => [recipe.id, recipe]));
  } catch (error) {
    console.warn('Could not parse existing recipes.js, regenerating generated values.');
    return new Map();
  }
}

function resetGeneratedImages() {
  fs.mkdirSync(generatedImagesDir, { recursive: true });

  for (const entry of fs.readdirSync(generatedImagesDir)) {
    if (entry.endsWith('.svg')) {
      fs.unlinkSync(path.join(generatedImagesDir, entry));
    }
  }
}

function normalizeImageKey(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function collectImageFiles(rootDir, urlPrefix) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const files = [];
  const queue = [{ dir: rootDir, prefix: urlPrefix }];

  while (queue.length > 0) {
    const current = queue.shift();

    for (const entry of fs.readdirSync(current.dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (current.dir === publicImagesDir && entry.name === 'generated') {
          continue;
        }

        queue.push({
          dir: path.join(current.dir, entry.name),
          prefix: `${current.prefix}/${entry.name}`,
        });
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();

      if (!supportedImageExtensions.has(extension)) {
        continue;
      }

      const baseName = path.parse(entry.name).name;
      files.push({
        normalized: normalizeImageKey(baseName),
        url: `${current.prefix}/${entry.name}`.replace(/\\/g, '/'),
      });
    }
  }

  return files;
}

function loadCustomRecipeImages() {
  if (!customRecipeImagesCache) {
    customRecipeImagesCache = customImageRoots.flatMap((root) => collectImageFiles(root.dir, root.urlPrefix));
  }

  return customRecipeImagesCache;
}

function findCustomRecipeImage(recipe) {
  const normalizedName = normalizeImageKey(recipe.name.en);
  const normalizedId = normalizeImageKey(recipe.id);
  const files = loadCustomRecipeImages();

  const exactMatch = files.find((file) => file.normalized === normalizedName || file.normalized === normalizedId);
  if (exactMatch) {
    return exactMatch.url;
  }

  const prefixMatch = files.find((file) => file.normalized.startsWith(normalizedName) || file.normalized.startsWith(normalizedId));
  return prefixMatch ? prefixMatch.url : null;
}

function hashString(value) {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function numberFromHash(key, min, max, offset = 0) {
  const span = max - min + 1;
  return min + (hashString(`${key}:${offset}`) % span);
}

function pickFromHash(options, key, offset = 0) {
  return options[hashString(`${key}:${offset}`) % options.length];
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function wrapTitle(text, maxChars = 18) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxChars || currentLine.length === 0) {
      currentLine = nextLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3);
}

const categoryPalettes = {
  "Stir-fry": {
    backgroundStart: "#7a2f20",
    backgroundEnd: "#d88a44",
    panel: "rgba(35, 15, 10, 0.34)",
    border: "rgba(255, 245, 233, 0.22)",
    heading: "#fff5ea",
    copy: "rgba(255, 245, 233, 0.86)",
    highlight: "#f6d3a2",
    shadow: "rgba(27, 10, 5, 0.45)",
  },
  "Soup & Stew": {
    backgroundStart: "#23443c",
    backgroundEnd: "#6ea17b",
    panel: "rgba(11, 30, 26, 0.34)",
    border: "rgba(239, 248, 237, 0.22)",
    heading: "#f3fbef",
    copy: "rgba(243, 251, 239, 0.84)",
    highlight: "#d2ecb6",
    shadow: "rgba(8, 19, 17, 0.45)",
  },
  "Rice": {
    backgroundStart: "#73421f",
    backgroundEnd: "#d6a55c",
    panel: "rgba(46, 24, 9, 0.30)",
    border: "rgba(255, 246, 228, 0.22)",
    heading: "#fff7e5",
    copy: "rgba(255, 247, 229, 0.84)",
    highlight: "#f2d185",
    shadow: "rgba(31, 17, 8, 0.42)",
  },
  "Noodles": {
    backgroundStart: "#24435d",
    backgroundEnd: "#73a1b9",
    panel: "rgba(12, 24, 33, 0.32)",
    border: "rgba(240, 248, 252, 0.22)",
    heading: "#f4fbff",
    copy: "rgba(244, 251, 255, 0.84)",
    highlight: "#cce9f1",
    shadow: "rgba(10, 16, 22, 0.45)",
  },
};

const proteinAccents = {
  chicken: "#f3d7ab",
  pork: "#f0c1ad",
  beef: "#f2b09b",
  shrimp: "#ffb08a",
  squid: "#d7dfee",
  tofu: "#ede1b0",
  fish: "#9bd1d8",
};

function buildRecipeCover(recipe, meta) {
  const palette = categoryPalettes[recipe.category] || categoryPalettes["Stir-fry"];
  const accent = proteinAccents[meta.proteinId] || "#f1dbc3";
  const seed = hashString(recipe.id);
  const titleLines = wrapTitle(recipe.name.en);
  const shapeRotation = numberFromHash(recipe.id, -18, 18, 20);
  const bubbleOneX = numberFromHash(recipe.id, 740, 1020, 21);
  const bubbleOneY = numberFromHash(recipe.id, 100, 290, 22);
  const bubbleTwoX = numberFromHash(recipe.id, 820, 1100, 23);
  const bubbleTwoY = numberFromHash(recipe.id, 340, 620, 24);
  const ribbonY = numberFromHash(recipe.id, 610, 690, 25);
  const flavorWord = meta.styleName.replace('Stir-fried ', '').replace('with ', '');
  const detailY = 360 + (titleLines.length - 1) * 86;

  const garnishDots = Array.from({ length: 16 }, (_, index) => {
    const x = numberFromHash(recipe.id, 120, 1060, 40 + index);
    const y = numberFromHash(recipe.id, 110, 780, 60 + index);
    const radius = numberFromHash(recipe.id, 6, 16, 80 + index);
    const opacity = (18 + (seed + index * 7) % 28) / 100;
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${accent}" opacity="${opacity}"/>`;
  }).join('');

  const titleMarkup = titleLines.map((line, index) => {
    const dy = index === 0 ? 0 : 86;
    return `<tspan x="0" dy="${dy}">${escapeXml(line)}</tspan>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(recipe.name.en)}</title>
  <desc id="desc">Generated recipe cover for ${escapeXml(recipe.name.en)}.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.backgroundStart}"/>
      <stop offset="100%" stop-color="${palette.backgroundEnd}"/>
    </linearGradient>
    <linearGradient id="panelGlow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="${palette.highlight}" stop-opacity="0.18"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="${palette.shadow}"/>
    </filter>
  </defs>

  <rect width="1200" height="900" rx="48" fill="url(#bg)"/>
  <rect x="42" y="42" width="1116" height="816" rx="36" fill="none" stroke="${palette.border}" stroke-width="2"/>

  <g opacity="0.16">
    ${garnishDots}
  </g>

  <g transform="translate(820 170) rotate(${shapeRotation})" filter="url(#shadow)">
    <ellipse cx="0" cy="0" rx="210" ry="160" fill="url(#panelGlow)"/>
    <ellipse cx="0" cy="0" rx="138" ry="104" fill="${palette.panel}"/>
    <path d="M -92 0 C -48 -78, 52 -74, 96 0 C 46 70, -44 82, -92 0 Z" fill="${accent}" opacity="0.72"/>
    <path d="M -38 -60 C 20 -48, 58 18, 14 64 C -44 56, -72 -10, -38 -60 Z" fill="${palette.highlight}" opacity="0.52"/>
  </g>

  <circle cx="${bubbleOneX}" cy="${bubbleOneY}" r="104" fill="${accent}" opacity="0.12"/>
  <circle cx="${bubbleTwoX}" cy="${bubbleTwoY}" r="148" fill="${palette.highlight}" opacity="0.10"/>

  <g filter="url(#shadow)">
    <rect x="72" y="108" width="268" height="52" rx="26" fill="${palette.panel}"/>
    <text x="102" y="141" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-size="26" font-weight="700" fill="${palette.heading}">${escapeXml(recipe.category.toUpperCase())}</text>

    <rect x="72" y="${ribbonY}" width="304" height="58" rx="29" fill="${accent}"/>
    <text x="104" y="${ribbonY + 37}" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-size="28" font-weight="700" fill="#2f1a0f">${escapeXml(meta.proteinLabel.toUpperCase())}</text>
  </g>

  <g transform="translate(78 214)">
    <text font-family="Georgia, 'Times New Roman', serif" font-size="82" font-weight="700" fill="${palette.heading}">
      ${titleMarkup}
    </text>
    <text x="0" y="${detailY}" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-size="28" fill="${palette.copy}">Prep ${recipe.prepTime} min | Cook ${recipe.cookTime} min | Serves ${recipe.servings}</text>
    <text x="0" y="${detailY + 52}" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-size="24" fill="${palette.copy}">Style: ${escapeXml(flavorWord)} | Rating ${recipe.rating.toFixed(1)}</text>
  </g>
</svg>
`;
}

function writeRecipeCover(recipe, meta) {
  const fileName = `${recipe.id}.svg`;
  const imagePath = path.join(generatedImagesDir, fileName);
  fs.writeFileSync(imagePath, buildRecipeCover(recipe, meta), 'utf8');
  return `/images/generated/${fileName}`;
}

const existingRecipesById = loadExistingRecipes();
resetGeneratedImages();

const meats = [
  { en: "Chicken", km: "ážŸáž¶áž…áŸ‹áž˜áž¶áž“áŸ‹", ids: "chicken" },
  { en: "Pork", km: "ážŸáž¶áž…áŸ‹áž‡áŸ’ážšáž¼áž€", ids: "pork" },
  { en: "Beef", km: "ážŸáž¶áž…áŸ‹áž‚áŸ„", ids: "beef" },
  { en: "Shrimp", km: "áž”áž„áŸ’áž‚áž¶", ids: "shrimp" },
  { en: "Squid", km: "áž˜áž¹áž€", ids: "squid" },
  { en: "Tofu", km: "ážáŸ…áž áŸŠáž¼", ids: "tofu" },
  { en: "Fish", km: "ážáŸ’ážšáž¸", ids: "fish" }
];

const styles = [
  { en: "Stir-fried with Basil", km: "áž†áž¶áž€áŸ’ážáŸ…", method: "Stir-fry", pre: "cha-kdao" },
  { en: "Stir-fried with Ginger", km: "áž†áž¶ážáŸ’áž‰áž¸", method: "Stir-fry", pre: "cha-knei" },
  { en: "Stir-fried Sweet & Sour", km: "áž†áž¶áž‡áž¼ážšáž¢áŸ‚áž˜", method: "Stir-fry", pre: "cha-chour-em" },
  { en: "Sour Soup", km: "ážŸáž˜áŸ’áž›áž˜áŸ’áž‡áž¼ážš", method: "Soup & Stew", pre: "samlor-machou" },
  { en: "Curry", km: "ážŸáž˜áŸ’áž›áž€áž¶ážšáž¸", method: "Soup & Stew", pre: "samlor-kari" },
  { en: "Fried Rice", km: "áž”áž¶áž™აჟ†აჟ¶", method: "Rice", pre: "bai-cha" },
  { en: "Noodle Soup", km: "áž‚აჟ»აჟ™აჟ‘აჟ¶აჟœ", method: "Noodles", pre: "kuy-teav" }
];

const ratings = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
const diffs = ["easy", "medium", "hard"];
const extraRecipes = [];
let generatedCoverCount = 0;
let customPhotoCount = 0;

for (let i = 0; i < styles.length && extraRecipes.length < 45; i++) {
  for (let j = 0; j < meats.length && extraRecipes.length < 45; j++) {
    const style = styles[i];
    const meat = meats[j];

    if (style.en === "Curry" && meat.en === "Squid") continue;
    if (style.en === "Noodle Soup" && meat.en === "Tofu") continue;

    const recipeId = `${style.pre}-${meat.ids}`;
    const existingRecipe = existingRecipesById.get(recipeId);
    const recipe = {
      id: recipeId,
      name: existingRecipe?.name ?? { en: `${style.en} with ${meat.en}`, km: `${style.km}${meat.km}` },
      image: '',
      category: style.method,
      difficulty: existingRecipe?.difficulty ?? pickFromHash(diffs, recipeId, 0),
      prepTime: existingRecipe?.prepTime ?? numberFromHash(recipeId, 10, 24, 1),
      cookTime: existingRecipe?.cookTime ?? numberFromHash(recipeId, 10, 29, 2),
      servings: existingRecipe?.servings ?? numberFromHash(recipeId, 2, 4, 3),
      rating: existingRecipe?.rating ?? pickFromHash(ratings, recipeId, 4),
      dietary: existingRecipe?.dietary ?? (meat.ids === "tofu"
        ? ["vegetarian", "dairy-free"]
        : (meat.ids === "shrimp" || meat.ids === "squid" || meat.ids === "fish")
          ? ["pescatarian", "dairy-free"]
          : ["dairy-free"]),
      ingredients: [
        { name: meat.en, amount: "300g", essential: true },
        { name: style.en.includes("Ginger") ? "Fresh ginger" : style.en.includes("Basil") ? "Holy basil" : style.en.includes("Curry") ? "Coconut milk" : "Garlic", amount: "amount varies", essential: true },
        { name: "Cooking oil", amount: "2 tbsp", essential: true },
        { name: "Soy sauce or Fish sauce", amount: "1 tbsp", essential: true },
        { name: "Mixed vegetables", amount: "1 cup", essential: false }
      ],
      steps: [
        { instruction: `Prepare the ${meat.en.toLowerCase()} and chop into even pieces.`, timer: null, tip: "Consistency helps it cook evenly." },
        { instruction: "Heat a pan or wok with oil and add the aromatic ingredients.", timer: 120, tip: null },
        { instruction: `Add the ${meat.en.toLowerCase()} and cook until golden brown.`, timer: 300, tip: null },
        { instruction: `Add seasonings appropriate for ${style.en.toLowerCase()} and stir thoroughly.`, timer: 120, tip: null },
        { instruction: "Serve hot with a side of steamed rice or complementary side dish.", timer: null, tip: null }
      ]
    };

    const customImage = findCustomRecipeImage(recipe);
    if (customImage) {
      recipe.image = customImage;
      customPhotoCount++;
    } else {
      recipe.image = writeRecipeCover(recipe, {
        proteinId: meat.ids,
        proteinLabel: meat.en,
        styleName: style.en,
      });
      generatedCoverCount++;
    }

    extraRecipes.push(recipe);
  }
}

const allRecipes = [...baseRecipes, ...extraRecipes].map((recipe) => {
  const customImage = findCustomRecipeImage(recipe);
  if (customImage && customImage !== recipe.image) {
    return { ...recipe, image: customImage };
  }

  return recipe;
});
const fileContent = `export const recipes = ${JSON.stringify(allRecipes, null, 2)};\n`;

fs.writeFileSync(recipesFile, fileContent);
console.log("Successfully generated recipes.js with", allRecipes.length, "items,", customPhotoCount, "matched custom photos, and", generatedCoverCount, "generated covers.");

// Legacy generator kept disabled during the image-cover migration.
if (false) {
const meats = [
  { en: "Chicken", km: "សាច់មាន់", ids: "chicken", img: "/images/chicken-stirfry.jpg" },
  { en: "Pork", km: "សាច់ជ្រូក", ids: "pork", img: "/images/pork-dish.jpg" },
  { en: "Beef", km: "សាច់គោ", ids: "beef", img: "/images/beef-dish.jpg" },
  { en: "Shrimp", km: "បង្គា", ids: "shrimp", img: "/images/shrimp-dish.jpg" },
  { en: "Squid", km: "មឹក", ids: "squid", img: "/images/squid-dish.jpg" },
  { en: "Tofu", km: "តៅហ៊ូ", ids: "tofu", img: "/images/tofu-dish.jpg" },
  { en: "Fish", km: "ត្រី", ids: "fish", img: "/images/fish-dish.jpg" }
];

const styles = [
  { en: "Stir-fried with Basil", km: "ឆាក្តៅ", method: "Stir-fry", pre: "cha-kdao", baseId: "cha-kdao", img: "/images/cha-kdao.jpg" },
  { en: "Stir-fried with Ginger", km: "ឆាខ្ញី", method: "Stir-fry", pre: "cha-knei", baseId: "cha-knei", img: "/images/cha-knei.jpg" },
  { en: "Stir-fried Sweet & Sour", km: "ឆាជូរអែម", method: "Stir-fry", pre: "cha-chour-em", baseId: "cha-chour-em", img: "/images/cha-chour-em.jpg" },
  { en: "Sour Soup", km: "សម្លម្ជូរ", method: "Soup & Stew", pre: "samlor-machou", baseId: "samlor-machou", img: "/images/samlor-machou.jpg" },
  { en: "Curry", km: "សម្លការី", method: "Soup & Stew", pre: "samlor-kari", baseId: "samlor-kari", img: "/images/samlor-kari.jpg" },
  { en: "Fried Rice", km: "បាយឆា", method: "Rice", pre: "bai-cha", baseId: "bai-cha", img: "/images/bai-cha.jpg" },
  { en: "Noodle Soup", km: "គុយទាវ", method: "Noodles", pre: "kuy-teav", baseId: "kuy-teav", img: "/images/kuy-teav.jpg" }
];

let generatedCount = baseRecipes.length;
const extraRecipes = [];

// Helper arrays
const ratings = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
const diffs = ["easy", "medium", "hard"];

// All available images for maximum variety
const allFoodImages = [
  "/images/amok.png", "/images/loklak.png", "/images/korko.png",
  "/images/nombanhchok.png", "/images/baisachchrouk.png",
  "/images/cha-kdao.jpg", "/images/cha-knei.jpg", "/images/cha-chour-em.jpg",
  "/images/samlor-machou.jpg", "/images/samlor-kari.jpg",
  "/images/bai-cha.jpg", "/images/kuy-teav.jpg",
  "/images/chicken-stirfry.jpg", "/images/pork-dish.jpg", "/images/beef-dish.jpg",
  "/images/shrimp-dish.jpg", "/images/squid-dish.jpg",
  "/images/tofu-dish.jpg", "/images/fish-dish.jpg"
];

let imgIndex = 0;

for (let i = 0; i < styles.length && generatedCount < 50; i++) {
  for (let j = 0; j < meats.length && generatedCount < 50; j++) {
    const s = styles[i];
    const m = meats[j];
    
    // Skip weird combinations
    if (s.en === "Curry" && m.en === "Squid") continue;
    if (s.en === "Noodle Soup" && m.en === "Tofu") continue;

    // Alternate between style image and protein image, then cycle through all images
    // This ensures maximum visual variety — no two adjacent recipes share the same image
    let recipeImage;
    if (j % 2 === 0) {
      recipeImage = m.img;  // Use protein-specific image for even indices
    } else {
      recipeImage = s.img;  // Use style-specific image for odd indices
    }

    const recipe = {
      id: `${s.pre}-${m.ids}`,
      name: { en: `${s.en} with ${m.en}`, km: `${s.km}${m.km}` },
      image: recipeImage,
      category: s.method,
      difficulty: diffs[Math.floor(Math.random() * diffs.length)],
      prepTime: Math.floor(Math.random() * 15) + 10,
      cookTime: Math.floor(Math.random() * 20) + 10,
      servings: Math.floor(Math.random() * 3) + 2,
      rating: ratings[Math.floor(Math.random() * ratings.length)],
      dietary: m.ids === "tofu" ? ["vegetarian", "dairy-free"] : (m.ids === "shrimp" || m.ids === "squid" || m.ids === "fish") ? ["pescatarian", "dairy-free"] : ["dairy-free"],
      ingredients: [
        { name: m.en, amount: "300g", essential: true },
        { name: s.en.includes("Ginger") ? "Fresh ginger" : s.en.includes("Basil") ? "Holy basil" : s.en.includes("Curry") ? "Coconut milk" : "Garlic", amount: "amount varies", essential: true },
        { name: "Cooking oil", amount: "2 tbsp", essential: true },
        { name: "Soy sauce or Fish sauce", amount: "1 tbsp", essential: true },
        { name: "Mixed vegetables", amount: "1 cup", essential: false }
      ],
      steps: [
        { instruction: `Prepare the ${m.en.toLowerCase()} and chop into even pieces.`, timer: null, tip: "Consistency helps it cook evenly." },
        { instruction: `Heat a pan or wok with oil and add the aromatic ingredients.`, timer: 120, tip: null },
        { instruction: `Add the ${m.en.toLowerCase()} and cook until golden brown.`, timer: 300, tip: null },
        { instruction: `Add seasonings appropriate for ${s.en.toLowerCase()} and stir thoroughly.`, timer: 120, tip: null },
        { instruction: `Serve hot with a side of steamed rice or complementary side dish.`, timer: null, tip: null }
      ]
    };
    
    extraRecipes.push(recipe);
    generatedCount++;
  }
}

const allRecipes = [...baseRecipes, ...extraRecipes];

const fileContent = `export const recipes = ${JSON.stringify(allRecipes, null, 2)};\n`;

fs.writeFileSync(path.join(__dirname, 'recipes.js'), fileContent);
console.log("Successfully generated recipes.js with", allRecipes.length, "items.");
}
