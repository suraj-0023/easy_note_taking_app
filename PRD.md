# Product Requirements Document — Nexora

**Version**: 1.0  
**Date**: April 26, 2026  
**Author**: Suraj Kunuku  

---

## 1. Product Overview

Nexora is a browser-based vocabulary learning and note-taking app that combines flashcards, AI-powered word acquisition, and personal knowledge management into a single gamified experience. Users build decks of vocabulary, notes, and flashcards — organized around books, subjects, or topics they are actively studying.

The app works entirely in the browser (no install required), syncs across devices via Firebase, and requires no API keys from the user.

---

## 2. Problem Statement

Learners who read frequently encounter unfamiliar words but have no frictionless way to capture, define, and retain them. Existing tools (Anki, Quizlet) require manual data entry. Dictionary apps provide definitions but no retention mechanism. Nexora bridges this gap by combining:

- One-tap or image-scan word capture
- Automatic definition, IPA, and usage enrichment
- Flashcard and quiz-based retention practice
- Personal notes and custom flashcards in the same workspace

---

## 3. Target Users

| Persona | Description |
|---|---|
| **Active Reader** | Reads books regularly (fiction, non-fiction, academic); wants to capture and learn words encountered while reading |
| **Student** | Studying for exams or language learning; wants to organize subject-specific vocabulary and notes |
| **Self-learner** | Building vocabulary intentionally; motivated by streaks, progress, and gamification |

**Primary platform**: Desktop browser (GitHub Pages). Mobile support is on the roadmap.

---

## 4. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Reduce word capture friction | Time from seeing a word → saved to Nexora < 30 seconds |
| Drive retention | Average quiz accuracy improves ≥ 15% after 5 sessions per word |
| Increase daily engagement | Users return on 3+ days per week (streak system) |
| Zero-friction onboarding | New user completes first word add within 2 minutes of landing |

---

## 5. Core Features

### 5.1 Decks
- Users create named Decks (e.g. "Atomic Habits", "Class 10 Biology")
- All content (vocab, notes, flashcards) belongs to a Deck
- Sidebar lists all Decks; clicking filters the main library view
- Guest users see 4 pre-seeded example Decks on first visit

### 5.2 Vocabulary Capture
- **Text input**: Type a word → click Vocab → definition fetched automatically from Free Dictionary API
- **Image scan**: Upload a photo of a book page → AI (Gemini 2.0 Flash Vision) extracts underlined words + suggests advanced vocabulary → user reviews each word before accepting
- **AI Preview**: Before any word is saved, user sees the definition and can Accept, Edit, or Discard
- Words are enriched via a 4-tier waterfall:
  1. Free Dictionary API (no key required)
  2. Wordnik (optional user key)
  3. Gemini 2.0 Flash gap-fill via Cloudflare Worker proxy
  4. Web Speech API audio fallback

### 5.3 Notes
- Rich text notes attached to a Deck
- Displayed in the library grid alongside vocab and flashcards
- Color-coded left border indicating content type

### 5.4 Custom Flashcards
- User-defined front/back cards attached to a Deck
- Practiced in the Flashcards mode alongside vocabulary cards

### 5.5 Practice Modes

#### Flashcards
- 3 modes: Word → Definition, Definition → Word, Usage → Word
- Self-rated: "Got It" / "Need Practice"
- Includes both vocabulary and custom flashcard types
- Per-word performance tracked and shown as accuracy badge on library cards

#### Vocabulary Quiz
- 3 difficulty tiers: Easy / Medium / Hard
- Multiple-choice format with 3 AI-generated distractors per question
- Distractor generation powered by Gemini 2.0 Flash (via Cloudflare Worker)
- Intelligent distractor selection avoids trivially wrong answers

#### Stats
- Per-word accuracy breakdown across quiz and flashcard modes
- Visual accuracy indicators on all library cards (color-coded score ring)

### 5.6 AI Features (powered by Gemini 2.0 Flash)
All AI calls are proxied through a Cloudflare Worker — the API key is never exposed to the browser.

| Feature | Trigger |
|---|---|
| Word enrichment (IPA, definition, usage) | Automatic when Free Dict / Wordnik miss a field |
| Image word extraction | User uploads a book page photo |
| Quiz distractor generation | Automatic per quiz question |

### 5.7 Authentication & Sync
- Sign in via Google or Email (Firebase Auth)
- All data synced to Firestore (one merged document per user)
- localStorage used as primary store — app works offline
- Guest mode available without sign-in; data cleared on sign-out

