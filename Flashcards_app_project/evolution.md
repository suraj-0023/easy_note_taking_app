# Nexora — Project Evolution Log

> Reverse-chronological changelog. Each entry covers what changed, why, and the impact.

---

## 2026-05-17 — Command-Center (Notion-style) UX redesign + 6 bug fixes

**What:** Full visual redesign of the app shell from M3 warm/emerald to a Notion/Linear-inspired "Command-Center" aesthetic. Blue `#2D8CFF` replaces emerald as the primary UI accent for all chrome elements (sidebar, buttons, active states, add modal, search shortcut pill). Library section tiles become minimal board cards. A board stats bar (`#ccBoardStats`) appears above the library showing Total Items, Mastered, Due Today, and Decks counts. Sidebar gains an inline search button styled as a ghost pill. Six confirmed bugs were found and fixed by parallel Haiku bug-hunter agents.

**Why:** User wanted a more professional, productivity-focused design closer to Notion/Linear rather than the gamified emerald palette. The existing M3 warm aesthetic felt too playful for a study tool that serious learners use daily.

**Impact:** App now has a clean, neutral command-center look. Sidebar navigation is flat-tree style. Library tiles are minimal board cards with bold counts. Emerald is preserved for content-level indicators (SM-2 mastery borders, vocab pills) but removed from all structural/chrome elements. Board stats give users an at-a-glance progress summary without entering a deck.

**Technical Detail:**
1. **CSS variables**: Added `--primary: #2D8CFF`, `--primary-50: #EFF6FF`, `--primary-100: #DBEAFE`, `--primary-700: #1D4ED8` to `:root` block (~line 134).
2. **Command-Center override block**: ~380-line CSS block injected before `</style>` (end of StylesGlobal) using `!important` throughout to override existing cascade without touching individual rules. Covers sidebar background, logo mark, deck pill active states, search ghost pill, add button, tile cards, board stats grid, and all dark-mode counterparts.
3. **Sidebar search bar**: HTML `<button class="sidebar-search-bar">` added between logo and Library label in `MainAppContainer` (6227); calls `openSearch()` and displays `⌘K` shortcut chip.
4. **Board stats bar**: `<div class="cc-board-stats" id="ccBoardStats">` added before library section; populated in `renderLibrary()` (JSLibrary 10988) with Total Items, Mastered (SM-2 repetitions ≥ 3), Due Today, and Decks counts.
5. **Bug fixes**:
   - `getDueCount()` property mismatch (`newCount/reviewCount/lapsedCount` → `new/review/lapsed`) — caused "NaN" in Due Today stat.
   - Board stats 4-column overflow on mobile <560px — fixed with `@media (max-width:640px) { .cc-board-stat { flex: 1 1 calc(50% - 5px); } }`.
   - Library tile counts showed "3 notes" text — JS now sets only the raw number; `.lib-tile-name` label handles the type string.
   - Add Modal deck selector `<select>` still used emerald token — overridden to blue `var(--primary-700)` / `var(--primary-50)`.
   - Dark-mode `.cc-board-stat*` overrides missing `!important` and `.red` variant — added all flags and red dark variant `#FF6B6B`.
   - "Add Content" button in Recently Added section had inline `background:var(--emerald)` — overridden via `#recentlyAddedSection button { background: #2D8CFF !important; }`.

---

## 2026-05-17 — Two-shot quiz distractor prefetch, smarter question-type-aware options

**What:** Fixed quiz distractor generation architecture with two-shot concurrent batching and smarter fallback options.

**Why:** Friends testing the app found quiz options showed "Option A / B / C" (LLM fallback) and first question was slow loading. Root causes: (1) fallback used placeholder text instead of session vocab, (2) all 20 questions sent in one large batch, blocking first card.

**Impact:** First quiz card appears in ~1–2s instead of 20+ seconds; all fallback options now show real vocabulary from the quiz session pool instead of generic placeholders; distractor generation is smarter (opposites for definitions, nearby numbers for facts, similar-sounding words for vocab, swapped values for statements).

**Technical Detail:** (1) `_fallbackDistractors()` now pulls 3 random words from the current quiz session pool instead of returning hardcoded "Option A/B/C". (2) `_prefetchAllDistractors()` split into two concurrent batches via `Promise.allSettled`: Q1-Q2 fires immediately (small payload, ~1–2s response), Q3-Q20 fires in background without blocking UI. (3) New `_buildDeckContext()` creates a compact summary of deck vocab/notes for LLM domain context. (4) New `_buildDistractorPrompt()` centralizes distractor generation logic with question-type-aware rules (MCQs for definitions: opposites/antonyms; numeric facts: nearby wrong numbers; vocabulary: similar-sounding words; T/F statements: swapped values). (5) New `_prefetchBatch(items, startIndex, deckContext)` — core batch fetcher used by both shots, fills missed slots with local fallback on API failure. (6) `_callAnthropicDistractors()` updated to use shared `_buildDistractorPrompt()` builder for consistency.

---

## 2026-05-17 — Bug fixes: null safety, onclick injection hardening

**What:** Fixed 4 confirmed bugs across JSFlashcards, JSNewQuizSystem, JSHelpPanel, and JSInit sections.

**Why:** 8-agent bug sweep (2 rounds of 4 Haiku agents) identified runtime crashes and an injection vulnerability in search result onclick handlers.

**Impact:** App no longer crashes when displaying vocab words that lack usage examples; quiz correctly handles edge-case option data; help panel is resilient to invalid tab index; search results are safe against ID strings containing apostrophes.

**Technical Detail:** (1) `showFlashCard()` in JSFlashcards now guards `w.usage` access with `w.usage && w.usage.length` before use at ~line 9468 and 9476; quiz feedback restore at ~line 9728 similarly guarded. (2) `selectNqOption()` in JSNewQuizSystem adds `if (!correctOpt) return;` before accessing `correctOpt.id`. (3) `renderHelpTab()` in JSHelpPanel now checks `!HELP_TABS_CONTENT[idx]` and null-checks the DOM element. (4) Search result onclick handlers in JSInit now escape IDs with `.replace(/'/g, "\\'")` before injecting into JS string literals.

---

## 2026-05-07 — Vocab phrase extraction, concise notes output

**What:** (1) Typing a phrase in vocab mode now extracts individual meaningful words (stop-word filtered) as separate vocab suggestions instead of treating the whole phrase as one item. No "YOUR CONTENT" section for phrase input. (2) Notes AI output is now 3 sections of exactly 2 sentences each — definition + one example line only; related and memory hook fields removed from body.

**Why:** Users reported vocab mode showing the full phrase as one card (e.g. "Brevity is the soul of wit" instead of "Brevity", "soul", "wit"). Notes were generating multi-paragraph essays that were hard to digest.

**Impact:** Vocab suggestions are now individual learnable words. Notes are concise and scannable — 2 sentences per section.

