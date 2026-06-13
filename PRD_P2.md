# Nexora — PRD Analysis & Review

**Version:** 2.0  
**Date:** April 27, 2026  
**Author:** Suraj Kunuku  
**Status:** Draft

---

## 1. Executive Summary

Nexora has strong bones: frictionless word capture, AI enrichment, a clean design system, and a meaningful insight that "read → capture → retain" is broken in existing tools. The core loop is defensible.

But the product is shipping a learning app without its most important ingredient: spaced repetition. Without it, the retention promise is unsubstantiated. Additionally, the technical architecture (5800-line single HTML file) is approaching a wall, and the retention mechanics (streaks, daily review queue, progress visibility) are thin for a habit-forming product.

The single biggest risk: users add words, feel good, come back two days later with nothing pulling them, and churn.

---

## 2. Current Product Analysis

### Vision

One frictionless tool to capture vocabulary while reading → auto-enrich it → retain it through spaced practice.

### Target Users

- Active readers
- Students
- Self-learners

### Core Value Proposition

Zero-friction word capture from text or images → automatic definition/IPA/usage → gamified retention.

### What's Working

- The 4-tier enrichment waterfall (Free Dict → Wordnik → Gemini gap-fill → TTS) is genuinely clever and differentiated
- AI-powered image scan with per-word review is a strong, unique feature
- M3 warm design is cohesive and premium-feeling
- Cloudflare Worker proxy for API key security is production-grade thinking
- Firebase + localStorage offline-first architecture is solid
- Onboarding ceremony (first word, streak badge) creates a positive first moment

### What's Missing

- No scheduling algorithm — the most important piece of a retention tool
- No daily review queue — no reason to return
- No search
- Mobile is an afterthought for a reading-context app
- One 5800-line file with no tests

---

## 3. Key Issues & Gaps

### Critical (Breaks the Core Promise)

#### 1. No Spaced Repetition Algorithm

The PRD says "SM-2 scheduling" is a near-term roadmap item, but this should have been Day 1. "Got It / Need Practice" ratings exist — SM-2 can plug in directly. Without it, the flashcard mode is a flat random shuffle, which research consistently shows is 40–60% less effective than spaced review. Duolingo, Anki, and Readwise all lead with this.

#### 2. No Daily Review Queue / Pull Mechanism

There's no concept of "cards due today." Users have no reason to return unless they self-motivate. The streak tracks days active but doesn't tell the user what to do today. This is the difference between a tool and a habit.

#### 3. Binary Word States Are Insufficient

The current model: New (red) / Learning (amber) / Mastered (green) based on accuracy %. This is a UI affordance, not a learning state machine. There's no concept of "due for review," "young card," "lapsed card," or "mature card." Anki's 4-state model (New → Learning → Review → Relearning) is the gold standard for a reason.

### High (Significant Friction or Churn Risk)

#### 4. No Search or Filter Within the Library

A user with 200 words across 8 decks has no way to find a specific word. This becomes painful fast and signals to users that the tool doesn't scale with them.

#### 5. Guest Mode Data Loss

Users who explore as a guest and add content lose everything on sign-out. This is a significant conversion risk. Best practice: warn before data loss, offer a "save your data" prompt, and persist a temporary session token.

#### 6. Two Separate Image-Scan Flows

The Scan Page Modal and the Generate → Image flow both extract words from images but have different UIs. This creates confusion: "which one do I use?" Consolidate to one flow.

#### 7. No Context Capture

When a user adds a word from a book, there's nowhere to store the sentence it appeared in. Context is the most powerful memory hook. Anki users do this manually; Nexora could make it automatic via the image scan.

#### 8. Quiz Covers Vocabulary Only

Custom flashcards and notes don't participate in the quiz. The learning system is fragmented by content type.

#### 9. Missing Export/Backup

No CSV or JSON export. For a tool that stores personal knowledge, this is a trust gap. Users are nervous about lock-in.

### Medium (Polish/Growth Blockers)

#### 10. Distractor Generation Is Uncached

Every quiz question hits Gemini for 3 distractors. This is slow (~1–2s per question) and expensive. Distractors should be generated once and cached per word in Firestore.

#### 11. No Keyboard Shortcuts in the Core Flow

The help panel mentions shortcuts, but there's no keyboard navigation for the Add flow, flashcard flip, or quiz answer selection. Power users (students, researchers) rely on these.

#### 12. Onboarding Length vs. Activation Metric

