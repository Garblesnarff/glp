import { ALL_TAGS, MEAL_TYPES } from "../data/recipes";
import { palette, sans } from "../constants";
import { RecipeCard } from "./RecipeCard";
import type { MealType, Recipe } from "../types";

export function RecipesTab({
  search,
  setSearch,
  mealFilter,
  setMealFilter,
  tagFilter,
  setTagFilter,
  filteredRecipes,
  assignSlotActive,
  onRecipeClick,
  onAssignRecipe,
}: {
  search: string;
  setSearch: (value: string) => void;
  mealFilter: MealType | "all";
  setMealFilter: (value: MealType | "all") => void;
  tagFilter: string;
  setTagFilter: (value: string) => void;
  filteredRecipes: Recipe[];
  assignSlotActive: boolean;
  onRecipeClick: (recipe: Recipe) => void;
  onAssignRecipe: (recipeId: string) => void;
}) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search recipes or ingredients..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          border: `1px solid ${palette.border}`,
          fontFamily: sans,
          fontSize: 14,
          background: palette.card,
          boxSizing: "border-box",
          marginBottom: 12,
          outline: "none",
        }}
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {(["all", ...MEAL_TYPES] as const).map((meal) => (
          <button
            key={meal}
            onClick={() => setMealFilter(meal)}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              border: `1px solid ${mealFilter === meal ? palette.accent : palette.border}`,
              background: mealFilter === meal ? palette.accent : palette.card,
              color: mealFilter === meal ? "#fff" : palette.textMuted,
              fontFamily: sans,
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {meal === "all" ? "All" : `${meal.charAt(0).toUpperCase()}${meal.slice(1)}`}
          </button>
        ))}
        <select
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value)}
          style={{
            padding: "5px 10px",
            borderRadius: 20,
            border: `1px solid ${palette.border}`,
            fontFamily: sans,
            fontSize: 12,
            background: palette.card,
            color: palette.textMuted,
            cursor: "pointer",
          }}
        >
          <option value="all">All tags</option>
          {ALL_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => onRecipeClick(recipe)}
            onAssign={assignSlotActive ? onAssignRecipe : undefined}
          />
        ))}
        {filteredRecipes.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: palette.textMuted, fontFamily: sans }}>
            No recipes match your filters
          </div>
        ) : null}
      </div>
    </div>
  );
}