**Technical Detail:** In `handleAddModalGenerate()`, vocab text handling now splits by whitespace/comma, filters `VS` stop-word set, pushes each token as `source:'suggested'`. `_toNoteItem()` body drops `related` and `hook`. Passage prompt changed to 3 sections, "exactly 2 sentences" per definition, simplified JSON schema.

---

## 2026-05-07 — Fix word-level notes, sticky Next button in Add Modal review

**What:** (1) `isWordList` detection now requires either comma-separated input or a short stop-word-free token group — sentences like "Brevity is the soul of wit" no longer generate per-word definitions. (2) Add Modal review panel now has a sticky footer: panel is capped at 88vh, footer has flex-shrink:0, review content scrolls internally so Next/Finalize buttons are always visible.

**Why:** Pasting a sentence or phrase into Notes mode was triggering word-level note generation (e.g. definitions for "Brevity", "is", "the"). Also, the Next button in the review wizard required scrolling to the bottom to find.

**Impact:** Notes mode now produces topic-level study notes for any sentence/passage input. The Next and Finalize buttons are always visible during review regardless of how many cards are shown.

**Technical Detail:** Added `_STOP` set in `_generateNotesFromText()`; `isWordList` now uses `/,/.test(trimmed) || (short + no-stop-word check)`. `.add-modal-panel` gets `max-height:88vh;overflow:hidden`. `.add-modal-footer` gets `flex-shrink:0`. On review open: `#addModalReview` set to flex column with `flex:1`, `#addModalReviewContent` set to `overflow-y:auto;flex:1`.

---

## 2026-05-07 — Onboarding Review: Color-Coded Cards with Type Badges

**What:** Each suggestion card in the onboarding review panel now has a distinct background color and a type badge pill (VOCAB / NOTE / FLASHCARD) so users can instantly tell content types apart.

**Why:** Users reported no visual distinction between notes and flashcards (and vocab) in the suggestion list — all cards looked identical.

**Impact:** Review panel is now immediately scannable — amber for vocab, green for notes, indigo for flashcards, each with a matching border and uppercase badge pill.

**Technical Detail:** Added `TYPE_STYLE` lookup object in `_nobShowReview()` in `nexora-onboarding.js` with per-type bg, badgeBg, badge color, label, and icon. Card `<label>` now uses `background:${ts.bg};border:1px solid ${ts.badgeBg}` and renders a `<span>` pill with the type label right-aligned beside the title.

---

## 2026-05-07 — Onboarding Review UX: Richer Cards, Sticky Save Button, Shorter Notes

**What:** Updated the onboarding wizard Step 2 ("Add your first content") review panel in three ways: (1) suggestion cards now show a two-line preview (title + body excerpt up to 110 chars) instead of title only; (2) the "Save selected →" / "Skip all" nav buttons are now always visible via flex layout with max-height constraint on the review container; (3) AI notes prompt now generates exactly 3 short sections (2–3 sentences each) instead of 3–6 long detailed sections with examples/tips.

**Why:** Users reported that suggestions were "just one line" and hard to scan; the save button required scrolling to reach on smaller screens; AI-generated notes were too long to read quickly in the review step.

**Impact:** Review panel is more scannable and actionable — users can read note and flashcard content at a glance, and can always see and click the save button without scrolling.

**Technical Detail:** `_nobShowReview()` in `nexora-onboarding.js` now renders each suggestion with `<div style="flex:1;min-width:0">` containing a bold title row and a muted preview row. `#nob-step1-review` uses `display:flex;flex-direction:column;max-height:52vh;` with the items container `flex:1;overflow-y:auto`. Nav buttons have `flex-shrink:0` to stay pinned at bottom. Notes Gemini prompt changed to request exactly 3 sections with 2–3 sentence bodies in JSON format `{"notes":[{"title":"...","body":"..."}]}`. Card body construction updated to read `n.body || n.definition` to support both preview text and definitions.

---

## 2026-05-07 — AI UX Overhaul: Loading Screen, AI Toggle, Topic Notes, Onboarding Review

### What
- Vocab-only Add Modal now shows a single word input (textarea hidden)
- Fun loading screen with rotating emoji messages replaces static "Generating…" button
- AI toggle button (on by default) in modal footer — disables Gemini calls when off
- Success toast ("✓ N items added to Deck!") shown after finalizing review
- LLM notes prompt rewritten: generates exactly 4 comprehensive teacher-style topic sections
- LLM flashcard prompt rewritten: generates topic Q&A pairs (not word definitions)
- Onboarding Step 2 now shows AI-generated suggestions in a mini review (checkboxes) before saving, followed by a "🎉 X items added!" success state

### Why
- Users reported the Add Modal had confusing 3-input layout for vocab
- "Generate" felt like nothing was happening — no feedback during AI calls
- Notes were returning word definitions instead of topic-level content (e.g. "solar" definition instead of planets + distances)
- Onboarding Step 2 silently saved without showing what was added

### Impact
- Cleaner vocab input UX (1 input instead of 3)
- Engaging loading experience during AI generation
- AI can be disabled per-user via toggle
- Topic queries now produce real study notes with facts, lists, and data
- Onboarding users can review and accept AI suggestions before they're saved

### Technical Detail
- `updateAddModalTypes()` in JSAddModal: hides `#addModalTextArea` for vocab-only mode
- `_showAddLoading()` / `_hideAddLoading()` cycle 9 rotating emoji messages every 1.9s
- `_isAIEnabled()` / `_toggleAI()` use `lsGet/lsSet('nexora_ai_enabled')`, default true
- `_showSuccessToast(msg)` creates/reuses `#nexoraSuccessToast` DOM element
- `_generateNotesFromText()` passage prompt updated: teacher-style, exactly 4 sections
- `_generateFlashcardsFromText()` prompt updated: topic Q&A with 6-10 pairs
- `_wizardStep2Next()` in nexora-onboarding.js: calls `_callGemini()` for notes/flashcards, shows `_nobShowReview()` panel
- `_wizardStep2Finalize()`: saves selected items, shows `nob-step1-success` with count, auto-advances after 1.4s
- nexora-onboarding.css: added `@keyframes nob-bob` and `@keyframes loadbar-sweep`

---

## 2026-05-07 — Mobile Responsiveness: Sidebar Drawer, Bottom Nav, Media Queries

**What:** Made the app fully responsive for phone browsers at ≤768px viewport width.
- Added slide-in sidebar drawer with hamburger toggle (☰) in the top bar, activated by `toggleMobileMenu()`
- Added `#mobileOverlay` backdrop div to close sidebar on tap
- Added `#bottomNav` bottom navigation bar with 5 items (Library, Flashcards, Quiz, Notes, Stats)
- Reduced padding on `.deck-header-bar`, `.view`, `.flip-front/back`, `.practice-back-bar`, `.login-card`
- Made `SearchModal` and `AddModal` render as bottom sheets on mobile
- Added `viewport-fit=cover` meta tag to support `env(safe-area-inset-bottom)` on iPhone safe areas
- Added JS section `JSMobileMenu` with `toggleMobileMenu()`, `closeMobileMenu()`, `bottomNavTap()`, and resize listener