The PRD states "first word added within 2 minutes." The onboarding currently has: login screen → 2-step profile setup → 4-slide welcome tour → first-word ceremony. That's potentially 3–4 minutes before a user has done the core action. Cut the tour to 2 slides max, or show it after the first word.

#### 13. No Pronunciation in Cards

IPA is shown in the word modal, but not on library cards. Users need to hear/see pronunciation during review, not just when they open the detail modal.

#### 14. Stats Are Per-Word, Not Systemic

There's no deck-level mastery %, no "words learned this week" trend, no "you're on track for your daily goal" signal. Users can't see if they're making progress toward anything.

---

## 4. Recommendations & Improvements

### R1 — Ship SM-2 Before Anything Else

Implement the SM-2 algorithm with the existing "Got It / Need Practice" binary mapped to ease factor (2.5 for correct, penalty for incorrect). Add card states: New / Learning / Review / Lapsed. Surface a "Due Today" count on the sidebar. This single change transforms Nexora from a tool to a system.

**Implementation:** Each vocab/flashcard entry gains: interval, ease, dueDate, repetitions, state. The daily review queue is just `allCards.filter(c => c.dueDate <= today)`.

### R2 — Build a Daily Review Habit Loop

Home screen default view should be Today's Queue: "You have 8 cards due today. 3 new, 5 review." One tap starts a session. Session ends with a summary and streak update. Email/web push notification: "Your 9am review is ready." This is the core engagement loop.

### R3 — Unified Image-to-Word Flow

Remove the dual flows. The Add Section image attach → Generate → is the canonical path. The dedicated "Scan Page" modal can be an entry point that opens the same flow. Users shouldn't discover two ways to do the same thing.

### R4 — Add Context Sentence Capture

When adding a word (text or image), offer a "Context sentence" field that auto-fills from the image extract. Store this alongside the word. Show it during flashcard review. This is the most evidence-backed improvement for vocabulary retention.

### R5 — Onboarding: Value-First, Then Tour

Flip the order: Profile setup (name only, 30 seconds) → Library with pre-seeded deck highlighted → "Add your first word" inline prompt → first-word ceremony → optional tour offer. The tour is currently blocking the first value moment.

### R6 — Implement Search

Global search bar in the header: matches word names, definitions, note titles, and flashcard fronts. Keyboard shortcut: Cmd+K. Results grouped by content type and deck.

### R7 — Guest Mode: Graceful Save Prompt

Before clearing guest data, show a modal: "You've added 7 words. Sign in to save them." One-tap Google sign-in migrates data. The current flow silently loses user work.

### R8 — Cache Quiz Distractors

Generate distractors when a word is first quizzed, store in `nexora_vocab` as `distractors: [...]`. Regenerate only when the user manually requests it. Eliminates per-question latency.

### R9 — Deck-Level Progress Dashboard

Each deck shows: total cards, mastery % (mature cards / total), words added this week (sparkline), and next due date. Replaces the current flat stats view with something goal-oriented.

### R10 — Architecture: Extract to Modules

Not a user-facing change, but critical. At 5800 lines, a single bug can break everything and there's no way to test. Even without a build step, split into `app.html` (shell + init) + `<script src="vocab.js">` + `<script src="quiz.js">` etc. This is the minimum viable maintainability fix.

---

## 5. Feature Roadmap

### MVP (Must-Have, Ship Now)

| Feature | Why | Effort |
|---|---|---|
| SM-2 spaced repetition | Core promise of retention; data model already supports it | M |
| Daily review queue | The habit hook; drives return visits | S |
| Context sentence field | #1 vocabulary retention technique | S |
| Guest → Sign-in save prompt | Eliminate silent data loss, improve conversion | S |
| Cached quiz distractors | Fix UX lag, reduce AI costs | S |
| Search (Cmd+K) | Basic table stakes for any knowledge tool | M |

### V1 (Next 6 Weeks)

| Feature | Why | Effort |
|---|---|---|
| Deck-level progress dashboard | Users need to see momentum toward goals | M |
| Cloze deletion card type | Fill-in-the-blank is the most effective vocab test format | M |
| Context sentence in flashcard review | Show where the word came from during practice | S |
| Browser extension (Chrome) | Capture words from web reading without leaving the page | L |
| CSV import | Unlock teacher/student use case; remove lock-in fear | M |
| Unified image scan flow | Remove UX confusion between two flows | S |
| Mobile responsive layout | Vocabulary capture happens on phones during reading | L |

### Future Roadmap

