# Nexora — Full UI/UX Redesign Plan

**Role:** Senior UI/UX Designer  
**File to edit:** `Flashcards_app_project/app.html` (~5800 lines)  
**Scope:** Full visual overhaul  
**Design direction:** Linear (speed, keyboard-first, minimal chrome) × Readwise/Matter (calm, reading-focused, editorial typography)

---

## Context

The app has strong bones but two core UX failures:
1. **No reason to return** — no daily queue widget, streak means nothing, no "what do I do today"
2. **Adding content is clunky** — the inline Add Section with type pills + textarea + toolbar is visually noisy and unclear in its flow

PRD_analysis.md also documents two bugs:
- Scroll position resets to top after adding a vocab/note
- No obvious UI to create a standalone note or flashcard card from within the library

The redesign must feel like a product a reader would be proud to use daily — calm, fast, beautiful. Not loud or gamified.

---

## Design Principles

1. **Content-first:** The interface fades away during study. Words are the hero, not the chrome.
2. **Keyboard-native:** Every core action has a shortcut. Mouse is optional.
3. **Warm intelligence:** The warmth stays (cream, amber, emerald) but is applied with restraint. Only 1–2 accent colors per view.
4. **Calm feedback:** Micro-animations confirm actions without interrupting flow. No celebration mid-session.
5. **One clear next action:** Every screen has one obvious primary CTA. No competing calls-to-action.

---

## 1. Token System (CSS Custom Properties)

Replace the current `:root` block entirely. Introduce a `[data-theme="dark"]` block.

### Light Mode (`:root`)
```css
/* Backgrounds */
--bg:        #FDFAF6;   /* slightly lighter/cleaner than current #FFF7ED */
--bg-2:      #F5F0E8;
--surface:   #FFFFFF;   /* cards, modals */
--surface-2: #F9F6F1;   /* subtle elevated surface */

/* Sidebar */
--sidebar-bg: #FFFFFF;
--sidebar-border: #EDE8E0;

/* Text */
--text:    #1A1612;   /* warm near-black */
--muted:   #6E6660;
--muted-2: #A09890;

/* Borders */
--border:   #EDE8E0;
--border-2: #E0D8CE;

/* Brand accents (keep existing hues) */
--emerald:     #10B981;
--emerald-50:  #ECFDF5;
--emerald-100: #D1FAE5;
--emerald-700: #047857;
--amber:       #F59E0B;
--amber-50:    #FFFBEB;
--amber-100:   #FEF3C7;
--red:         #EF4444;
--red-50:      #FEF2F2;
--red-100:     #FEE2E2;
--purple:      #8B5CF6;   /* SM-2 Lapsed state */
--purple-50:   #F5F3FF;

/* SM-2 State colors */
--state-new:      #EF4444;  /* red */
--state-learning: #F59E0B;  /* amber */
--state-review:   #10B981;  /* emerald */
--state-lapsed:   #8B5CF6;  /* purple */

/* Typography */
--font-sans:  'Plus Jakarta Sans', system-ui, sans-serif;
--font-serif: Georgia, 'Times New Roman', serif;  /* for vocab words only */

/* Shadows */
--shadow-card:  0 2px 8px rgba(26, 22, 18, 0.07);
--shadow-modal: 0 20px 48px rgba(26, 22, 18, 0.14);
--shadow-float: 0 8px 24px rgba(26, 22, 18, 0.12);
```

### Dark Mode (`[data-theme="dark"]`)
```css
--bg:        #141210;   /* warm dark — NOT cold gray */
--bg-2:      #1C1A17;
--surface:   #221F1A;
--surface-2: #2A2620;

--sidebar-bg:     #1C1A17;
--sidebar-border: #2E2A26;

--text:    #F0EBE3;   /* warm off-white */
--muted:   #9E9489;
--muted-2: #6B6460;

--border:   #2E2A26;
--border-2: #383330;

--emerald:     #34D399;  /* brighter in dark */
--emerald-50:  rgba(52, 211, 153, 0.12);
--emerald-100: rgba(52, 211, 153, 0.2);
--emerald-700: #6EE7B7;
--amber:       #FCD34D;
--amber-50:    rgba(252, 211, 77, 0.12);
--amber-100:   rgba(252, 211, 77, 0.2);
--red:         #F87171;
--red-50:      rgba(248, 113, 113, 0.12);
--red-100:     rgba(248, 113, 113, 0.2);
--purple:      #A78BFA;
--purple-50:   rgba(167, 139, 250, 0.12);

--shadow-card:  0 2px 8px rgba(0, 0, 0, 0.25);
--shadow-modal: 0 20px 48px rgba(0, 0, 0, 0.5);
--shadow-float: 0 8px 24px rgba(0, 0, 0, 0.35);
```

