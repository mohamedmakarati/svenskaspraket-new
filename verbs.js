const response = await fetch('./verbs-data.json');
if (!response.ok) throw new Error('Kunde inte läsa verbdata.');
const data = await response.json();

const requestedLanguage = new URLSearchParams(location.search).get('lang');
const state = { language: requestedLanguage === 'ar' ? 'arabic' : 'english', group: 'all', query: '', quiz: [], quizIndex: 0, score: 0, locked: false };
const rows = document.querySelector('#verbRows');
const empty = document.querySelector('#empty');
const shownCount = document.querySelector('#shownCount');
const heading = document.querySelector('#translationHeading');

function normalized(value) { return value.toLocaleLowerCase('sv').normalize('NFD').replace(/\p{Diacritic}/gu, ''); }
function visibleVerbs() {
  const query = normalized(state.query);
  return data.verbs.filter(verb => {
    const groupMatches = state.group === 'all' || verb.group === state.group;
    const haystack = normalized(Object.values(verb).filter(Boolean).join(' '));
    return groupMatches && (!query || haystack.includes(query));
  });
}
function renderRows() {
  const verbs = visibleVerbs();
  shownCount.textContent = verbs.length;
  empty.hidden = verbs.length > 0;
  heading.textContent = state.language === 'english' ? 'English' : 'العربية';
  rows.innerHTML = verbs.map(verb => `<tr><td>${verb.id}</td><td><img class="verbImage" loading="lazy" src="${verb.image}" alt="Minnesbild för verbet ${verb.infinitive}" width="120" height="80"></td><td><span class="group">${verb.group}</span></td><td>${verb.imperative ?? '—'}</td><td class="infinitive">${verb.infinitive}</td><td>${verb.present}</td><td>${verb.preterite}</td><td>${verb.supine}</td><td class="${state.language === 'arabic' ? 'arabic' : ''}">${verb[state.language]}</td></tr>`).join('');
}
function renderAuxiliaries() {
  document.querySelector('#auxiliaryCards').innerHTML = data.auxiliaries.map(item => `<div class="auxCard"><strong>${item.swedish}</strong><div class="translation ${state.language === 'arabic' ? 'arabic' : ''}">${item[state.language]}</div></div>`).join('');
}
document.querySelector('#search').addEventListener('input', event => { state.query = event.target.value; renderRows(); });
document.querySelector('#group').addEventListener('change', event => { state.group = event.target.value; renderRows(); });
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
  state.language = button.dataset.language;
  document.querySelectorAll('[data-language]').forEach(item => item.classList.toggle('active', item === button));
  renderRows(); renderAuxiliaries();
}));
document.querySelectorAll('[data-language]').forEach(button => button.classList.toggle('active', button.dataset.language === state.language));

const prompt = document.querySelector('#quizPrompt');
const choices = document.querySelector('#quizChoices');
const score = document.querySelector('#quizScore');
function shuffle(items) { return [...items].sort(() => Math.random() - .5); }
function startQuiz() {
  state.quiz = shuffle(data.verbs).slice(0, 10); state.quizIndex = 0; state.score = 0; state.locked = false;
  document.querySelector('#startQuiz').textContent = 'Starta om'; renderQuestion();
}
function renderQuestion() {
  if (state.quizIndex >= state.quiz.length) {
    prompt.textContent = `Klart! Du fick ${state.score} av ${state.quiz.length} rätt.`; choices.innerHTML = ''; score.textContent = ''; return;
  }
  state.locked = false;
  const verb = state.quiz[state.quizIndex];
  prompt.textContent = `${state.quizIndex + 1}/10: Vad är preteritum av “${verb.infinitive}”?`;
  const alternatives = shuffle([verb.preterite, ...shuffle(data.verbs.filter(x => x.id !== verb.id).map(x => x.preterite)).slice(0, 2)]);
  choices.innerHTML = alternatives.map(value => `<button>${value}</button>`).join('');
  score.textContent = `Poäng: ${state.score}`;
  choices.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    if (state.locked) return; state.locked = true;
    const correct = button.textContent === verb.preterite;
    if (correct) { state.score += 1; button.classList.add('correct'); } else { button.classList.add('wrong'); choices.querySelectorAll('button').forEach(item => { if (item.textContent === verb.preterite) item.classList.add('correct'); }); }
    score.textContent = `Poäng: ${state.score}`;
    setTimeout(() => { state.quizIndex += 1; renderQuestion(); }, 850);
  }));
}
document.querySelector('#startQuiz').addEventListener('click', startQuiz);
renderRows(); renderAuxiliaries();
