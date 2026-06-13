# Nexora Flashcards — Claude Code Instructions

## GitHub Push Process

**Every time the user says "push to GitHub" or "push the updates", delegate ALL steps below to a Haiku 4.5 subagent using the Agent tool with `model: "haiku"`.**

Spawn the agent with a self-contained prompt that includes:
- A summary of all changes made in this session (files changed, what and why)
- Today's date
- The repo details and credential instructions below
- The full task list (Steps 0–3)

The Haiku agent handles everything: updating docs, committing, pushing, and managing GitHub issues.

---

### Step 0 — Update Documentation

Before committing, update these two files following the rules in `skills/app_project_manager.md`:

1. **`evolution.md`** — Prepend a new entry at the top (reverse-chronological) with today's date covering:
   - **What**: Technical and UI/UX changes made
   - **Why**: The problem solved or user request
   - **Impact**: Functional or aesthetic outcome
   - **Technical Detail**: Key functions, files, or data structures changed

2. **`comprehensive_project_summary.md`** — Update any sections that are now outdated due to the changes (features list, architecture, roadmap, "Last Updated" date).

3. **`CODE_MAP.md`** — Refresh line numbers by running:
   ```bash
   grep -n "@@SECTION" index.html
   ```
   Compare the output against the current CODE_MAP.md table. Update any line numbers that have shifted and add rows for any new `@@SECTION` markers not yet in the table. Include this file in the same commit.

Include all three files in the same commit as the code changes.

### Step 1 — Commit & Push

```bash
git pull --rebase origin main    # always sync with remote before committing
git add <changed files>          # stage specific files, never git add -A blindly
git commit -m "type: message"    # follow Conventional Commits (feat/fix/docs/refactor)
git push origin main
```

### Step 2 — Create GitHub Issue(s)

`gh` CLI is NOT installed. Use `curl` + the stored OAuth token from git credentials.

**Get the token:**
```bash
git credential fill <<'EOF'
protocol=https
host=github.com
EOF
# Copy the `password=` value — that is the token
```

**Create an issue:**
```bash
GITHUB_TOKEN="<token>"
REPO="suraj-0023/Flashcards_app"

curl -s -X POST "https://api.github.com/repos/${REPO}/issues" \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<issue title matching the commit>",
    "body": "<markdown body — include summary, what changed, and the commit SHA>"
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('number'), d.get('html_url'))"
```

**Issue body template:**
```markdown
## Summary
- Bullet points of what changed and why

## Changes
| Area | Detail |
|---|---|
| File/feature | What was done |

## Commit
<SHA>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Step 3 — Close the Issue

```bash
curl -s -X PATCH "https://api.github.com/repos/${REPO}/issues/<NUMBER>" \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"state": "closed"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('state'), d.get('html_url'))"
```

### One-shot reference (copy-paste skeleton)

```bash
GITHUB_TOKEN=$(git credential fill <<'EOF'
protocol=https
host=github.com
EOF
# paste password value here
)
REPO="suraj-0023/Flashcards_app"
ISSUE_NUMBER=<N>

# Close
curl -s -X PATCH "https://api.github.com/repos/${REPO}/issues/${ISSUE_NUMBER}" \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"state": "closed"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('state'), d.get('html_url'))"
```

---

## Repo Details

| Key | Value |
|---|---|
| Remote | `https://github.com/suraj-0023/Flashcards_app.git` |
| Default branch | `main` |
| GitHub CLI | Not installed — use `curl` + `git credential fill` |
| Credential store | macOS Keychain via `git credential fill` (protocol=https, host=github.com) |

---

## Commit Message Convention

```
feat:     new feature or content
fix:      bug fix
docs:     documentation only
refactor: code change, no behaviour change
chore:    tooling, config, deps
```

---

## Project Overview

Single-file app (`index.html`) backed by Firebase Auth + Firestore.  
Vocabulary sourced from `vocabulary.json` and `quiz_words.json`.  
User data (notes, custom cards, vocab, decks) stored in namespaced localStorage and synced to Firestore.

## Code Navigation (index.html)

`index.html` is a single 10,500+ line file. Before reading or editing it:

1. Check [CODE_MAP.md](CODE_MAP.md) for the section you need.
2. Run `grep -n "@@SECTION: SectionName" index.html` to get the exact line number.
3. Read only that section (typically 100–300 lines) instead of the full file.
4. If you need JS for a feature, look for the matching `JS*` section (e.g., `JSFlashcards` for flashcard study logic).

**Never read the full index.html unless the task explicitly spans the entire file.**

### Keeping the map up to date
- **When adding a new section** (new UI block, new feature, new JS function group): place a `<!-- @@SECTION: Name -->` (HTML) or `// @@SECTION: Name` (JS) marker at the top of it, then add a new row to `CODE_MAP.md`.
- **When modifying an existing section**: no marker change needed — the existing marker stays.
- **Naming convention**: PascalCase, no spaces (e.g. `JSThemeManager`, `SettingsPanel`).
- This ensures every new section is discoverable without reading the full file.
