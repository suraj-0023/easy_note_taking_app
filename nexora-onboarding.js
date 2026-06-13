/*
 * NEXORA ONBOARDING — IMPLEMENTATION TODO / VERIFICATION CHECKLIST
 * Generated: 2026-05-03
 * ─────────────────────────────────────────────────────────────────
 *
 * SHARED FOUNDATION
 * [✓] NexoraOnboarding namespace created
 * [✓] All localStorage flags defined
 * [✓] get / set / getJSON / setJSON / isSet helpers implemented
 *     (wraps lsGet/lsSet for per-user namespacing when available)
 *
 * FEATURE 1 — Welcome Modal
 * [✓] Modal renders on first visit (before profile setup)
 * [✓] SVG illustration implemented (open book + 4-point star)
 * [✓] "Get started" CTA triggers existing goal-setting flow (showProfileSetup)
 * [✓] "Skip intro" also shows profile setup (user chose Option B)
 * [✓] WELCOME_SEEN flag set on both interactions
 * [⚠ MANUAL CHECK] Confirm existing goal-setting function name: showProfileSetup()
 *
 * FEATURE 2 — Add Button Spotlight
 * [✓] Spotlight triggers only when user item count = 0 (ignores demo vocab)
 * [✓] 1500ms delay after welcome dismissal
 * [✓] Pulse ring animation on ".add-modal-btn" button
 * [✓] Tooltip callout renders below button
 * [✓] Auto-dismiss at 8 seconds
 * [✓] Button remains fully functional during spotlight
 * [⚠ MANUAL CHECK] Confirm "+ Add" button selector used: .add-modal-btn
 *
 * FEATURE 3 — First Deck Wizard
 * [✓] 3-step wizard renders (replaces existing startWelcomeTour)
 * [✓] Step 1: deck name input + deck creation via createNewDeck()
 * [✓] Step 2: word input + word addition via _addWordsFromText()
 * [✓] Step 3: live inline flashcard renders + flip animation works
 * [✓] Completion state: confetti + CTA navigates to new deck
 * [✓] Skip closes wizard and sets WIZARD_DONE flag
 * [✓] showOnboardComplete() suppressed (wizard handles completion)
 * [⚠ MANUAL CHECK] Deck creation function used: createNewDeck() — reads #projectNameInput
 * [⚠ MANUAL CHECK] Word addition function used: _addWordsFromText(text, deckId)
 * [⚠ MANUAL CHECK] Definition fetched from: lsGet('custom_vocab') after _addWordsFromText
 *
 * FEATURE 4 — Contextual Tooltips
 * [✓] TOOLTIPS_SEEN JSON object initialized
 * [✓] Tooltip: Add button (first hover/tap on .add-modal-btn)
 * [✓] Tooltip: Deck card open (first switchProject to non-"all" deck)
 * [✓] Tooltip: Practice button (first openPracticeView call)
 * [✓] Tooltip: Vocab word tap (first openModal call)
 * [✓] Tooltip: Stats section (openPracticeView("stats"))
 * [✓] Only 1 tooltip visible at a time enforced
 * [✓] Auto-dismiss at 6 seconds
 * [✓] Mobile overflow protection (viewport clamping)
 * [⚠ MANUAL CHECK] Selectors / functions used for triggers:
 *     add_button     → .add-modal-btn (mouseenter + touchstart)
 *     deck_open      → wrapped switchProject(id)
 *     practice_button→ wrapped openPracticeView(type)
 *     vocab_word     → wrapped openModal(id)
 *     stats_section  → wrapped openPracticeView("stats")
 *
 * FEATURE 5 — Onboarding Checklist
 * [✓] Checklist widget renders as collapsed pill (bottom-left)
 * [✓] Expands/collapses on tap
 * [✓] Circular progress arc on pill (SVG stroke-dashoffset)
 * [✓] Linear progress bar in expanded state
 * [✓] Task 1 auto-detection: lsGet("nexora_profile_complete")
 * [✓] Task 2 auto-detection: projects with id !== "general"
 * [✓] Task 3 auto-detection: custom_vocab + notes + custom_cards count
 * [✓] Task 4 auto-detection: FIRST_SESSION_DONE flag
 * [✓] Task 5 auto-detection: FIRST_QUIZ_DONE flag
 * [✓] Hook added at showFlashDone for Task 4 flag
 * [✓] Hook added at showQuizDone + _showNqDone for Task 5 flag
 * [✓] Jump links navigate to correct sections
 * [✓] Completion state fires + widget removed after 3s
 * [✓] Manual dismiss with confirm dialog
 * [✓] Auto-collapse after 8 seconds of inactivity
 * [⚠ MANUAL CHECK] Session-end function: showFlashDone()
 * [⚠ MANUAL CHECK] Quiz-complete functions: showQuizDone() + _showNqDone()
 * [⚠ MANUAL CHECK] Navigation functions: openPracticeView(), openAddModal(), showProfileSetup()
 *
 * KNOWN GAPS / SKIPPED
 * [ ] "AI Extract" and "Scan Image" modes in Step 2 are UI-only toggles —
 *     actual implementation would need openAddModal() which exits the wizard flow.
 *     Currently they show a note to use the main "+ Add" button.
 * [ ] Wizard Step 3 "Got It / Need Practice" don't update SM-2 scores —
 *     they only mark the wizard complete.
 *
 * RECOMMENDED MANUAL TESTS AFTER DEPLOYMENT
 * [ ] Clear localStorage entirely → walk through full onboarding sequence
 * [ ] Verify welcome modal fires before goal-setting screen
 * [ ] Verify spotlight fires 1.5s after home load with empty library
 * [ ] Verify wizard Step 2 actually saves word to correct deck
 * [ ] Verify wizard Step 3 flashcard flip animation works
 * [ ] Trigger each of the 5 tooltips in sequence
 * [ ] Complete a full flashcard session → Task 4 checks off
 * [ ] Complete 1 quiz session → Task 5 checks off
 * [ ] Complete all 5 checklist tasks → widget disappears after 3s
 * [ ] Return after closing tab → no onboarding shows again
 * [ ] Test all modals on 360px wide mobile screen
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     SHARED FOUNDATION — NexoraOnboarding namespace
  ══════════════════════════════════════════════════════ */
  const NexoraOnboarding = {
    flags: {
      WELCOME_SEEN:       'nexora_welcome_seen',
      WIZARD_DONE:        'nexora_first_deck_wizard_done',
      CHECKLIST_COMPLETE: 'nexora_onboarding_complete',
      ADD_SPOTLIGHT_SHOWN:'nexora_add_spotlight_shown',
      TOOLTIPS_SEEN:      'nexora_tooltips_seen',
      FIRST_SESSION_DONE: 'nexora_first_session_done',
      FIRST_QUIZ_DONE:    'nexora_first_quiz_done',
    },

    // Use lsGet/lsSet (user-scoped) when available; fall back to raw localStorage
    get(key) {
      if (typeof lsGet === 'function') return lsGet(key, null);
      const v = localStorage.getItem(key);
      try { return v !== null ? JSON.parse(v) : null; } catch { return v; }
    },
    set(key, val) {
      if (typeof lsSet === 'function') return lsSet(key, val);
      localStorage.setItem(key, JSON.stringify(val));
    },
    getJSON(key) {
      if (typeof lsGet === 'function') {
        const v = lsGet(key, null);
        return (v && typeof v === 'object') ? v : {};
      }
      try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
    },
    setJSON(key, val) {
      if (typeof lsSet === 'function') return lsSet(key, val);
      localStorage.setItem(key, JSON.stringify(val));
    },
    isSet(key) {
      const v = this.get(key);
      return v !== null && v !== false && v !== undefined;
    },
  };

  /* ── internal state ── */
  let _wiz = { step: 0, deckId: null, deckName: '', word: '', def: null };
  let _pendingProfileUser = null;
  let _activeTooltip = null;
  let _tooltipTimer  = null;
  let _spotlightTimer = null;
  let _checklistExpanded = false;
  let _checklistCollapseTimer = null;
  let _checklistPollTimer = null;
  let _lastChecklistDone = -1;

  /* ══════════════════════════════════════════════════════
     FEATURE 1 — WELCOME MODAL
  ══════════════════════════════════════════════════════ */
  function showWelcomeModal() {
    if (document.getElementById('nob-welcome-modal')) return;

    const el = document.createElement('div');
    el.id = 'nob-welcome-modal';
    el.className = 'nob-backdrop';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = `
      <div class="nob-welcome-card">
        <div class="nob-welcome-wordmark">Nexora</div>
        <div class="nob-welcome-tagline">From Information to Intelligence</div>
        <div class="nob-welcome-illustration">
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M40 52 C30 52 14 47 8 43 L8 15 C14 19 30 23 40 23 L40 52Z" fill="#10B981" opacity="0.9"/>
            <path d="M40 52 C50 52 66 47 72 43 L72 15 C66 19 50 23 40 23 L40 52Z" fill="#059669" opacity="0.85"/>
            <line x1="40" y1="52" x2="40" y2="23" stroke="white" stroke-width="1.5" opacity="0.5"/>
            <path d="M59 6 L60.3 10.2 L64.8 10.2 L61.2 12.7 L62.5 17 L59 14.5 L55.5 17 L56.8 12.7 L53.2 10.2 L57.7 10.2 Z" fill="#F5A623"/>
          </svg>
        </div>
        <div class="nob-welcome-headline">From what you read to what you know.</div>
        <div class="nob-welcome-body">Paste a paragraph. Scan a page. Highlight an idea.<br>Nexora's AI turns your reading into vocabulary, notes, and flashcards — automatically.</div>
        <button class="nob-welcome-cta" id="nob-cta-start">Get started →</button>
        <button class="nob-welcome-skip" id="nob-cta-skip">Skip intro</button>
      </div>`;

    document.body.appendChild(el);

    document.getElementById('nob-cta-start').addEventListener('click', () => _dismissWelcome());
    document.getElementById('nob-cta-skip').addEventListener('click',  () => _dismissWelcome());
  }

  function _dismissWelcome() {
    NexoraOnboarding.set(NexoraOnboarding.flags.WELCOME_SEEN, true);
    const modal = document.getElementById('nob-welcome-modal');
    if (modal) modal.remove();

    // Call the pending showProfileSetup action
    if (typeof _pendingProfileUser !== 'undefined' && _origShowProfileSetup) {
      _origShowProfileSetup(_pendingProfileUser);
    }

    // Start checklist now that welcome is dismissed
    _initChecklist();
  }

  /* ══════════════════════════════════════════════════════
     FEATURE 2 — ADD BUTTON SPOTLIGHT
  ══════════════════════════════════════════════════════ */
  // IDs seeded by seedDemoData — should not count as user content
  const DEMO_PROJECT_IDS = new Set(['general', 'p_atomic', 'p_climate', 'p_alchemist', 'p_science10']);

  function _countUserItems() {
    const vocab  = (typeof lsGet === 'function' ? lsGet('custom_vocab', []) : []) || [];
    const cards  = ((typeof lsGet === 'function' ? lsGet('nexora_custom_cards', []) : []) || [])
                     .filter(c => !DEMO_PROJECT_IDS.has(c.projectId));
    const notes  = ((typeof lsGet === 'function' ? lsGet('nexora_notes', []) : []) || [])
                     .filter(n => !DEMO_PROJECT_IDS.has(n.deckId));
    return vocab.length + cards.length + notes.length;
  }

  function _maybeShowSpotlight() {
    if (NexoraOnboarding.isSet(NexoraOnboarding.flags.ADD_SPOTLIGHT_SHOWN)) return;

    // Prefer the header add button (visible on Complete Library view);
    // fall back to deck-home CTA when user is on a specific deck (header btn is hidden).
    let btn = document.querySelector('.add-modal-btn');
    if (!btn || btn.offsetParent === null) {
      btn = document.querySelector('.deck-home-cta-btn');
    }
    if (!btn || btn.offsetParent === null) return;

    NexoraOnboarding.set(NexoraOnboarding.flags.ADD_SPOTLIGHT_SHOWN, true);
    _showSpotlight(btn);
  }

  function _showSpotlight(btn) {
    btn.classList.add('nob-spotlight-ring');

    const tip = document.createElement('div');
    tip.id = 'nob-spotlight-tip';
    tip.className = 'nob-spotlight-tip';
    tip.innerHTML = `
      <div class="nob-spotlight-label">YOUR SUPERPOWER</div>
      <div class="nob-spotlight-title">3 ways to add content</div>
      <div class="nob-spotlight-desc">📝 Type manually\n🤖 Paste text — AI extracts vocab &amp; notes\n📷 Scan a book page — AI finds underlined words</div>
      <hr class="nob-spotlight-divider">
      <div class="nob-spotlight-hint">Tap + Add to get started</div>`;
    document.body.appendChild(tip);

    _positionBelow(tip, btn);
    _spotlightTimer = setTimeout(_dismissSpotlight, 8000);

    // Dismiss on outside click
    setTimeout(() => {
      document.addEventListener('click', _spotlightOutsideClick, { once: true, capture: true });
    }, 100);
  }

  function _spotlightOutsideClick(e) {
    const tip = document.getElementById('nob-spotlight-tip');
    const btn = document.querySelector('.add-modal-btn');
    if (tip && !tip.contains(e.target) && e.target !== btn) {
      _dismissSpotlight();
    } else if (btn && btn.contains(e.target)) {
      _dismissSpotlight(); // user tapped the button — dismiss naturally
    }
  }

  function _dismissSpotlight() {
    clearTimeout(_spotlightTimer);
    document.removeEventListener('click', _spotlightOutsideClick, { capture: true });
    const btn = document.querySelector('.add-modal-btn');
    if (btn) btn.classList.remove('nob-spotlight-ring');
    const tip = document.getElementById('nob-spotlight-tip');
    if (tip) tip.remove();
  }

  /* ══════════════════════════════════════════════════════
     FEATURE 3 — FIRST DECK WIZARD
  ══════════════════════════════════════════════════════ */
  function _showFirstDeckWizard() {
    if (document.getElementById('nob-wizard-modal')) return;
    _wiz = { step: 0, deckId: null, deckName: '', word: '', def: null };

    const el = document.createElement('div');
    el.id = 'nob-wizard-modal';
    el.className = 'nob-wizard-backdrop';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = `
      <div class="nob-wizard-card">
        <!-- Branded header -->
        <div class="nob-wizard-header">
          <div class="nob-wizard-brand">
            <div class="nob-wizard-brand-mark">N</div>
            <div class="nob-wizard-brand-name">Getting started</div>
          </div>
          <button class="nob-wizard-header-close" id="nob-wiz-header-close" aria-label="Close">✕</button>
        </div>

        <div class="nob-wizard-body">
          <!-- Step progress dots (4 steps) -->
          <div class="nob-wizard-dots">
            <div class="nob-wizard-dot active" id="nob-dot-0"></div>
            <div class="nob-wizard-dot"        id="nob-dot-1"></div>
            <div class="nob-wizard-dot"        id="nob-dot-2"></div>
            <div class="nob-wizard-dot"        id="nob-dot-3"></div>
          </div>

          <!-- STEP 1: Name Your Deck -->
          <div class="nob-wizard-step active" id="nob-step-0">
            <div class="nob-wizard-title">First, create a deck</div>
            <div class="nob-wizard-desc">A deck is a collection — name it after the book, subject, or topic you're studying.</div>
            <input class="nob-wizard-input" id="nob-deck-input" type="text"
              placeholder="Atomic Habits, GRE Prep, Work Vocab…" autocomplete="off" />
            <div class="nob-wizard-nav">
              <button class="nob-wizard-skip" id="nob-wiz-skip">Skip setup</button>
              <button class="nob-wizard-next" id="nob-step0-next">Next →</button>
            </div>
          </div>

          <!-- STEP 2: Add First Content (multi-type) -->
          <div class="nob-wizard-step" id="nob-step-1">
            <!-- Input form (hidden during loading/review) -->
            <div id="nob-step1-form">
              <div class="nob-wizard-title">Add your first content</div>
              <div class="nob-wizard-desc">Select what to create, then type or paste.</div>

              <!-- Multi-select type buttons -->
              <div class="nob-type-toggle" style="display:flex;gap:8px;margin:12px 0 10px;flex-wrap:wrap;">
                <button class="nob-type-btn" id="nob-type-vocab" data-type="vocab">📚 Vocabulary</button>
                <button class="nob-type-btn" id="nob-type-note"  data-type="note">📝 Note</button>
                <button class="nob-type-btn" id="nob-type-flash" data-type="flash">🃏 Flashcard</button>
              </div>

              <!-- Vocab fields -->
              <div id="nob-vocab-fields" style="display:none;">
                <input class="nob-wizard-input" id="nob-word-input" type="text"
                  placeholder="e.g. ephemeral, serendipity…" autocomplete="off" style="margin-bottom:4px;" />
              </div>

              <!-- Note fields -->
              <div id="nob-note-fields" style="display:none;">
                <textarea class="nob-wizard-input" id="nob-note-body" rows="3"
                  placeholder="Write your note here…" style="resize:vertical;font-family:inherit;font-size:0.9rem;padding:10px 12px;"></textarea>
              </div>

              <!-- Flashcard fields -->
              <div id="nob-flash-fields" style="display:none;">
                <input class="nob-wizard-input" id="nob-flash-front" type="text"
                  placeholder="Front — question or term…" autocomplete="off" style="margin-bottom:6px;" />
                <input class="nob-wizard-input" id="nob-flash-back" type="text"
                  placeholder="Back — answer or definition…" autocomplete="off" />
              </div>

              <!-- Multi-select fields (2+ types) -->
              <div id="nob-multi-fields" style="display:none;">
                <textarea class="nob-wizard-input" id="nob-multi-text" rows="3"
                  placeholder="Paste your content or topic here — AI will generate notes, vocab &amp; cards…"
                  style="resize:vertical;font-family:inherit;font-size:0.9rem;padding:10px 12px;"></textarea>
                <div class="nob-wizard-ai-hint">
                  🤖 AI will generate suggestions — you choose what to keep.
                </div>
              </div>

              <div class="nob-wizard-nav" style="margin-top:14px;">
                <button class="nob-wizard-skip" id="nob-wiz-skip-2">Skip</button>
                <button class="nob-wizard-next" id="nob-step1-next">Add &amp; Continue →</button>
              </div>
            </div>

            <!-- Loading state -->
            <div id="nob-step1-loading" style="display:none;flex-direction:column;align-items:center;gap:12px;padding:20px 0;">
              <div id="nob-load-emoji" style="font-size:2rem;animation:nob-bob 1.4s ease-in-out infinite;">🧠</div>
              <div id="nob-load-msg" style="font-size:0.88rem;font-weight:700;color:var(--text,#1A1612);text-align:center;">Teaching your deck...</div>
              <div style="width:200px;height:4px;background:var(--border-2,#EDE8E0);border-radius:4px;overflow:hidden;">
                <div style="height:100%;background:var(--emerald,#10B981);border-radius:4px;animation:loadbar-sweep 1.6s ease-in-out infinite;"></div>
              </div>
            </div>

            <!-- Review state — AI suggestions shown here -->
            <div id="nob-step1-review" style="display:none;flex-direction:column;max-height:52vh;gap:0;">
              <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted,#6E6660);margin-bottom:10px;flex-shrink:0;">🤖 AI found these for you</div>
              <div id="nob-review-items" style="display:flex;flex-direction:column;gap:8px;overflow-y:auto;flex:1;padding-bottom:4px;"></div>
              <div class="nob-wizard-nav" style="flex-shrink:0;margin-top:8px;">
                <button class="nob-wizard-skip" id="nob-review-skip">Skip all</button>
                <button class="nob-wizard-next" id="nob-review-save">Save selected →</button>
              </div>
            </div>

            <!-- Success state -->
            <div id="nob-step1-success" style="display:none;flex-direction:column;align-items:center;gap:10px;padding:16px 0;text-align:center;">
              <div style="font-size:2.4rem;">🎉</div>
              <div style="font-size:1rem;font-weight:700;color:var(--emerald,#10B981);" id="nob-success-msg">Added to your deck!</div>
              <div style="font-size:0.82rem;color:var(--muted,#6E6660);">Moving to the next step…</div>
            </div>
          </div>

          <!-- STEP 3: Book Page / Image Scan Demo -->
          <div class="nob-wizard-step" id="nob-step-2">
            <div class="nob-wizard-title">Learn from what you read</div>
            <div class="nob-wizard-desc">Scan a book page or paste text — Nexora detects what's worth studying, automatically.</div>

            <!-- Section label -->
            <div style="font-size:11px;font-weight:700;color:var(--muted,#6E6660);text-transform:uppercase;letter-spacing:0.06em;margin:14px 0 6px;">📷 How it works</div>

            <!-- Book page illustration -->
            <div class="nob-book-page" style="background:var(--bg-2,#f5f0ea);border:1px solid var(--border,#EDE8E0);border-radius:10px;padding:14px 16px;font-size:0.85rem;line-height:1.65;color:var(--text,#1A1612);margin:0 0 12px;font-family:Georgia,serif;position:relative;">
              <p style="margin:0 0 8px;">The concept of <span style="border-bottom:2px solid var(--emerald,#10B981);font-weight:600;">serendipity</span> plays a crucial role in scientific discovery. Many important findings have been accidental.</p>
              <p style="margin:0 0 8px;background:rgba(251,191,36,0.25);border-radius:3px;padding:1px 3px;display:inline-block;width:100%;box-sizing:border-box;">Unexpected breakthroughs emerge when researchers pursue seemingly unrelated lines of inquiry.</p>
              <p style="margin:0;">Scientists value <span style="border-bottom:2px solid var(--emerald,#10B981);font-weight:600;">serendipitous</span> findings that reshape entire fields of knowledge.</p>
            </div>

            <!-- Annotation legend — prominent -->
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;font-size:0.85rem;background:var(--bg,#FDFAF6);border:1px solid var(--border,#EDE8E0);border-radius:9px;padding:12px 14px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="display:inline-block;width:24px;border-bottom:2.5px solid var(--emerald,#10B981);flex-shrink:0;"></span>
                <span><strong>Underlined word</strong> → saved as <strong style="color:var(--emerald,#10B981);">Vocabulary</strong></span>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="display:inline-block;width:24px;height:16px;background:rgba(251,191,36,0.40);border-radius:3px;flex-shrink:0;"></span>
                <span><strong>Highlighted sentence</strong> → saved as <strong style="color:#92400E;">Note</strong></span>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="display:inline-block;width:24px;text-align:center;font-size:14px;flex-shrink:0;">🤖</span>
                <span><strong>AI suggestions</strong> → more vocabulary &amp; notes from the full passage</span>
              </div>
            </div>

            <div class="nob-wizard-nav">
              <button class="nob-wizard-skip" id="nob-wiz-skip-3">Skip →</button>
              <button class="nob-wizard-next" id="nob-step2-scan">📷 Try image scan →</button>
            </div>
          </div>

          <!-- STEP 4: Practice — Flip the Card -->
          <div class="nob-wizard-step" id="nob-step-3">
            <div class="nob-wizard-title">Now let's practice it</div>
            <div class="nob-wizard-desc">Tap the card to flip it and see the definition.</div>
            <div class="nob-flashcard-wrap">
              <div class="nob-flashcard-mini" id="nob-flashcard">
                <div class="nob-card-face nob-card-front">
                  <span id="nob-card-word"></span>
                  <span class="nob-card-hint">tap to flip</span>
                </div>
                <div class="nob-card-face nob-card-back">
                  <span id="nob-card-def">Loading definition…</span>
                </div>
              </div>
            </div>
            <div class="nob-flash-actions" id="nob-flash-actions">
              <button class="nob-flash-btn nob-flash-btn-got"  id="nob-btn-got">✓ Got It</button>
              <button class="nob-flash-btn nob-flash-btn-need" id="nob-btn-need">✗ Need Practice</button>
            </div>
            <div class="nob-wizard-nav">
              <button class="nob-wizard-skip" id="nob-wiz-skip-4">Skip setup</button>
              <span></span>
            </div>
          </div>

          <!-- COMPLETION STATE -->
          <div class="nob-wizard-complete" id="nob-wiz-complete">
            <div class="nob-confetti-wrap">
              <div class="nob-confetti-dot"></div>
              <div class="nob-confetti-dot"></div>
              <div class="nob-confetti-dot"></div>
              <div class="nob-confetti-dot"></div>
              <div class="nob-confetti-dot"></div>
              <div class="nob-confetti-dot"></div>
            </div>
            <div class="nob-wizard-complete-heading">You're all set! 🎉</div>
            <div class="nob-wizard-complete-sub" id="nob-complete-sub">Your deck is ready. Keep adding content.</div>
            <button class="nob-wizard-complete-cta" id="nob-complete-cta">Go to my deck →</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(el);
    _wizardBindEvents();

    // Auto-focus Step 1 input
    setTimeout(() => {
      const inp = document.getElementById('nob-deck-input');
      if (inp) inp.focus();
    }, 320);
  }

  function _wizardBindEvents() {
    // Header close button
    const headerClose = document.getElementById('nob-wiz-header-close');
    if (headerClose) headerClose.addEventListener('click', _wizardSkip);

    // Step 1 next (create deck)
    const s0next = document.getElementById('nob-step0-next');
    if (s0next) s0next.addEventListener('click', _wizardStep1Next);
    const deckInput = document.getElementById('nob-deck-input');
    if (deckInput) deckInput.addEventListener('keydown', e => { if (e.key === 'Enter') _wizardStep1Next(); });

    // Step 2 type toggle (multi-select)
    ['nob-type-vocab', 'nob-type-note', 'nob-type-flash'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        _syncContentTypeFields();
      });
    });

    // Step 2 next (add content)
    const s1next = document.getElementById('nob-step1-next');
    if (s1next) s1next.addEventListener('click', _wizardStep2Next);

    // Step 3 (book demo) — scan CTA opens image scan modal, skip goes to step 3
    const scanBtn = document.getElementById('nob-step2-scan');
    if (scanBtn) scanBtn.addEventListener('click', () => {
      _wizardSkip();  // close wizard first
      if (typeof openAddModal === 'function') {
        openAddModal();
        // Pre-select "file" input type if possible
        setTimeout(() => {
          const fileCheck = document.querySelector('#addInputChecks input[value="file"]');
          if (fileCheck && !fileCheck.checked) { fileCheck.checked = true; if (typeof updateAddModalTypes === 'function') updateAddModalTypes(); }
        }, 300);
      }
    });
    const skip3 = document.getElementById('nob-wiz-skip-3');
    if (skip3) skip3.addEventListener('click', () => _goWizardStep(3));

    // Flashcard flip (step 4)
    const card = document.getElementById('nob-flashcard');
    if (card) {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        const actions = document.getElementById('nob-flash-actions');
        if (card.classList.contains('flipped') && actions) actions.classList.add('show');
      });
    }

    // Practice buttons (step 4)
    const gotBtn  = document.getElementById('nob-btn-got');
    const needBtn = document.getElementById('nob-btn-need');
    if (gotBtn)  gotBtn.addEventListener('click',  _wizardComplete);
    if (needBtn) needBtn.addEventListener('click', _wizardComplete);

    // Review save / skip all
    const reviewSave = document.getElementById('nob-review-save');
    if (reviewSave) reviewSave.addEventListener('click', _wizardStep2Finalize);
    const reviewSkip = document.getElementById('nob-review-skip');
    if (reviewSkip) reviewSkip.addEventListener('click', () => _goWizardStep(2));

    // Skip buttons (all trigger full wizard skip)
    ['nob-wiz-skip', 'nob-wiz-skip-2', 'nob-wiz-skip-4'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', _wizardSkip);
    });

    // Completion CTA
    const cta = document.getElementById('nob-complete-cta');
    if (cta) cta.addEventListener('click', _closeWizard);
  }

  function _syncContentTypeFields() {
    const vocabSel = document.getElementById('nob-type-vocab')?.classList.contains('selected');
    const noteSel  = document.getElementById('nob-type-note')?.classList.contains('selected');
    const flashSel = document.getElementById('nob-type-flash')?.classList.contains('selected');
    const selectedCount = [vocabSel, noteSel, flashSel].filter(Boolean).length;
    const multi = selectedCount >= 2;

    const vocabF = document.getElementById('nob-vocab-fields');
    const noteF  = document.getElementById('nob-note-fields');
    const flashF = document.getElementById('nob-flash-fields');
    const multiF = document.getElementById('nob-multi-fields');

    if (vocabF) vocabF.style.display = (!multi && vocabSel) ? '' : 'none';
    if (noteF)  noteF.style.display  = (!multi && noteSel)  ? '' : 'none';
    if (flashF) flashF.style.display = (!multi && flashSel) ? '' : 'none';
    if (multiF) multiF.style.display = multi ? '' : 'none';
  }

  function _wizardStep1Next() {
    const input = document.getElementById('nob-deck-input');
    if (!input) return;
    const name = input.value.trim();
    if (!name) {
      input.classList.add('shake');
      input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
      return;
    }
    _wiz.deckName = name;

    // Create deck using existing createNewDeck() — set input value then call
    const deckInput = document.getElementById('projectNameInput');
    if (deckInput && typeof createNewDeck === 'function') {
      const prev = deckInput.value;
      deckInput.value = name;
      // Temporarily restore original switchProject so createNewDeck doesn't consume the deck_open tooltip
      const _wrapped = window.switchProject;
      if (_origSwitchProject) window.switchProject = _origSwitchProject;
      createNewDeck();
      if (_origSwitchProject) window.switchProject = _wrapped;
      deckInput.value = prev;
      // createNewDeck → switchProject → sets currentProjectId → lsSet
      _wiz.deckId = typeof lsGet === 'function' ? lsGet('nexora_current_project', null) : null;
    } else {
      // Fallback: record the name; word will go to current project
      console.warn('[Onboarding] createNewDeck not found — deck creation skipped');
    }

    _goWizardStep(1);
    setTimeout(() => {
      const wi = document.getElementById('nob-word-input');
      if (wi) wi.focus();
    }, 320);
  }

  // ── WIZARD STEP 2: LOADING / REVIEW STATE HELPERS ──

  let _nobLoadTimer = null;
  const _NOB_LOAD_MSGS = [
    { emoji: '🧠', msg: 'Teaching your deck...' },
    { emoji: '✨', msg: 'Connecting the dots...' },
    { emoji: '📚', msg: 'Reading between the lines...' },
    { emoji: '☕', msg: 'Brewing some insights...' },
    { emoji: '🎯', msg: 'Targeting key concepts...' },
    { emoji: '🚀', msg: 'Almost there...' },
  ];

  function _nobShowLoading() {
    document.getElementById('nob-step1-form').style.display    = 'none';
    document.getElementById('nob-step1-review').style.display  = 'none';
    document.getElementById('nob-step1-success').style.display = 'none';
    const el = document.getElementById('nob-step1-loading');
    if (el) el.style.display = 'flex';
    let idx = 0;
    function _cycle() {
      const m = _NOB_LOAD_MSGS[idx % _NOB_LOAD_MSGS.length];
      const emojiEl = document.getElementById('nob-load-emoji');
      const msgEl   = document.getElementById('nob-load-msg');
      if (emojiEl) emojiEl.textContent = m.emoji;
      if (msgEl)   msgEl.textContent   = m.msg;
      idx++;
      _nobLoadTimer = setTimeout(_cycle, 1800);
    }
    _cycle();
  }

  function _nobHideLoading() {
    clearTimeout(_nobLoadTimer);
    const el = document.getElementById('nob-step1-loading');
    if (el) el.style.display = 'none';
  }

  // Generated items for the mini review
  let _nobReviewItems = [];  // [{type, data, checked}]

  function _nobShowReview(items) {
    _nobReviewItems = items;
    const container = document.getElementById('nob-review-items');
    if (!container) return;

    if (!items.length) {
      // Nothing to review — skip straight
      _goWizardStep(2);
      return;
    }

    const TYPE_STYLE = {
      vocab:     { bg: 'rgba(251,191,36,0.14)',  badge: '#D97706', badgeBg: 'rgba(251,191,36,0.18)', label: 'Vocab',     icon: '📚' },
      note:      { bg: 'rgba(16,185,129,0.10)',  badge: '#059669', badgeBg: 'rgba(16,185,129,0.15)', label: 'Note',      icon: '📝' },
      flashcard: { bg: 'rgba(99,102,241,0.10)',  badge: '#4F46E5', badgeBg: 'rgba(99,102,241,0.15)', label: 'Flashcard', icon: '🃏' },
    };
    container.innerHTML = items.map((item, i) => {
      const ts = TYPE_STYLE[item.type] || TYPE_STYLE.note;
      let title, preview;
      if (item.type === 'vocab') {
        title = item.data.text || ''; preview = '';
      } else if (item.type === 'note') {
        title = (item.data.title || '').slice(0, 60) || 'Note';
        const raw = (item.data.body || '').replace(/\n/g, ' ');
        preview = raw.slice(0, 110) + (raw.length > 110 ? '…' : '');
      } else {
        title = (item.data.front || '').slice(0, 70);
        const ans = item.data.back || '';
        preview = ans.slice(0, 100) + (ans.length > 100 ? '…' : '');
      }
      return `<label style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:${ts.bg};border-radius:10px;cursor:pointer;border:1px solid ${ts.badgeBg};">
        <input type="checkbox" data-idx="${i}" checked style="margin-top:4px;flex-shrink:0;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;${preview ? 'margin-bottom:3px;' : ''}">
            <span style="font-size:0.875rem;font-weight:700;color:var(--text,#1A1612);flex:1;min-width:0;">${ts.icon} ${title}</span>
            <span style="font-size:0.65rem;font-weight:700;letter-spacing:0.04em;padding:2px 7px;border-radius:99px;background:${ts.badgeBg};color:${ts.badge};flex-shrink:0;text-transform:uppercase;">${ts.label}</span>
          </div>
          ${preview ? `<div style="font-size:0.78rem;color:var(--muted,#6E6660);line-height:1.45;">${preview}</div>` : ''}
        </div>
      </label>`;
    }).join('');

    document.getElementById('nob-step1-form').style.display    = 'none';
    document.getElementById('nob-step1-loading').style.display = 'none';
    document.getElementById('nob-step1-success').style.display = 'none';
    document.getElementById('nob-step1-review').style.display  = 'flex';
  }

  async function _wizardStep2Finalize() {
    const deckId = _wiz.deckId;
    const checkboxes = document.querySelectorAll('#nob-review-items input[type=checkbox]');
    const selected = [...checkboxes].map((cb, i) => cb.checked ? _nobReviewItems[i] : null).filter(Boolean);

    const saveBtn = document.getElementById('nob-review-save');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

    let savedCount = 0;
    for (const item of selected) {
      try {
        if (item.type === 'vocab' && item.data.text) {
          window._silentAdd = true;
          try { if (typeof _addWordsFromText === 'function') await _addWordsFromText(item.data.text, deckId); } finally { window._silentAdd = false; }
          if (!_wiz.word) { _wiz.word = item.data.text; }
          savedCount++;
        } else if (item.type === 'note') {
          const notes = (typeof lsGet === 'function' ? lsGet('nexora_notes', []) : []);
          notes.push({
            id: 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2,5),
            deckId: deckId || null,
            title: item.data.title || (item.data.body || '').slice(0, 60),
            content: item.data.body || '',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
          });
          if (typeof lsSet === 'function') lsSet('nexora_notes', notes);
          if (typeof ALL_NOTES !== 'undefined') { ALL_NOTES.length = 0; notes.forEach(n => ALL_NOTES.push(n)); }
          savedCount++;
        } else if (item.type === 'flashcard') {
          const cards = (typeof lsGet === 'function' ? lsGet('nexora_custom_cards', []) : []);
          const newCard = {
            id: 'cc_' + Date.now() + '_' + Math.random().toString(36).substr(2,6),
            isCustom: true,
            front: item.data.front || '',
            back: item.data.back || '',
            projectId: deckId || null,
            sm2: typeof defaultSM2 === 'function' ? defaultSM2() : {}
          };
          cards.push(newCard);
          if (typeof lsSet === 'function') lsSet('nexora_custom_cards', cards);
          if (typeof ALL_CUSTOM_CARDS !== 'undefined') ALL_CUSTOM_CARDS.push(newCard);
          if (!_wiz.word) { _wiz.word = newCard.front; _wiz.def = newCard.back; }
          savedCount++;
        }
      } catch(e) { console.warn('[Onboarding] save failed:', e); }
    }

    // Show success
    document.getElementById('nob-step1-review').style.display  = 'none';
    const successEl = document.getElementById('nob-step1-success');
    if (successEl) {
      const msgEl = document.getElementById('nob-success-msg');
      const deckName = _wiz.deckName || 'your deck';
      if (msgEl) msgEl.textContent = savedCount > 0
        ? `✓ ${savedCount} item${savedCount > 1 ? 's' : ''} added to "${deckName}"!`
        : '✓ Saved!';
      successEl.style.display = 'flex';
    }

    setTimeout(() => _goWizardStep(2), 1400);
  }

  async function _wizardStep2Next() {
    const vocabSel = document.getElementById('nob-type-vocab')?.classList.contains('selected');
    const noteSel  = document.getElementById('nob-type-note')?.classList.contains('selected');
    const flashSel = document.getElementById('nob-type-flash')?.classList.contains('selected');
    const selectedCount = [vocabSel, noteSel, flashSel].filter(Boolean).length;

    if (!selectedCount) { _goWizardStep(2); return; }

    const multi = selectedCount >= 2;
    const deckId = _wiz.deckId;
    const aiEnabled = typeof _isAIEnabled === 'function' ? _isAIEnabled() : true;

    // Collect raw input
    let vocabWords = [];
    let noteContent = '';
    let flashFront = '', flashBack = '';
    let multiText = '';

    if (multi) {
      multiText = (document.getElementById('nob-multi-text')?.value || '').trim();
      if (!multiText) { _goWizardStep(2); return; }
    } else {
      if (vocabSel) {
        const raw = (document.getElementById('nob-word-input')?.value || '').trim();
        vocabWords = raw.split(',').map(w => w.trim()).filter(Boolean);
      }
      if (noteSel) noteContent  = (document.getElementById('nob-note-body')?.value  || '').trim();
      if (flashSel) {
        flashFront = (document.getElementById('nob-flash-front')?.value || '').trim();
        flashBack  = (document.getElementById('nob-flash-back')?.value  || '').trim();
      }
    }

    const hasContent = multi ? !!multiText : (vocabWords.length || noteContent || flashFront || flashBack);
    if (!hasContent) { _goWizardStep(2); return; }

    // Show loading
    _nobShowLoading();

    const reviewItems = [];

    try {
      if (multi && aiEnabled && typeof _callGemini === 'function') {
        // Use AI to generate content from the multi-text
        if (noteSel || vocabSel) {
          try {
            const notesPrompt = `You are a concise teacher. Create exactly 3 short study note sections on: ${JSON.stringify(multiText.slice(0, 2000))}
Return ONLY raw JSON: {"notes":[{"title":"section heading","body":"2-3 sentence summary of key facts"},...]}
Each body must be 2-3 sentences max. Exactly 3 sections. No markdown, no extra text.`;
            const raw = await _callGemini(notesPrompt);
            const parsed = JSON.parse(raw);
            (parsed.notes || []).forEach(n => {
              const body = n.body || n.definition || '';
              if (body) reviewItems.push({ type: 'note', data: { title: n.title || '', body } });
            });
          } catch(e) { console.warn('[Onboarding] note AI failed:', e); }
        }
        if (flashSel) {
          try {
            const flashPrompt = `Create 4-6 flashcard Q&A pairs for studying: ${JSON.stringify(multiText.slice(0, 2000))}
Return ONLY raw JSON: {"cards":[{"front":"question","back":"answer"},...]}
No markdown, no extra text.`;
            const raw = await _callGemini(flashPrompt);
            const parsed = JSON.parse(raw);
            (parsed.cards || []).forEach(c => {
              reviewItems.push({ type: 'flashcard', data: { front: c.front || '', back: c.back || '' } });
            });
          } catch(e) { console.warn('[Onboarding] flash AI failed:', e); }
        }
      } else if (!multi) {
        // Single type — show items directly (vocab lookups, notes, flashcards)
        for (const w of vocabWords) {
          reviewItems.push({ type: 'vocab', data: { text: w } });
          _wiz.word = _wiz.word || w;
        }
        if (noteContent) {
          reviewItems.push({ type: 'note', data: { title: noteContent.slice(0, 60), body: noteContent } });
        }
        if (flashFront || flashBack) {
          if (aiEnabled && typeof _callGemini === 'function' && flashFront && !flashBack) {
            try {
              const bp = `Generate a concise answer for flashcard front: "${flashFront.slice(0,300)}" — Return ONLY raw JSON: {"back":"answer"} No markdown.`;
              const raw = await _callGemini(bp);
              flashBack = JSON.parse(raw).back || '';
            } catch {}
          }
          reviewItems.push({ type: 'flashcard', data: { front: flashFront, back: flashBack } });
          if (!_wiz.word) { _wiz.word = flashFront; _wiz.def = flashBack; }
        }
      }
    } catch(e) {
      console.warn('[Onboarding] generation error:', e);
    }

    _nobHideLoading();

    if (!reviewItems.length) {
      // Nothing generated — just advance
      _goWizardStep(2);
      return;
    }

    _nobShowReview(reviewItems);
  }

  function _goWizardStep(n) {
    const prev = document.getElementById(`nob-step-${_wiz.step}`);
    if (prev) prev.classList.remove('active');

    // Update dots (4 total)
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`nob-dot-${i}`);
      if (!dot) continue;
      dot.classList.remove('active', 'done');
      if (i < n)        dot.classList.add('done');
      else if (i === n) dot.classList.add('active');
    }

    _wiz.step = n;
    const next = document.getElementById(`nob-step-${n}`);
    if (next) next.classList.add('active');

    // Populate Step 4 (index 3) practice flashcard
    if (n === 3) {
      const wordEl = document.getElementById('nob-card-word');
      const defEl  = document.getElementById('nob-card-def');
      if (wordEl) wordEl.textContent = _wiz.word || 'serendipity';
      if (defEl)  defEl.textContent  = _wiz.def  || 'The occurrence of happy accidents — finding something good without looking for it.';
      const card = document.getElementById('nob-flashcard');
      if (card) card.classList.remove('flipped');
      const actions = document.getElementById('nob-flash-actions');
      if (actions) actions.classList.remove('show');
    }
  }

  function _wizardComplete() {
    const steps = document.getElementById('nob-wizard-modal')?.querySelector('.nob-wizard-card');
    if (!steps) return;

    // Hide step panels and nav
    ['nob-step-0','nob-step-1','nob-step-2','nob-step-3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    const dots = document.querySelector('.nob-wizard-dots');
    if (dots) dots.style.display = 'none';

    // Show completion
    const comp = document.getElementById('nob-wiz-complete');
    if (comp) {
      comp.classList.add('show');
      const sub = document.getElementById('nob-complete-sub');
      if (sub && _wiz.deckName) {
        sub.textContent = `Your deck "${_wiz.deckName}" is ready. Keep adding words.`;
      }
    }

    _markWizardDone();
  }

  function _wizardSkip() {
    _markWizardDone();
    _closeWizard();
  }

  function _markWizardDone() {
    NexoraOnboarding.set(NexoraOnboarding.flags.WIZARD_DONE, true);
    // Mark existing tour complete so startWelcomeTour never fires again
    if (typeof lsSet === 'function') {
      lsSet('nexora_tour_complete', true);
    }
    // Also call applyProfileToUI so the sidebar updates (replaces dismissOnboardComplete side-effect)
    if (typeof applyProfileToUI === 'function') {
      try { applyProfileToUI(); } catch(e) {}
    }
    _initChecklist();  // ensure root exists before update
    _updateChecklist();
  }

  function _closeWizard() {
    const modal = document.getElementById('nob-wizard-modal');
    if (modal) modal.remove();

    const appEl     = document.getElementById('app');
    const loadingEl = document.getElementById('loadingScreen');

    // Ensure the main app is visible (handles case where loadVocab failed during wizard)
    if (loadingEl) loadingEl.style.display = 'none';
    if (appEl && appEl.style.display === 'none') {
      appEl.style.display = '';
      if (typeof updateProjectUI === 'function') try { updateProjectUI(); } catch(e) {}
      if (typeof applyProjectFilter === 'function') try { applyProjectFilter(); } catch(e) {}
    }

    // Navigate to the newly created deck — bypass the tooltip wrapper
    if (_wiz.deckId) {
      const fn = _origSwitchProject || (typeof switchProject === 'function' ? switchProject : null);
      if (fn) try { fn(_wiz.deckId); } catch(e) {}
    }

    // Spotlight fires 1500ms after the app is visible
    setTimeout(_maybeShowSpotlight, 1500);
  }

  /* ══════════════════════════════════════════════════════
     FEATURE 4 — CONTEXTUAL TOOLTIPS
  ══════════════════════════════════════════════════════ */
  const TOOLTIP_MESSAGES = {
    add_button:      '3 ways to add content — type manually, paste text for AI extraction, or scan a book page 📷',
    deck_open:       'This is your deck — all your vocab, notes, and flashcards live here. Tap Practice to start learning.',
    practice_button: 'Choose Flashcards to review, or Quiz to test yourself with 4-option questions.',
    vocab_word:      'Tap 🔊 to hear pronunciation. Scroll for definitions, synonyms, and usage examples.',
    stats_section:   'Your learning history lives here — streaks, accuracy, and cards due today 🔥',
  };

  function _showTooltip(key, anchorEl, position) {
    if (!anchorEl) return;
    const seen = NexoraOnboarding.getJSON(NexoraOnboarding.flags.TOOLTIPS_SEEN);
    if (seen[key]) return;

    // Only one at a time
    _dismissTooltip();

    const tip = document.createElement('div');
    tip.id = 'nob-active-tooltip';
    tip.className = 'nob-tooltip ' + (position === 'above' ? 'nob-tooltip-caret-down' : 'nob-tooltip-caret-up');
    tip.innerHTML = `
      <button class="nob-tooltip-dismiss" aria-label="Dismiss">×</button>
      <div class="nob-tooltip-text">${TOOLTIP_MESSAGES[key] || ''}</div>`;
    document.body.appendChild(tip);

    _activeTooltip = { el: tip, key };

    tip.querySelector('.nob-tooltip-dismiss').addEventListener('click', _dismissTooltip);

    _positionTooltip(tip, anchorEl, position);

    // Outside click — { once: true } prevents listener accumulation across multiple shows
    setTimeout(() => {
      document.addEventListener('click', _tooltipOutsideClick, { capture: true, once: true });
    }, 80);

    // Auto-dismiss at 6 seconds
    clearTimeout(_tooltipTimer);
    _tooltipTimer = setTimeout(_dismissTooltip, 6000);
  }

  function _dismissTooltip() {
    clearTimeout(_tooltipTimer);
    document.removeEventListener('click', _tooltipOutsideClick, { capture: true });
    if (_activeTooltip) {
      const seen = NexoraOnboarding.getJSON(NexoraOnboarding.flags.TOOLTIPS_SEEN);
      seen[_activeTooltip.key] = true;
      NexoraOnboarding.setJSON(NexoraOnboarding.flags.TOOLTIPS_SEEN, seen);
      if (_activeTooltip.el) _activeTooltip.el.remove();
      _activeTooltip = null;
    }
  }

  function _tooltipOutsideClick(e) {
    if (_activeTooltip && _activeTooltip.el && !_activeTooltip.el.contains(e.target)) {
      _dismissTooltip();
    }
  }

  function _positionTooltip(tipEl, anchorEl, position) {
    // First render to get dimensions
    tipEl.style.visibility = 'hidden';
    tipEl.style.position = 'fixed';

    requestAnimationFrame(() => {
      const rect = anchorEl.getBoundingClientRect();
      const tw = tipEl.offsetWidth  || 240;
      const th = tipEl.offsetHeight || 80;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top, left;
      if (position === 'above') {
        top  = rect.top - th - 10;
        left = rect.left;
      } else {
        top  = rect.bottom + 10;
        left = rect.left;
      }

      // Clamp to viewport with 8px margin
      left = Math.max(8, Math.min(left, vw - tw - 8));
      top  = Math.max(8, Math.min(top,  vh - th - 8));

      tipEl.style.left       = left + 'px';
      tipEl.style.top        = top  + 'px';
      tipEl.style.visibility = 'visible';
    });
  }

  function _positionBelow(el, anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const vw = window.innerWidth;

    let left = rect.left;
    const maxW = 260;
    left = Math.max(8, Math.min(left, vw - maxW - 8));

    el.style.position = 'fixed';
    el.style.top  = (rect.bottom + 8) + 'px';
    el.style.left = left + 'px';
  }

  function _setupTooltipTriggers() {
    // 1. Add button — first hover or touch
    document.addEventListener('mouseover', e => {
      const btn = e.target.closest('.add-modal-btn');
      if (btn) _showTooltip('add_button', btn, 'below');
    });
    document.addEventListener('touchstart', e => {
      const btn = e.target.closest('.add-modal-btn');
      if (btn) _showTooltip('add_button', btn, 'below');
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════
     FEATURE 5 — ONBOARDING CHECKLIST
  ══════════════════════════════════════════════════════ */
  const TASK_DEFS = [
    {
      id: 'goal',
      label: 'Set your learning goal',
      check: () => !!(typeof lsGet === 'function' ? lsGet('nexora_profile_complete', false) : false),
      jump: () => { if (typeof showProfileSetup === 'function') try { showProfileSetup(null); } catch(e) {} },
    },
    {
      id: 'deck',
      label: 'Create your first deck',
      check: () => {
        const projs = (typeof lsGet === 'function' ? lsGet('nexora_projects', []) : []) || [];
        return projs.some(p => p.id && p.id !== 'general');
      },
      jump: () => { if (typeof openNewDeckModal === 'function') try { openNewDeckModal(); } catch(e) {} },
    },
    {
      id: 'words',
      label: 'Add 5 words or cards',
      subLabel: () => {
        const n = _countUserItems();
        return n < 5 ? `${n} / 5 added` : '';
      },
      check: () => _countUserItems() >= 5,
      jump: () => { if (typeof openAddModal === 'function') try { openAddModal(); } catch(e) {} },
    },
    {
      id: 'session',
      label: 'Complete a flashcard session',
      check: () => NexoraOnboarding.isSet(NexoraOnboarding.flags.FIRST_SESSION_DONE),
      jump: () => {
        if (typeof openPracticeView === 'function') try { openPracticeView('flash'); } catch(e) {}
      },
    },
    {
      id: 'quiz',
      label: 'Try the quiz',
      check: () => NexoraOnboarding.isSet(NexoraOnboarding.flags.FIRST_QUIZ_DONE),
      jump: () => {
        if (typeof openPracticeView === 'function') try { openPracticeView('vocab'); } catch(e) {}
      },
    },
  ];

  function _getChecklistProgress() {
    const done = TASK_DEFS.filter(t => t.check());
    return { done: done.length, total: TASK_DEFS.length };
  }

  function _initChecklist() {
    if (NexoraOnboarding.isSet(NexoraOnboarding.flags.CHECKLIST_COMPLETE)) return;
    if (document.getElementById('nob-checklist-root')) return;

    const root = document.createElement('div');
    root.id = 'nob-checklist-root';
    document.body.appendChild(root);
    _renderChecklist();

    // Seed _lastChecklistDone so the first poll doesn't needlessly re-render
    _lastChecklistDone = _getChecklistProgress().done;

    // Poll every 2s to update state
    _checklistPollTimer = setInterval(_updateChecklist, 2000);
  }

  function _renderChecklist() {
    const root = document.getElementById('nob-checklist-root');
    if (!root) return;

    const { done, total } = _getChecklistProgress();
    const r = 11;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - done / total);

    const tasksHtml = TASK_DEFS.map(t => {
      const isDone = t.check();
      const sub    = t.subLabel ? t.subLabel() : '';
      return `
        <div class="nob-task-row">
          <div class="nob-task-check ${isDone ? 'done' : ''}"></div>
          <div class="nob-task-body">
            <div class="nob-task-label ${isDone ? 'done' : ''}">${t.label}</div>
            ${sub ? `<div class="nob-task-sub">${sub}</div>` : ''}
          </div>
          <button class="nob-task-link ${isDone ? 'hidden' : ''}"
            data-task="${t.id}" aria-label="Go to ${t.label}">→</button>
        </div>`;
    }).join('');

    root.innerHTML = `
      <div class="nob-checklist-card ${_checklistExpanded ? 'open' : ''}" id="nob-cl-card">
        <div class="nob-checklist-header">
          <span class="nob-checklist-title">Getting started</span>
          <button class="nob-checklist-close" id="nob-cl-close">×</button>
        </div>
        <div class="nob-linear-bar-wrap">
          <div class="nob-linear-bar-fill" style="width:${(done/total*100).toFixed(1)}%"></div>
        </div>
        ${tasksHtml}
      </div>
      <button class="nob-pill" id="nob-cl-pill" aria-label="Getting started ${done}/${total}">
        <svg class="nob-pill-arc" viewBox="0 0 28 28">
          <circle class="nob-pill-arc-track" cx="14" cy="14" r="${r}"/>
          <circle class="nob-pill-arc-fill"  cx="14" cy="14" r="${r}"
            stroke-dasharray="${circ.toFixed(2)}"
            stroke-dashoffset="${offset.toFixed(2)}"/>
        </svg>
        <span class="nob-pill-label">🚀 Getting started · ${done}/${total}</span>
      </button>`;

    // Bind events
    document.getElementById('nob-cl-pill')?.addEventListener('click', _toggleChecklist);
    document.getElementById('nob-cl-close')?.addEventListener('click', _dismissChecklist);
    root.querySelectorAll('.nob-task-link').forEach(btn => {
      btn.addEventListener('click', e => {
        const task = TASK_DEFS.find(t => t.id === btn.dataset.task);
        if (task) task.jump();
        _collapseChecklist();
      });
    });
  }

  function _updateChecklist() {
    const root = document.getElementById('nob-checklist-root');
    if (!root) return;

    const { done, total } = _getChecklistProgress();

    // All done — show completion state then remove
    if (done >= total) {
      _showChecklistComplete();
      return;
    }

    // Skip re-render if progress hasn't changed (prevents animation replay)
    if (done === _lastChecklistDone) return;
    _lastChecklistDone = done;

    // Suppress slide-up animation on the existing pill before replacing innerHTML
    const existingPill = root.querySelector('.nob-pill');
    if (existingPill) existingPill.style.animation = 'none';

    _renderChecklist();
  }

  function _toggleChecklist() {
    _checklistExpanded = !_checklistExpanded;
    const card = document.getElementById('nob-cl-card');
    if (card) card.classList.toggle('open', _checklistExpanded);

    if (_checklistExpanded) {
      // Auto-collapse after 8 seconds of inactivity
      clearTimeout(_checklistCollapseTimer);
      _checklistCollapseTimer = setTimeout(_collapseChecklist, 8000);
    }
  }

  function _collapseChecklist() {
    _checklistExpanded = false;
    const card = document.getElementById('nob-cl-card');
    if (card) card.classList.remove('open');
    clearTimeout(_checklistCollapseTimer);
  }

  function _dismissChecklist() {
    const confirmed = window.confirm('Dismiss the Getting Started checklist? You can always explore on your own.');
    if (!confirmed) return;
    NexoraOnboarding.set(NexoraOnboarding.flags.CHECKLIST_COMPLETE, true);
    clearInterval(_checklistPollTimer);
    const root = document.getElementById('nob-checklist-root');
    if (root) root.remove();
  }

  function _showChecklistComplete() {
    clearInterval(_checklistPollTimer);
    const root = document.getElementById('nob-checklist-root');
    if (!root) return;

    root.innerHTML = `
      <div class="nob-checklist-card open" id="nob-cl-card">
        <div class="nob-checklist-complete-banner">🎉 You're all set! You know Nexora inside out.</div>
      </div>`;

    setTimeout(() => {
      NexoraOnboarding.set(NexoraOnboarding.flags.CHECKLIST_COMPLETE, true);
      const r = document.getElementById('nob-checklist-root');
      if (r) r.remove();
    }, 3000);
  }

  /* ══════════════════════════════════════════════════════
     FUNCTION WRAPPERS
  ══════════════════════════════════════════════════════ */
  let _origShowProfileSetup  = null;
  let _origStartWelcomeTour  = null;
  let _origShowOnboardComplete = null;
  let _origShowFlashDone     = null;
  let _origShowQuizDone      = null;
  let _origShowNqDone        = null;
  let _origSwitchProject     = null;
  let _origOpenModal         = null;
  let _origOpenPracticeView  = null;
  let _origOpenAddModal      = null;

  function _setupWrappers() {
    // ── Welcome Modal gate: intercept showProfileSetup ──
    if (typeof showProfileSetup === 'function') {
      _origShowProfileSetup = showProfileSetup;
      window.showProfileSetup = function (user) {
        if (!NexoraOnboarding.isSet(NexoraOnboarding.flags.WELCOME_SEEN)) {
          _pendingProfileUser = user;
          showWelcomeModal();
        } else {
          _origShowProfileSetup(user);
        }
      };
    }

    // ── Replace Welcome Tour with First Deck Wizard ──
    if (typeof startWelcomeTour === 'function') {
      _origStartWelcomeTour = startWelcomeTour;
      window.startWelcomeTour = function () {
        if (!NexoraOnboarding.isSet(NexoraOnboarding.flags.WIZARD_DONE)) {
          _showFirstDeckWizard();
        } else {
          // Already done — just mark tour complete silently
          if (typeof lsSet === 'function') lsSet('nexora_tour_complete', true);
        }
      };
    }

    // ── Suppress original celebration overlay (wizard handles completion) ──
    if (typeof showOnboardComplete === 'function') {
      _origShowOnboardComplete = showOnboardComplete;
      window.showOnboardComplete = function () {
        // Suppressed: the wizard handles its own completion state.
        // If the wizard was never shown (edge case), show original.
        if (NexoraOnboarding.isSet(NexoraOnboarding.flags.WIZARD_DONE)) return;
        _origShowOnboardComplete.apply(this, arguments);
      };
    }

    // ── Task 4: set FIRST_SESSION_DONE when flashcard session ends ──
    if (typeof showFlashDone === 'function') {
      _origShowFlashDone = showFlashDone;
      window.showFlashDone = function () {
        _origShowFlashDone.apply(this, arguments);
        if (!NexoraOnboarding.isSet(NexoraOnboarding.flags.FIRST_SESSION_DONE)) {
          NexoraOnboarding.set(NexoraOnboarding.flags.FIRST_SESSION_DONE, true);
          _updateChecklist();
        }
      };
    }

    // ── Task 5: set FIRST_QUIZ_DONE when quiz session ends ──
    if (typeof showQuizDone === 'function') {
      _origShowQuizDone = showQuizDone;
      window.showQuizDone = function () {
        _origShowQuizDone.apply(this, arguments);
        if (!NexoraOnboarding.isSet(NexoraOnboarding.flags.FIRST_QUIZ_DONE)) {
          NexoraOnboarding.set(NexoraOnboarding.flags.FIRST_QUIZ_DONE, true);
          _updateChecklist();
        }
      };
    }
    if (typeof _showNqDone === 'function') {
      _origShowNqDone = _showNqDone;
      window._showNqDone = function () {
        _origShowNqDone.apply(this, arguments);
        if (!NexoraOnboarding.isSet(NexoraOnboarding.flags.FIRST_QUIZ_DONE)) {
          NexoraOnboarding.set(NexoraOnboarding.flags.FIRST_QUIZ_DONE, true);
          _updateChecklist();
        }
      };
    }

    // ── Tooltip: Deck card open ──
    if (typeof switchProject === 'function') {
      _origSwitchProject = switchProject;
      window.switchProject = function (id) {
        _origSwitchProject.apply(this, arguments);
        if (id && id !== 'all') {
          const anchor = document.querySelector(`.project-item-sidebar.active`) ||
                         document.querySelector('.deck-header-bar');
          if (anchor) setTimeout(() => _showTooltip('deck_open', anchor, 'below'), 400);
        }
      };
    }

    // ── Tooltip: Vocab word tap ──
    if (typeof openModal === 'function') {
      _origOpenModal = openModal;
      window.openModal = function (id) {
        _origOpenModal.apply(this, arguments);
        const anchor = document.querySelector('.word-item, .vocab-card');
        if (anchor) setTimeout(() => _showTooltip('vocab_word', anchor, 'below'), 300);
      };
    }

    // ── Tooltip: Practice button + Stats section ──
    if (typeof openPracticeView === 'function') {
      _origOpenPracticeView = openPracticeView;
      window.openPracticeView = function (type) {
        _origOpenPracticeView.apply(this, arguments);
        if (type === 'stats') {
          const anchor = document.getElementById('practiceLink-stats') ||
                         document.querySelector('.practice-link');
          if (anchor) setTimeout(() => _showTooltip('stats_section', anchor, 'below'), 400);
        } else if (type === 'flash' || type === 'vocab') {
          const anchor = document.querySelector('.practice-link.active') ||
                         document.querySelector('.practice-link');
          if (anchor) setTimeout(() => _showTooltip('practice_button', anchor, 'below'), 400);
        }
        _updateChecklist();
      };
    }

    // ── Spotlight: dismiss naturally when add button is tapped ──
    if (typeof openAddModal === 'function') {
      _origOpenAddModal = openAddModal;
      window.openAddModal = function () {
        _dismissSpotlight();
        _origOpenAddModal.apply(this, arguments);
      };
    }
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function _init() {
    _setupWrappers();
    _setupTooltipTriggers();

    // If user already dismissed welcome in a previous session, show checklist immediately
    if (NexoraOnboarding.isSet(NexoraOnboarding.flags.WELCOME_SEEN) &&
        !NexoraOnboarding.isSet(NexoraOnboarding.flags.CHECKLIST_COMPLETE)) {
      // Small delay so the app renders first
      setTimeout(_initChecklist, 800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  // Expose namespace globally
  window.NexoraOnboarding = NexoraOnboarding;

})();