**Implementation:** Add `data-theme` to `<html>`. Toggle via JS: `document.documentElement.dataset.theme = 'dark'`. Persist in `localStorage('nexora_theme')`. On load, read system preference as default: `window.matchMedia('(prefers-color-scheme: dark)').matches`.

---

## 2. Typography Changes

Keep **Plus Jakarta Sans** for all UI. Add **serif** for vocabulary words only.

| Element | Current | New |
|---|---|---|
| Vocab word (library card) | 17px, 800, sans | 18px, 700, **serif** (Georgia) |
| Vocab word (modal) | 1.8rem, 800, sans | 2rem, 400, **serif** — more editorial |
| Flashcard word (front) | 2.6rem, 800, sans | 2.8rem, 400, **serif** — Readwise feel |
| Definition text | 15px, 500, sans | 15px, 400, sans, line-height 1.7 |
| Card labels / pills | 11px, 700, 0.08em | 11px, 600, 0.06em — slightly less aggressive |
| Sidebar deck names | 13px, 600 | 13.5px, 500 — calmer weight |
| Section labels | uppercase, 11px | uppercase, 10.5px, 0.1em — more refined |

---

## 3. Sidebar Redesign

**Width:** 240px → 220px (slightly tighter, calmer)  
**Background:** Keep white + F0FDF4 gradient, but in dark mode use `--sidebar-bg`

### New Structure (top to bottom):
```
┌─────────────────────────────┐
│  [N]  Nexora               │  ← logo (smaller mark, 28px)
│                             │
│  ┌─────────────────────┐    │
│  │  🔥 8 cards due     │    │  ← NEW: Daily Queue Badge
│  │  Start Review →     │    │     emerald bg, rounded 12px
│  └─────────────────────┘    │     hidden when 0 cards due
│                             │
│  LIBRARY ─────────────      │  ← section label
│  ○ All Decks                │
│  · Atomic Habits       ●●●○ │  ← deck + mastery dots (4 dots)
│  · GRE Prep            ●○○○ │
│  + New Deck                 │
│                             │
│  PRACTICE ─────────────     │
│  ⚡ Flashcards              │
│  ❓  Quiz                   │
│  📊  Progress               │
│                             │
│  ─────────────────────      │
│  ☀ / ☾  Light / Dark       │  ← NEW: theme toggle
│  ?  Help & Guide            │
│                             │
│  [avatar]  Suraj            │  ← profile (bottom)
└─────────────────────────────┘
```

**Daily Queue Badge (new):**
- Only shown when `dueCount > 0`
- Background: `var(--emerald-50)`, border: `var(--emerald-100)`
- Text: "🔥 {n} cards due today" (14px, 700)
- Below text: small "Start Review →" link (12px, emerald)
- Dark mode: `var(--emerald-50)` (rgba version)
- On click: opens flashcard practice overlay in SM-2 review mode

**Mastery dots (new):**
- 4 small dots (8×8px circles) next to each deck name
- Filled dots = mastery quartile. 1 dot = 0–25%, 4 filled = 75–100%
- Color: `--emerald` filled, `--border-2` empty
- On hover: show tooltip "42% mastered"

**Dark mode toggle:**
- Position: above Help, below Practice section separator
- Toggle: `☀` (light active) or `☾` (dark active)
- Smooth 200ms transition on all color tokens

---

## 4. Main Area — Header + Search

**Add a persistent search bar to the deck header:**

```
┌─────────────────────────────────────────────────────────────────┐
│  · Atomic Habits   (47 items)          [⌘K  Search...]  [+ Add]│
└─────────────────────────────────────────────────────────────────┘
```

- Header stays sticky
- Search `[⌘K Search...]` is a ghost input that triggers the command palette on click or Cmd+K
- `[+ Add]` button replaces the old inline add section — opens the Add Modal (Cmd+N)
- Remove the inline `.add-section-card` from the main scroll area entirely (this is the biggest UX win)

---

## 5. Daily Review Queue Widget

Shown at the top of the main scroll area **only** when `dueCount > 0` and user has not started the session:

