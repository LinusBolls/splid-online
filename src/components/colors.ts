import { SplidJs } from "splid-js";

/**
 * Deterministically selects a random Map entry based on a seed string.
 * @param {Map} map - The JavaScript Map to access.
 * @param {string} seed - The seed string to determine the random entry.
 * @returns {[any, any]} - The selected entry as a [key, value] pair.
 */
function getRandomMapEntry<T>(map: Map<string, T>, seed: string): T {
  if (!(map instanceof Map)) {
    throw new Error("The first argument must be a Map.");
  }
  if (typeof seed !== "string") {
    throw new Error("The seed must be a string.");
  }

  // Hash function to convert the seed string into a numeric value
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0; // Ensure non-negative integer
    }
    return hash;
  };

  const entries = Array.from(map.entries());
  if (entries.length === 0) {
    throw new Error("The map is empty.");
  }

  const index = hashString(seed) % entries.length;

  return entries[index][1];
}

export const AvatarColorMap = new Map([
  [
    "A100",
    {
      bg: "#e3e3fe",
      fg: "#3838f5",
    },
  ],
  [
    "A110",
    {
      bg: "#dde7fc",
      fg: "#1251d3",
    },
  ],
  [
    "A120",
    {
      bg: "#d8e8f0",
      fg: "#086da0",
    },
  ],
  [
    "A130",
    {
      bg: "#cde4cd",
      fg: "#067906",
    },
  ],
  [
    "A140",
    {
      bg: "#eae0fd",
      fg: "#661aff",
    },
  ],
  [
    "A150",
    {
      bg: "#f5e3fe",
      fg: "#9f00f0",
    },
  ],
  [
    "A160",
    {
      bg: "#f6d8ec",
      fg: "#b8057c",
    },
  ],
  [
    "A170",
    {
      bg: "#f5d7d7",
      fg: "#be0404",
    },
  ],
  [
    "A180",
    {
      bg: "#fef5d0",
      fg: "#836b01",
    },
  ],
  [
    "A190",
    {
      bg: "#eae6d5",
      fg: "#7d6f40",
    },
  ],
  [
    "A200",
    {
      bg: "#d2d2dc",
      fg: "#4f4f6d",
    },
  ],
  [
    "A210",
    {
      bg: "#d7d7d9",
      fg: "#5c5c5c",
    },
  ],
]);

export const getRandomAvatarColor = (seed: string) => {
  return getRandomMapEntry(AvatarColorMap, seed);
};

export const assignAvatarColors = (
  members: SplidJs.Person[]
): Record<string, { bg: string; fg: string }> => {
  const record: Record<string, { bg: string; fg: string }> = {};

  for (const [idx, member] of members.entries()) {
    // TODO: reduce color collision for members with same .initials

    record[member.GlobalId] = getRandomMapEntry(AvatarColorMap, idx.toString());
  }
  return record;
};
