import data from "https://unpkg.com/lexicon-data@1.0.0/index.mjs";
import SeededRandomEngine from "https://unpkg.com/seeded-random-engine@1.0.3/index.mjs";

const { constraints, topics } = data;

const $main = document.querySelector("main");
const $prev = document.getElementById("prev");
const $next = document.getElementById("next");
const $groupA = document.getElementById("group-a");
const $groupB = document.getElementById("group-b");
const $generation = document.getElementById("generation");
const $level = document.getElementById("level");

const stages = [
  { guesses: 1, start: 3, end: 5 },
  { guesses: 2, start: 4, end: 7 },
  { guesses: 3, start: 5, end: 8 },
];
const maxItems = 10;
const maxGuesses = 3;
const rangeItems = maxItems * 2;
const cores = rangeItems + maxGuesses;
const engine = new SeededRandomEngine({
  cores,
  history: 1,
  seed: "here",
});

const config = {
  level: 0,
};

$groupA.addEventListener("change", groupChange);
$groupB.addEventListener("change", groupChange);

$prev.addEventListener("click", () => generate(config.level - 1));
$next.addEventListener("click", () => generate(config.level + 1));
generate();

function groupChange() {
  if ($groupA.checked) {
    document.body.classList.add("group-a");
    document.body.classList.remove("group-b");
  }
  if ($groupB.checked) {
    document.body.classList.add("group-b");
    document.body.classList.remove("group-a");
  }
}

function generate(nextLevel = 0) {
  engine.generate();

  config.level = Math.max(nextLevel, 0);
  $level.value = config.level;
  $generation.value = engine.generation;
  if (engine.generation % 2 === 0) {
    document.body.classList.remove("odd");
    document.body.classList.add("even");
  } else {
    document.body.classList.add("odd");
    document.body.classList.remove("even");
  }

  const constraints = extractConstraints();
  const terms = extractTerms();

  const termCount = 3 + (config.level % 6);

  $main.innerHTML = `
    <div class="view-1">VIEW 1 ${constraints.join(", ")}<br>${terms.join(
    ", "
  )}</div>
    <div class="view-2">VIEW 2 ${constraints.join(", ")}<br>${terms.join(
    ", "
  )}</div>`;
}

function extractConstraints() {
  const values = engine.values();
  const possibleStraints = constraints.simple;
  const straints = [];
  for (let i = 0; i < maxGuesses; i++) {
    straints.push(
      possibleStraints[
        Math.floor(values[maxItems + i] * possibleStraints.length)
      ]
    );
  }
  return straints;
}

function extractTerms() {
  const values = engine.values();
  const terms = [];
  for (let i = 0; i < rangeItems; i += 2) {
    const group = topics[Math.floor(values[i] * topics.length)];
    const index = Math.floor(values[i + 1] * group.length);
    terms.push(group.splice(index, 1)[0]);
  }
  return terms;
}
