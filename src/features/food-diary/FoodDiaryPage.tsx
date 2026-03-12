import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StatusNotice } from "../../components/ui/StatusNotice";
import { inputStyle, primaryButtonStyle, secondaryLinkStyle, textareaStyle } from "../../components/ui/styles";
import { getLocalIsoDate } from "../../lib/dates";
import { readStoredJson, writeStoredJson } from "../../lib/storage";
import { DashboardPanel } from "../dashboard/components/DashboardPanel";
import { font, palette, sans } from "../meal-planner/constants";
import type { FoodDiaryEntry, FoodDiaryMealType } from "./types";
import { getFoodDiaryTotals, sortFoodDiaryEntries } from "./utils";

const FOOD_DIARY_STORAGE_KEY = "food-diary:entries";

export function FoodDiaryPage() {
  const [entries, setEntries] = useState<FoodDiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
  const [foodName, setFoodName] = useState("");
  const [mealType, setMealType] = useState<FoodDiaryMealType>("breakfast");
  const [date, setDate] = useState(getLocalIsoDate());
  const [calories, setCalories] = useState("");
  const [proteinGrams, setProteinGrams] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    void (async () => {
      const savedEntries = await readStoredJson<FoodDiaryEntry[]>(FOOD_DIARY_STORAGE_KEY);
      setEntries(savedEntries ?? []);
      setIsLoading(false);
    })();
  }, []);

  const sortedEntries = useMemo(() => sortFoodDiaryEntries(entries), [entries]);
  const todayEntries = useMemo(() => sortedEntries.filter((entry) => entry.date === getLocalIsoDate()), [sortedEntries]);
  const todayTotals = useMemo(() => getFoodDiaryTotals(todayEntries), [todayEntries]);

  async function persistEntries(nextEntries: FoodDiaryEntry[]) {
    setEntries(nextEntries);
    await writeStoredJson(FOOD_DIARY_STORAGE_KEY, nextEntries);
  }

  async function handleAddEntry() {
    if (!foodName.trim()) {
      setStatusTone("error");
      setStatusMessage("Add a food name before saving.");
      return;
    }

    const parsedCalories = calories ? Number(calories) : undefined;
    const parsedProtein = proteinGrams ? Number(proteinGrams) : undefined;
    if (parsedCalories !== undefined && (!Number.isFinite(parsedCalories) || parsedCalories < 0)) {
      setStatusTone("error");
      setStatusMessage("Calories must be 0 or more.");
      return;
    }
    if (parsedProtein !== undefined && (!Number.isFinite(parsedProtein) || parsedProtein < 0)) {
      setStatusTone("error");
      setStatusMessage("Protein grams must be 0 or more.");
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    try {
      await persistEntries([
        {
          id: `food:${date}:${crypto.randomUUID()}`,
          date,
          mealType,
          foodName: foodName.trim(),
          calories: parsedCalories,
          proteinGrams: parsedProtein,
          notes: notes.trim() ? notes.trim() : undefined,
        },
        ...entries,
      ]);
      setFoodName("");
      setCalories("");
      setProteinGrams("");
      setNotes("");
      setStatusTone("success");
      setStatusMessage("Food entry saved.");
    } catch {
      setStatusTone("error");
      setStatusMessage("Could not save entry. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteEntry(id: string) {
    await persistEntries(entries.filter((entry) => entry.id !== id));
  }

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading food diary...</div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Food Diary
          </div>
          <h1 style={{ fontFamily: font, fontSize: 40, margin: "8px 0", lineHeight: 1.05 }}>Log what you eat like MyFitnessPal.</h1>
          <p style={{ fontFamily: sans, color: palette.textMuted, maxWidth: 650, lineHeight: 1.6, margin: 0 }}>
            Capture meals, snacks, calories, and protein in one place. Everything saves locally in your browser so your diary is always available.
          </p>
        </div>
        <Link to="/" style={secondaryLinkStyle}>Back to dashboard</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <DashboardPanel title="Add food entry">
          <div style={{ display: "grid", gap: 12 }}>
            <label style={fieldLabelStyle}>Food name<input style={inputStyle} value={foodName} onChange={(event) => setFoodName(event.target.value)} placeholder="e.g. Chicken burrito bowl" /></label>
            <label style={fieldLabelStyle}>Meal
              <select style={inputStyle} value={mealType} onChange={(event) => setMealType(event.target.value as FoodDiaryMealType)}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </label>
            <label style={fieldLabelStyle}>Date<input style={inputStyle} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label style={fieldLabelStyle}>Calories (optional)<input style={inputStyle} value={calories} onChange={(event) => setCalories(event.target.value)} inputMode="numeric" /></label>
            <label style={fieldLabelStyle}>Protein grams (optional)<input style={inputStyle} value={proteinGrams} onChange={(event) => setProteinGrams(event.target.value)} inputMode="decimal" /></label>
            <label style={fieldLabelStyle}>Notes (optional)<textarea style={{ ...textareaStyle, minHeight: 80 }} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
            <button style={primaryButtonStyle} onClick={() => void handleAddEntry()} disabled={isSaving}>{isSaving ? "Saving..." : "Save entry"}</button>
            {statusMessage ? <StatusNotice tone={statusTone}>{statusMessage}</StatusNotice> : null}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Today at a glance">
          <div style={{ fontFamily: sans, color: palette.textMuted, fontSize: 14, lineHeight: 1.8 }}>
            <div><strong style={{ color: palette.text }}>{todayEntries.length}</strong> entries logged today</div>
            <div><strong style={{ color: palette.text }}>{todayTotals.calories}</strong> calories recorded</div>
            <div><strong style={{ color: palette.text }}>{todayTotals.proteinGrams}g</strong> protein recorded</div>
          </div>
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Recent entries">
          {sortedEntries.length === 0 ? (
            <div style={{ fontFamily: sans, color: palette.textMuted }}>No entries yet. Add your first meal above.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {sortedEntries.map((entry) => (
                <div key={entry.id} style={entryCardStyle}>
                  <div>
                    <div style={{ fontFamily: sans, fontWeight: 700 }}>{entry.foodName}</div>
                    <div style={{ fontFamily: sans, color: palette.textMuted, fontSize: 13 }}>
                      {entry.date} · {entry.mealType} · {entry.calories ?? "-"} cal · {entry.proteinGrams ?? "-"}g protein
                    </div>
                    {entry.notes ? <div style={{ marginTop: 6, fontFamily: sans, fontSize: 13 }}>{entry.notes}</div> : null}
                  </div>
                  <button style={deleteButtonStyle} onClick={() => void handleDeleteEntry(entry.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}

const fieldLabelStyle = {
  display: "grid",
  gap: 6,
  fontFamily: sans,
  fontSize: 13,
  color: palette.text,
};

const entryCardStyle = {
  border: `1px solid ${palette.border}`,
  borderRadius: 12,
  padding: "12px 14px",
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "flex-start",
};

const deleteButtonStyle = {
  borderRadius: 999,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  color: palette.text,
  fontFamily: sans,
  cursor: "pointer",
  padding: "6px 10px",
};
