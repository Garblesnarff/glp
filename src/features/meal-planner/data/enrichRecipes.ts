import type { Recipe, RecipeAppetiteLevel, RecipeGlp1Profile, RecipePortion, RecipeSeed } from "../types";

function includesAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

function deriveGlp1Profile(recipe: RecipeSeed): RecipeGlp1Profile {
  const text = `${recipe.name} ${recipe.notes ?? ""} ${recipe.tags.join(" ")} ${recipe.ingredients.join(" ")}`.toLowerCase();

  const softMarkers = ["smoothie", "yogurt", "soup", "oats", "cottage", "chia", "pudding", "parfait", "mousse"];
  const refluxRisks = ["chili", "curry", "bbq", "enchilada", "tomato", "taco"];
  const heavyMarkers = ["beef", "pork chop", "chili", "casserole", "pot roast", "stew", "enchilada"];

  const shotDayFriendly = includesAny(text, softMarkers) || recipe.tags.includes("no-cook") || recipe.time <= 10;
  const nauseaFriendly = includesAny(text, ["smoothie", "yogurt", "cottage", "soup", "oats", "pudding", "parfait", "mousse"]);
  const refluxFriendly = !includesAny(text, refluxRisks);
  const constipationSupport =
    recipe.fiber >= 12 ? "high" : recipe.fiber >= 8 ? "medium" : recipe.fiber >= 4 ? "low" : "none";
  const appetiteLevel: RecipeAppetiteLevel[] =
    includesAny(text, ["smoothie", "soup", "mousse"])
      ? ["none", "low", "normal"]
      : shotDayFriendly
        ? ["low", "normal"]
        : ["normal"];
  const portionFlex: RecipePortion[] =
    recipe.tags.includes("meal-prep") || recipe.tags.includes("make-ahead") || recipe.tags.includes("freezer-friendly")
      ? ["mini", "half", "full"]
      : recipe.servings > 1
        ? ["half", "full"]
        : ["mini", "full"];
  const heaviness = includesAny(text, heavyMarkers)
    ? 4
    : recipe.calories >= 430
      ? 3
      : shotDayFriendly
        ? 1
        : 2;
  const texture = [
    ...(includesAny(text, ["smoothie", "oats", "pudding", "soup", "cottage", "mousse"]) ? ["soft"] : []),
    ...(includesAny(text, ["smoothie", "yogurt", "parfait", "bark", "mousse"]) ? ["cold"] : []),
    ...(recipe.tags.includes("no-cook") ? ["fresh"] : []),
  ];
  const avoidWhen = [
    ...(refluxFriendly ? [] : ["severe reflux"]),
    ...(heaviness >= 4 ? ["active vomiting"] : []),
    ...(includesAny(text, ["chili", "curry", "enchilada", "casserole"]) ? ["active nausea"] : []),
  ];

  return {
    shotDayFriendly,
    nauseaFriendly,
    refluxFriendly,
    constipationSupport,
    appetiteLevel,
    portionFlex,
    heaviness,
    texture: texture.length > 0 ? texture : ["mixed"],
    avoidWhen,
  };
}

function deriveAllergens(recipe: RecipeSeed) {
  const text = `${recipe.name} ${recipe.ingredients.join(" ")} ${recipe.notes ?? ""}`.toLowerCase();

  return [
    ...(text.includes("yogurt") || text.includes("cottage cheese") || text.includes("cheese") || text.includes("feta") ? ["dairy"] : []),
    ...(text.includes("almond") || text.includes("pecan") || text.includes("walnut") ? ["tree-nuts"] : []),
    ...(text.includes("peanut") ? ["peanuts"] : []),
  ];
}

export function enrichRecipe(recipe: RecipeSeed): Recipe {
  const glp1 = deriveGlp1Profile(recipe);

  return {
    ...recipe,
    glp1,
    allergens: deriveAllergens(recipe),
    freezesWell: recipe.tags.includes("freezer-friendly") || recipe.tags.includes("meal-prep"),
    leftoverDays: recipe.tags.includes("freezer-friendly") ? 5 : recipe.tags.includes("meal-prep") ? 4 : 3,
    canBlendOrSip: includesAny(`${recipe.name} ${recipe.notes ?? ""}`.toLowerCase(), ["smoothie", "soup", "mousse"]),
    recommendedPortion: glp1.shotDayFriendly || glp1.nauseaFriendly ? "half" : recipe.meal === "snack" ? "mini" : "full",
  };
}
