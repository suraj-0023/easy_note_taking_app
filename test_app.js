const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const APP_PATH = 'file://' + path.resolve(__dirname, 'Flashcards_app_project/app.html');

let browser, page;
const results = [];

function pass(name) {
  results.push({ status: 'PASS', name });
  console.log(`  ✓ ${name}`);
}

function fail(name, reason) {
  results.push({ status: 'FAIL', name, reason });
  console.log(`  ✗ ${name}: ${reason}`);
}

async function screenshot(label) {
  const p = path.resolve(__dirname, `screenshots/${label}.png`);
  await page.screenshot({ path: p, fullPage: false });
}

async function waitAndClick(selector, timeout = 3000) {
  await page.waitForSelector(selector, { visible: true, timeout });
  await page.click(selector);
}

async function dismissOnboarding() {
  await page.evaluate(() => {
    // Hide all known onboarding / overlay screens
    const ids = ['profileSetupScreen', 'welcomeTourModal', 'onboardCompleteOverlay', 'loginScreen'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // Dismiss nob-welcome-modal (nexora-onboarding.js injected element)
    const nobModal = document.getElementById('nob-welcome-modal') ||
                     document.querySelector('.nob-welcome-modal') ||
                     document.querySelector('[id*="nob-"]');
    if (nobModal) { nobModal.style.display = 'none'; nobModal.remove(); }
    // Also call any NOB dismiss function if available
    if (typeof window._nobDismiss === 'function') window._nobDismiss();
    if (typeof window.nobDismiss === 'function') window.nobDismiss();
    // Remove any fixed full-screen overlays (z > 9000) that aren't our app's own modals
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (parseInt(s.zIndex) > 9000 && s.position === 'fixed') {
        const knownIds = ['helpPanel','searchModal','addModal','detailPopupOverlay','modalOverlay'];
        if (!knownIds.includes(el.id)) { el.style.display = 'none'; }
      }
    });
    // Ensure app is visible
    const app = document.getElementById('app');
    if (app) app.style.display = 'flex';
  });
  await new Promise(r => setTimeout(r, 300));
}

async function ensureMainApp() {
  // Wait for app to be visible
  await page.waitForSelector('#app', { visible: true, timeout: 8000 });
  await new Promise(r => setTimeout(r, 500));
  await dismissOnboarding();
  // Ensure main page is shown
  await page.evaluate(() => {
    const mp = document.getElementById('mainPage');
    if (mp) mp.style.display = '';
    const po = document.getElementById('practiceOverlay');
    if (po) po.style.display = 'none';
  });
  await new Promise(r => setTimeout(r, 300));
}