### 5.8 Onboarding
- **Profile Setup**: 2-step flow (name + learning goal → daily target / age / city)
- **Welcome Tour**: 4-slide modal introducing Decks, Flashcards, Quiz, and Notes with animated illustrations
- **First Word Ceremony**: Overlay with typewriter animation and Day 1 streak badge on first word save
- **Contextual Hints**: Non-blocking tooltips on first use of key features; auto-dismiss after 6s
- **Help Panel**: Sidebar panel with Getting Started guide, feature accordion, keyboard shortcuts, and Replay Tour

---

## 6. User Flows

### Flow 1 — Add a Word from Text
1. User selects a Deck from the sidebar
2. Types a word in the Add Section textarea
3. Selects the **Vocab** type pill
4. Clicks **Generate →**
5. AI Preview card appears with definition, IPA, usage
6. User clicks **Accept** → word saved to library and Firestore

### Flow 2 — Add Words from an Image
1. User clicks the **[+]** attach button → uploads a book page photo
2. Selects **Vocab** type pill → clicks **Generate →**
3. Word review modal opens with two groups: Underlined Words / AI-Suggested Hard Words
4. User toggles each word chip to accept or reject
5. Clicks **Add Selected Words** → accepted words run through the enrichment waterfall → saved

### Flow 3 — Practice with Quiz
1. User clicks **Vocab** in the sidebar Practice section
2. Selects **Quiz** from the landing screen
3. Chooses difficulty tier (Easy / Medium / Hard)
4. Answers multiple-choice questions; AI generates distractors per question
5. Score and per-word accuracy updated after each answer

### Flow 4 — Review with Flashcards
1. User clicks **Flashcards** in the sidebar Practice section
2. Selects one or more Decks
3. Chooses a mode (Word→Def, Def→Word, Usage→Word)
4. Flips cards and self-rates each as Got It or Need Practice
5. Session ends; performance stats updated

---

## 7. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| **No install** | Runs entirely in the browser; hosted on GitHub Pages |
| **Offline support** | localStorage as primary store; Firestore sync when online |
| **API key security** | No API keys exposed in client-side code; Gemini key stored in Cloudflare Worker secret |
| **Performance** | First meaningful paint < 2s on a standard connection |
| **No build step** | Single HTML file; no framework, no bundler |
| **Cross-browser** | Chrome, Safari, Firefox (latest 2 versions) |

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — single file (`app.html`, ~5800 lines) |
| Auth | Firebase Auth (Google + Email) |
| Database | Firestore (cloud sync) + localStorage (offline primary) |
| AI | Google Gemini 2.0 Flash Vision via Cloudflare Worker proxy |
| Dictionary | Free Dictionary API (primary), Wordnik (secondary) |
| Audio | Web Speech API (fallback TTS) |
| Hosting | GitHub Pages (`suraj-0023.github.io/Flashcards_app`) |
| Design | Material Design 3 — warm palette, pill buttons, 14–18px radius cards |
| Font | Plus Jakarta Sans |

---

## 9. Design System

| Token | Value |
|---|---|
| Background (main) | `#FFF7ED` warm cream |
| Background (sidebar) | White → `#F0FDF4` green-tinted gradient |
| Primary / Mastered | `#10B981` emerald |
| Learning | `#F59E0B` amber |
| New / Unseen | `#EF4444` red |
| Border radius (cards) | 14px |
| Border radius (modals) | 18px |
| Button style | Pill-shaped, drop-shadow, emerald primary |

---

## 10. Roadmap

### Near-term (next 4 weeks)
- [ ] **Mobile / PWA** — Responsive layout, service worker, iOS/Android home screen install
- [ ] **Quiz Card Type** — `nexora_quiz_cards` data model; create and display quiz cards in the library
- [ ] **Spaced Repetition** — SM-2 scheduling algorithm for flashcard and vocab review sessions

### Mid-term (1–3 months)
- [ ] **AI Notes & Flashcard Generation** — Paste text or upload a document → AI auto-generates notes and flashcards
- [ ] **Custom Domain & Branding** — Dedicated domain, favicon, meta tags for sharing
- [ ] **Advanced Stats** — Learning curves, time-to-mastery estimates, weekly reports

### Long-term (3–6 months)
- [ ] **Social Features** — Deck sharing, collaborative decks, leaderboards
- [ ] **Native Mobile Apps** — iOS and Android via React Native or Capacitor
- [ ] **Import / Export** — CSV, Anki `.apkg`, PDF export of notes

---

## 11. Out of Scope (v1)

- Real-time collaboration / multiplayer
- Audio recording / speaking practice
- Teacher / classroom management tools
- Paid tiers or monetization
