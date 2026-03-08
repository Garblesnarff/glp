# GLP-1 Companion App — Product Requirements Document

## Vision

**This is NOT a meal planner. It's a GLP-1 companion that happens to include meal planning.**

The app supports users through their first 12 weeks on GLP-1 medication and beyond. The home screen should feel like opening a daily support system — not a recipe browser. Each account supports two linked users: the primary user (taking the medication) and a prep partner (the person cooking/prepping meals).

---

## User Model

Each account has two roles authenticated via WorkOS:

- **Primary user**: The person taking GLP-1 medication. Sets weight, dietary restrictions, medication schedule, and logs symptoms/intake.
- **Prep partner**: The person handling cooking and meal prep. Gets their own dashboard focused on what to cook, when, and what to buy.

Both users share the same meal plan, grocery list, and recipe database. Both can view symptom/hydration data (with primary user's consent).

### Initial User Profile Setup (onboarding)

- Current weight
- Dietary restrictions (multi-select + custom: egg-free, gluten-free, dairy-free, no seafood, no sausage, etc.)
- Medication name and start date
- Shot day of week
- Prep partner invite (email/link)

---

## Nutritional Targets (from PubMed research)

| Macro | Daily Target | Source |
|-------|-------------|--------|
| Protein | 114–143g (1.2–1.5 g/kg) | doi:10.1016/j.obpill.2025.100209 |
| Fiber | 25–30g (ramp gradually) | doi:10.3389/fnut.2025.1566498 |
| Calories | ~1400–1800 (appetite-dependent) | Individualized |
| Hydration | 64–80 oz water/day minimum | FDA labeling guidance |

**Common deficiencies on GLP-1s to watch**: calcium, iron, magnesium, potassium, choline, vitamins A/C/D/E

---

## Existing v1 Features (already built)

The current artifact has these working:
1. **Recipe database** — 78 recipes, all allergen-compliant, searchable by name/ingredient/meal type/tag
2. **Weekly meal planner** — assign recipes to day/meal slots, persists via storage
3. **Auto-generated grocery list** — from weekly plan, with checkboxes and item counts
4. **Nutrition tracker** — protein/fiber/calorie progress bars per day with weekly averages

## Current Implementation Status

The codebase has moved beyond the original single-screen artifact and now includes:

1. **Bun-first production scaffold**
   - Bun package/runtime workflow
   - TypeScript + Vite + ESLint + test setup
   - Git-initialized repo and deploy-oriented structure

2. **Feature-modular planner architecture**
   - Planner state, UI, utils, and repositories are split into modules
   - Local persistence is abstracted behind repository interfaces

3. **WorkOS + Supabase integration foundation**
   - WorkOS auth provider and gated app flow
   - Supabase browser client wired to WorkOS access tokens
   - Initial SQL migrations for planner state and core companion tables

4. **Companion-first app shell**
   - Dashboard is now the default route
   - Planner/grocery/tracker/recipes live as routed sections
   - Onboarding route exists for profile and medication setup
   - Dedicated daily log, red-flag, and recent-history routes now exist
   - Route-level code splitting is in place for major screens

5. **Core domain model scaffold**
   - User profile, daily log, medication log, meal entry, account role types
   - Local + Supabase repositories for profile and planner data
   - Recent daily-log loading is supported for trend/history views

6. **First P0 dashboard workflow**
   - Tap-based appetite and symptom check-in
   - Hydration increment logging
   - Shot-day-aware contextual dashboard messaging
   - Emergency support card with gentle-food suggestions
   - Heuristic meal recommendations based on appetite and shot-day context

7. **Dedicated daily-support flows**
   - Standalone daily log route for symptoms, appetite, hydration, and safety review
   - Standalone red-flag guidance route
   - Recent history route with per-day symptom, hydration, appetite, food mood, and food-noise review
   - 7-day summaries for symptom frequency, hydration averages, nausea, constipation, and low-appetite days

8. **Recipe schema enrichment foundation**
   - All existing recipes now pass through an enrichment layer that attaches explicit GLP-1 metadata
   - Structured fields now exist in code for shot-day friendliness, nausea/reflux handling, constipation support, appetite fit, portion flexibility, heaviness, texture, contraindications, leftover behavior, and sip/blend friendliness
   - Dashboard recommendations now use structured recipe metadata instead of only name/notes heuristics
   - Recipe detail screens now expose GLP-1 support metadata so recommendations are explainable in the UI
   - Dashboard recommendation cards now show short rationale badges for why a meal fits today's context

9. **Meal response capture and early tolerance learning**
   - Daily log now supports quick logging of eaten meals from current recommendations
   - Users can record portion, tolerance, and whether they would eat the meal again
   - Recent tolerance feedback now influences recommendation ranking and can suppress recently rough meals
   - History now shows meal-response data alongside symptom and hydration history

10. **Prep partner workspace foundation**
   - A dedicated partner route now exists in the app shell
   - Primary users can create and revoke prep-partner invite scaffolds from the UI
   - Prep guidance is now available in a partner-specific workspace with role-aware copy and actions
   - Supabase repository and RLS migration groundwork now exist for partner invite management
   - Prep partners can now resolve a linked primary user by prep-partner email and read shared household context in the partner workspace

11. **Account-link lifecycle foundation**
   - Primary users now auto-create a durable account membership during onboarding/profile save when using Supabase
   - Prep partners can see incoming invites and accept them from the partner workspace
   - Supabase account/account-member RLS policies now exist for account creation, membership insertion, and invitee-side invite acceptance
   - The app now has an explicit account-linking repository layer instead of burying account lifecycle logic inside profile code

12. **Shared planner/grocery household scope**
   - Supabase meal-planner state now supports account-scoped storage via `account_id`
   - Planner and grocery data can now resolve through shared household membership instead of staying strictly user-scoped
   - Legacy single-user rows still have a safe `user_id` fallback path during migration
   - The planner UI now indicates when the current view is operating on a shared household plan

13. **Rough-day partner alert foundation**
   - Primary users can now trigger an account-scoped rough-day support alert from the emergency support card
   - Prep partners can see active support alerts in the partner workspace and mark them handled
   - Support alerts now have an explicit repository layer and Supabase table/RLS policy scaffold
   - The emergency flow now reaches across the shared household model instead of staying single-user only

14. **Medication timeline foundation**
   - A dedicated medication route now exists for logging injections, doses, dose-increase weeks, and missed or delayed shots
   - Medication logs now support shot status and dose-escalation markers in the domain and repository layer
   - The timeline includes simple injection-site rotation guidance and a first symptom-overlap summary
   - Dashboard navigation now exposes medication tracking as a first-class workflow instead of burying it in onboarding

15. **Pattern analysis foundation**
   - History now includes a dedicated pattern-signals panel that combines symptoms, rough meals, hydration, appetite, and medication events
   - Per-day correlation rows now flag dose-increase days, shot status, rough meal responses, and symptom load in one place
   - The codebase now has explicit analysis helpers for medication/tolerance correlations instead of only raw summary cards
   - This is the first implementation step toward the PRD’s food-tolerance and dose-correlation trend layer

16. **Constipation support workflow foundation**
   - Daily log now includes a dedicated constipation support card instead of treating constipation as only a symptom toggle
   - Users can log a bowel movement, mark a short walk complete, and get hydration plus gentler-fiber prompts in one place
   - The app now estimates days since last bowel movement from recent logs and raises an escalation state when constipation persists
   - Constipation support now surfaces fiber-friendly recipe suggestions from the enriched meal metadata

17. **Food relationship tracking foundation**
   - Food noise and food mood are now first-class daily check-in controls on dashboard and daily log
   - Dashboard metrics now expose food noise directly instead of leaving it buried in stored log data
   - Recent trends and history pattern analysis now include average food noise and harder food-relationship days
   - Per-day history correlation rows now show food mood and food noise alongside symptoms, hydration, meals, and medication events

18. **In-app companion reminder foundation**
   - Dashboard now derives and surfaces in-app reminders for shot-day prep, dose-increase weeks, hydration, constipation support, and injection-site rotation
   - Medication timeline now also surfaces the reminder set relevant to medication planning
   - Reminder logic lives in an explicit derived layer instead of being buried in UI components
   - This establishes the product behavior for reminders before adding scheduled/push delivery infrastructure

19. **Supplement and movement support foundation**
   - Daily log now includes a dedicated checklist for common GLP-1 support supplements and basic movement habits
   - Users can log protein supplement, multivitamin, vitamin D, calcium, and magnesium support directly in the daily workflow
   - Users can also log a short walk, mobility, and strength work without leaving the daily log
   - Recent 7-day trends now surface supplement adherence and movement frequency so these signals stop being passive stored fields

20. **Support-habit adherence and coaching foundation**
   - Dashboard now derives protein-support and movement-consistency guidance from today's state plus the recent 7-day window
   - Companion reminders now nudge users when low-appetite days are unfolding without protein supplement support or when no strength work has been logged across the week
   - History now includes supplement, movement, strength, and protein-support signals in both pattern summaries and day-level correlation rows
   - This is the first step from passive checklist tracking toward lean-mass-preservation coaching

21. **Weight tracking with correct framing foundation**
   - A dedicated weight route now exists so weigh-ins are not buried inside onboarding or treated as the home screen hero
   - Users can log weight plus optional waist measurement, clothes-fit notes, and free-text context
   - Weight is now framed against recent hydration and protein consistency instead of just raw scale change
   - Saving a new weigh-in updates the current profile weight and recalculates protein targets from the newer body weight
   - Supabase and local persistence paths now exist for durable weight-log storage

### What is still scaffolded vs complete

- **Dashboard**: implemented as the default route with live daily-state interactions, recommendation rationale badges, and early tolerance-aware ranking, but still not yet personalized by deeper long-term correlation modeling
- **Symptom tracker**: dedicated daily log and history views now exist, and meal-response capture is now attached to the daily workflow, but no charting, export, or clinician-style trend review yet
- **Hydration tracker**: tap-based increments and hydration-risk logic exist, but not yet full bottle/glass visualization, reminders, or notification logic
- **Medication timeline**: dedicated route and first logging workflow now exist, but there is still no automatic recurring schedule, missed-dose reminders, or true correlation/visual analytics with symptoms and food tolerance yet
- **Trend analysis**: first pattern and correlation summaries now exist in history, but there are still no true charts, longitudinal scoring models, or recommendation loops driven by these correlations yet
- **Constipation workflow**: first bowel-movement tracking and support prompts now exist, but there is still no Bristol stool scale, persistent escalation timer beyond recent logs, or automated reminder scheduling yet
- **Food relationship tracking**: food noise and food mood are now active parts of the daily workflow and trends, but there is still no dedicated coaching layer, celebration framing, or recommendation logic based on these signals yet
- **Reminder system**: in-app reminders now exist for core companion workflows, but there is still no scheduling engine, push delivery, refill reminders, or user-configurable reminder preferences yet
- **Supplement and movement support**: checklist logging, first adherence nudges, and basic coaching now exist, but there is still no clinician-configurable regimen, custom supplement library, or scheduled reminder delivery yet
- **Emergency support**: dashboard emergency card, red-flag route, and first-pass partner rough-day alerts now exist, but there is still no push delivery, reminder scheduling, or escalation logic beyond the in-app account alert
- **Prep partner model**: route, invite UI, linked-primary shared reads, first-pass invite acceptance, and rough-day support alerts now exist, but there is still no polished invite acceptance UX, account unlink/recovery flow, or broader notification system yet
- **Planner/grocery sharing**: account-scoped persistence is now wired for Supabase-backed sessions, but local mode remains personal-only and there is not yet explicit conflict handling or audit/history for shared edits
- **Recommendation engine**: now partially structured, explainable, and lightly personalized via recent tolerance feedback, but still not powered by true symptom correlations, durable preference memory, or longer-term longitudinal modeling
- **History/trends**: recent history exists as a browsable view, but not yet charted or analyzed beyond summary logic
- **Weight tracking**: dedicated logging and better framing now exist, but there is still no charting, celebration system, waist/clothes-fit trend visualization, or deeper correlation with medication phases yet

---

## Architecture Notes

- **Runtime**: Bun (for server, scripts, package management — use Bun everywhere possible)
- **Stack**: React (Vite), TypeScript
- **Auth**: WorkOS (2 users per account — primary + prep partner)
- **Data**: Local repositories now exist alongside Supabase-backed repositories; app is moving toward Supabase as primary persistence
- **Routing**: Dashboard-first routed application structure is in place
- **Deployment target**: Hetzner-hosted deployment path assumed
- **Future integrations**: Notion MCP (existing recipe database), Supabase backend

---

## Phase 1 — Critical First-Week Features

These are needed immediately for a user who just took their first shot.

### 1.1 Home Dashboard (replaces recipe browser as default view)

The daily hub. Shows at a glance:

- **Shot status**: Days since last injection, next shot day
- **Quick check-in**: "How are you feeling?" (tap to log symptoms)
- **Today's hydration progress**: Glass/bottle visual tracker
- **Today's protein progress**: Bar toward personalized target
- **Recommended meals for today**: Context-aware (shot day vs normal day, current symptoms)
- **Appetite level indicator**: Set once in the morning, affects meal suggestions

### 1.2 Shot-Day Mode

Activates automatically on injection day + 1-3 days after (configurable).

**Behavior changes:**
- Meal suggestions switch to "gentle stomach" recipes (tagged)
- Favor: smaller portions, lighter foods, lower-fat, soups, smoothies, yogurt bowls, soft/cold foods
- De-prioritize: heavy, greasy, spicy, or large-volume meals
- Show contextual prompts: "eat slowly", "try half portions", "cold foods may help"

### 1.3 Symptom Tracker

Daily log, quick-tap interface (not a form — should take <15 seconds):

**Symptoms to track:**
- Nausea (none / mild / moderate / severe)
- Fullness / food aversion
- Constipation
- Diarrhea
- Reflux / burping
- Stomach pain
- Fatigue
- Injection-site reaction

**Symptom → Recommendation mapping:**
| Symptom | Recommendation |
|---------|---------------|
| Nausea | Cold/bland foods, smoothies, yogurt, smaller meals |
| Constipation | Higher-fluid + gradual fiber + fruit/veg/lentils/chia prompts |
| Diarrhea | Simpler foods, hydration emphasis, electrolyte prompt |
| Reflux | Smaller meals, avoid late/heavy meals |
| Food aversion | Liquid calories (smoothies, protein shakes), gentle snacks |

### 1.4 Hydration Tracker

More prominent than calorie tracking right now.

- Daily water goal (default 64 oz, adjustable)
- Bottle/glass-based visual tracker (tap to add 8oz, 12oz, 16oz, custom)
- Electrolyte prompt on bad GI days (when nausea/vomiting/diarrhea logged)
- Hydration warnings if vomiting or diarrhea are active
- FDA labeling specifically calls out dehydration risk with GLP-1s

### 1.5 Emergency "I Feel Awful" Button

One-tap access from home screen. Shows:

- 3 gentlest foods currently in the meal plan
- Hydration reminder with current progress
- Red-flag symptom checklist (see 1.6)
- Option to notify prep partner (in-app notification) that it's a rough day
- "Safe foods" quick list (always available, not dependent on weekly plan)

### 1.6 Red-Flag Symptom Screen

Simple, clear, not buried. Accessible from symptom tracker and emergency button.

**"Contact your doctor or get help if you experience:"**
- Severe or persistent abdominal pain
- Pain that radiates to the back
- Ongoing vomiting that won't stop
- Signs of dehydration (dizziness, dark urine, dry mouth)
- Possible gallbladder symptoms (upper abdominal pain, jaundice)

These are reflected in FDA labeling for GLP-1 medications.

---

## Phase 2 — Weeks 2-4 Features

### 2.1 Personalized Protein Target

Replace the fixed `DAILY_TARGETS = { protein: 130 }` with:

- Input: current weight (update periodically)
- Optional: goal weight, clinician-recommended target
- Calculate range, not single number
- Show tiers: "minimum" / "good" / "great" protein days
- Recalculate as weight changes

### 2.2 Appetite Slider

Morning check-in:
- No appetite → suggest shakes, yogurt, cottage cheese, soft foods, small protein snacks
- Low appetite → mini meals, half portions
- Normal appetite → full meal options

Directly filters recipe suggestions on home dashboard.

### 2.3 Fiber Ramp System

High fiber is the goal, but ramping too fast on a sensitive stomach backfires.

- "Fiber tolerance" setting (weeks 1-2: gentle, weeks 3-4: moderate, weeks 5+: full target)
- Gradual weekly ramp of daily fiber target
- Separate soluble-fiber-friendly suggestions
- "Today may be a low-fiber day" option when symptoms flare
- Visual: show fiber target changing over time

### 2.4 Portion Splitting & Leftover Logic

GLP-1 users often can't eat a full meal in one sitting.

- "Full portion / half portion / snack portion" toggle per meal
- "Save the rest for later" — logs partial consumption
- Macros automatically recalculate based on portion
- This is critical for accurate tracking

### 2.5 Dose + Escalation Timeline

Log:
- Medication name (semaglutide, tirzepatide, etc.)
- Current dose
- Shot day (weekly recurring)
- Injection site (rotate tracker)
- Dose increase dates
- Missed/delayed doses

Overlay with symptom data to find patterns (symptoms often spike around dose increases).

### 2.6 Prep Partner View

Dedicated dashboard for the prep partner role:

- "What needs to be prepped today?"
- Shot day tomorrow? → "Prep gentle foods tonight, here are 3 options"
- Batch cooking suggestions for the week
- Grocery run reminders
- Symptom summary (so they know if it's a rough day without asking)

---

## Phase 3 — Weeks 4-12 Features

### 3.1 Smart Recommendation Engine

Uses symptom history + appetite + shot schedule to suggest:

- Which meals are safest on shot day?
- Which foods correlate with nausea/reflux?
- Which days are hydration-risk days?
- Is protein dropping during dose increases?

### 3.2 "Can I Eat This Today?" Food Checker

Tap any recipe and see:
- High protein? High fiber?
- Gentle or rough on stomach?
- Better on shot day vs normal day?
- Suggested portion size
- Example: Chili → nutritious, but "normal day only" if nausea active

### 3.3 Food Tolerance Trends

Charts over time:
- Symptom frequency by week
- Protein intake trend
- Hydration consistency
- Correlation: dose changes → symptom spikes → food tolerance shifts

### 3.4 Constipation Support Workflow

Dedicated mini-system:
- Last bowel movement tracker
- Bristol stool scale (optional)
- Water reminder bump when constipated
- Movement/walk reminder
- "Choose easier fiber today" suggestions
- Escalation prompt if constipation persists >3 days

### 3.5 "Food Noise" Tracker

One of the most dramatic GLP-1 effects. Simple 1-5 scale:
- "How much are you thinking about food today?"
- Tracks the reduction in food obsession over time
- Powerful motivational data in weeks 2-4 when scale may be slow

### 3.6 Emotional Relationship with Food Check-in

GLP-1s fundamentally change the food-as-comfort dynamic. Simple mood check:
- Excited / Neutral / Anxious / Sad / Overwhelmed
- About food specifically, not general mood
- Catches the disorientation early when food stops being a reward

### 3.7 Movement / Strength Prompts

Simple tracking to preserve lean mass:
- Walk after meals checkbox
- 10-minute mobility
- 2-3x/week strength sessions
- Research shows protein + resistance training = best lean mass preservation

### 3.8 Supplement Tracker

Daily checklist:
- Multivitamin
- Vitamin D
- Calcium
- Magnesium
- Protein supplement (pea/collagen)
- Custom additions
- Reminder notifications

### 3.9 Social Eating Playbook

"Dining out" mode:
- Quick tips by cuisine type (Mexican, Chinese, burger joints, pizza places, etc.)
- What to order when you can only eat a few bites
- How to handle family gatherings and social pressure
- "Doggy bag strategy" — order knowing you'll eat half

### 3.10 Weight Tracking with Correct Framing

NOT just pounds. Frame in context:
- "At your protein intake, research suggests most of this loss is fat mass"
- Celebrate consistency metrics (protein streaks, hydration streaks) MORE than the scale
- Optional: waist measurement, how clothes fit (qualitative)
- Never make the scale the hero metric

### 3.11 Medication Companion Reminders

- Shot day reminder
- Refill date
- Dose increase week prep ("your dose goes up next week, here's what to expect")
- Rotate injection site
- "Eat something light before bed if you tend to feel worse on an empty stomach"
- "Prep safe foods the day before shot day"

---

## Recipe Schema Enhancement

Current schema:
```js
{
  id, name, meal, time, servings,
  protein, fiber, calories,
  ingredients, steps, tags, notes
}
```

**Add these fields for symptom-aware filtering:**

```js
glp1: {
  shotDayFriendly: true,        // safe on injection day
  nauseaFriendly: true,         // gentle on stomach
  refluxFriendly: false,        // avoid if reflux active
  constipationSupport: "high",  // "none" | "low" | "medium" | "high"
  appetiteLevel: ["low", "normal"],  // which appetite levels this works for
  portionFlex: ["mini", "half", "full"],  // can this be split?
  heaviness: 2,                 // 1-5 scale (1 = light, 5 = heavy)
  texture: ["soft", "cold"],    // texture categories
  avoidWhen: ["active vomiting", "severe reflux"]  // contra-indications
},
allergens: [],                  // explicit allergen list
freezesWell: true,
leftoverDays: 4,                // how long leftovers keep
canBlendOrSip: false,           // can this be consumed as liquid?
recommendedPortion: "half"      // default portion suggestion
```

**Tag all 78 existing recipes with these fields.** This is the key to making the recommendation engine work.

---

## "First 8 Weeks" Onboarding Journey

Guided experience, not just a tool:

- **Week 1**: "Here's what to expect. Nausea is normal. Eat what you can. Focus on hydration and protein."
- **Week 2**: "Your body is adjusting. Track symptoms — patterns will emerge."
- **Week 3-4**: "Dose may increase. Here's how to prep. Your food tolerance data is building."
- **Week 5-6**: "Review your trends. Which meals worked? Which didn't? Adjust your plan."
- **Week 8**: "Checkpoint. How's your protein? Fiber? Hydration? Let's optimize."

Each week surfaces relevant features and tips contextually.

---

## Data Schema (for state management / eventual Supabase)

```typescript
interface UserProfile {
  name: string;
  currentWeight: number;  // lbs
  goalWeight?: number;
  proteinTarget: { min: number; max: number };  // auto-calculated
  fiberTarget: number;  // ramps over time
  hydrationGoal: number;  // oz
  dietaryRestrictions: string[];
  medicationStartDate: string;
}

interface MedicationLog {
  id: string;
  medication: string;
  dose: string;
  shotDay: string;  // day of week
  injectionSite: string;
  date: string;
  notes?: string;
}

interface DailyLog {
  date: string;
  symptoms: Record<SymptomType, Severity>;
  appetiteLevel: "none" | "low" | "normal";
  hydrationOz: number;
  foodNoiseLevel: number;  // 1-5
  foodMood: "excited" | "neutral" | "anxious" | "sad" | "overwhelmed";
  mealsConsumed: MealEntry[];
  supplements: string[];
  movement: string[];
  bowelMovement?: boolean;
  notes?: string;
}

interface MealEntry {
  recipeId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  portion: "mini" | "half" | "full";
  actualProtein: number;
  actualFiber: number;
  actualCalories: number;
}

type SymptomType = "nausea" | "fullness" | "constipation" | "diarrhea" | 
                   "reflux" | "stomachPain" | "fatigue" | "injectionSite";
type Severity = "none" | "mild" | "moderate" | "severe";
```

---

## UI/UX Principles

1. **15-second rule**: Any daily logging action should take <15 seconds
2. **Tap, don't type**: Symptom and hydration tracking should be all taps, no keyboard
3. **Context over content**: Show RELEVANT info based on today's state, not everything
4. **Two users**: Prep partner cooks, primary user eats. Both need views.
5. **Celebrate consistency**: Streaks, not perfection. "5 days hitting protein target!" matters more than "you ate 132g today"
6. **Never shame**: No red warnings for missing targets on bad days. GLP-1 side effects are real.
7. **Mobile-first**: This will be used on a phone at the kitchen counter and the couch

---

## Build Priority Summary

| Priority | Feature | Why Now |
|----------|---------|---------|
| P0 | Home dashboard | First thing the user sees |
| P0 | Shot-day mode | Needed from injection day 1 |
| P0 | Emergency "I feel awful" button | Could need it the next morning |
| P0 | Hydration tracker | Dehydration risk from day 1 |
| P1 | Symptom tracker | Start collecting data immediately |
| P1 | Personalized protein target | Current fixed target is a placeholder |
| P1 | Red-flag symptom screen | Safety feature |
| P2 | Appetite slider + meal filtering | Useful once appetite effects kick in |
| P2 | Fiber ramp system | Prevent GI problems from fiber overload |
| P2 | Portion splitting | Accurate tracking for smaller eaters |
| P2 | Dose timeline | Pattern detection needs data |
| P2 | Prep partner view | Prep partner needs planning visibility |
| P3 | Smart recommendation engine | Needs symptom data history |
| P3 | Food tolerance trends | Needs weeks of data |
| P3 | All other Phase 3 features | Build once foundation is solid |
