# Nexora — Code Map

> Auto-generated section index for app.html. Use `grep -n "@@SECTION: Name"` to jump to any section.

## How to use
1. Find the section name below for the feature you need to change.
2. Run: `grep -n "@@SECTION: SectionName" app.html` to get the line number.
3. Read only that section (typically 100–300 lines) rather than the full file.

## Sections

| Section | Marker | Line | Description |
|---|---|---|---|
| **HTML/CSS** | | | |
| Styles (global CSS) | `StylesGlobal` | 66 | All CSS for the app (colors, layout, animations, media queries, mobile responsiveness, Command-Center overrides) |
| Login Screen | `LoginScreen` | 6027 | Login/signup UI and auth forms |
| Profile Setup | `ProfileSetup` | 6078 | Profile creation wizard (name, goal, target, demographics) |
| Welcome Tour Modal | `WelcomeTour` | 6157 | Interactive onboarding carousel (decks, cards) |
| Onboarding Complete Overlay | `OnboardCompleteOverlay` | 6191 | Celebration screen after profile setup completion |
| Help Panel | `HelpPanel` | 6206 | Help guide with tabs (Getting Started, Features, Tips, Tour replay) |
| Main App Container | `MainAppContainer` | 6227 | Root app div (sidebar + main, mobile overlay backdrop, hamburger btn) |
| Practice Overlay | `PracticeOverlay` | 6330 | Flashcard/quiz/stats practice UI (decks, cards, scoring, notes) |
| Main Page | `MainPage` | 6646 | Main library view (deck browser, search, add section, bottom nav) |
| Search Modal | `SearchModal` | 12756 | Cmd+K command palette (search vocab, notes, flashcards) |
| Add Modal | `AddModal` | 12769 | Modal for adding vocab/notes/flashcards to decks |
| **JavaScript – Core** | | | |
| Main Script Setup | `MainScript` | 7278 | Script block opener, Gemini proxy URL config |
| State Variables | `JSState` | 7283 | Global state (VOCAB, QUIZ_VOCAB, projects, currentUser, etc.) |
| Auth Helpers | `JSAuthHelpers` | 7305 | Helper functions (getPerfKey, loadPerf, shuffle, etc.) |
| Analytics | `JSAnalytics` | 7329 | Firebase analytics tracking (trackEvent) |
| Storage Layer | `JSStorage` | 7343 | localStorage and Firestore sync (lsGet, lsSet, syncToCloud, etc.) |
| **JavaScript – Onboarding** | | | |
| Onboarding | `JSOnboarding` | 7446 | Profile setup steps, tour navigation, completion ceremony |
| Help Panel Logic | `JSHelpPanel` | 7770 | Help tab content and interactions |
| Auth State Handler | `JSAuthStateHandler` | 7911 | Firebase auth state listener and user login flow |
| Login Functions | `JSLoginFunctions` | 8019 | Sign-in, sign-up, password reset UI and validation |
| **JavaScript – Data** | | | |
| Demo Data Seed | `JSDemoData` | 8188 | Seed data for new users (vocab, notes, custom cards) |
| Load from JSON | `JSLoadJSON` | 8221 | Load vocabulary from JSON files (vocabulary.json, quiz_words.json) |
| **JavaScript – UI & Modals** | | | |
| Dictionary | `JSDictionary` | 8984 | Render vocabulary grid with scores (dict view) |
| Modal Dialog | `JSModalDialog` | 9012 | Word detail popup (definition, usage, SM-2 badge, edit, delete) |
| AI Modal | `JSAIModal` | 9210 | Gemini AI modal for generating vocab from text/images |
| Vocab Preview | `JSVocabPreview` | 9331 | Preview definition before saving vocab word |
| Image Vocab Modal | `JSImageVocab` | 9357 | OCR/Gemini image scanning, word extraction and grid UI |
| **JavaScript – Cards & Practice** | | | |
| Custom Flashcards | `JSCustomFlashcards` | 9638 | Create and manage custom front/back flashcards |
| Flashcards | `JSFlashcards` | 9689 | Flashcard study mode (SM-2 rating, flip, keyboard shortcuts, toast) |
| Quiz | `JSQuiz` | 9991 | Quiz mode with multiple choice and difficulty levels |
| Stats | `JSStats` | 10226 | Performance stats (total, correct, accuracy per word) |
| **JavaScript – Navigation & Views** | | | |
| Flashcard Deck Selection | `JSFlashcardDeckSelection` | 10282 | Deck picker for practice (checkboxes, start practice) |
| Practice Overlay | `JSPracticeOverlay` | 10377 | Practice view switcher (flashcards/quiz/stats) |
| Notes Review | `JSNotesReview` | 10425 | Notes flip-card review mode (deck picker, navigation) |
| New Quiz System | `JSNewQuizSystem` | 10541 | Multiple choice quiz engine with wrong answer review |
| Vocab Practice (Flip) | `JSVocabPractice` | 10910 | Flip card vocab review mode (vocabulary.json words) |
| Library | `JSLibrary` | 10988 | Main library render (decks, vocab, notes, cards sections) |
| Library List View | `JSLibraryListView` | 11072 | Filtered list display (vocab, notes, flashcards) with SM-2 state pills |
| Detail Popup | `JSDetailPopup` | 11236 | Item detail view in list (flip for cards, edit, delete) |
| **JavaScript – Add Section & Management** | | | |
| Add Section | `JSAddSection` | 11332 | Add vocab/notes UI (text textarea, file uploads, type pills) |
| Deck Dashboard | `JSDeckDashboard` | 11555 | Deck home page (stats, section tiles, actions) |
| Notes | `JSNotes` | 11677 | Notes editor and list (create, edit, delete, search) |
| Add Modal | `JSAddModal` | 11758 | Advanced add modal (multi-select types, dual-group pills, review wizard) |
| Mobile Menu | `JSMobileMenu` | 12601 | Mobile sidebar drawer, bottom nav, responsive toggles |
| **JavaScript – Init** | | | |
| Init & Setup | `JSInit` | 12638 | App initialization, Firebase/auth integration, event listeners |

