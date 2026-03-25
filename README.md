# 🛖 Huck Finn's Raft

An idle browser game inspired by Mark Twain's *Adventures of Huckleberry Finn*. Drift down the Mississippi River from Cairo to New Orleans, catching fish, hiring companions, and building your reputation along the way.

**[▶ Play the game](https://danteofdoom.github.io/huckfin-game/)**

---

## Gameplay

You're Huck Finn with a raft, a fishing line, and a thousand miles of river ahead of you. Catch fish and sell them for dollars. Spend dollars on companions and upgrades that automate your income. Travel far enough and you'll reach New Orleans — where the journey resets and you earn permanent upgrades for the next run.

### Resources

| Resource | How to earn | Used for |
|----------|-------------|----------|
| 🐟 Fish | Tap Fish button, or hire Jim | Selling for dollars |
| 💰 Dollars | Sell fish, hire companions | Companions & upgrades |
| 📍 Miles | Buy raft upgrades | Unlocking towns & companions |
| ⭐ Rep | Earned on prestige | Permanent Freedom Upgrades |

### Companions

Companions earn resources every second passively. They unlock as you travel downriver.

| Companion | Unlocks at | Effect |
|-----------|------------|--------|
| 👨 Jim | Start (free) | +1 fish/sec |
| 🎩 Tom Sawyer | Mile 100 — $50 | +$0.50/sec |
| 👑 The King | Mile 300 — $200 | +$1.50/sec, raises suspicion |
| 🎭 The Duke | Mile 300 — $200 | +$1.00/sec, raises suspicion |
| 🕯️ Widow Douglas | Mile 500 — $500 | Rep gains +50% |

> ⚠️ Hiring the King or Duke activates a **Suspicion** meter. At 100% you lose 30% of your dollars and it resets. Buy the **Lay Low** upgrade to slow suspicion growth.

### Upgrades

| Category | Chain |
|----------|-------|
| 🎣 Fishing | Better Line → Two Lines → Fishing Net |
| 🪵 Raft | Sturdy Raft → Painted Raft → Steam-Powered |
| 💵 Trade | Town Dock → Haggle → Known Trader |
| 🤫 Risk | Lay Low (suspicion grows 50% slower) |

### Towns

| Mile | Town | Event |
|------|------|-------|
| 50 | Cairo | All fish sold at double price |
| 200 | Memphis | The King & Duke appear |
| 400 | Vicksburg | +$500 bonus — or lose 20% if the King is aboard |
| 600 | Natchez | Widow Douglas appears |
| 800 | Baton Rouge | Fish prices +50% for the rest of the run |
| 1000 | New Orleans | Journey complete — prestige! |

### Prestige

Reaching New Orleans completes the run. Your progress resets but you earn ⭐ Rep (`floor(dollars ÷ 200) × multiplier`) to spend on **Freedom Upgrades** — permanent bonuses that apply to every future run.

| Upgrade | Cost | Effect |
|---------|------|--------|
| 🏃 Head Start | 1 ⭐ | Start with Jim already hired |
| 🌊 Faster Current | 2 ⭐ | +10% miles/sec base |
| 🌟 Good Reputation | 2 ⭐ | Town bonuses +25% |
| 🎣 Seasoned Fisherman | 3 ⭐ | Start with Fishing Net already owned |
| 👥 Full Crew | 5 ⭐ | All companions cost 50% less |

---

## Running Locally

No build step required — it's plain HTML, CSS, and JavaScript.

```bash
git clone https://github.com/danteofdoom/huckfin-game.git
cd huckfin-game
open index.html   # or serve with any static file server
```

---

## Project Structure

```
huckfin-game/
├── index.html          # Game shell and layout
├── how-to-play.html    # In-game help page
├── style.css           # Styles
└── js/
    ├── state.js        # Game state
    ├── engine.js       # Game loop and tick logic
    ├── upgrades.js     # Upgrade definitions
    ├── actions.js      # Player actions (fish, sell, buy)
    ├── save.js         # Auto-save and offline progress
    ├── ui.js           # DOM rendering
    └── debug.js        # Debug panel
```

The game saves automatically every second using `localStorage`. Offline earnings are credited on return, capped at 8 hours.
