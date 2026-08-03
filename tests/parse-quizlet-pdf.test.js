import { describe, it, expect } from 'vitest';
import { parseQuizletPdfText, splitSvEn } from '../scripts/parse-quizlet-pdf.mjs';

describe('parseQuizletPdfText', () => {
  it('splits Swedish and English from Quizlet lines', () => {
    expect(splitSvEn('betecknar stands for')).toEqual({ sv: 'betecknar', en: 'stands for' });
    expect(splitSvEn('avslöjar (ngt FÖR ngn) reveals')).toEqual({
      sv: 'avslöjar (ngt FÖR ngn)',
      en: 'reveals',
    });
  });

  it('parses title, URL and entries from sample export', () => {
    const sample = `Ord, ord, ord (Rivstart B2/C1_kapitel 1)
Study online at https://quizlet.com/_8n3678
1. betecknar stands for
2. formulerar expresses
28. oändlig infinite`;

    const parsed = parseQuizletPdfText(sample);
    expect(parsed.sourceUrl).toBe('https://quizlet.com/_8n3678');
    expect(parsed.entries).toHaveLength(3);
    expect(parsed.entries[0].sv).toBe('betecknar');
  });
});
