// Lightweight randomization for synthetic content — no external deps.

export const SIM_PASSWORD = "password123";

const adjectives = [
  "cosmic", "sleepy", "brave", "quantum", "fuzzy", "silent", "golden",
  "rusty", "lunar", "wild", "clever", "spicy", "frosty", "mellow", "nova",
];
const nouns = [
  "penguin", "river", "nebula", "otter", "circuit", "maple", "comet",
  "falcon", "pixel", "ember", "willow", "badger", "harbor", "cactus", "raven",
];
const topics = [
  "JavaScript", "coffee", "space", "gaming", "music", "hiking", "cats",
  "startups", "design", "history", "photography", "running",
];

const titleTemplates = [
  (t) => `What's your favorite thing about ${t}?`,
  (t) => `I just got into ${t} and I'm hooked`,
  (t) => `Unpopular opinion about ${t}`,
  (t) => `Best resources to learn ${t}?`,
  (t) => `${t} changed how I think about everything`,
  (t) => `Daily ${t} thread`,
];

const sentences = [
  "This is exactly what I needed to read today.",
  "Totally agree, great point.",
  "Can you say more about this?",
  "I had the opposite experience honestly.",
  "Saving this for later, thanks!",
  "Underrated take.",
  "Source? Would love to read more.",
  "Been thinking about this a lot lately.",
  "Solid write-up.",
  "Not sure I agree but interesting perspective.",
];

export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// alphanumeric, 3–30 chars — satisfies the register validator rules.
export const randomUserName = () =>
  `${randomItem(adjectives)}${capitalize(randomItem(nouns))}${randomInt(1, 9999)}`
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 30);

// Includes a number to keep names/slugs unique across many runs.
export const randomCommunityName = () =>
  `${capitalize(randomItem(adjectives))} ${capitalize(randomItem(nouns))}s ${randomInt(100, 999)}`;

export const randomDescription = () =>
  `A community for everything about ${randomItem(topics)}.`;

export const randomTitle = () => randomItem(titleTemplates)(randomItem(topics));

export const randomSentence = () => randomItem(sentences);