| Feature | Why |
|---|---|
| PWA / native mobile app | Full offline, home screen, camera access for image scan |
| Public deck marketplace | Social proof, content flywheel, teacher use case |
| Collaborative decks | Classroom and study-group use case |
| AI-generated notes from pasted text | Notion AI competitor, retention-first |
| Reading mode integration | Import Kindle highlights, PDF highlights |
| Advanced analytics | Forgetting curve visualization, learning velocity, time-to-mastery |
| Wordnik key auto-provisioning | Remove the friction of optional API keys |
| Streak recovery / grace day | Duolingo's most effective retention mechanic |

---

## 6. PRD Version 2

### Product Requirements Document — Nexora

**Version:** 2.0  
**Date:** April 26, 2026  
**Author:** Suraj Kunuku  
**Status:** Draft

---

### 6.1 Product Vision

Nexora turns the words you encounter while reading into knowledge you actually keep. It combines zero-friction word capture, AI-powered enrichment, and science-backed spaced repetition into a single, beautiful tool — so every word you encounter becomes a word you own.

**North Star:** A user who adds a word on Monday should be tested on it at exactly the right moment on Wednesday, Saturday, and two weeks later — without thinking about it.

### 6.2 Problem Statement

Readers encounter 10–20 unfamiliar words per hour. Existing tools force a choice:

- **Dictionary apps** (Merriam-Webster, Google): define words but provide no retention mechanism.
- **Anki:** powerful spaced repetition but requires manual data entry and offers no AI enrichment or image capture.
- **Quizlet:** easy to use but no intelligent scheduling and no word capture from reading.
- **Kindle Vocabulary Builder:** captures words but is locked to Kindle and has no active recall.

No single tool connects the moment of encounter to long-term retention with zero friction. Nexora fills this gap.

### 6.3 Target Users

| Persona | Description | Primary Need |
|---|---|---|
| The Active Reader | Reads 2–5 books/month; highlights unfamiliar words; wants to build vocabulary from what they read | Capture while reading, retain without effort |
| The Student | Studying for exams (SAT, GRE, IELTS) or learning a language; needs organized, deck-based study | Structured practice, measurable progress, daily goals |
| The Self-Learner | Building vocabulary intentionally; motivated by streaks, stats, mastery | Gamification, progress visibility, habit formation |

**Primary platform:** Desktop browser (GitHub Pages). Mobile is V1 priority.

### 6.4 Goals & Success Metrics

| Goal | KPI | Target |
|---|---|---|
| Retention via spaced repetition | % of cards in "Review" or "Mature" state after 14 days | ≥ 60% |
| Daily habit formation | % of users active 3+ days/week after week 2 | ≥ 35% |
| Frictionless capture | Time from seeing word → saved to Nexora | < 30 seconds |
| Quiz accuracy improvement | Quiz accuracy after 5 sessions per word vs. baseline | ≥ 20% improvement |
| Onboarding activation | % of new users adding first word within 2 minutes | ≥ 70% |
| Retention (D7) | % of users returning on Day 7 | ≥ 25% |
| Retention (D30) | % of users returning on Day 30 | ≥ 15% |

---

## 7. Core Features

### 7.1 Decks

- Users create named Decks (e.g., "Atomic Habits," "GRE Prep")
- All content (vocab, notes, custom flashcards) belongs to a Deck
- Deck header shows: name, item count, mastery %, next review due
- Sidebar lists all Decks; clicking filters the library
- Guest users see 4 pre-seeded example Decks on first visit

### 7.2 Vocabulary Capture

**Text input:** Type a word → select Vocab type → click Generate → definition fetched from enrichment waterfall → AI Preview with definition, IPA, usage, and context sentence field → Accept / Edit / Discard.

**Image scan:** Upload a book page photo → Gemini 2.0 Flash Vision extracts underlined words + suggests advanced vocabulary → user reviews each word in a chip-based modal (accept/reject per word) → accepted words run through the enrichment waterfall → saved with auto-extracted context sentence where available.

**Context capture:** Every word entry has an optional "context sentence" field showing where the word appeared. Auto-populated from image scan; manually entered for text input. Displayed on flashcards during review.

**Enrichment waterfall (4-tier):**

1. Free Dictionary API (no key required)
2. Wordnik (optional free key)
3. Gemini 2.0 Flash gap-fill via Cloudflare Worker proxy (auto-fires when fields are missing)
4. Web Speech API audio fallback at playback time

### 7.3 Spaced Repetition (SM-2)

Every vocabulary and custom flashcard entry has a learning state:

