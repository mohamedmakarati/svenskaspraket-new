let words=[];let order=[];let current=0;let question=null;const supportLanguage=new URLSearchParams(location.search).get('lang')==='ar'?'ar':'en';
const $=s=>document.querySelector(s);const pick=a=>a[Math.floor(Math.random()*a.length)];
async function init(){words=await fetch('/quizlet-vocabulary.json').then(r=>r.json());order=words.map((_,i)=>i);$('#total').textContent=words.length;showCard();newQuestion();renderList(words)}
function showCard(){const w=words[order[current]];$('#position').textContent=`${current+1} / ${words.length}`;$('#cardSv').textContent=w.sv;$('#cardEn').textContent=w.en;$('#cardAr').textContent=w.ar;$('#flashcard').classList.remove('flipped')}
$('#flashcard').onclick=()=>$('#flashcard').classList.toggle('flipped');
$('#next').onclick=()=>{current=(current+1)%words.length;showCard()};$('#previous').onclick=()=>{current=(current-1+words.length)%words.length;showCard()};
$('#shuffle').onclick=()=>{order.sort(()=>Math.random()-.5);current=0;showCard()};
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.panel').forEach(x=>x.classList.add('hidden'));$(`#${b.dataset.mode}Panel`).classList.remove('hidden')});
function newQuestion(){question=pick(words);$('#quizWord').textContent=question.sv;$('#feedback').textContent='';const choices=[question,...words.filter(x=>x.id!==question.id).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);$('#answers').innerHTML='';choices.forEach(w=>{const b=document.createElement('button');b.textContent=w[supportLanguage];if(supportLanguage==='ar')b.dir='rtl';b.onclick=()=>{document.querySelectorAll('#answers button').forEach(x=>x.disabled=true);b.classList.add(w.id===question.id?'correct':'wrong');$('#feedback').textContent=w.id===question.id?`Rätt! ${question.ar}`:`Inte rätt. Svaret är: ${question.en} · ${question.ar}`};$('#answers').append(b)})}
$('#newQuestion').onclick=newQuestion;
function renderList(list){$('#resultCount').textContent=`${list.length} ord`;$('#wordRows').innerHTML=list.map(w=>`<tr><td>${w.id}</td><td><b>${escapeHtml(w.sv)}</b></td><td>${escapeHtml(w.en)}</td><td>${escapeHtml(w.ar)}</td></tr>`).join('')}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#search').oninput=e=>{const q=e.target.value.trim().toLowerCase();renderList(words.filter(w=>`${w.sv} ${w.en} ${w.ar}`.toLowerCase().includes(q)))};
init();
