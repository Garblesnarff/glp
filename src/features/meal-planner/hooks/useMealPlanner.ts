import { useEffect, useMemo, useState } from "react";
import { useAppServices } from "../../../app/providers/AppServices";
import { RECIPES } from "../data/recipes";
import {
  assignRecipeToWeekPlan,
  buildGroceryList,
  calculateWeeklyStats,
  clearMealSlot,
  cloneEmptyWeekPlan,
  createRecipeMap,
  filterRecipes,
} from "../utils";
import type { AssignSlot, GroceryState, MealType, PlannerTab, Recipe, WeekPlan } from "../types";

export function useMealPlanner(initialTab: PlannerTab = "recipes") {
  const { mealPlanRepository } = useAppServices();
  const [tab, setTab] = useState<PlannerTab>(initialTab);
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState<MealType | "all">("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(cloneEmptyWeekPlan);
  const [assignSlot, setAssignSlot] = useState<AssignSlot | null>(null);
  const [groceryChecked, setGroceryChecked] = useState<GroceryState>({});

  useEffect(() => {
    void (async () => {
      const storedPlan = await mealPlanRepository.loadWeekPlan();
      if (storedPlan) {
        setWeekPlan(storedPlan);
      }

      const storedChecks = await mealPlanRepository.loadGroceryState();
      if (storedChecks) {
        setGroceryChecked(storedChecks);
      }
    })();
  }, [mealPlanRepository]);

  const recipeMap = useMemo(() => createRecipeMap(), []);

  const filteredRecipes = useMemo(
    () =>
      filterRecipes({
        search,
        mealFilter,
        tagFilter,
      }),
    [mealFilter, search, tagFilter],
  );

  const weeklyStats = useMemo(() => calculateWeeklyStats(weekPlan, recipeMap), [recipeMap, weekPlan]);
  const groceryList = useMemo(() => buildGroceryList(weekPlan, recipeMap), [recipeMap, weekPlan]);

  async function persistWeekPlan(nextPlan: WeekPlan) {
    setWeekPlan(nextPlan);
    await mealPlanRepository.saveWeekPlan(nextPlan);
  }

  async function toggleGrocery(item: string) {
    const next = { ...groceryChecked, [item]: !groceryChecked[item] };
    setGroceryChecked(next);
    await mealPlanRepository.saveGroceryState(next);
  }

  async function assignRecipe(recipeId: string) {
    if (!assignSlot) {
      return;
    }

    await persistWeekPlan(assignRecipeToWeekPlan(weekPlan, assignSlot.day, assignSlot.meal, recipeId));
    setAssignSlot(null);
  }

  async function clearSlot(day: string, meal: MealType) {
    await persistWeekPlan(clearMealSlot(weekPlan, day, meal));
  }

  async function clearWeek() {
    await persistWeekPlan(cloneEmptyWeekPlan());
  }

  function startAssigning(day: string, meal: MealType) {
    setAssignSlot({ day, meal });
    setMealFilter(meal);
    setTab("recipes");
  }

  return {
    tab,
    setTab,
    search,
    setSearch,
    mealFilter,
    setMealFilter,
    tagFilter,
    setTagFilter,
    selectedRecipe,
    setSelectedRecipe,
    weekPlan,
    assignSlot,
    setAssignSlot,
    groceryChecked,
    filteredRecipes,
    weeklyStats,
    groceryList,
    recipeMap,
    recipes: RECIPES,
    toggleGrocery,
    assignRecipe,
    clearSlot,
    clearWeek,
    startAssigning,
  };
}