```
┌────────────────────────────────────────────────────────────┐
│  🔥  8 cards due today                         [✕ dismiss] │
│  3 new  ·  4 review  ·  1 lapsed                          │
│                                                            │
│  ████████████░░░░░░░░  Progress bar (if session started)  │
│                                                            │
│                               [Start Review →]            │
└────────────────────────────────────────────────────────────┘
```

- Background: `var(--emerald-50)`, border: `1px solid var(--emerald-100)`, border-radius: 16px
- Dark mode: `var(--emerald-50)` (rgba emerald tint)
- New/review/lapsed counts in small muted pills
- `[Start Review →]` is the only CTA — opens practice overlay in SM-2 mode
- `[✕]` dismisses for this session (stores in sessionStorage)
- If user has started a session and navigated away: shows progress bar + "Continue Review →"

---

## 6. Library Card Redesign

**Remove:** SVG score ring (too complex to read at a glance)  
**Keep:** Color-coded 4px left border  
**Add:** SM-2 state pill at card bottom + due date indicator

### New Vocab Card Structure:
```
┌─ [emerald border] ──────────────────────┐
│  serendipity              [GRE Prep ×]  │  ← word (serif) + deck badge
│  /ˌser.ənˈdɪp.ɪ.ti/                    │  ← IPA (12px, muted)
│                                         │
│  the occurrence of events by chance     │  ← definition (2-line clamp)
│  in a happy or beneficial way...        │
│                                         │
│  [● Review]  [Due in 3d]  [85%]  [▶]  │  ← state pill + due + score + review btn
└─────────────────────────────────────────┘
```

**SM-2 state pill colors:**
- `● New` → red dot + "New" text
- `● Learning` → amber dot
- `● Review` → emerald dot + "Due in Xd"
- `● Lapsed` → purple dot

**Accuracy badge:** Replace SVG ring with plain text `85%` (13px, 700, color matches mastery level)

**Review button:** Small icon-only button (`▶`) that opens the word modal. On hover reveals "Review" label.

### Note Card:
- Keep indigo left border
- Remove title/content clutter — show first line of content as preview (italic, muted)
- Show `edited Xd ago` timestamp (12px, muted-2)

### Flashcard Card:
- Keep amber left border
- Show front text (bold) / back text (muted, truncated)
- Show SM-2 state pill same as vocab cards

---

## 7. Add Modal (Cmd+N replaces inline Add Section)

**Trigger:** Click `[+ Add]` in header, or press Cmd+N anywhere  
**Design:** Centered modal, max-width 480px, backdrop blur

```
        ┌───────────────────────────────────────┐
        │  Add to Atomic Habits              ✕  │
        │                                       │
        │  ┌───────────────────────────────┐    │
        │  │ Type a word or phrase...      │    │  ← autofocused
        │  └───────────────────────────────┘    │
        │                                       │
        │  [ ● Vocab ]  [ Note ]  [ Flashcard ] │  ← type pills
        │                                       │
        │  ── When Vocab is selected: ─────── ─ │
        │  Context sentence  (optional)         │
        │  ┌───────────────────────────────┐    │
        │  │ e.g. "from Chapter 4..."      │    │
        │  └───────────────────────────────┘    │
        │                                       │
        │  ── When Note is selected: ────────── │
        │  Title + content fields               │
        │                                       │
        │  ── When Flashcard is selected: ───── │
        │  Front field + Back field             │
        │                                       │
        │  📎 Attach image                      │
        │                                       │
        │  [Generate →]              [Cancel]   │
        └───────────────────────────────────────┘
```