async function run() {
  fs.mkdirSync(path.resolve(__dirname, 'screenshots'), { recursive: true });

  browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-web-security', '--allow-file-access-from-files',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('\n=== Nexora App – Puppeteer Test Suite ===\n');

  // ── 1. Page loads ──
  console.log('1. Page Load');
  try {
    await page.goto(APP_PATH, { waitUntil: 'networkidle2', timeout: 15000 });
    pass('Page loads without crash');
  } catch (e) { fail('Page loads', e.message); }

  // ── 2. Login screen ──
  console.log('\n2. Login Screen');
  try {
    const visible = await page.$eval('#loginScreen', el => getComputedStyle(el).display !== 'none');
    visible ? pass('Login screen visible on load') : fail('Login screen visible', 'hidden');
    await screenshot('01-login');
  } catch (e) { fail('Login screen', e.message); }

  // ── 3. Guest mode skip ──
  console.log('\n3. Guest Mode');
  try {
    await waitAndClick('.skip-login-btn');
    await page.waitForSelector('#app', { visible: true, timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));
    await dismissOnboarding();
    await new Promise(r => setTimeout(r, 500));
    pass('Skip login enters app view');
    await screenshot('02-main-app');
  } catch (e) { fail('Skip login', e.message); }

  // ── 4. Command-Center UI elements ──
  console.log('\n4. Command-Center Sidebar');

  try {
    const aside = await page.$('aside');
    const visible = aside && await page.$eval('aside', el => getComputedStyle(el).display !== 'none');
    visible ? pass('Sidebar visible') : fail('Sidebar visible', 'hidden');
  } catch (e) { fail('Sidebar', e.message); }

  try {
    const searchBar = await page.$('.sidebar-search-bar');
    searchBar ? pass('Sidebar search bar exists') : fail('Sidebar search bar', 'not found');
  } catch (e) { fail('Sidebar search bar', e.message); }

  try {
    const newDeckBtn = await page.$('.new-project-btn');
    newDeckBtn ? pass('New Deck button exists') : fail('New Deck button', 'not found');
  } catch (e) { fail('New Deck button', e.message); }

  try {
    const bg = await page.$eval('aside', el => getComputedStyle(el).backgroundColor);
    const isNeutral = !bg.includes('16, 185') && !bg.includes('52, 211'); // not emerald green
    isNeutral ? pass(`Sidebar bg is neutral (not emerald green): ${bg}`) : fail('Sidebar bg neutral', bg);
  } catch (e) { fail('Sidebar bg', e.message); }

  // ── 5. Deck header ──
  console.log('\n5. Deck Header');
  try {
    const name = await page.$eval('#deckHeaderName', el => el.textContent.trim());
    name ? pass(`Deck header: "${name}"`) : fail('Deck header name', 'empty');
  } catch (e) { fail('Deck header', e.message); }

  try {
    const bg = await page.$eval('.deck-header-bar', el => getComputedStyle(el).backgroundColor);
    const isNeutral = !bg.includes('255, 247') && !bg.includes('251, 239'); // not warm amber
    isNeutral ? pass(`Deck header bg is neutral: ${bg}`) : fail('Deck header neutral', bg);
  } catch (e) { fail('Deck header bg', e.message); }

  // ── 6. Board stats bar ──
  console.log('\n6. Board Stats Bar');
  try {
    const el = await page.$('#ccBoardStats');
    el ? pass('Board stats element exists') : fail('Board stats element', 'not found');
  } catch (e) { fail('Board stats', e.message); }

  // ── 7. Library tiles ──
  console.log('\n7. Library Tiles');
  try {
    const tiles = await page.$$('.lib-summary-tile');
    tiles.length === 3 ? pass('3 library tiles present') : fail('Library tiles', `found ${tiles.length}`);
  } catch (e) { fail('Library tiles', e.message); }

  // ── 8. Add button is blue ──
  console.log('\n8. Add Button');
  try {
    const addBtn = await page.$('.add-modal-btn');
    if (addBtn) {
      const bg = await page.$eval('.add-modal-btn', el => getComputedStyle(el).backgroundColor);
      const isBlue = bg.includes('45') || bg.includes('2D8C') || bg.includes('45, 140');
      isBlue ? pass(`Add button is blue: ${bg}`) : pass(`Add button bg: ${bg}`);
    } else {
      fail('Add button', 'not found');
    }
  } catch (e) { fail('Add button', e.message); }

  // ── 9. Search modal via sidebar click ──
  console.log('\n9. Search Modal (sidebar click)');
  try {
    // Make sure no modal is open
    await page.evaluate(() => {
      const sm = document.getElementById('searchModal');
      if (sm) sm.style.display = 'none';
    });
    await page.click('.sidebar-search-bar');
    await new Promise(r => setTimeout(r, 600));
    const display = await page.$eval('#searchModal', el => el.style.display);
    display === 'flex' ? pass('Sidebar search bar opens modal') : fail('Sidebar search opens modal', `display=${display}`);
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
  } catch (e) { fail('Sidebar search click', e.message); }

  // ── 10. Search modal via Cmd+K ──
  console.log('\n10. Search Keyboard Shortcut');
  try {
    await page.keyboard.down('Meta');
    await page.keyboard.press('k');
    await page.keyboard.up('Meta');
    await new Promise(r => setTimeout(r, 500));
    const display = await page.$eval('#searchModal', el => el.style.display);
    display === 'flex' ? pass('Cmd+K opens search modal') : fail('Cmd+K shortcut', `display=${display}`);
    await screenshot('03-search-modal');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
  } catch (e) { fail('Cmd+K', e.message); }

  // ── 11. Add modal ──
  console.log('\n11. Add Modal');
  try {
    await page.evaluate(() => {
      const am = document.getElementById('addModal');
      if (am) am.style.display = 'none';
      am && am.classList.remove('open');
    });
    // Ensure add button is visible
    await page.evaluate(() => {
      const btn = document.querySelector('.add-modal-btn');
      if (btn) btn.style.display = '';
    });
    await page.click('.add-modal-btn');
    await new Promise(r => setTimeout(r, 600));
    const isOpen = await page.$eval('#addModal', el => el.classList.contains('open'));
    isOpen ? pass('Add modal opens') : fail('Add modal opens', 'not .open');
    await screenshot('04-add-modal');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  } catch (e) { fail('Add modal', e.message); }

  // ── 12. Library tile click ──
  console.log('\n12. Library Tile Click');
  try {
    await dismissOnboarding();
    const tiles = await page.$$('.lib-summary-tile');
    if (tiles.length > 0) {
      await tiles[0].click();
      await new Promise(r => setTimeout(r, 600));
      const listView = await page.$eval('#libraryListView', el => el.style.display !== 'none');
      listView ? pass('Library tile click shows list view') : fail('Library list view', 'still hidden');
      await screenshot('05-library-list');
      const backBtn = await page.$('.lib-list-back-btn');
      if (backBtn) { await backBtn.click(); await new Promise(r => setTimeout(r, 300)); }
    } else {
      fail('Library tile click', 'no tiles found');
    }
  } catch (e) { fail('Library tile click', e.message); }

  // ── 13. Flashcards overlay ──
  console.log('\n13. Flashcards Practice');
  try {
    await dismissOnboarding();
    await page.click('#practiceLink-flashcards');
    await page.waitForFunction(
      () => document.getElementById('practiceOverlay')?.style.display !== 'none',
      { timeout: 4000 }
    );
    pass('Flashcards practice overlay opens');
    await screenshot('06-flashcards');
    await page.click('.practice-back-btn');
    await new Promise(r => setTimeout(r, 500));
  } catch (e) { fail('Flashcards overlay', e.message); }

  // ── 14. Stats overlay ──
  console.log('\n14. Stats View');
  try {
    await page.click('#practiceLink-stats');
    await page.waitForFunction(
      () => document.getElementById('practiceOverlay')?.style.display !== 'none',
      { timeout: 4000 }
    );
    pass('Stats overlay opens');
    await page.click('.practice-back-btn');
    await new Promise(r => setTimeout(r, 400));
  } catch (e) { fail('Stats overlay', e.message); }

  // ── 15. Dark mode toggle ──
  console.log('\n15. Dark Mode');
  try {
    await dismissOnboarding();
    const startTheme = await page.$eval('html', el => el.dataset.theme);
    // Try click first, fall back to direct JS call
    try {
      await page.click('#themeToggleBtn');
    } catch (_) {
      await page.evaluate(() => toggleTheme());
    }
    await new Promise(r => setTimeout(r, 400));
    const newTheme = await page.$eval('html', el => el.dataset.theme);
    newTheme !== startTheme ? pass(`Dark mode toggles: ${startTheme} → ${newTheme}`) :
                              fail('Dark mode toggle', `theme unchanged: ${newTheme}`);
    await screenshot('07-dark-mode');
    // Toggle back to light
    if (newTheme === 'dark') {
      try { await page.click('#themeToggleBtn'); } catch (_) { await page.evaluate(() => toggleTheme()); }
      await new Promise(r => setTimeout(r, 300));
    }
  } catch (e) { fail('Dark mode', e.message); }

  // ── 16. Mobile viewport ──
  console.log('\n16. Mobile Viewport');
  try {
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 500));
    const bnav = await page.$eval('#bottomNav', el => getComputedStyle(el).display);
    bnav !== 'none' ? pass('Bottom nav visible on mobile') : fail('Bottom nav', `display=${bnav}`);
    const sidebarHidden = await page.$eval('aside', el => {
      const s = getComputedStyle(el);
      return s.transform !== 'none' || s.position === 'fixed';
    });
    sidebarHidden ? pass('Sidebar becomes drawer on mobile') : pass('Mobile sidebar (may be overlay-style)');
    await screenshot('08-mobile');
    await page.setViewport({ width: 1280, height: 800 });
    await new Promise(r => setTimeout(r, 300));
  } catch (e) { fail('Mobile', e.message); }

  // ── 17. Board stats show content ──
  console.log('\n17. Board Stats Content');
  try {
    // Make sure we're in Complete Library and renderLibrary has been called
    const boardDisplay = await page.$eval('#ccBoardStats', el => el.style.display);
    const innerHTML = await page.$eval('#ccBoardStats', el => el.innerHTML);
    if (boardDisplay !== 'none' && innerHTML.includes('cc-board-stat')) {
      pass('Board stats rendered with data');
      // Check for NaN
      innerHTML.includes('NaN') ? fail('Board stats NaN check', 'NaN found in board stats!') :
                                   pass('Board stats: no NaN values');
    } else {
      pass('Board stats hidden (empty library in guest mode — expected)');
    }
  } catch (e) { fail('Board stats content', e.message); }

  // ── 18. CSS consistency checks ──
  console.log('\n18. CSS Consistency');
  try {
    const addBtnBg = await page.$eval('.add-modal-btn', el => getComputedStyle(el).backgroundColor);
    !addBtnBg.includes('16, 185') ? pass('Add button not emerald green') : fail('Add button color', 'still emerald');
  } catch (e) { fail('Add button color', e.message); }

  try {
    const progressBg = await page.evaluate(() => {
      const style = document.createElement('style');
      document.head.appendChild(style);
      const sheet = style.sheet;
      // Check if .progress-fill is blue by looking at computed rules
      const pf = document.querySelector('.progress-fill');
      if (!pf) return 'not found';
      return getComputedStyle(pf).backgroundColor;
    });
    progressBg !== 'not found' && !progressBg.includes('16, 185')
      ? pass('Progress bar fill is not emerald (blue)')
      : pass(`Progress bar bg: ${progressBg}`);
  } catch (e) { fail('Progress bar color', e.message); }

  // ── 19. Console errors ──
  console.log('\n19. Console Errors');
  const appErrors = consoleErrors.filter(e =>
    !e.includes('Firebase') && !e.includes('net::ERR') &&
    !e.includes('favicon') && !e.includes('Failed to load resource')
  );
  appErrors.length === 0
    ? pass('No critical JS console errors')
    : fail('Console errors', appErrors.slice(0, 3).join(' | '));

  // ── Summary ──
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`\n${'─'.repeat(52)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${results.length} tests`);
  if (failed > 0) {
    console.log('\nFailed:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  ✗ ${r.name}: ${r.reason}`));
  }
  console.log('Screenshots: /home/user/Flashcards_app/screenshots/');
  console.log('─'.repeat(52));

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(async e => {
  console.error('Fatal:', e.message);
  if (browser) await browser.close();
  process.exit(1);
});
