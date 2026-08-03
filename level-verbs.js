const level = document.documentElement.dataset.level;
const response = await fetch(`./verbs-${level}-data.json`);
if (!response.ok) throw new Error("Kunde inte läsa verbdata.");
const data = await response.json();
const requestedLanguage = new URLSearchParams(location.search).get("lang");
const state = {
  language: requestedLanguage === "ar" ? "ar" : "en",
  group: "all",
  query: "",
  quiz: [],
  index: 0,
  score: 0,
  locked: false,
};
const rows = document.querySelector("#verbRows"),
  empty = document.querySelector("#empty"),
  count = document.querySelector("#shownCount"),
  heading = document.querySelector("#translationHeading");
const norm = (v) =>
  String(v ?? "")
    .toLocaleLowerCase("sv")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
const esc = (v) =>
  String(v ?? "—").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const groups = [...new Set(data.map((v) => v.group))];
document.querySelector("#groupCount").textContent = groups.length;
const groupSelect = document.querySelector("#group");
groups.forEach((g) =>
  groupSelect.insertAdjacentHTML(
    "beforeend",
    `<option value="${esc(g)}">${esc(g)}</option>`,
  ),
);
function visible() {
  const q = norm(state.query);
  return data.filter(
    (v) =>
      (state.group === "all" || v.group === state.group) &&
      (!q || norm(Object.values(v).join(" ")).includes(q)),
  );
}
function render() {
  const verbs = visible();
  count.textContent = verbs.length;
  empty.hidden = verbs.length > 0;
  heading.textContent = state.language === "en" ? "English" : "العربية";
  rows.innerHTML = verbs
    .map(
      (v) =>
        `<tr><td>${v.id}</td><td><img class="verbImage" loading="lazy" src="${esc(v.image)}" alt="Minnesbild för verbet ${esc(v.infinitive)}" width="120" height="80"></td><td><span class="group">${esc(v.group)}</span></td><td>${esc(v.imperative)}</td><td class="infinitive">${esc(v.infinitive)}</td><td>${esc(v.present)}</td><td>${esc(v.preterite)}</td><td>${esc(v.supine)}</td><td class="${state.language === "ar" ? "arabic" : ""}">${esc(v[state.language])}</td></tr>`,
    )
    .join("");
}
document.querySelector("#search").oninput = (e) => {
  state.query = e.target.value;
  render();
};
groupSelect.onchange = (e) => {
  state.group = e.target.value;
  render();
};
document.querySelectorAll("[data-language]").forEach(
  (b) =>
    (b.onclick = () => {
      state.language = b.dataset.language;
      document
        .querySelectorAll("[data-language]")
        .forEach((x) => x.classList.toggle("active", x === b));
      render();
    }),
);
document.querySelectorAll("[data-language]").forEach((button) =>
  button.classList.toggle("active", button.dataset.language === state.language),
);
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5),
  prompt = document.querySelector("#quizPrompt"),
  choices = document.querySelector("#quizChoices"),
  score = document.querySelector("#quizScore");
function question() {
  if (state.index >= state.quiz.length) {
    prompt.textContent = `Klart! Du fick ${state.score} av ${state.quiz.length} rätt.`;
    choices.innerHTML = "";
    score.textContent = "";
    return;
  }
  state.locked = false;
  const v = state.quiz[state.index];
  prompt.textContent = `${state.index + 1}/10: Vad är preteritum av “${v.infinitive}”?`;
  const opts = shuffle([
    v.preterite,
    ...shuffle(data.filter((x) => x.id !== v.id).map((x) => x.preterite)).slice(
      0,
      3,
    ),
  ]);
  choices.innerHTML = opts.map((x) => `<button>${esc(x)}</button>`).join("");
  score.textContent = `Poäng: ${state.score}`;
  choices.querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        if (state.locked) return;
        state.locked = true;
        const ok = b.textContent === v.preterite;
        if (ok) {
          state.score++;
          b.classList.add("correct");
        } else {
          b.classList.add("wrong");
          choices.querySelectorAll("button").forEach((x) => {
            if (x.textContent === v.preterite) x.classList.add("correct");
          });
        }
        score.textContent = `Poäng: ${state.score}`;
        setTimeout(() => {
          state.index++;
          question();
        }, 850);
      }),
  );
}
document.querySelector("#startQuiz").onclick = () => {
  state.quiz = shuffle(data).slice(0, 10);
  state.index = 0;
  state.score = 0;
  document.querySelector("#startQuiz").textContent = "Starta om";
  question();
};
render();
