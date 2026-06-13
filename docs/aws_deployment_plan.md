# Nexora App — AWS Deployment Plan

## The Key Insight

The app already has a backend — **Firebase handles authentication and all user data**.
AWS is needed only to **host the HTML file** publicly. This keeps costs extremely low.

---

## Architecture (Minimal Cost)

```
User Browser
     │
     ▼
AWS CloudFront (CDN + HTTPS)   ← free SSL, global fast delivery
     │
     ▼
AWS S3 (stores your HTML file)  ← static hosting, ~$0.01/month
     │
     └──── Firebase Auth + Firestore (stays as-is)
                │
                └── all user data, decks, vocab, flashcards
```

**Estimated monthly cost: ~$1–3/month** (mostly CloudFront at low traffic)

---

## Should You Buy a Domain?

**Yes.** Without a domain users hit an ugly URL like `d1abc.cloudfront.net`.

**Where to buy:**
- **Namecheap** — cheapest, ~$9–12/year for `.com`
- **AWS Route 53** — convenient (everything in one place), ~$13/year for `.com`
- `.app` domains require HTTPS (which you'll have anyway via ACM)

Suggested names: `nexora.io`, `nexora.app`

---

## Should You Move User Data to AWS?

**No, not yet.** Firebase Firestore free tier covers hundreds of active users at zero cost:
- 1 GB storage
- 50,000 reads/day
- 20,000 writes/day

Migrating to AWS (DynamoDB + API Gateway + Lambda) adds complexity and cost without benefit at this stage. **Keep Firebase, revisit at scale.**

---

## What to Track (Initial Stage)

Firebase Auth already captures signups. Add these fields to a `analytics/{userId}` Firestore doc:

| Field | What it tells you |
|---|---|
| `signupDate` | when they joined |
| `lastActiveDate` | retention / churn |
| `totalDecks` | engagement depth |
| `totalVocabAdded` | core usage |
| `totalFlashcardsAdded` | feature usage |
| `practiceSessionsCount` | how often they study |
| `platform` | desktop vs mobile |

This answers: *"Are people actually using it?"* — without overbuilding.

---

## Step-by-Step Setup Plan

### Phase 1 — Hosting (Day 1, ~2 hours)

Using **AWS Amplify** (easier than manual S3+CloudFront, same result):

1. Create AWS account (if not done)
2. Push HTML to GitHub (already done)
3. Connect Amplify to the GitHub repo — auto-deploys on every push
4. **Free tier:** 1,000 build minutes/month, 15 GB served/month — covers early traffic

### Phase 2 — Custom Domain (Day 1–2)

1. Buy domain (Namecheap or Route 53)
2. In Amplify: "Domain management" → add your domain
3. Amplify provisions a free SSL cert automatically via ACM
4. If using Namecheap: update CNAME records to point to Amplify

### Phase 3 — Analytics (Week 1)

1. Add a small `trackEvent(userId, event)` helper function to the HTML
2. Write to `analytics/{userId}` Firestore doc on: login, deck create, practice start
3. No new AWS services needed — Firebase handles it

### Phase 4 — Monitoring (Week 2, optional)

1. Enable Amplify access logs
2. Set an **AWS Billing Alert at $10/month** so there are no surprise charges

---

## IAM Access for Deployment

Create an IAM user in AWS Console → IAM → Users → "Create user" → attach these policies:

```
- AmplifyFullAccess
- AWSCertificateManagerFullAccess
- Route53FullAccess
- S3FullAccess (scoped to app bucket)
```

Download the Access Key CSV and share the Key ID + Secret to proceed with setup.
Temporarily using `AdministratorAccess` is fine during setup — revoke it after.

---

## Cost Summary

| Item | Cost |
|---|---|
| Domain | ~$10 one-time/year |
| AWS Amplify hosting | ~$1–3/month |
| Firebase (Auth + Firestore) | Free (early stage) |
| SSL Certificate (ACM) | Free |
| **Total** | **~$10 upfront + ~$2/month** |

---

## This Week's Action Items

- [ ] Buy a domain (~$10)
- [ ] Create AWS account + IAM user
- [ ] Connect Amplify to GitHub repo (30 min)
- [ ] Wire the custom domain (30 min)
- [ ] Add 5 analytics fields to Firestore writes in the HTML (~1 hour of code)
