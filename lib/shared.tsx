// lib/shared.ts

// --- Types ---
export type Handedness = "L" | "R";

export type PitchInput = {
  pitchType: string;
  handedness: Handedness; // enforce L or R
  release_speed: number;
  pfx_x: number;
  pfx_z: number;
  release_extension: number;
  release_spin_rate: number;
  spin_axis: number;
  release_pos_x: number;
  release_pos_z: number;
  fb_velo: number;
  fb_ivb: number;
  fb_hmov: number;
};

export type StuffPlusResult = {
  stuffPlus: number;
  percentile: number;
};

// --- Stuff+ calculation (local fallback) ---
export function calculateStuffPlus(pitch: PitchInput): number {
  const {
    release_speed = 90,
    pfx_z = 15,
    pfx_x = 8,
    release_spin_rate = 2200,
  } = pitch;

  return (
    100 +
    0.25 * (release_speed - 90) +
    0.1 * (pfx_z - 15) +
    0.05 * (pfx_x - 8) +
    0.01 * ((release_spin_rate - 2200) / 100)
  );
}

// --- Stuff+ → Percentile mapping ---
export function stuffPlusToPercentile(stuff: number): number {
  if (stuff < 80) return 5;
  if (stuff < 90) return 25;
  if (stuff < 100) return 50;
  if (stuff < 110) return 75;
  return 95;
}

// --- Pitch Colors ---
export const pitchColors: Record<string, string> = {
  FF: "#1f77b4", // fastball
  SL: "#ff7f0e", // slider
  CH: "#2ca02c", // changeup
  CB: "#d62728", // curveball
  SI: "#9467bd", // sinker
};

// --- Example Sample Pitches ---
export const samplePitches: PitchInput[] = [
  {
    pitchType: "FF",
    release_speed: 96,
    pfx_x: 8,
    pfx_z: 18,
    release_extension: 6,
    release_spin_rate: 2400,
    spin_axis: 180,
    release_pos_x: 1.5,
    release_pos_z: 5.5,
    fb_velo: 96,
    fb_ivb: 18,
    fb_hmov: -7,
    handedness: "R",
  },
  {
    pitchType: "SL",
    release_speed: 85,
    pfx_x: -4,
    pfx_z: 5,
    release_extension: 5.8,
    release_spin_rate: 2600,
    spin_axis: 90,
    release_pos_x: 1.4,
    release_pos_z: 5.3,
    fb_velo: 85,
    fb_ivb: 5,
    fb_hmov: -14,
    handedness: "R",
  },
  {
    pitchType: "CH",
    release_speed: 82,
    pfx_x: 10,
    pfx_z: 9,
    release_extension: 6.1,
    release_spin_rate: 1800,
    spin_axis: 210,
    release_pos_x: 1.6,
    release_pos_z: 5.7,
    fb_velo: 82,
    fb_ivb: 9,
    fb_hmov: 12,
    handedness: "L",
  },
];

// --- Backend API call ---
export async function getStuffPlusAPI(
  pitch: PitchInput
): Promise<StuffPlusResult> {
  try {
    const response = await fetch("https://stuff-plus-app.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pitch),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      stuffPlus: data.stuffPlus ?? calculateStuffPlus(pitch), // fallback if API fails
      percentile:
        data.percentile ??
        stuffPlusToPercentile(data.stuffPlus ?? calculateStuffPlus(pitch)),
    };
  } catch (err) {
    console.error("Failed to fetch Stuff+:", err);
    // fallback to local calc
    const stuff = calculateStuffPlus(pitch);
    return {
      stuffPlus: stuff,
      percentile: stuffPlusToPercentile(stuff),
    };
  }
}
