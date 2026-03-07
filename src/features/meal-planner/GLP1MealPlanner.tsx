import { DAILY_TARGETS } from "./data/recipes";
import { font, palette, sans } from "./constants";
import { useMealPlanner } from "./hooks/useMealPlanner";
import { GroceryTab } from "./components/GroceryTab";
import { PlannerTab } from "./components/PlannerTab";
import { RecipeModal } from "./components/RecipeModal";
import { RecipesTab } from "./components/RecipesTab";
import { TabButton } from "./components/TabButton";
import { TrackerTab } from "./components/TrackerTab";

export function GLP1MealPlanner({ initialTab = "recipes" }: { initialTab?: "recipes" | "planner" | "grocery" | "tracker" }) {
  const planner = useMealPlanner(initialTab);

  return (
    <div style={{ fontFamily: sans, background: palette.bg, minHeight: "100vh", color: palette.text }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          background: `linear-gradient(135deg, ${palette.accent} 0%, #1f4b38 100%)`,
          padding: "20px 24px",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: sans, opacity: 0.7 }}>
          GLP-1 Optimized
        </div>
        <h1 style={{ fontFamily: font, fontSize: 26, margin: "4px 0 2px", fontWeight: 700 }}>Meal Planner</h1>
        <div style={{ fontSize: 12, fontFamily: sans, opacity: 0.8 }}>
          Daily targets: {DAILY_TARGETS.protein}g protein · {DAILY_TARGETS.fiber}g fiber · ~{DAILY_TARGETS.calories} cal
        </div>
        <div style={{ fontSize: 11, fontFamily: sans, opacity: 0.6, marginTop: 2 }}>
          Egg-free · Gluten-free · No seafood · No sausage
        </div>
      </div>

      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${palette.border}`,
          background: `${palette.card}f2`,
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
        }}
      >
        <TabButton id="recipes" label="Recipes" icon="📖" activeTab={planner.tab} onSelect={planner.setTab} />
        <TabButton id="planner" label="Week Plan" icon="📅" activeTab={planner.tab} onSelect={planner.setTab} />
        <TabButton id="grocery" label="Grocery" icon="🛒" activeTab={planner.tab} onSelect={planner.setTab} />
        <TabButton id="tracker" label="Tracker" icon="📊" activeTab={planner.tab} onSelect={planner.setTab} />
      </div>

      <div style={{ padding: "16px 16px 100px", maxWidth: 920, margin: "0 auto" }}>
        {planner.tab === "recipes" ? (
          <RecipesTab
            search={planner.search}
            setSearch={planner.setSearch}
            mealFilter={planner.mealFilter}
            setMealFilter={planner.setMealFilter}
            tagFilter={planner.tagFilter}
            setTagFilter={planner.setTagFilter}
            filteredRecipes={planner.filteredRecipes}
            assignSlotActive={Boolean(planner.assignSlot)}
            onRecipeClick={planner.setSelectedRecipe}
            onAssignRecipe={(recipeId) => void planner.assignRecipe(recipeId)}
          />
        ) : null}

        {planner.tab === "planner" ? (
          <PlannerTab
            weekPlan={planner.weekPlan}
            weeklyStats={planner.weeklyStats}
            recipeMap={planner.recipeMap}
            assignSlot={planner.assignSlot}
            onCancelAssign={() => planner.setAssignSlot(null)}
            onSelectRecipe={planner.setSelectedRecipe}
            onClearSlot={(day, meal) => void planner.clearSlot(day, meal)}
            onStartAssigning={planner.startAssigning}
            onClearWeek={() => void planner.clearWeek()}
          />
        ) : null}

        {planner.tab === "grocery" ? (
          <GroceryTab
            groceryList={planner.groceryList}
            groceryChecked={planner.groceryChecked}
            onToggleGrocery={(item) => void planner.toggleGrocery(item)}
          />
        ) : null}

        {planner.tab === "tracker" ? <TrackerTab weeklyStats={planner.weeklyStats} /> : null}
      </div>

      {planner.selectedRecipe ? <RecipeModal recipe={planner.selectedRecipe} onClose={() => planner.setSelectedRecipe(null)} /> : null}
    </div>
  );
}
