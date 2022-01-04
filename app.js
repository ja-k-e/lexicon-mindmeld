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

const stages = generateStages([
  { guesses: 1, start: 3, end: 5 },
  { guesses: 2, start: 4, end: 7 },
  { guesses: 3, start: 5, end: 8 },
]);

const maxItems = 10;
const maxGuesses = 3;
const rangeItems = maxItems * 2;
const cores = rangeItems + maxGuesses;
let engine = generateEngine();

function generateEngine() {
  return new SeededRandomEngine({
    cores,
    history: 1,
    seed: "here",
  });
}

const config = {
  level: 1,
};

$groupA.addEventListener("change", groupChange);
$groupB.addEventListener("change", groupChange);
$level.addEventListener("change", () => {
  const level = parseInt($level.value);
  if (!$level.value) {
    return;
  }
  generate(level);
});
$generation.addEventListener("change", () => {
  const generation = parseInt($generation.value);
  if (!$generation.value) {
    return;
  }
  if (generation < engine.generation) {
    engine = generateEngine();
  } else {
    engine.ff(generation - 1);
  }
  generate();
});

$prev.addEventListener("click", () => generate(config.level - 1));
$next.addEventListener("click", () => generate(config.level + 1));
generate(1);

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

function generate(nextLevel) {
  engine.generate();
  $generation.value = engine.generation;

  if (nextLevel !== undefined) {
    config.level = Math.max(nextLevel, 1);
    $level.value = config.level;
  }
  if (config.level % 2 === 0) {
    document.body.classList.remove("odd");
    document.body.classList.add("even");
  } else {
    document.body.classList.add("odd");
    document.body.classList.remove("even");
  }

  const constraints = extractConstraints();
  const terms = extractTerms();

  const { guesses, quantity } =
    stages[Math.min(stages.length, config.level) - 1];

  const constraintsDisplay = [...constraints].slice(0, guesses);
  const termsDisplay = shuffle([...terms].slice(0, quantity));
  const limitedTermsDisplay = [...terms].slice(0, guesses);

  $main.innerHTML = `
    <div class="view-1">
      <ul>
        ${termsDisplay
          .map((term) => `<li><strong>${term}</strong></li>`)
          .join("")}
      </ul>
    </div>
    <div class="view-2">
      <ul>
        ${limitedTermsDisplay
          .map(
            (term, i) =>
              `<li><strong>${term}</strong><br><em>${constraintsDisplay[i]}</em></li>`
          )
          .join("")}
      </ul>
    </div>`;
}

function extractConstraints() {
  const values = engine.values();
  const possible = constraints.simple;
  const straints = [];
  for (let i = 0; i < maxGuesses; i++) {
    straints.push(possible[Math.floor(values[maxItems + i] * possible.length)]);
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
