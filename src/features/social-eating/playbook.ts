import type { DailyLog, UserProfile } from "../../domain/types";
import { isShotDaySupportActive } from "../dashboard/support";

export type CuisinePlaybook = {
  id: string;
  title: string;
  bestBets: string[];
  caution: string[];
  portionMove: string;
};

export function getDiningOutContext(profile: UserProfile, log: DailyLog) {
  const shotDay = isShotDaySupportActive(profile);
  const lowAppetite = log.appetiteLevel !== "normal";
  const nauseaActive = log.symptoms.nausea !== "none";
  const refluxActive = log.symptoms.reflux !== "none";

  const messages: string[] = [];

  if (shotDay) {
    messages.push("Shot-day support is active. Order smaller, gentler, and easier-to-stop meals.");
  }
  if (nauseaActive) {
    messages.push("Nausea is active today. Cold, bland, or simpler foods will usually land better than rich entrees.");
  }
  if (refluxActive) {
    messages.push("Reflux is active today. Avoid greasy, spicy, and very tomato-heavy picks if possible.");
  }
  if (lowAppetite) {
    messages.push("Appetite is reduced. Prioritize a few protein-forward bites over trying to finish a normal portion.");
  }
  if (messages.length === 0) {
    messages.push("Normal day dining still benefits from a half-portion mindset and a plan for leftovers.");
  }

  return {
    shotDay,
    lowAppetite,
    nauseaActive,
    refluxActive,
    messages,
  };
}

export function getCuisinePlaybook(profile: UserProfile, log: DailyLog) {
  const context = getDiningOutContext(profile, log);

  const cuisines: CuisinePlaybook[] = [
    {
      id: "mexican",
      title: "Mexican",
      bestBets: [
        "Chicken taco plate or fajitas with beans if tolerated",
        "Taco bowl with protein first, then a few bites of rice",
        "Brothier chicken soup when appetite is low",
      ],
      caution: [
        "Large burritos",
        "Chips before the meal",
        "Greasy queso-heavy combinations",
      ],
      portionMove: "Order expecting leftovers. Protein first, then stop when the first fullness signal hits.",
    },
    {
      id: "chinese",
      title: "Chinese",
      bestBets: [
        "Steamed or lightly sauteed chicken with vegetables",
        "Egg-drop style or broth-based soup if tolerated",
        "Rice on the side instead of mixed into a large entree",
      ],
      caution: [
        "Heavy fried dishes",
        "Large noodle portions",
        "Very sweet sauces if nausea is active",
      ],
      portionMove: "Think a few bites of protein, a few bites of rice, then pause before deciding on more.",
    },
    {
      id: "burgers",
      title: "Burger joints",
      bestBets: [
        "Single patty burger or burger bowl",
        "Grilled chicken sandwich, often without finishing the bun",
        "Kids-size portions when available",
      ],
      caution: [
        "Double burgers",
        "Large fries",
        "Milkshakes on rough stomach days",
      ],
      portionMove: "Split the meal in half immediately or box half before you start eating.",
    },
    {
      id: "pizza",
      title: "Pizza",
      bestBets: [
        "One slice plus side salad or grilled protein if available",
        "Lighter toppings over very greasy combinations",
        "Soup or salad if a full slice sounds too heavy",
      ],
      caution: [
        "Multiple slices eaten quickly",
        "Very greasy meat-heavy pies",
        "Late-night pizza with reflux",
      ],
      portionMove: "Decide on one slice first. If you still want more after a pause, reassess slowly.",
    },
  ];

  if (context.nauseaActive || context.shotDay) {
    cuisines.forEach((cuisine) => {
      cuisine.bestBets = cuisine.bestBets.slice(0, 2);
      cuisine.caution.unshift("Rich or heavy entrees are more likely to backfire today");
    });
  }

  if (context.refluxActive) {
    cuisines
      .filter((cuisine) => cuisine.id === "mexican" || cuisine.id === "pizza")
      .forEach((cuisine) => {
        cuisine.caution.unshift("Spicy and tomato-heavy choices are higher-risk today");
      });
  }

  return cuisines;
}

export function getSocialScripts() {
  return [
    "I’m good with a smaller portion today, but I’d love to take the rest home.",
    "My stomach is unpredictable right now, so I’m starting light and seeing how it lands.",
    "I’m not skipping your food, I just hit full really quickly these days.",
  ];
}