**Behaviour:**
- Opens with `Vocab` type pre-selected
- Type pills switch the form fields below (JS `show/hide` pattern)
- Context sentence only shown for Vocab type
- Front/Back fields shown for Flashcard type
- Note shows title + rich textarea
- `Generate →` triggers existing `handleGenerate()` logic — no change to JS logic
- Keyboard: `Escape` = cancel, `Cmd+Enter` = generate
- On accept/save: modal closes, library re-renders, **scroll position preserved** (see Bug Fix #1)
- Deck selector is a small dropdown inside the modal header (next to "Add to...")

**Image attach:** The `📎` icon opens a file picker. If an image is attached, the word field label changes to "Or describe what to extract..." and the Generate button triggers image scan flow.

---

## 8. Command Palette — Search (Cmd+K)

Triggered by Cmd+K or clicking the search ghost input in the deck header.

```
        ┌───────────────────────────────────────┐
        │  🔍  Search everything...             │  ← autofocused
        ├───────────────────────────────────────┤
        │  VOCAB                                │
        │  serendipity  ·  Atomic Habits   [→]  │
        │  ephemeral    ·  GRE Prep        [→]  │
        │                                       │
        │  NOTES                                │
        │  Chapter 4 Summary  ·  Atomic Habits  │
        │                                       │
        │  FLASHCARDS                           │
        │  What is habit stacking?              │
        └───────────────────────────────────────┘
```

- Results update as user types (fuzzy match on word/title/definition)
- Arrow keys navigate, Enter opens the item
- `Escape` closes
- Show type icon (📚 vocab, 📝 note, 🃏 card) before each result
- Max 5 results per section, "See all 12 →" link if more

---

## 9. Flashcard Practice — Improvements

**Typography:** Make the word on the card front use `var(--font-serif)` — this is the biggest "feel" change. Calm, editorial, like reading a dictionary.

**Keyboard hints (new):** Show subtle keyboard shortcuts below the card:
```
  [Space] to flip  ·  [1] Need Practice  ·  [2] Got It
```
(10px, muted-2, centered — disappears after first use)

**Context sentence on card back:** Show below the definition in a warm-tinted block:
```
┌──────────────────────────────────────────────┐  ← flip back
│  the occurrence of events by chance...       │  ← definition
│                                              │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│   "...a moment of serendipity in Chapter 4"  │  ← context sentence
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │     italic, amber-50 bg
└──────────────────────────────────────────────┘
```

**After rating:** Show small "Next review: in 3 days" toast below the action buttons (1.5s, then fade). This makes the SM-2 scheduling visible and builds trust.

**Progress bar:** Make it taller (6px instead of 4px) and animate the fill smoothly.

---

## 10. Word Modal — Improvements

**Word heading:** Switch to `var(--font-serif)`, 2rem, weight 400 — more like a dictionary entry

**IPA + audio on same line:** `  /ˌser.ənˈdɪp.ɪ.ti/  [▶ Play]`

**Context sentence section (new):** Add a new section between "Usage Examples" and "Synonyms":
```
  From your notes
  "...a moment of serendipity in Chapter 4..."
```
Only shown if the word has a stored context sentence.

**SM-2 state badge in modal header:** Next to the word type badge, show `[● Review · Due in 3d]`

---

## 11. Bug Fixes

### Bug 1: Scroll position resets after adding content
**Location:** `renderLibrary()` and any function that calls it after an add action  
**Fix:** Before re-render, save `const scrollTop = document.querySelector('.main-scroll-area').scrollTop`. After render, restore: `document.querySelector('.main-scroll-area').scrollTop = scrollTop`.

### Bug 2: No UI to create standalone note or flashcard
**Fix:** The new Add Modal (Cmd+N) handles this. Type pills let the user select Note or Flashcard. The old Add Section card was the only entry point and it was confusing. The `[+ Add]` button in the header + Cmd+N shortcut make both creation paths discoverable.

---

## 12. Guest Save Prompt

When a guest user has added ≥ 1 item, show a persistent bottom banner:

```
┌──────────────────────────────────────────────────────────┐
│  💾  You have 7 words saved locally.    [Sign in to keep] │
└──────────────────────────────────────────────────────────┘
```

- Position: `fixed`, bottom: 0, full width
- Background: `var(--amber-50)`, border-top: `1px solid var(--amber-100)`
- `[Sign in to keep]` button: amber pill, opens auth flow
- Dismissible with ✕ (stores in sessionStorage, re-appears next session)
- Count updates live as user adds more items

---

## 13. Dark Mode Toggle

**Location:** Sidebar, above Help & Guide, below Practice section divider  
**HTML:** `<button id="themeToggleBtn" class="theme-toggle-btn">☀ Light</button>`  
**Behaviour:**
```js
const root = document.documentElement;
const saved = localStorage.getItem('nexora_theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = saved || (prefersDark ? 'dark' : 'light');
root.dataset.theme = theme;

function toggleTheme() {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('nexora_theme', next);
  updateToggleLabel();
}
```
- Label: "☀ Light" when in dark mode (click to switch to light), "☾ Dark" when in light mode
- Transition: add `transition: background 0.2s, color 0.2s` to `body, aside, .modal, .lib-list-card` etc.

---

## 14. Onboarding Simplification (per PRD_analysis)

**Goal:** First word added within 2 minutes. Current flow is too long.

**New flow:**
1. Login (unchanged)
2. Profile Step 1: Name only (pre-filled from Google). No goal selection yet. "Continue →" in 10 seconds.
3. **Skip Step 2** (daily target, age, city) → move to Settings later
4. Library opens. Show inline prompt overlaid on library: **"Add your first word to get started →"** pointing to the `[+ Add]` button
5. After first word saved: first-word ceremony overlay (unchanged — it's good)
6. After ceremony: offer tour (2 slides max, not 4)

**Remove from profile setup:** Goal chips, step 2 optional fields. Move to a "Settings" link in the profile section.

---

## 15. Implementation Order (Phased)

### Phase 1 — Token system + Dark mode (foundation, ~2 hours)
1. Replace `:root` block with new tokens
2. Add `[data-theme="dark"]` block  
3. Apply `var(--bg)`, `var(--surface)`, `var(--text)` etc. across all existing CSS rules that use hardcoded colors
4. Add dark mode toggle button + JS
5. Add `data-theme` to `<html>`

### Phase 2 — Sidebar + Header (visible impact, ~1.5 hours)
1. Reduce sidebar width to 220px
2. Add Daily Queue Badge (hidden when dueCount=0, shown when >0)
3. Add mastery dots next to deck names
4. Add dark mode toggle in sidebar
5. Redesign deck header: add `[⌘K Search...]` ghost input + `[+ Add]` button
6. Remove inline `.add-section-card` from main scroll area

### Phase 3 — Add Modal (Cmd+N) (~2 hours)
1. Build `#addModal` HTML with type pills, context sentence field, note fields, flashcard fields
2. Build `openAddModal()` / `closeAddModal()` JS
3. Wire Cmd+N and the `[+ Add]` button
4. Route `handleGenerate()` to work from modal context (not inline add section)
5. On save: close modal, restore scroll position (Bug Fix #1)

### Phase 4 — Library Card Updates (~1.5 hours)
1. Update vocab card HTML: serif word, IPA line, SM-2 state pill, accuracy text badge (remove SVG ring)
2. Update note card: italic preview, timestamp
3. Update flashcard card: front/back preview, SM-2 pill
4. Add SM-2 state computation in `renderLibrary()` (reads `dueDate`, `state` from word data)

### Phase 5 — Search Command Palette (Cmd+K) (~1.5 hours)
1. Build `#searchModal` HTML
2. Build `openSearch()` / fuzzy search across `ALL_VOCAB`, `ALL_NOTES`, `nexora_custom_cards`
3. Wire Cmd+K + ghost input click
4. Keyboard navigation (arrow keys + enter)

### Phase 6 — Daily Review Queue Widget (~1 hour)
1. Build `#reviewQueueWidget` HTML above library
2. Show/hide based on `getDueCount()` (reads SM-2 dueDate from word records)
3. Wire "Start Review →" to practice overlay in SM-2 mode

### Phase 7 — Flashcard + Modal improvements (~1 hour)
1. Switch flashcard word to serif font
2. Add keyboard hints below card (hidden after first use)
3. Add context sentence block on card back
4. Add "Next review: in X days" post-rating toast
5. Update word modal: serif heading, context sentence section, SM-2 badge

### Phase 8 — Fixes + polish (~1 hour)
1. Guest save banner
2. Onboarding simplification (remove Step 2, shorten tour to 2 slides)
3. Typography refinements (letter-spacing, line-height pass)
4. Transition animations on theme switch

---

## 16. Critical Files

| File | What changes |
|---|---|
| `Flashcards_app_project/app.html` | All CSS and HTML changes; all JS additions |

All changes are contained in the single `app.html` file. No new files needed.

---

## 17. Verification Checklist

- [ ] Open app in light mode: warm cream background, serif vocab words, no inline add card visible
- [ ] Toggle dark mode: all surfaces switch to warm dark, no hardcoded white/gray remains
- [ ] Press Cmd+N: Add Modal opens, autofocused, type pills work, Escape closes
- [ ] Add a vocab word via modal: modal closes, library refreshes, scroll position preserved
- [ ] Press Cmd+K: search palette opens, typing returns results, Enter navigates to item
- [ ] Visit app with cards due (mock `dueDate` = yesterday): queue widget visible in main area and sidebar badge shows count
- [ ] Click "Start Review →": flashcard practice opens, word is in serif, context sentence shows on back
- [ ] Rate a card: "Next review: in 3 days" toast appears below buttons
- [ ] Guest mode + add 1 word: bottom banner appears with "Sign in to keep" CTA
- [ ] Open a deck: mastery dots appear in sidebar next to that deck name
- [ ] Mobile simulation (DevTools): layout should not break (even pre-responsive, should be usable at 768px)
