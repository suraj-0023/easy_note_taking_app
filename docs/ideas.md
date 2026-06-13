# Flashcards App — Ideas & Feature Tracker

## To Be Done

### Core Features
- [ ] Edit items from Detail Popup — add Edit button inside the popup for notes and flashcards (currently view-only)
- [ ] Search / filter in List View — search bar inside each list view to find items quickly
- [ ] Vocab Flashcards deck filter — Vocab Practice flip mode currently uses all vocab in active deck; add a deck selector like Flashcards practice
- [ ] Onboarding / empty state — first-time users see blank tiles with no guidance; add a "Get started" prompt

### Stats & Analytics
- [ ] Stats page upgrade — currently only shows vocab performance; include notes count, flashcard stats

### AI & Advanced Features
- [ ] Add AI assistance to fill or rewrite custom flashcards/memory cards to ensure correct spelling and grammar.
- [ ] Add the ability to create summary points of a book into flashcards/memory cards for revisiting.

### Design, UI/UX
- [ ] Update the brand/app name and the theme of the app.
- [ ] Update UI and UX for better utility.
- [ ] Mobile layout polish — deck selection grid and library tiles need responsive tweaks on small screens.

### User Accounts & Sync
- [ ] Make sure the user can use and save progress across web and app.

### Deployment & Launch
- [ ] Make the app suitable for mobile as well.
- [ ] Create iOS and Android app files and test for any issues.
- [ ] Bug fixing before making it live.
- [ ] Create a project in GitHub and update the project details (description, README, etc.).
- [ ] Make this live on web and app stores. Identify where to host the app/website.
- [ ] Documentation of the app for every step and changes (tech, product, and deployment documentation).

---

## Already Done

### App Structure & Layout
- [x] Single-page scrollable layout — migrated from tab-based navigation to unified scrollable page
- [x] Sticky deck header bar — shows active deck name + item count
- [x] Add Section — textarea, file attach with dropdown (Image/PDF/File), type pills, deck selector, Generate button
- [x] AI Preview section — accept/edit/discard cards before saving
- [x] Library summary tiles — 3 large tiles (Notes / Flashcards / Vocab) with live counts
- [x] List View — sort by Time / Alpha / Part of Speech + shuffle
- [x] Detail Popup — unified modal with ← → navigation; vocab shows full details, notes show content, flashcards are flippable

### Deck & Practice System
- [x] Deck system — sidebar deck list, create/delete decks, switch between them
- [x] Practice overlay — sidebar links open a full-area overlay with back button
- [x] Practice > Flashcards: deck selection grid — session starts with a deck picker, builds queue from selected decks only
- [x] Practice > Vocab: landing screen with two options — Vocab Flashcards (flip mode) and Vocab Quiz (MCQ)

### Content Types
- [x] Notes — create, edit, delete notes per deck
- [x] Custom flashcards/memory cards — add an option to create custom flashcards
- [x] Project/category organisation — category system for words and cards

### Vocab & Words
- [x] Add words — input one or multiple words separated by commas
- [x] Delete words — option to remove a word from the directory
- [x] Image upload — upload images of pages so underlined words are extracted and added to the directory

### Auth & Sync
- [x] Firebase Auth + Firestore cloud sync — Gmail/email login with profile; data persists across sessions