**Why:** The 260px fixed sidebar occupied 67% of a 390px phone screen, making the app completely unusable on mobile. Desktop layout is 100% unchanged — all mobile rules are inside `@media (max-width: 768px)` and only apply to phones/tablets.

**Impact:** App is now fully usable on iPhone and Android browsers. Onboarding screens (ProfileSetup, WelcomeTour, OnboardComplete) were already responsive via existing 600px media queries, so mobile users now have full end-to-end experience.

**Technical Detail:** `app.html` — added `viewport-fit=cover` to viewport meta tag (line 6); added full `@media (max-width: 768px)` CSS block before `</style>` (StylesGlobal section) covering sidebar transform, overlay, bottom nav, and all component paddings; added `#mobileOverlay` div before `<aside>` in MainAppContainer; added `#hamburgerBtn` as first child of `.deck-header-bar` in MainPage; added `#bottomNav` with 5 items before `</main>` in MainPage; added new `JSMobileMenu` JS section before `JSInit` with `toggleMobileMenu()`, `closeMobileMenu()`, `bottomNavTap()` functions and resize listener.

---

## 2026-05-07 — Onboarding & Add Content UI Redesign

**What**: Bigger onboarding wizard (580px), new welcome brand copy, step 2 smart field logic (single field per content type, AI hint for multi-select), image scan step redesign with prominent legend, removed "From" toggle from Add Content modal, added review wizard section headers, hidden General deck from all UI surfaces.

**Why**: Onboarding was confusing (all 5 fields showing at once), welcome screen only mentioned vocabulary, Add Content modal had an unnecessary "From" toggle step, review results lacked visual hierarchy, and the legacy General deck was cluttering the UI.

**Impact**: Cleaner onboarding flow, simpler content-adding UX, visually segregated AI vs user content in review, General deck no longer visible to users.

**Technical Detail**: `_syncContentTypeFields()` in nexora-onboarding.js rewritten with mutually-exclusive display logic; `updateAddModalTypes()` in app.html no longer uses `_getSelectedInputs()`; new `.add-review-section-head` CSS class for review headers; `projects.filter(p => p.id !== 'general')` applied across all deck pickers and library rendering.

---

## 2026-05-06 — UX Sweep: Floater Fix, Grid Redesign, General Deck Removal, Save Original AI, Notes Review, Onboarding Expansion

### What
- Fixed Getting Started floater blinking (poll no longer re-renders unless progress changes)
- Removed the auto-created "General" deck for all users (V4 migration)
- Recently Added grid: vocab = square tiles (1:1), notes/flashcards = wide horizontal rectangles (2.5:1, span 2 cols), fluid auto-fill grid
- AI Generate now offers a "Save Original" card at the top of review results for Notes and Flashcards (from text: raw input; from image: verbatim highlighted/underlined text)
- New Notes Review practice mode: flip through notes like flashcards, accessible from sidebar
- Onboarding wizard expanded from 3 → 4 steps: multi-type content creator (Vocab/Note/Flashcard multi-select) + book-page scan demo step

### Why
User review identified six UX issues: floater animation bug, missing original-text save option in AI flow, incorrect card shapes in recently added section, auto-created General deck cluttering sidebar, no practice mode for notes, and onboarding only covering vocabulary.

### Impact
- Floater no longer pops every 2 seconds
- General deck removed from sidebar for all users (existing items still accessible via Complete Library)
- Recently Added section is visually cleaner with correct card proportions
- Users can now save their own text alongside AI suggestions
- Notes are now a first-class practice item (flip review mode)
- Onboarding introduces all three content types and the image scan feature

### Technical Detail
- nexora-onboarding.js: _lastChecklistDone sentinel; _syncContentTypeFields(); _wizardStep2Next() multi-type save; _goWizardStep() updated for 4 dots; new _showFirstDeckWizard() HTML with nob-step-0 through nob-step-3
- nexora-onboarding.css: .nob-type-btn and .nob-type-btn.selected added
- app.html: DEMO_SEED_VERSION bumped to 4; deck-recent-grid CSS; _generateFlashcardBackForFront(); _extractVerbatimFromFile(); JSNotesReview section; openPracticeView() notes branch

---

## 2026-05-06 — Onboarding UI redesign: match Nexora design system

**What:** Redesigned `nexora-onboarding.css` to use the app's emerald design tokens instead of an independent blue palette. Added a branded wizard header with Nexora N-mark, "Getting started" label, and ✕ close button. Updated the welcome modal SVG illustration to use emerald colors.

