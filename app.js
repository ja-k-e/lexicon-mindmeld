import data from "https://unpkg.com/lexicon-data@1.0.10/index.mjs";
import SeededRandomEngine from "https://unpkg.com/seeded-random-engine@1.0.4/index.mjs";

const { lexiconConstraints, lexiconTopics } = data;

const $main = document.querySelector("main");
const $lost = document.getElementById("lost");
const $won = document.getElementById("won");
const $groupA = document.getElementById("group-a");
const $groupB = document.getElementById("group-b");
const $generation = document.getElementById("generation");
const $constants = document.getElementById("constants");
const $level = document.getElementById("level");
const $levelDisplay = document.getElementById("level-display");
const $seed = document.getElementById("seed");

const stages = generateStages([
  { guesses: 1, start: 3, end: 5 },
  { guesses: 2, start: 4, end: 7 },
  { guesses: 3, start: 5, end: 8 },
]);

const maxItems = 10;
const maxGuesses = 3;
const rangeItems = maxItems * 2;
const cores = rangeItems + maxGuesses;
const searchParams = new URLSearchParams(window.location.search);
const seed = searchParams.get("s") || "your-seed-here";

const state = {
  level: 1,
  seed,
  engine: null,
};

generateEngine();

$seed.value = state.seed;
$groupA.addEventListener("click", () => handleGroupChange("a"));
$groupB.addEventListener("click", () => handleGroupChange("b"));
$levelDisplay.addEventListener("click", () =>
  $constants.classList.remove("hide")
);
$constants.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.side) {
    return;
  }
  const level = parseInt($level.value);
  const generation = parseInt($generation.value);
  if ($seed.value !== state.seed) {
    handleSeedChange($seed.value);
  }

  if (generation !== state.engine.generation) {
    state.engine.to(generation);
  }

  updateLevel(level);

  $constants.classList.add("hide");
});

$lost.addEventListener("click", () => generateAndUpdateLevel(state.level - 1));
$won.addEventListener("click", () => generateAndUpdateLevel(state.level + 1));

function generateEngine() {
  delete state.engine;
  state.engine = new SeededRandomEngine({
    cores,
    history: 10,
    seed: state.seed,
  });
}

function handleSeedChange(seed) {
  state.seed = seed;
  searchParams.set("s", seed);
  const { protocol, host, pathname } = window.location;
  const path = [
    protocol,
    "//",
    host,
    pathname,
    "?",
    searchParams.toString(),
  ].join("");
  window.history.replaceState({ path }, "", path);
  generateEngine();
}

function handleGroupChange(aOrB) {
  state.side = aOrB;
  if (aOrB === "a") {
    $groupA.classList.remove("unselected");
    $groupB.classList.add("unselected");
    document.body.classList.add("group-a");
    document.body.classList.remove("group-b");
  } else if (aOrB === "b") {
    $groupA.classList.add("unselected");
    $groupB.classList.remove("unselected");
    document.body.classList.add("group-b");
    document.body.classList.remove("group-a");
  }
}

function generateAndUpdateLevel(level) {
  state.engine.generate();
  $generation.value = state.engine.generation;
  updateLevel(level);
}

function updateLevel(level) {
  if (level !== state.level) {
    state.level = Math.max(level, 1);
  }
  $level.value = state.level;
  $levelDisplay.innerText = `Level ${state.level}`;
  if (state.level % 2 === 0) {
    document.body.classList.remove("odd");
    document.body.classList.add("even");
  } else {
    document.body.classList.add("odd");
    document.body.classList.remove("even");
  }

  const constraints = extractConstraints();
  const terms = extractTerms();

  const { guesses, quantity } =
    stages[Math.min(stages.length, state.level) - 1];

  const constraintsDisplay = [...constraints].slice(0, guesses);
  const termsDisplay = shuffle([...terms].slice(0, quantity));
  const terms2Display = [...terms].slice(0, guesses);

  drawTerms(constraintsDisplay, termsDisplay, terms2Display);
}

function drawTerms(constraints, terms, terms2) {
  const termConstraint = (term, constraint) =>
    `<li><strong>${term}</strong><br><em>${constraint}</em></li>`;

  $main.innerHTML = `
    <div class="view-1">
      <ul>
        ${terms.map((term) => `<li><strong>${term}</strong></li>`).join("")}
      </ul>
    </div>
    <div class="view-2">
      <ul>
        ${terms2
          .map((term, i) => termConstraint(term, constraints[i]))
          .join("")}
      </ul>
    </div>`;
}

function extractConstraints() {
  const values = state.engine.values();
  const possible = lexiconConstraints.simple;
  const straints = [];
  for (let i = 0; i < maxGuesses; i++) {
    straints.push(possible[Math.floor(values[maxItems + i] * possible.length)]);
  }
  return straints;
}

function extractTerms() {
  const values = state.engine.values();
  const terms = [];
  const topicsTmp = [];
  lexiconTopics.forEach((group) => topicsTmp.push([...group]));
  for (let i = 0; i < rangeItems; i += 2) {
    const group = topicsTmp[Math.floor(values[i] * topicsTmp.length)];
    const index = Math.floor(values[i + 1] * group.length);
    const item = group.splice(index, 1)[0];
    terms.push(item);
  }
  return terms;
}

function generateStages(params) {
  const data = [];
  params.forEach(({ guesses, start, end }) => {
    for (let a = start; a <= end; a++) {
      for (let i = 0; i < 3; i++) {
        data.push({ guesses, quantity: a });
      }
    }
  });
  return data;
}

function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
