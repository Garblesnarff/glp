import { RECIPES, RECIPE_SEEDS } from "../src/features/meal-planner/data/recipes";
import {
  estimateRecipeNutrition,
  findRecipeNutritionOutliers,
  formatQaDetail,
  formatQaRow,
} from "../src/features/meal-planner/nutritionQa";

const args = new Set(process.argv.slice(2));
const verbose = args.has("--verbose");
const strict = args.has("--strict");

const rawOutliers = findRecipeNutritionOutliers(RECIPE_SEEDS);
const normalizedOutliers = findRecipeNutritionOutliers(RECIPES);
const minCoverage = Math.min(...RECIPE_SEEDS.map((recipe) => estimateRecipeNutrition(recipe).coverage));

console.log(`Raw seed outliers: ${rawOutliers.length}`);
console.log(`Normalized recipe outliers: ${normalizedOutliers.length}`);
console.log(`Minimum ingredient coverage: ${Math.round(minCoverage * 100)}%`);

if (rawOutliers.length > 0) {
  console.log("");
  console.log("Top raw-seed mismatches:");
  console.log("ID    Recipe                               Cover   Stored C/P/F   Est. C/P/F    Delta C/P/F");
  console.log(rawOutliers.slice(0, verbose ? rawOutliers.length : 20).map(formatQaRow).join("\n"));
}

if (verbose && rawOutliers.length > 0) {
  console.log("");
  console.log("Details:");
  console.log(rawOutliers.map(formatQaDetail).join("\n\n"));
}

if (strict && (normalizedOutliers.length > 0 || minCoverage < 0.7)) {
  process.exit(1);
}