**Why:** The onboarding wizard, spotlight tooltips, and checklist widget were styled with a completely different visual language (blue #3B8BD4/#2563EB accents, generic black #111 buttons, pure-white cards) that clashed with the app's warm emerald design system — making it feel like a foreign component.

**Impact:** Onboarding now feels native to Nexora — consistent accent color, button style, surface tones, and flashcard gradient. The wizard has a branded header so users always know which app they're in.

**Technical Detail:** `nexora-onboarding.css` — replaced all `#3B8BD4`/`#2563EB` with `var(--emerald)`; replaced `background: #111` CTAs with `var(--emerald)`; swapped hardcoded `#fff` surfaces for `var(--surface)`; changed the `.nob-card-front` gradient to `linear-gradient(135deg, var(--emerald) 0%, #059669 100%)`; restyled `.nob-wizard-dot` as segmented bars. `nexora-onboarding.js` — added `.nob-wizard-header` + `.nob-wizard-body` wrapper structure in `_showFirstDeckWizard()`, wired header ✕ button, updated SVG fill colors.

---

## 2026-05-06 — Sample deck removal, card layout, tagline & quiz timing

### What
- Removed all four sample decks (Atomic Habits, Climate Disaster, The Alchemist, Class 10 Science) and all their associated notes, flashcards, and vocabulary from the app
- Recently Added grid: flashcard and note cards are now horizontal rectangles; vocabulary cards remain squares
- Deck home tagline changed from "Your personal study deck" → "Notes · Flashcards · Vocabulary"; header left-aligned
- Quiz now starts immediately (first card shown at once); batch distractor prefetch runs in background

### Why
- Onboarding feature is complete; sample decks are no longer needed and clutter new-user experience
- Card text was being clipped inside square flashcard/note cards — horizontal layout gives more room
- Tagline was visually drifting toward the Vocabulary tile; left-alignment anchors it to Notes/Flashcards
- "Preparing quiz…" was blocking the UI for 10-20 seconds while all distractors were batch-fetched

### Impact
- New users start with a clean slate (General deck only); existing users have sample decks auto-removed on next login via V3 migration
- Recently Added section is more readable with distinct card shapes per content type
- Quiz feels instant; options appear as soon as each card's distractors are ready

### Technical Detail
- `DEMO_SEED_VERSION` bumped 2→3; `DEMO_DATA` arrays cleared; `mergeDemoDataForUser()` now filters out sample IDs
- CSS: `.deck-recent-card.type-vocab { aspect-ratio: 1/1 }` and `.type-flash, .type-note { min-height: 84px }`
- `startNotesQuiz` / `startVocabQuizDirect`: removed `await` from `_prefetchAllDistractors()`; `_renderNqCard()` called first
- Batch loop: added `if (_nqTrack[idx]) return;` guard to avoid overwriting per-card results

---

## [2026-05-05] — Automated bug sweep: 6 fixes (4 HIGH, 2 MEDIUM)

**What:** Fixed 4 stored-XSS vulnerabilities and 2 null/async bugs across quiz, library, search, and flashcard sections.

**Why:** Dual Haiku agent automated sweep identified unescaped innerHTML injections, a null dereference in discardPreview, a missing await on syncToCloud, and unguarded DOM accesses in flashcard rendering.

**Impact:** Eliminates stored-XSS vectors in quiz option rendering, detail popup, and Cmd+K search results; prevents crash when aiPreviewCards element is absent; ensures demo seed sync completes before continuing auth flow; prevents flashDeleteBtn null crash.

**Technical Detail:** `_escHtml()` applied to all user-controlled fields in `renderDetailPopupContent`, `renderSearchResults`, and `showQuizCard`; quiz option onclick converted to data-attribute pattern; `discardPreview` null-checks `aiPreviewCards`; `await` added to `syncToCloud()` in JSAuthStateHandler demo-seed block; `showFlashCard` wraps `flashDeleteBtn` access in null guards.

---

## 2026-05-05 — Nexora Onboarding: 18-step flow fully verified and hardened

**What**: Fixed 5 bugs in `nexora-onboarding.js` and 1 in `app.html` to make the complete onboarding flow work end-to-end.

**Why**: Puppeteer MCP-based 18-step regression test revealed multiple issues: spotlight targeting a hidden button, tooltip outside-click listener accumulating across shows, wizard closing with app still hidden on `file://`, deck_open tooltip consumed invisibly during wizard deck creation, and checklist DOM not yet initialized when first update call ran. Also `skipLogin()` bypassed the onboarding wrapper entirely.

**Impact**: Full onboarding flow now works from welcome modal → goal wizard → spotlight → 5 contextual tooltips → checklist (3 tasks auto-done, 2 via session/quiz) → completion banner. Dark mode and mobile (360px) both verified.

**Technical Detail**:
- `_maybeShowSpotlight()` in nexora-onboarding.js: fallback from `.add-modal-btn` to `.deck-home-cta-btn`
- Outside-click `addEventListener` uses `{ once: true }` to prevent re-entrant dismiss loop
- `_closeWizard()` force-shows `#app` + hides loadingScreen for `file://` compatibility
- Wizard step 0 swaps `window.switchProject` ↔ `_origSwitchProject` around `createNewDeck()` call
- `_markWizardDone()` calls `_initChecklist()` before `_updateChecklist()`
- `app.html` `skipLogin()`: added `if (!lsGet('nexora_tour_complete', false)) showProfileSetup(null);`

---

## 2026-05-01 — UI/UX Improvements: Sidebar, Library, Quiz Flow

**What:** Six UX improvements — sidebar cleanup, wider sidebar, context-aware Add button, Recently Added section in Complete Library, deck picker before quiz, and batch distractor prefetch for instant quiz navigation.

**Why:** Mastery dots were overlapping deck names; sidebar felt cramped; two Add buttons appeared simultaneously on deck views; Complete Library had no at-a-glance recent activity; quiz launched without deck selection; quiz card navigation was slow due to per-card AI calls.

**Impact:**
- Sidebar deck names no longer obscured by dots
- Wider sidebar (260px) gives more room for deck names
- Only one Add button visible at a time — header button hidden on deck views, shown on Complete Library
- Complete Library shows last 15 added items across all decks with deck name badge and "+ Add Content" button
- Quiz now asks which deck(s) to include before starting; "All Decks" pre-selected
- Quiz navigation is instant — all answer options generated in one batch request at quiz start

**Technical Detail:**
- Sidebar: removed `_masteryPercent` call and `dotsHtml` from deck pill render; `aside` width 220px → 260px
- `applyProjectFilter()`: toggles `.add-modal-btn` display based on `currentProjectId === 'all'`
- `renderLibrary()`: populates `#recentlyAddedSection` with sorted merged array of notes/cards/vocab when on Complete Library
- New `_showQuizDeckPicker(mode)`, `_onQuizDeckCbChange()`, `_hideQuizDeckPicker()`, `_confirmQuizDecks()` for deck picker flow
- `startNotesQuiz(deckIds)` / `startVocabQuizDirect(deckIds)`: accept optional deck filter; call `_prefetchAllDistractors()` before rendering
- `_prefetchAllDistractors()`: single batch Gemini call for all questions; populates `_nqTrack` entries upfront
- `_renderNqCard()`: now synchronous; falls back to per-card async only when prefetch entry missing

---

## 2026-05-01 — Smart Note Generation: 3-Mode Input Detection

**What:** Rewrote `_generateNotesFromText` and `_generateNotesFromFile` to produce structured notes with a clear title and rich body instead of raw definition strings. Input is now auto-detected as single word, word list, or passage — each mode uses a tailored Gemini prompt and produces the right number of notes.

**Why:** Notes generated from a single word (e.g. "imitation") previously showed only the definition with no title, making them unidentifiable after time. A note should be a study artifact — titled, contextualised, and rich enough to stand alone.

**Impact:**
- Single word → 1 note titled with the word; body has definition, usage example, related words, and memory hook
- Word list (e.g. "imitation mimicry emulation") → one note per word, parallel Gemini calls, same structure
- Passage → Gemini extracts however many concepts are worth studying (2–6), each as its own titled note
- Image/file notes also now return structured {title, body} objects
- Review wizard note cards now show the title as a bold heading above the body

**Technical Detail:**
- `_generateNotesFromText(text)`: detects single word (1 token), word list (2–8 short tokens, no punctuation), or passage; dispatches to `_wordNotePrompt` per-word or passage-mode Gemini prompt; uses `Promise.all` for parallel word-list calls
- `_generateNotesFromFile(file)`: updated prompt requests `{title, definition, example, related, hook}` per note; `toItem()` helper assembles the body string
- `_noteCard()`: renders `item.title` as bold heading when present; `white-space:pre-line` on body; falls back to `item.text` for compat
- `_finalizeReview()`: saves `item.title` → `note.title` and `item.body` → `note.content`

---

## 2026-05-01 — Add Modal Redesign: Dual-Group Selection + Multi-Step Review Wizard

**What:** Completely redesigned the Add Content modal with two independent multi-select pill groups ("Generate": Vocab/Notes/Flashcards; "From": Text/Image-File) and a sequential multi-step review wizard (Back/Next/Finalize navigation).

**Why:** User requested any combination of content types and sources to be generatable simultaneously, with a step-by-step review flow instead of the old single-preview pattern. Notes and flashcards from images use Gemini to prioritise highlighted/annotated content.

**Impact:**
- Users can now generate Vocab + Notes + Flashcards from the same text or image in one action
- Each generated item goes through a review step before saving (accept/decline per item)
- Gemini-powered generation for notes and flashcards from images/PDFs, with highlighted content prioritised
- Legacy single-preview save flow removed; wizard replaces it entirely

**Technical Detail:**
- `updateAddModalTypes()` — controls dynamic input area visibility based on selected pill combinations
- `_callGemini(prompt, file)`, `_generateVocabFromFile`, `_generateNotesFromText/File`, `_generateFlashcardsFromText/File` — new Gemini generation functions returning `{highlighted:[], suggested:[]}` objects
- `handleAddModalGenerate()` — rebuilt to iterate types, build `_reviewQueue`, launch `_startReview()`
- `_startReview()` / `_renderReviewStep()` / `_finalizeReview()` — new multi-step wizard with step-dot indicator
- `_reviewQueue`, `_reviewStep`, `_reviewSelections` — new state variables driving the wizard
- `_addModalFiles` (array) replaces `_addModalFile` (single) for multi-file support
- New CSS: `.add-modal-section-label`, `.add-modal-step-bar`, `.add-modal-step-dot`, `.review-item-card`, `.review-item-actions` and related selectors

---

## 2026-04-30 — Bug-finder agent sweep: 7 new bugs fixed

**What:** Two automated Haiku bug-finder agents scanned all remaining sections of app.html and found 7 bugs that were then fixed.

**Why:** Post-issue-sweep automated audit to catch bugs not covered by the existing issue tracker.

**Impact:**
- lsGet() no longer crashes on corrupted localStorage (affects all app data reads)
- Guest-to-user data migration no longer crashes on malformed localStorage during sign-in
- showLoginError() no longer crashes when loginError element is absent from DOM
- showLibraryList() no longer crashes when libListSort element is absent
- _daysAgo() shows empty string instead of "NaN d ago" for invalid date strings
- vfRateCard() (vocab flip practice) no longer crashes when called past end of queue
- Custom card IDs now include random suffix preventing same-millisecond ID collisions

**Technical Detail:**
- `lsGet()`: JSON.parse now in try-catch, returns fallback on SyntaxError
- `handleAuthState()`: introduced `_parseSafe()` helper for guest localStorage migration
- `showLoginError()`: added `if (!el) return;` guard
- `showLibraryList()`: wrapped sortSel access in `if (sortSel) {}`
- `_daysAgo()`: `isNaN(ts)` check before date arithmetic
- `vfRateCard()`: `if (!w) return;` guard added
- Card IDs: `'cc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)` in 3 places

---

## 2026-04-30 — Bulk Issue Resolution: 30+ Bug Fixes Across All Sections

**What:** Resolved 30+ open GitHub issues spanning CSS dark mode, JS null-check crashes, async race conditions, UX bugs, and data sync issues.

**Why:** Systematic bug sweep of all open GitHub issues to improve app stability, dark mode fidelity, and data integrity.

**Impact:**
- App no longer crashes on edge cases (out-of-bounds arrays, null word lookups, stale IDs)
- Dark mode now renders correctly across all major UI surfaces (login, flashcards, quiz, stats, help panel)
- "Nexora" branding complete — old "Smritikosha" text removed from profile setup screen
- Escape key now universally closes all modals (detail popup, image scan, custom card)
- Sync failures in notes/custom cards now show error feedback instead of silent stuck state
- Quiz score display no longer shows NaN when zero questions answered
- Search results now resolve item index at click time, preventing stale-index crashes

**Technical Detail:**
- CSS: Replaced `#fff`/hardcoded hex with `var(--surface)`, `var(--emerald-700)`, `var(--red)`, `color-mix()` design tokens in 15+ rules
- JS: Added `if (!w) return` / `if (!item) return` guards in `rateCard`, `openModal`, `_renderNqCard`, `moveWordToProject`
- JS: Wrapped `_addWordsFromText` in try/finally to guarantee `currentProjectId` restore
- JS: Added `AbortController` 10s timeout to `_callAnthropicDistractors` fetch
- JS: `_checkSectionDone` now checks `isConnected` and filters out `.tile-collapsing` tiles
- JS: `renderSearchResults` now uses `findIndex(x => x.id === ...)` at click time
- JS: `syncToCloud` fire-and-forget calls in notes/custom cards now have `.catch(() => {})`
- JS: `nextQuiz()` bounds-check calls `showQuizDone()` instead of overrunning array
- JS: `selectQuizOption()` now null-checks `perf[w.id]` and `w.usage[0]`
- JS: `finishProfileSetup()` validates `_profileGoal` when not skipping
- JS: `handleAddModalGenerate()` closes Add modal before opening image modal to prevent overlap
- JS: `startNotesQuiz()` uses crypto-safe fallback ID instead of `Math.random()`

---

## 2026-04-30 — Context-Aware Definition Selection + Synonyms & Antonyms Enrichment

**What:** Added Tier 1.5 context-aware definition selection via Gemini (`_selectRelevantDefs`), which picks the 2–3 most relevant definitions for a word based on the deck's title and vocabulary sample. Extended Tier 3 Gemini gap-fill to also fetch 2 synonyms and 2 antonyms per word when missing.

**Why:** Words often have many definitions; showing the most context-relevant ones improves study effectiveness. Synonyms and antonyms provide richer vocabulary context and deepen understanding beyond a single definition.

**Impact:** Word detail cards now surface definitions most relevant to the deck being studied. Users see up to 2 synonyms and 2 antonyms on enriched word cards, strengthening vocabulary connections.

**Technical Detail:**
- `_selectRelevantDefs(word, allDefs, deckTitle, deckVocab)` — sends all definitions + deck context to Gemini proxy; parses a JSON array of 1-based indices; returns top 3 matching `allDefs` entries
- Tier 1.5 inserted in `addWords()` pipeline: fires after Free Dict succeeds and `wordData.allDefs.length > 2`
- `_haikuEnrichWord` extended: `needsSynonyms` / `needsAntonyms` flags added; prompt now requests `"synonyms": [string, string]` and `"antonyms": [string, string]`; results stored as `wordData.synonyms` and `wordData.antonyms` (sliced to 2)

---

## 2026-04-30 — App Renamed to Nexora + Code Navigation System

**What:** Renamed app from Smritikosha/Lexicon to Nexora across all project files. Added a code navigation system with @@SECTION markers and CODE_MAP.md index.

**Why:** New brand identity (Nexora). Navigation system introduced to allow agents to jump directly to the right code section without reading the full 10,500-line app.html.

**Impact:** All display names, localStorage keys (`nexora_*`), taglines, and documentation now reflect the Nexora brand. Future code changes are faster and more precise with the section map.

**Technical Detail:** 170+ text replacements across 13 files. 42 `@@SECTION` markers added to app.html. CODE_MAP.md created with 40 section entries.

---

## 2026-04-30 — SM-2 Spaced Repetition, Daily Queue, Search Palette, Keyboard Shortcuts, UX Polish

**What:** Implemented SM-2 spaced repetition algorithm with four pure functions (`defaultSM2`, `applyRating`, `getDueCount`, `updateDailyBadge`) to track word mastery intervals and due dates. Added daily review queue badge in sidebar with breakdown (lapsed → review → new priority order). Built Cmd+K search/command palette modal with real-time filtering. Keyboard shortcuts wired: Space (flip), 1 (wrong), 2 (correct). Context sentences now flow from add modal through preview and display on flashcard back. SM-2 state badge added to word detail modal. Post-rating toast appears below flip actions. Onboarding simplified to 1 profile step + 2-slide tour.

**Why:** SM-2 delivers scientifically-proven spacing algorithm for long-term retention. Daily queue badge gives quick visibility into study load. Search palette improves discoverability. Keyboard shortcuts reduce friction during study. Context sentences anchor memory to real usage.

**Impact:** Users see SM-2 intervals and due dates on every word, enabling intelligent study planning. Daily queue badge encourages consistent review. Cmd+K search makes finding words fast. Keyboard-first study (Space+1/2) speeds up sessions. Simplified onboarding reduces friction.

**Technical Detail:**
- SM-2 state stored per word in localStorage with `{interval, easiness, repetitions, dueDate}`
- `_renderLibListHTML()` rewritten to show SM-2 state pills with "Due in Xd" chips
- `openSearch()`, `closeSearch()`, `runSearch()` manage the search modal; Cmd+K/Escape wired in global keydown handler

---

## 2026-04-30 — Three UX Fixes: Sample Deck Labels, Guest Light Mode, Remove Word-Added Alert

**What:** (1) Sample decks now show a non-bold "(sample)" label at reduced opacity. (2) "Continue without signing in" now starts in light mode regardless of OS preference. (3) Removed browser alert after adding vocab words successfully.

**Why:** Sample deck labels distinguish built-in content from user decks. Guest dark mode was jarring. The alert felt out of place.

**Impact:** Cleaner sidebar, better first-run experience for guests, quieter add-word flow.

---

## 2026-04-30 — Fix Flashcards Section Card Navigating to Practice Instead of List

**What:** Fixed `showDeckSection('flashcards')` which was launching practice mode instead of displaying the flashcard items list.

**Why:** User reported clicking the Flashcards card sent them to practice mode rather than showing the item list like Notes and Vocab.

**Impact:** Clicking Flashcards in the deck home now correctly opens the library list of flashcard items.

---

## 2026-04-29 — Fix Notes/Vocab Section Navigation (Deck-Specific Mode)

**What:** Fixed Notes and Vocab tiles doing nothing when clicked from a specific deck's home, and fixed the Back button restoring the wrong view.

**Why:** `showDeckSection` did not route for 'notes' and 'vocab' in deck-specific mode; the library section was hidden so nothing appeared.

**Impact:** Notes, Flashcards, and Vocab tiles now correctly navigate to filtered list views. Back button correctly restores the deck home.

---

## 2026-04-29 — Add Modal Text-Input Preview/Review Step

**What:** Added a confirm-before-save preview step in the +Add modal for Vocab, Note, and Flashcard types. After generating, a preview card is shown. Buttons change to "← Edit" and "✓ Save". Multi-type selections show all previews stacked.

**Why:** User requested the same accept/decline UX that image scan already provided, applied to typed text input.

**Impact:** Users can review and confirm (or back out and edit) before any typed content is persisted.

---

## 2026-04-28 — Add Modal Multi-Select, PRD/Design Docs, Brand Review

**What:** Upgraded Add Modal from radio-style type pills to multi-select checkboxes. Vocab + Note + Flashcard can be checked simultaneously; Image/PDF exclusive. Added Phase 2 planning documents.

**Why:** Type pills were mutually exclusive. Multi-select lets users create a vocab entry, note, and flashcard from a single text block in one submit.

**Impact:** Content creation is more flexible. The modal is self-contained for all add flows including file scan. Deck Home CSS scaffolding in place for Phase 3.

---

## 2026-04-28 — Phase 2 — Sidebar Redesign, Add Modal (Cmd+N), Header Actions, Scroll Fix

**What:** Narrowed sidebar to 220px; added mastery dots (4-dot quartile indicator) to each deck. Added Daily Queue Badge placeholder. Redesigned deck header: Cmd+K Search ghost pill + "+ Add" emerald button. Built Add Modal with Cmd+N/Escape/Cmd+Enter support. Fixed scroll position bug: `_renderLibListHTML()` now saves/restores scroll position.

**Why:** Inline add section was cluttered and broke scroll position. Modal gives a clean, focused creation flow. Mastery dots give instant deck health visibility.

**Impact:** All content creation flows through a focused modal. Scroll position preserved after adds. Sidebar shows per-deck mastery at a glance.

---

## 2026-04-26 — App Rebranding: Lexicon/Smritikosha → Nexora

**What:** Renamed app to Nexora. Updated page title, login screen, sidebar logo, and all documentation.

**Why:** User requested a fresh, modern name that is easier to pronounce and remember.

**Impact:** All visible branding refreshed. User experience remains unchanged.

---

## 2026-04-28 — Batch AI Tile Preview & Multi-Source Word Enrichment

**What:** Replaced per-word Free Dictionary API calls in image scan with single batch Gemini call. New `_saveWordWithEnrichment` function saves immediately with AI seed, then enriches async (Free Dict → Wordnik → Gemini). Added `dataSources[]` field to track contributing APIs. Removed alert popups on word accept.

**Why:** Old image scan was wasteful—called Free Dictionary once per word for preview, then again on accept. Single batch Gemini call for preview is faster; enrichment happens in background without blocking UI.

**Impact:** Reduced API call count significantly. Faster tile preview and word acceptance. No alert popups. Full data source transparency.

**Technical Detail:** `_saveWordWithEnrichment()` saves with cached AI data, then async enrichment via Free Dict → Wordnik → Gemini gap-fill. `_mergeWordSources()` merges multiple sources with dedup.

---

## 2026-04-27 — Rich Image-Scan Popup with Tiles, Definitions, Difficulty System

**What:** Redesigned image vocabulary scan popup to display extracted words as styled tiles with async-fetched definitions. Added difficulty scoring system (Easy/Medium/Hard/Very Hard). Two labelled sections ("📖 Underlined Words" / "✨ AI-Suggested Words") separated by divider.

**Why:** Previous scan listed words as plain text with no enrichment. Users couldn't see definitions before accepting. No difficulty metadata for prioritization.

**Impact:** Image scanning shows full dictionary definitions before acceptance. Difficulty badges provide visual cues for study planning.

**Technical Detail:** New CSS classes for tiles and difficulty badges. `_fetchTileDefinition()` async helper fetches Free Dict and computes difficulty via `_scoreDifficulty()`.

---

## 2026-04-27 — Docs: Add PRD and Reformat PRD Analysis with Proper Markdown

**What:** Added `PRD.md` (new product requirements document) and reformatted `PRD_analysis.md` with proper markdown structure (headers, tables, lists).

**Why:** `PRD_analysis.md` had plain text tables that didn't render; `PRD.md` was missing.

**Impact:** Project documentation is now complete and readable in any markdown viewer.

---

## 2026-04-26 — Fix: Show Real API Error Instead of Silent "No Words Found" on Image Scan

**What:** Fixed error handling in image processing functions. Previously when API returned error with HTTP 200, app silently fell back to empty arrays and displayed "No words found."

**Why:** User reported image upload always returned "no words" despite the prompt working. Root cause was API hitting free-tier quota; secondary cause was app not checking `data.error`.

**Impact:** Image scanning now shows the actual API error instead of silently failing. Users get actionable feedback.

---

## 2026-04-26 — Feat: Secure Gemini API Key via Cloudflare Worker Proxy

**What:** Removed hardcoded `GEMINI_API_KEY` from client-side HTML. Replaced all 4 direct Gemini API fetch calls with calls to a Cloudflare Worker proxy endpoint. API key now stored securely as Cloudflare Worker secret.

**Why:** Hardcoded API key was being detected and restricted by Google. Key was discoverable in browser DevTools, causing quota abuse flags. Moving to Cloudflare ensures it never reaches the client.

**Impact:** API key is now secured behind server-side proxy. All Gemini-powered features work reliably without quota abuse risk.

---

## 2026-04-25 — Refactor: Replace Anthropic with Gemini Flash, Hardcode API Key

**What:** Replaced all Anthropic/Claude Haiku API calls with Gemini 1.5 Flash across 4 fetch sites (word enrichment, distractor generation, image scanning, image vocab modal enrichment). Removed API key input fields from UI.

**Why:** User requested app work out-of-the-box without manual API key entry. Unified all AI calls under single provider (Gemini) to simplify maintenance.

**Impact:** App fully functional without users entering any API keys. Reduced cognitive load and improved first-time UX.

**Technical Detail:** `_haikuEnrichWord()` replaced with Gemini fetch; function signature unchanged. `_callAnthropicDistractors()` replaced with Gemini fetch; fallback preserved.

---

## 2026-04-25 — Feat: Word Preview Before Saving and Image Vocab Review Modal

**What:** Generate flow now shows AI Preview card with fetched definition before saving. Image + Vocab opens popup modal with all extracted words (underlined + AI-suggested) with per-word Accept/Edit/Decline buttons.

**Why:** Typing a word and clicking Generate added it immediately without showing definition. Attaching image showed generic placeholder instead of actual extracted words.

**Impact:** Users can now review word definitions before accepting them. Image scans fully functional with clean review modal.

---

## 2026-04-25 — Fix: Onboarding Funnel Bug Fixes (5 Issues)

**What:** Fixed five bugs: (1) Step 2 disappeared post-animation (missing `active` class), (2) profile name/goal fields never injected into HTML, (3) swipe gesture fired on diagonal scrolls, (4) hint height hardcoded at 80px, (5) progress label had no clamp on step count.

**Why:** Haiku audit surfaced critical and medium bugs breaking step navigation and silently swallowing profile data.

**Impact:** Step 2 stays visible. Sidebar correctly shows user's name and goal. Tour no longer skips on scroll. Hints position correctly near viewport edges.

---

## 2026-04-24 — Feat: Redesign User Onboarding Experience

**What:** Overhauled all onboarding—Profile Setup (animated progress bar, gradient icons, goal validation with shake, directional slides), Welcome Tour (4 CSS-animated hero illustrations per slide), and Onboarding Completion (serif typewriter ceremony, word-by-word definition stagger, Day 1 streak badge).

**Why:** User requested premium, design-elevated onboarding. Existing flow used basic emoji icons and step dots with no animation.

**Impact:** First-time users experience warm, premium onboarding matching the app's literate aesthetic. Mobile users get bottom-sheet layouts.

**Technical Detail:** New CSS keyframes for animations (slide, flip, cascade, typewriter, etc.). Goal data now surfaces in UI via `applyProfileToUI()`.

---

## 2026-04-23 — Bug Fixes: Null-Safety, Async Race Conditions, Timer Leaks (Issues #16–#29)

**What:** Fixed 19 bugs across three passes: null-safety in dictionary waterfall and word modal; async race conditions in quiz navigation and stats filter; auto-flip timer leaks; undefined values in Wordnik usage array; `w.opposites` null crash; quiz distractors stored at wrong index.

**Why:** Three sequential Haiku 4.5 reviews surfaced crashes when API responses were empty, modal missing from DOM, quiz navigation firing before async loads, stats accessing nonexistent fields, and background timers firing after modal close.

**Impact:** Word addition, quiz flow, and stats view no longer crash under edge-case data. Quiz options always fully loaded before display. Timer state properly managed across sessions.

**Technical Detail:** Guards added throughout: `if (!data || !data.length)` in fetch paths, `(array || [])` null checks, `clearAutoFlipTimer()` called before state resets, captured index snapshot in async blocks to avoid race conditions.

---

## 2026-04-23 — Dictionary Waterfall + AI Gap-Fill + Web Speech Audio Fallback

**What:** Replaced single-tier Free Dictionary API call with 4-tier waterfall: (1) Free Dictionary API, (2) Wordnik fallback, (3) Claude Haiku 4.5 gap-fill for missing IPA/definition/usage, (4) Web Speech API audio fallback at playback time.

**Why:** Core vocabulary and obscure words often returned incomplete data (missing IPA, no audio, vague definition). Waterfall progressively enriches each word at near-zero cost.

**Impact:** Words receive IPA phonetics, audio, and usage examples from best available source. All words gain Web Speech API pronunciation even without stored URL.

**Technical Detail:** `addWords()` refactored with `_parseFreeDictEntry()`, `_fetchWordnik()`, `_haikuEnrichWord()` helpers. Audio button: uses URL if present, else `speechSynthesis.speak()`.

---

## 2026-04-23 — Dropdown Clipping Fix & AI Image Word Review UI

**What:** Fixed `+` file-attach button dropdown being clipped by parent overflow. Upgraded "Scan Page" image flow from `window.confirm()` dialog to full in-modal word review UI with two toggleable chip sections.

**Why:** Dropdown cut off at `.add-section-card` boundary due to `overflow: hidden`. Old confirm dialog gave no control over word selection. User wanted to accept/reject individual words and receive AI-suggested hard words beyond underlined ones.

**Impact:** Dropdown renders fully visible. Scan flow shows underlined and up to 8 AI-suggested hard words as toggleable chips. Users can deselect any word before adding.

**Technical Detail:** `.file-dropdown` changed from `position: absolute` to `position: fixed` with z-index 9999. Gemini prompt updated to return `{underlined_words, suggested_words}`.

---

## 2026-04-22 — M3 Warm/Gamified Design Implementation

**What:** Applied complete Material Design 3 warm/gamified aesthetic (inspired by Duolingo, Brainscape). Replaced all fonts with Plus Jakarta Sans. Converted dark sidebar to white with green-tinted gradient. Added emerald pill-shaped nav with SVG icons. Redesigned cards with 14px radius and color-coded left borders (green/amber/red). Updated buttons to pill-shaped with emerald primary and drop-shadow.

**Why:** To create engaging, gamified, visually cohesive user experience encouraging learning through warm colors and playful design language.

**Impact:** App now feels modern, cohesive, and premium. Warm palette and M3 design make vocabulary learning feel more rewarding.

**Technical Detail:** Palette includes #FFF7ED (warm bg), #10B981 (emerald), #F59E0B (amber), #EF4444 (red). All components updated to M3 specifications.

---

## 2026-04-21 — Per-User Data Isolation & Sample Decks for All Users

**What:** Fixed demo deck seeding for logged-in users: `seedDemoData` now guest-only. New `mergeDemoDataForUser()` merges demo decks after `pullFromCloud` without overwriting real data (triggered once via `nexora_demo_seeded` flag). Added delete button for every sidebar deck; deletion moves items to first remaining deck instead of hardcoded General.

**Why:** Users wanted example decks even after signing in. Previous approach meant existing users never got demo content.

**Impact:** All users (guest and signed-in) see curated example decks. Any deck can be deleted without data loss.

**Technical Detail:** `mergeDemoDataForUser()` with per-account guard flag. Library grid renders 2 columns of cards with preview content and deck badge.

---

## 2026-04-21 — GitHub Push Process & Project Conventions

**What:** Added `CLAUDE.md` documenting mandatory 3-step GitHub workflow (commit → create issue → close issue) and curl-based GitHub API approach (gh CLI not installed).

**Why:** To establish repeatable, documented process for pushing code without relying on third-party CLI tools.

**Impact:** Future development sessions have clear, copy-paste-ready workflow for all GitHub interactions.

---

## 2026-04-21 — Example Decks with Full Content & Complete Library Rename

**What:** Seeded 4 example decks for first-time guests: "Atomic Habits", "How to Avoid a Climate Disaster", "The Alchemist", "Class 10 Science" (each with 6–7 notes, 7 flashcards, 6–7 vocab items). Renamed "All Words" to "Complete Library" across 5 locations.

**Why:** To give new users immediate, engaging content and reduce blank-slate friction.

**Impact:** First-time users see rich, pre-populated library with diverse learning material. Complete Library branding is more descriptive and premium.

---

## 2026-04-21 — Enforce Per-User Data Isolation & Clear Guest State

**What:** Removed un-namespaced localStorage reads at init and sign-out. Reset all in-memory arrays on sign-out. Clear guest keys on sign-out. Migrate guest-created data into user's UID namespace on first login. Firestore rules enforce server-side access control.

**Why:** Previous sessions leaked data between different email accounts on same browser because localStorage was not namespaced.

**Impact:** Multi-user security now enforced. Guest data no longer persists between sessions and doesn't leak to logged-in users.

---

## 2026-04-20 — Single-Page Layout Restructure & Notes/Deck Pivot

**What:** Replaced tab-based navigation with single scrollable main page. Renamed "Projects" to "Decks". Added sidebar Practice section. Introduced Library grid combining all content types (Vocab, Notes, Flashcards). Added Notes as first-class content type. Added Add Section card with type pills, file attachment, and AI preview flow.

**Why:** Tab layout was limiting. Single-page approach with unified Library makes all content types accessible at a glance. User pivoted app's purpose to full note-taking + flashcards + vocab platform.

**Impact:** Main area is single scrollable page. Flashcards, Quiz, Stats accessed via "Practice" overlay. Library has filter pills: All/Notes/Flashcards/Quizzes/Vocab. Generate → shows per-type AI preview.

---

## 2026-04-09 — Performance Optimization & Optimistic UI

**What:** Implemented parallel fetching for core data and migrated auth handler to "Optimistic UI" pattern (cache first, sync in background).

**Why:** To eliminate long loading screens caused by sequential network requests.

**Impact:** Application startup is now near-instant. Users see data immediately from cache while cloud sync happens silently.

---

## 2026-04-09 — Firebase Google Authentication

**What:** Integrated Firebase Authentication with Google Sign-In using script-tag CDN. Established functional login/logout flow.

**Why:** To enable user-specific data persistence and progress tracking across devices.

**Impact:** Transitioned from local-only to cloud-authenticated ecosystem. Users can securely identify via Google.

---

## 2026-03-30 — UI Restructure & Sidebar Navigation

**What:** Reorganized application with ChatGPT-inspired dark sidebar for project management. Unified vocabulary loading to support core files and custom localStorage projects. Implemented "All Words" global view.

**Why:** To improve navigation and organization with professional, sidebar-based layout similar to modern AI chat interfaces.

**Impact:** Enhanced project organization and premium, scalable user interface. Users seamlessly switch between specific decks and holistic "All Words" view.

---

## 2026-03-25 — Project Organization System

**What:** Introduced `projects.json` for metadata and scoped `localStorage` keys (e.g., `nexora_perf_{projectId}`) for project-specific performance tracking.

**Why:** User wanted to categorize vocabulary by book or topic without mixing results and statistics.

**Impact:** Multiple isolated study paths within same application, enabling focused learning on specific texts.

---

## 2026-03-17 — Separating Quiz Words

**What:** Split vocabulary file into `vocabulary.json` (core dictionary) and `quiz_words.json` (additional for testing). Modified loading logic to merge for quizzes but keep dictionary clean.

**Why:** To keep main dictionary focused on primary words while allowing broader vocabulary for practice.

**Impact:** Cleaner dictionary UI and more diverse quiz content.

---

## 2026-03-14 — Project Inception

**What:** Initial creation of Flashcards app with `vocabulary.json` (Source of Truth) and interactive study modes (Flashcards, Quiz).

**Why:** User needed personal tool to track and study new English words.

**Impact:** Established functional, local-first vocabulary learning platform with persistent progress tracking.
