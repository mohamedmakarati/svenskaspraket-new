/** Parse Quizlet PDF export text into structured set data. */

function looksLikeEnglish(en) {
  if (/[åäöÅÄÖ]/.test(en)) return false;
  if (!/^[a-zA-Z(][a-zA-Z0-9\s,;:.\()*\-']*$/.test(en)) return false;
  for (const word of en.split(/\s+/)) {
    if (/\)/.test(word) && !/^\(.*\)$/.test(word)) return false;
  }
  return true;
}

export function splitSvEn(text) {
  const trimmed = text.trim();
  if (!trimmed) return { sv: '', en: '' };

  const parts = trimmed.split(/\s+/);
  let best = null;

  for (let i = 1; i < parts.length; i++) {
    const en = parts.slice(i).join(' ');
    const sv = parts.slice(0, i).join(' ');
    if (!looksLikeEnglish(en) || sv.length === 0) continue;
    if (!best || en.split(/\s+/).length >= best.en.split(/\s+/).length) {
      best = { sv, en };
    }
  }

  if (best) return best;
  return { sv: trimmed, en: '' };
}

export function parseQuizletPdfText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let title = '';
  let sourceUrl = '';
  const entries = [];

  for (const line of lines) {
    if (line.startsWith('Study online at ')) {
      sourceUrl = line.replace('Study online at ', '').trim();
      continue;
    }
    if (/^\d+\s*\/\s*\d+$/.test(line)) continue;
    if (line.startsWith('--')) continue;

    const entryMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (entryMatch) {
      const { sv, en } = splitSvEn(entryMatch[2]);
      entries.push({ n: Number(entryMatch[1]), sv, en });
      continue;
    }

    if (!title && !line.includes('quizlet.com') && entries.length === 0 && !/^\d+\./.test(line)) {
      title = line;
    }
  }

  return { title, sourceUrl, entries };
}

export function slugifySetId(title, sourceUrl) {
  const known = {
    'https://quizlet.com/_8nlhmv': 'chapter1',
    'https://quizlet.com/_8n36aw': 'verbs1to3',
    'https://quizlet.com/_8n3678': 'ordOrdOrd',
    'https://quizlet.com/_8mq3xa': 'prisetPaVatten',
  };
  if (known[sourceUrl]) return known[sourceUrl];

  const fromUrl = sourceUrl.match(/quizlet\.com\/(_\w+)/);
  if (fromUrl) return `quizlet${fromUrl[1].replace(/^_/, '')}`;

  return (title || 'set')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24) || 'set';
}
