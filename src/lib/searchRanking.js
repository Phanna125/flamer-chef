const TERM_ALIASES = [
  ['pork', 'pork', 'សាច់ជ្រូក', 'ជ្រូក'],
  ['beef', 'beef', 'សាច់គោ', 'គោ'],
  ['chicken', 'chicken', 'សាច់មាន់', 'មាន់'],
  ['fish', 'fish', 'ត្រី'],
  ['shrimp', 'shrimp', 'prawn', 'prawns', 'បង្គា'],
  ['squid', 'squid', 'calamari', 'មឹក'],
  ['tofu', 'tofu', 'តៅហ៊ូ', 'សណ្ដែកសៀង'],
  ['egg', 'egg', 'eggs', 'ស៊ុត'],
  ['rice', 'rice', 'បាយ'],
  ['soup', 'soup', 'stew', 'ស៊ុប', 'សម្ល'],
  ['curry', 'curry', 'ការី'],
  ['ginger', 'ginger', 'ខ្ញី'],
  ['basil', 'basil', 'holy basil', 'ម្ជូរព្រៃ', 'ជីរនាងវង'],
];

const ALIAS_LOOKUP = TERM_ALIASES.reduce((lookup, aliases) => {
  const normalizedAliases = aliases.map((alias) => normalizeText(alias));

  normalizedAliases.forEach((alias) => {
    lookup.set(alias, normalizedAliases);
  });

  return lookup;
}, new Map());

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function splitQuery(query) {
  return query
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function expandTerm(term) {
  const normalizedTerm = normalizeText(term);

  if (!normalizedTerm) {
    return [];
  }

  const directAliases = ALIAS_LOOKUP.get(normalizedTerm) || [normalizedTerm];
  const wordParts = normalizedTerm.split(' ').filter((part) => part.length > 1);
  const expandedWords = wordParts.flatMap((part) => ALIAS_LOOKUP.get(part) || [part]);

  return uniqueValues([normalizedTerm, ...directAliases, ...expandedWords]);
}

function getSearchGroups(query) {
  return splitQuery(query).map((term) => ({
    label: term,
    variants: expandTerm(term),
  }));
}

function scoreMatch(text, variant, exactScore, partialScore) {
  if (!text || !variant) {
    return 0;
  }

  if (text === variant) {
    return exactScore;
  }

  if (text.startsWith(`${variant} `) || text.endsWith(` ${variant}`) || text.includes(` ${variant} `)) {
    return partialScore + 25;
  }

  if (text.includes(variant)) {
    return partialScore;
  }

  return 0;
}

function getBestArrayScore(values, variants, exactScore, partialScore) {
  return values.reduce((bestScore, value) => {
    const valueScore = variants.reduce((bestVariantScore, variant) => {
      return Math.max(bestVariantScore, scoreMatch(value, variant, exactScore, partialScore));
    }, 0);

    return Math.max(bestScore, valueScore);
  }, 0);
}

function buildSearchableRecipe(recipe) {
  return {
    titleEn: normalizeText(recipe.name.en),
    titleKm: normalizeText(recipe.name.km),
    id: normalizeText(recipe.id),
    category: normalizeText(recipe.category),
    difficulty: normalizeText(recipe.difficulty),
    ingredients: recipe.ingredients.map((ingredient) => normalizeText(ingredient.name)),
    steps: recipe.steps.map((step) => normalizeText(`${step.instruction || ''} ${step.tip || ''}`)),
  };
}

function getRecipeRelevance(recipe, searchGroups) {
  const searchableRecipe = buildSearchableRecipe(recipe);

  if (searchGroups.length === 0) {
    return {
      matchPercentage: 0,
      matchedTerms: 0,
      relevanceScore: recipe.rating * 100,
      titleHits: 0,
      ingredientHits: 0,
    };
  }

  let matchedTerms = 0;
  let titleHits = 0;
  let ingredientHits = 0;
  let relevanceScore = 0;

  searchGroups.forEach(({ variants }) => {
    const titleScore = Math.max(
      getBestArrayScore([searchableRecipe.titleEn], variants, 260, 180),
      getBestArrayScore([searchableRecipe.titleKm], variants, 260, 180),
      getBestArrayScore([searchableRecipe.id], variants, 220, 155),
    );
    const ingredientScore = getBestArrayScore(searchableRecipe.ingredients, variants, 220, 150);
    const categoryScore = getBestArrayScore([searchableRecipe.category], variants, 120, 80);
    const stepScore = getBestArrayScore(searchableRecipe.steps, variants, 70, 35);
    const difficultyScore = getBestArrayScore([searchableRecipe.difficulty], variants, 40, 20);

    const bestScore = Math.max(titleScore, ingredientScore, categoryScore, stepScore, difficultyScore);

    if (bestScore > 0) {
      matchedTerms += 1;
      relevanceScore += bestScore;

      if (titleScore > 0) {
        titleHits += 1;
      }

      if (ingredientScore > 0) {
        ingredientHits += 1;
      }

      if (titleScore > 0 && ingredientScore > 0) {
        relevanceScore += 40;
      }
    }
  });

  return {
    matchPercentage: Math.round((matchedTerms / searchGroups.length) * 100),
    matchedTerms,
    relevanceScore,
    titleHits,
    ingredientHits,
  };
}

export function getDisplaySearchTerms(query) {
  return splitQuery(query);
}

export function rankRecipesByQuery(recipes, query) {
  const searchGroups = getSearchGroups(query);

  return recipes
    .map((recipe) => {
      const relevance = getRecipeRelevance(recipe, searchGroups);

      return {
        ...recipe,
        ...relevance,
      };
    })
    .sort((left, right) => {
      if (right.matchedTerms !== left.matchedTerms) {
        return right.matchedTerms - left.matchedTerms;
      }

      if (right.matchPercentage !== left.matchPercentage) {
        return right.matchPercentage - left.matchPercentage;
      }

      if (right.titleHits !== left.titleHits) {
        return right.titleHits - left.titleHits;
      }

      if (right.ingredientHits !== left.ingredientHits) {
        return right.ingredientHits - left.ingredientHits;
      }

      if (right.relevanceScore !== left.relevanceScore) {
        return right.relevanceScore - left.relevanceScore;
      }

      if (right.rating !== left.rating) {
        return right.rating - left.rating;
      }

      return left.name.en.localeCompare(right.name.en);
    });
}
