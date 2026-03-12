/**
 * One-off image generation script using fal.ai Z-Image Turbo.
 * Run: FAL_API_KEY=... bun run scripts/generate-images.ts
 */

import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const FAL_API_KEY = process.env.FAL_API_KEY;
if (!FAL_API_KEY) {
  console.error("FAL_API_KEY env var is required");
  process.exit(1);
}

const OUTPUT_DIR = join(import.meta.dir, "..", "public", "images");
const FAL_ENDPOINT = "https://queue.fal.run/fal-ai/z-image/turbo";
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 60;

type ImageSpec = {
  name: string;
  prompt: string;
  width: number;
  height: number;
};

const images: ImageSpec[] = [
  {
    name: "hero.webp",
    prompt:
      "Warm abstract wellness illustration, person preparing a healthy colorful meal in a modern kitchen, beige green and terracotta color palette, flat organic illustration style, soft gradients, no text, editorial quality",
    width: 1024,
    height: 768,
  },
  {
    name: "icon-symptoms.webp",
    prompt:
      "Monoline style icon, symptom tracking health journal with a gentle checkmark, beige background, forest green line art, minimal flat illustration, clean vector style",
    width: 512,
    height: 512,
  },
  {
    name: "icon-meals.webp",
    prompt:
      "Monoline style icon, meal planning with a plate of colorful food and a calendar, beige background, forest green line art, minimal flat illustration, clean vector style",
    width: 512,
    height: 512,
  },
  {
    name: "icon-hydration.webp",
    prompt:
      "Monoline style icon, water glass with gentle ripples and a drop, beige background, forest green line art, minimal flat illustration, clean vector style",
    width: 512,
    height: 512,
  },
  {
    name: "icon-shot-day.webp",
    prompt:
      "Monoline style icon, medication syringe with a calendar day marker and gentle care symbol, beige background, forest green line art, minimal flat illustration, clean vector style",
    width: 512,
    height: 512,
  },
  {
    name: "icon-partner.webp",
    prompt:
      "Monoline style icon, two people supporting each other with gentle connection lines, beige background, forest green line art, minimal flat illustration, clean vector style",
    width: 512,
    height: 512,
  },
  {
    name: "icon-emergency.webp",
    prompt:
      "Monoline style icon, gentle safety shield with a heart inside, beige background, forest green line art, minimal flat illustration, clean vector style",
    width: 512,
    height: 512,
  },
  {
    name: "step-onboarding.webp",
    prompt:
      "Warm flat illustration of a person setting up their profile on a phone, wellness app onboarding, beige and green palette, organic shapes, soft gradients, no text",
    width: 512,
    height: 512,
  },
  {
    name: "step-checkin.webp",
    prompt:
      "Warm flat illustration of a person doing a daily health check-in on their phone with gentle icons floating around, beige and green palette, organic shapes, soft gradients, no text",
    width: 512,
    height: 512,
  },
  {
    name: "step-support.webp",
    prompt:
      "Warm flat illustration of a person receiving personalized meal and wellness recommendations on a screen, beige and green palette, organic shapes, soft gradients, no text",
    width: 512,
    height: 512,
  },
];

const authHeaders = {
  Authorization: `Key ${FAL_API_KEY}`,
  "Content-Type": "application/json",
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollForResult(responseUrl: string): Promise<Record<string, unknown>> {
  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_INTERVAL_MS);
    const res = await fetch(responseUrl, { headers: authHeaders });
    const data = await res.json();
    // If we get images back, it's done
    if (data.images) return data;
    // If status is still in queue/processing, keep polling
    if (data.status === "IN_QUEUE" || data.status === "IN_PROGRESS") continue;
    // Any other status with no images is an error
    if (data.status === "COMPLETED") return data;
    // Unknown state — return what we have
    return data;
  }
  throw new Error("Timed out waiting for image generation");
}

async function saveImage(imageUrl: string, filePath: string): Promise<void> {
  if (imageUrl.startsWith("data:")) {
    // base64 data URL — decode and save
    const base64 = imageUrl.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    await Bun.write(filePath, buffer);
    console.log(`  Saved: ${filePath} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  } else {
    // HTTP URL — download
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    await Bun.write(filePath, buffer);
    console.log(`  Saved: ${filePath} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  }
}

async function generateImage(spec: ImageSpec): Promise<void> {
  console.log(`Generating: ${spec.name}...`);

  const response = await fetch(FAL_ENDPOINT, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      prompt: spec.prompt,
      image_size: { width: spec.width, height: spec.height },
      num_images: 1,
      sync_mode: true,
    }),
  });

  let data = await response.json();

  // If queued, poll for result
  if (data.status === "IN_QUEUE" || data.status === "IN_PROGRESS") {
    const responseUrl = data.response_url;
    if (!responseUrl) {
      console.error(`  Failed ${spec.name}: queued but no response_url`);
      return;
    }
    console.log(`  Queued, polling for result...`);
    data = await pollForResult(responseUrl);
  }

  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) {
    console.error(`  Failed ${spec.name}:`, data?.error || data?.detail || "No image URL in response");
    return;
  }

  const filePath = join(OUTPUT_DIR, spec.name);
  await saveImage(imageUrl, filePath);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Generating ${images.length} images...\n`);

  for (const spec of images) {
    await generateImage(spec);
  }

  console.log("\nDone! Images saved to public/images/");
}

main().catch(console.error);
