# Upload Quizlet PDFs here

1. Export your Quizlet set as PDF (same format as AnnaRansheim sets).
2. Copy the `.pdf` file into this folder **or** into `Desktop/svenska/`.
3. From the repo root run:

```bash
npm run import:b2c1-pdfs
```

This will:

- Parse Swedish + English from each PDF
- Add or update a set in `lesson-data.js` (matched by Quizlet URL)
- Preserve existing Arabic where the same word already exists
- Regenerate `src/data/lesson-b2c1.js` for the live lesson page
- Archive processed PDFs to `import/b2c1-lesson/archive/`

The lesson stays **`noindex`** until you confirm licensing.

New words without Arabic will use English as fallback until translations are added manually in `lesson-data.js`.