## Common Tasks

### Add a new vocab word to the collection
→ Look in **JSLoadJSON** (8221) to see how vocabulary is loaded and initialized, then check **JSStorage** (7343) to understand how to persist it.

### Change flashcard study mode behavior
→ Start with **JSFlashcards** (9689) for card flipping/SM-2 logic, **JSFlashcardDeckSelection** (10282) for deck picking, and **JSStats** (10226) for scoring.

### Add a new help section or onboarding step
→ Update **JSHelpPanel** (7770) for help tab content or **JSOnboarding** (7446) for profile/tour steps. Styling lives in **StylesGlobal** (66).

### Modify the modal for adding content
→ Check **JSAddModal** (11758) for the +Add modal flow (dual-group pill selection, review wizard), and **JSAddSection** (11332) for the simpler add section on the main page.

### Fix an image or AI feature
→ **JSImageVocab** (9357) handles OCR and Gemini image scanning. **JSAIModal** (9210) is the general AI modal. **JSVocabPreview** (9331) is for definition lookups.

### Change Firebase sync or auth behavior
→ **JSStorage** (7343) handles all cloud sync. **JSAuthStateHandler** (7911) handles login flows. **JSDemoData** (8188) seeds data for new users.

### Modify the search/command palette
→ **JSInit** (12638) wires the Cmd+K shortcut. The palette HTML is at **SearchModal** (12756). Search logic (openSearch, runSearch, renderSearchResults) lives in **JSAddModal** (11758).

### Modify Command-Center sidebar or board stats
→ CSS overrides live at the end of **StylesGlobal** (66). Board stats HTML is in **MainAppContainer** (6227). Population logic is in **JSLibrary** (10988).

---

## File Structure Overview

```
app.html
├── Head
│   ├── Firebase SDK (module)
│   ├── Theme init (inline script)
│   └── StylesGlobal (CSS)
├── Body
│   ├── LoginScreen
│   ├── ProfileSetup
│   ├── WelcomeTour
│   ├── OnboardCompleteOverlay
│   ├── HelpPanel
│   ├── MainAppContainer (sidebar + main)
│   │   ├── Sidebar (profile, nav, theme, mastery dots)
│   │   └── Main Content
│   │       ├── PracticeOverlay (flashcards/quiz/stats)
│   │       └── MainPage (library home)
│   ├── SearchModal (Cmd+K command palette)
│   └── AddModal (+ Add dialog)
└── MainScript (all JavaScript)
    ├── State & Config
    │   ├── JSState
    │   ├── JSAuthHelpers
    │   ├── JSAnalytics
    │   └── JSStorage
    ├── Onboarding & Auth
    │   ├── JSOnboarding
    │   ├── JSHelpPanel
    │   ├── JSAuthStateHandler
    │   └── JSLoginFunctions
    ├── Data Loading
    │   ├── JSDemoData
    │   └── JSLoadJSON
    ├── UI & Modals
    │   ├── JSDictionary
    │   ├── JSModalDialog
    │   ├── JSAIModal
    │   ├── JSVocabPreview
    │   └── JSImageVocab
    ├── Study Features
    │   ├── JSCustomFlashcards
    │   ├── JSFlashcards
    │   ├── JSQuiz
    │   ├── JSStats
    │   ├── JSFlashcardDeckSelection
    │   └── JSVocabPractice
    ├── Navigation & Library
    │   ├── JSPracticeOverlay
    │   ├── JSNewQuizSystem
    │   ├── JSLibrary
    │   ├── JSLibraryListView
    │   └── JSDetailPopup
    ├── Content Management
    │   ├── JSAddSection
    │   ├── JSDeckDashboard
    │   ├── JSNotes
    │   └── JSAddModal
    └── Initialization
        └── JSInit
```

---

**Last updated:** May 17, 2026  
**File size:** ~12,887 lines  
**Sections:** 44 major code regions

---

**Latest changes (May 17, 2026):** Command-Center (Notion-style) UX redesign — blue `#2D8CFF` primary accent replacing emerald for UI chrome, flat tree-nav sidebar, board-card library tiles, board stats bar (`cc-board-stats`); 6 bug fixes including `getDueCount()` property mismatch, mobile stats overflow, tile count text, emerald remnants in Add Modal and Recently Added button, dark-mode stat overrides. All new CSS injected as override block at end of StylesGlobal.
