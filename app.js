import data from "https://unpkg.com/lexicon-data@1.0.0/index.mjs";
import SeededRandomEngine from "https://unpkg.com/seeded-random-engine@1.0.3/index.mjs";

const { constraints, topics } = data;

const maxItems = 8;
const maxGuesses = 6;
const rangeItems = maxItems * 2;
const cores = rangeItems + maxGuesses;
const engine = new SeededRandomEngine({
  cores,
  history: 1,
  seed: "here",
});

newRound();

function newRound() {
  engine.generate();
  const constraints = extractConstraints();
  const terms = extractTerms();

  document.body.innerHTML = `${constraints.join(", ")}<br>${terms.join(", ")}`;
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
