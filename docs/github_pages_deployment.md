# GitHub Pages Deployment — Nexora App

## Live URL
`https://suraj-0023.github.io/easy_note_taking_app/`

## Architecture
```
User Browser
     │
     ▼
GitHub Pages (free CDN + HTTPS)
     │
     ▼
/index.html  (The main app container)
     │
     └── Firebase Auth + Firestore
```

## Cost
- Hosting: **$0** (GitHub Pages free tier)
- SSL: **$0** (automatic via GitHub)
- Firebase: **$0** (free tier)

---

## One-Time Setup Steps

### 1. Enable GitHub Pages (do this once in browser)
1. Go to: `https://github.com/suraj-0023/easy_note_taking_app/settings/pages`
2. Source → **Deploy from a branch**
3. Branch → **main** → Folder → **/ (root)**
4. Click **Save**
5. Wait ~60 seconds — GitHub will show your live URL

### 2. Add Firebase Authorized Domain (do this once in Firebase Console)
Firebase Auth blocks sign-in from unauthorized domains.
1. Open Firebase Console → your project
2. Go to **Authentication** → **Settings** → **Authorized domains**
3. Click **Add domain** → enter: `suraj-0023.github.io`
4. Save

---

## How Deploys Work (After Setup)
Every `git push` to `main` automatically updates the live site within ~60 seconds. No extra steps needed.

---

## Custom Domain (Optional, Later)
1. Buy a domain (Namecheap ~$10/year, or any registrar)
2. GitHub repo → Settings → Pages → **Custom domain** → enter your domain
3. Update DNS at your registrar to point to GitHub Pages IPs
4. GitHub auto-provisions SSL via Let's Encrypt

---

## Files
| File | Purpose |
|---|---|
| `/index.html` | The main app |

---

## Troubleshooting
- **Blank page / 404**: Check Pages is enabled in repo settings (Step 1 above)
- **Auth blocked / sign-in fails**: Add `suraj-0023.github.io` to Firebase authorized domains (Step 2 above)
- **Changes not showing**: Hard refresh (`Cmd+Shift+R`) or wait 60s for deploy to finish
