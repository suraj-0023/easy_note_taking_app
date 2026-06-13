# Vocabulary Flashcard Project

## Overview

A personal vocabulary learning system built to store, study, and track progress on new English words. The project consists of a word directory (JSON) and an interactive flashcard web app (HTML).

---

## Project Files

| File | Purpose |
|---|---|
| `vocabulary.json` | Master word directory — the single source of truth |
| `vocab_claude.html` | Standalone app — works directly in Claude or any browser, no setup needed |
| `app.html` | Fetch-based app — loads from `vocabulary.json`, Firebase Auth + Firestore cloud sync |

---

## How It Works

### Current Setup (Claude)
- Words are embedded directly inside `vocab_claude.html`
- Every time a new word is added, both the JSON and the HTML are updated
- Download and open `vocab_claude.html` in any browser — it just works

### Future Setup (VS Code / Local Server)cture the 
- `app.html` fetches word data from `vocabulary.json` at runtime using `fetch()`
- Both files must be in the same folder
- Open with VS Code Live Server extension
- To add new words: only update `vocabulary.json` — the app updates automatically on refresh

### Scaling Up (Future)
When ready to build a proper app:
- Replace the JSON file with a real database (Firebase, Supabase, etc.)
- Add a backend (Node.js / Python) to manage word entries via API
- Deploy on a web host for access from any device

---

## Word Directory Structure

Each word in `vocabulary.json` follows this schema:

```json
{
  "id": "w001",
  "word": "example",
  "type": ["noun", "verb"],
  "definition": "A thing characteristic of its kind or illustrating a general rule.",
  "usage": [
    "This is an example sentence.",
    "She set a good example for others."
  ],
  "opposites": ["exception", "anomaly"],
  "tenses": {
    "present": "example / examples",
    "pastSimple": "exampled",
    "pastParticiple": "exampled",
    "presentParticiple": "exampling"
  },
  "related": ["exemplary (adjective)", "exemplify (verb)"],
  "note": "Optional note about the word.",
  "addedOn": "2026-03-14"
}
```

---

## App Features

### Dictionary Tab
- Grid view of all words with a short definition preview
- Color-coded accuracy badge per word (based on quiz/flashcard history)
- Click any word to open a full detail modal with definition, usage examples, opposites, tenses, and related words

### Flashcards Tab
- Flip cards with 3 study modes:
  - **Word → Meaning** — see the word, recall the definition
  - **Meaning → Word** — see the definition, recall the word
  - **Usage → Word** — see a sentence, recall the word used
- Self-rate each card: ✓ Got It / ✗ Need Practice
- Progress bar and score tracker per session

### Quiz Tab
- Multiple choice questions (4 options)
- Question types rotate randomly: definition-based, sentence-based, meaning-based
- Correct answer revealed with feedback after each question
- Session score shown at the end

### Stats Tab
- Overall accuracy percentage across all sessions
- Total correct answers and total words
- Per-word progress bars sorted from weakest to strongest
- Helps identify which words need the most practice

---

## Word List (18 words)

| # | Word | Type |
|---|---|---|
| 1 | burglary | noun |
| 2 | multitude | noun |
| 3 | braids | noun, verb |
| 4 | indignantly | adverb |
| 5 | insanity | noun |
| 6 | throbbed | verb |
| 7 | eerie | adjective |
| 8 | peered | verb |
| 9 | canopied | adjective, verb |
| 10 | commode | noun |
| 11 | philosophical | adjective |
| 12 | swung | verb |
| 13 | reverberate | verb |
| 14 | conceal | verb |
| 15 | curler cap | noun |
| 16 | audacity | noun |
| 17 | benediction | noun |
| 18 | pragmatic | adjective |

---

## Adding New Words

### Via Claude (current workflow)
1. Share the word — by typing or uploading a photo with underlined words
2. Claude looks up the full entry (definition, type, usage, opposites, tenses, related words)
3. Claude updates `vocabulary.json` and rebuilds `vocab_claude.html`
4. Download and use the updated files

### Via VS Code (future workflow)
1. Share the word with Claude
2. Claude updates only `vocabulary.json`
3. Replace the old JSON in your folder
4. Refresh the app — new word appears automatically

---

## Performance Tracking

- Each word tracks correct and wrong answers independently across all modes (flashcards, quiz)
- Performance is saved in the browser's `localStorage` so it persists across sessions
- Stats tab shows cumulative accuracy per word

---

## Notes

- `unsanity` (original input) is not a standard English word — saved as **insanity** with a note in the dictionary entry
- The app name **Nexora** is the current branding
- Performance data resets if browser storage is cleared

---

*Project started: March 2026*
*Last updated: March 16, 2026*
*Total words: 18*