| State | Description |
|---|---|
| New | Not yet reviewed |
| Learning | Recently introduced; short intervals (1 day, 3 days) |
| Review | Established; SM-2 interval scheduling (days to weeks) |
| Lapsed | Answered incorrectly during Review; resets to short interval |

**Rating mapping:** "Got It" → correct (ease factor preserved/improved). "Need Practice" → incorrect (ease factor penalized, interval resets).

**Due Date Queue:** Each session starts from a "Due Today" list, not a random shuffle. The sidebar shows the count of cards due today.

### 7.4 Daily Review Queue

The home screen for returning users shows:

- "X cards due today" with a breakdown (new / review / lapsed)
- One-tap "Start Review" launches a focused session
- Session ends with: cards reviewed count, accuracy %, streak update, XP earned

### 7.5 Notes

- Rich text notes attached to a Deck
- Displayed in library grid alongside vocab and flashcards
- Color-coded left border
- Notes do not participate in the spaced repetition queue (V1 consideration)

### 7.6 Custom Flashcards

- User-defined front/back cards attached to a Deck
- Participate in SM-2 queue alongside vocabulary cards
- Practiced in Flashcards mode

### 7.7 Practice Modes

#### Flashcards (SM-2 Review)

- Session draws from Due Today queue by default; users can override to practice any deck
- 3 modes: Word→Definition, Definition→Word, Usage→Word
- Context sentence shown on card back
- Self-rated: "Got It" / "Need Practice"
- SM-2 interval and state updated after each rating

#### Vocabulary Quiz

- 3 difficulty tiers: Easy / Medium / Hard
- Multiple-choice with 3 AI-generated distractors (cached per word, generated once on first quiz)
- New card type: Cloze deletion — usage sentence with the target word blanked out
- Intelligent distractor selection avoids trivially wrong answers
- Per-word and per-deck accuracy tracked

#### Progress Dashboard

- Per-deck: mastery % (mature/total), new words added (7-day sparkline), next due date
- Global: streak, total words learned, XP, daily goal progress ring

### 7.8 Search

**Global search (Cmd+K / Ctrl+K):**

- Searches word names, definitions, note titles, flashcard fronts
- Results grouped by content type and deck
- Instant fuzzy match, keyboard navigable

### 7.9 AI Features (Powered by Gemini 2.0 Flash via Cloudflare Worker)

| Feature | Trigger | Caching |
|---|---|---|
| Word enrichment (IPA, definition, usage) | Auto when Free Dict / Wordnik miss fields | Stored with word record |
| Image word extraction | User uploads photo | N/A |
| Quiz distractor generation | First time word is quizzed | Cached in word record; regenerated on demand |
| Context sentence extraction | Auto from image scan | Stored with word record |

**API key security:** API key never exposed to browser — stored in Cloudflare Worker secret.

### 7.10 Authentication & Sync

- Sign in via Google or Email (Firebase Auth)
- All data synced to Firestore (single merged document per user)
- localStorage as primary store — app works offline
- Guest mode: 4 pre-seeded decks; data migration prompt shown before sign-out if user has added content ("Sign in to save your 7 words")

### 7.11 Onboarding (Value-First Flow)

1. Sign-in / Guest — one-tap Google or "Explore as Guest"
2. Name only — 10-second profile step; goal and details collected progressively in-app
3. Library with highlighted prompt — "Add your first word to get started" overlaid on pre-seeded deck
4. First word ceremony — typewriter animation, Day 1 streak badge, XP earned
5. Optional tour offer — "Want a quick overview?" (2-slide max: Decks, Practice)
6. Contextual hints — surface inline when user reaches each feature for the first time

---

## 8. User Flows

### Flow 1 — Add a Word from Text

1. User types a word in the Add Section textarea
2. Selects Vocab type pill
3. Clicks Generate →
4. AI Preview shows: word, IPA, definition, usage example, context sentence field
5. User optionally fills context sentence ("from Chapter 4 of Atomic Habits")
6. Clicks Accept → word saved, SM-2 state set to New, added to Due Today queue

### Flow 2 — Daily Review Session

1. User opens app; sidebar shows "12 cards due today"
2. Clicks Start Review
3. Cards drawn from SM-2 queue (lapsed first, then review, then new)
4. Each card: word shown → user thinks → flips → rates Got It or Need Practice
5. SM-2 intervals updated after each rating
6. Session complete: summary screen with accuracy, streak update, XP earned

### Flow 3 — Add Words from Image

