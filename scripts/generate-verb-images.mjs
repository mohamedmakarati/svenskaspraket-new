import fs from "node:fs";
import path from "node:path";
const sets = [
  ["a1", "public/verbs-data.json"],
  ["a2", "public/verbs-a2-data.json"],
  ["b1b2", "public/verbs-b1b2-data.json"],
];
const symbols = [
  [
    /write|read|book|study|learn|describe|translate|word|tell|say|argue|discuss|explain|ask|answer|think|believe|understand|remember|forget|know|mean|suggest|decide|choose|opinion/i,
    "Aa",
  ],
  [
    /walk|go|run|travel|ride|drive|fly|sail|climb|move|come|return|leave|arrive|land|swim|dive|ski|skate|fall|stand|sit|lie down/i,
    "→",
  ],
  [/eat|drink|cook|boil|grill|taste|food|coffee|serve|table|bite|suck/i, "FO"],
  [
    /work|job|finance|pay|buy|sell|borrow|save|manage|organize|program|edit|copy|download|click/i,
    "JOB",
  ],
  [
    /love|like|meet|friend|invite|greet|date|marry|divorce|forgive|help|care|support|enjoy|smile|laugh/i,
    "♥",
  ],
  [/see|look|watch|show|shine|light|glitter|hide|find|discover/i, "SE"],
  [/hear|listen|sing|sound|shout|scream|whisper/i, "♪"],
  [
    /wash|clean|tidy|repair|renovate|paint|plant|rake|dry|cut|open|close|connect|attach/i,
    "BY",
  ],
  [
    /exercise|train|compete|win|lose|play|jump|throw|catch|hit|kick|strength/i,
    "SP",
  ],
  [/sleep|rest|relax|feel|hurt|ill|cough|die|live|breathe/i, "VI"],
  [/fire|burn|freeze|blow|rain|weather|sun|nature|grow/i, "NA"],
  [/give|take|receive|offer|bring|carry|hold|put|pull|push|break|build/i, "DO"],
];
const colors = [
  "#075db8",
  "#087a4b",
  "#8b4bb8",
  "#b85b07",
  "#0a7d88",
  "#b42318",
];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
const slug = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 42) || "verb";
for (const [level, file] of sets) {
  let raw = JSON.parse(fs.readFileSync(file, "utf8"));
  let verbs = raw.verbs ?? raw;
  const dir = `public/verb-images/${level}`;
  fs.mkdirSync(dir, { recursive: true });
  for (const verb of verbs) {
    const en = verb.english ?? verb.en ?? "";
    const ar = verb.arabic ?? verb.ar ?? "";
    const inf = verb.infinitive;
    const present = verb.present;
    const symbol = (symbols.find(([re]) => re.test(en)) ?? [null, "SV"])[1];
    const color = colors[(verb.id - 1) % colors.length];
    const name = `${String(verb.id).padStart(3, "0")}-${slug(inf)}.svg`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320" role="img" aria-labelledby="t d"><title id="t">Minnesbild för ${esc(inf)}</title><desc id="d">${esc(inf)}, ${esc(present)}, ${esc(en)}</desc><rect width="480" height="320" rx="32" fill="#f8fafc"/><circle cx="390" cy="70" r="92" fill="${color}" opacity=".12"/><rect x="24" y="24" width="432" height="272" rx="24" fill="#fff" stroke="${color}" stroke-width="4"/><circle cx="240" cy="90" r="48" fill="${color}"/><text x="240" y="108" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="800" fill="#fff">${symbol}</text><text x="240" y="174" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#10233e">${esc(inf)}</text><text x="240" y="211" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="${color}">${esc(present)}</text><text x="240" y="250" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#65758a">${esc(en).slice(0, 38)}</text><text x="240" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#10233e" direction="rtl">${esc(ar).slice(0, 38)}</text></svg>`;
    fs.writeFileSync(path.join(dir, name), svg);
    verb.image = `./verb-images/${level}/${name}`;
  }
  fs.writeFileSync(file, JSON.stringify(raw, null, 2));
  console.log(level, verbs.length);
}