1. User clicks [+] attach → uploads book page photo
2. Selects Vocab pill → clicks Generate →
3. Word review modal: two chip groups (Underlined Words / AI-Suggested)
4. Context sentences auto-extracted per word
5. User toggles chips to accept/reject → clicks Add Selected
6. Accepted words: enrichment waterfall → SM-2 New state → library

### Flow 4 — Vocabulary Quiz

1. User clicks Vocab → Quiz in sidebar
2. Selects deck(s) and difficulty
3. Quiz draws from library (not SM-2 queue; separate mode)
4. Question types: multiple-choice, cloze deletion
5. Score and per-word accuracy updated; distractors cached after first generation

### Flow 5 — Search

1. User presses Cmd+K anywhere in app
2. Types word, phrase, or note title
3. Results appear instantly, grouped by type
4. Clicking a result opens that card/note in context

---

## 9. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| No install | Hosted on GitHub Pages; runs in browser |
| Offline support | localStorage primary; Firestore sync when online; conflict resolution: last-write-wins with timestamp |
| API key security | No keys in client code; Gemini via Cloudflare Worker; Wordnik key optional in localStorage |
| Performance | First meaningful paint < 2s; SM-2 queue calculation < 50ms |
| Architecture | Migrate from single-file to modular scripts before V1 (maintainability prerequisite) |
| Cross-browser | Chrome, Safari, Firefox (latest 2 versions) |
| Accessibility | WCAG 2.1 AA: keyboard navigation for all core flows, ARIA labels on interactive elements |
| Data portability | JSON and CSV export of all user data |

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — modular scripts (no bundler required) |
| Auth | Firebase Auth (Google + Email) |
| Database | Firestore (cloud sync) + localStorage (offline primary) |
| AI | Google Gemini 2.0 Flash Vision via Cloudflare Worker proxy |
| Dictionary | Free Dictionary API (primary), Wordnik (secondary) |
| Audio | Web Speech API (TTS fallback) |
| Hosting | GitHub Pages |
| Design | Material Design 3 — warm palette, pill buttons, 14–18px radius cards |
| Font | Plus Jakarta Sans |

---

## 11. Design System

*(Unchanged from v1 — the M3 warm palette is well-executed)*

| Token | Value |
|---|---|
| Background (main) | #FFF7ED warm cream |
| Background (sidebar) | White → #F0FDF4 green-tinted gradient |
| Primary / Mastered | #10B981 emerald |
| Learning | #F59E0B amber |
| New / Unseen | #EF4444 red |
| Lapsed | #8B5CF6 purple (new — distinct from "new") |
| Border radius (cards) | 14px |
| Border radius (modals) | 18px |

---

## 12. Roadmap

### MVP (Ship Within 2 Weeks — These Unlock the Core Value Promise)

- SM-2 spaced repetition with card states (New / Learning / Review / Lapsed)
- Daily review queue with due-count in sidebar
- Context sentence field on vocab entries
- Guest → sign-in data save prompt
- Quiz distractor caching (generate once, store in Firestore)
- Global search (Cmd+K)
- add feature to create a note or a flash card. 
- bug -- when scrolled in side a deck after entring vocab or notes the screen goes to top , so we should retain the scroll position. and also provide a option to add the a new entry for that section. 

### V1 (4–8 Weeks)

- Deck-level progress dashboard (mastery %, sparkline, XP)
- Cloze deletion card type
- CSV / JSON export
- Mobile responsive layout (PWA groundwork)
- Unified image scan flow (remove duplicate scan modal)
- Onboarding flow rework (value-first, tour after first word)
- Modular JS architecture (split single file into modules)

### Future (3–6 Months)

- PWA / native mobile apps (iOS, Android)
- Browser extension for web reading capture
- Public deck marketplace / import
- Collaborative decks
- AI-generated notes and flashcards from pasted text
- Reading integrations (Kindle highlights, PDF annotations)
- Streak recovery / grace day mechanic
- Advanced analytics (forgetting curve, learning velocity)

---

## 13. Out of Scope (V2)

- Real-time collaboration / multiplayer
- Audio recording / speaking practice
- Teacher / classroom management tools
- Paid tiers or monetization (evaluate after 500 MAU)
- Social leaderboards

---

## 14. Open Questions

| Question | Owner | Priority |
|---|---|---|
| Should the Daily Review queue mix vocab + custom flashcards by default, or keep them separate? | PM | High |
| What is the target word count before recommending a deck split? | Design | Medium |
| Should notes ever enter the SM-2 queue (as review prompts)? | PM | Medium |
| Is Wordnik key setup worth supporting, or should it be deprecated in favor of Gemini-only enrichment? | Eng | Low |
