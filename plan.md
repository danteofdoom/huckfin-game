# Huck Finn — Idle Browser Game Plan

A text-based idle game built with vanilla HTML/CSS/JS, deployable via GitHub Pages.

---

## Status

### ✅ Done
- `index.html` — full game layout (header, river bar, resources, actions, companions, upgrades, prestige shop, log, footer)
- `style.css` — dark warm river aesthetic, all panels styled including prestige shop, debug panel, footer
- `js/state.js` — all game data: resources, companions, upgrades, freedom upgrades, towns, derived rates, `recalcRates()`
- `js/engine.js` — tick loop (1s), suspicion, town events, prestige reset, offline earnings
- `js/actions.js` — fish, sell, buy companion, buy upgrade, buy freedom upgrade, reset/debug button wiring
- `js/save.js` — localStorage save/load, offline earnings on startup, reset
- `js/debug.js` — cheat panel: add fish/dollars/miles/rep, skip to any town, trigger raid, skip to prestige
- `js/upgrades.js` — stub (logic lives in actions.js and ui.js)
- `js/ui.js` — full DOM rendering: header, river, resources, suspicion, companions, upgrades, prestige shop, log, init
- `how-to-play.html` — plain English guide covering fishing, miles, companions, suspicion, towns, prestige, saving

### 🔜 Next Steps
1. **GitHub Pages deploy** — create a GitHub repo, push the game, enable Pages for a live URL
2. **Polish pass** — play through and fix anything that feels off (balancing costs/rates, missing edge cases)
3. **Nice to haves** (post-deploy)
   - Achievements / milestones panel
   - Sound effects (optional toggle)
   - Animated river progress marker
   - Mobile touch optimisation (larger tap targets)

---

## File Structure

```
huckfin-game/
├── index.html
├── style.css
├── how-to-play.html
└── js/
    ├── state.js
    ├── engine.js
    ├── actions.js
    ├── save.js
    ├── debug.js
    ├── upgrades.js   (stub)
    └── ui.js
```

---

## Concept

You play as Huck Finn drifting down the Mississippi River on a raft. You fish, trade at towns,
recruit companions, and earn enough to keep moving south. Prestige by completing the full river
journey and starting again with permanent upgrades.

---

## Tech Stack

- **HTML** — single `index.html` shell
- **CSS** — dark/warm river aesthetic, monospace font
- **Vanilla JS** — no framework, split across a few files
- **localStorage** — save/load game state
- **GitHub Pages** — free hosting

---

## Core Resources

| Resource   | Description                              |
|------------|------------------------------------------|
| 🐟 Fish     | Primary early currency, caught by Huck  |
| 💰 Dollars  | Main currency, earned by selling fish   |
| 📍 Miles    | Progress down the river (0–1000)        |
| ⭐ Rep      | Prestige currency, earned per journey   |

---

## Game Loop

1. **Tick** fires every second
2. Each active earner adds to its resource
3. Player manually sells fish for dollars (early game) — later automatable
4. Dollars spent on upgrades and companions
5. Miles accumulate passively once raft upgrades are purchased
6. Reach mile 1000 → prestige, spend Rep on permanent bonuses, restart

---

## Companions (Passive Earners)

| Companion     | Unlocks at   | Earns            | Cost       |
|---------------|--------------|------------------|------------|
| Jim           | Start        | +fish/sec        | Free       |
| Tom Sawyer    | Mile 100     | +$/sec           | $50        |
| The King      | Mile 300     | +$/sec (risky)   | $200       |
| The Duke      | Mile 300     | +$/sec (risky)   | $200       |
| Widow Douglas | Mile 500     | Rep multiplier   | $500       |

---

## Upgrades

### Raft Upgrades (increase miles/sec)
- Patched Raft — free (start)
- Sturdy Raft — $25
- Painted Raft — $150
- Steam-Powered Raft — $1,000

### Fishing Upgrades (increase fish/sec)
- Cane Pole — free (start)
- Better Line — $10
- Two Lines — $40
- Net — $200

### Trade Upgrades (increase sell price per fish)
- Sell at Riverbank — free (start)
- Sell at Town Dock — $30
- Haggle Skill — $100
- Known Trader — $400

---

## Towns (Milestone Events)

| Mile | Town             | Event                                  |
|------|------------------|----------------------------------------|
| 50   | Cairo            | Sell fish at double price (one time)   |
| 200  | Memphis          | Unlock The King & The Duke             |
| 400  | Vicksburg        | Bonus $500, risk event if King active  |
| 600  | Natchez          | Widow Douglas joins                    |
| 800  | Baton Rouge      | All fish prices +50% permanently       |
| 1000 | New Orleans      | Journey complete — prestige trigger    |

---

## Prestige

On completing the journey (mile 1000):
- Earn **Rep** based on dollars earned during the run
- Reset: miles, fish, dollars, companions, upgrades
- Keep: Rep and any purchased **Freedom Upgrades**

### Freedom Upgrades (permanent, bought with Rep)

| Upgrade             | Cost | Effect                        |
|---------------------|------|-------------------------------|
| Head Start          | 1 ⭐  | Start with Jim already hired  |
| Faster Current      | 2 ⭐  | +10% miles/sec base           |
| Good Reputation     | 2 ⭐  | Towns give +25% bonuses       |
| Seasoned Fisherman  | 3 ⭐  | Start with Fishing Net owned  |
| Full Crew           | 5 ⭐  | All companions 2x cheaper     |


A text-based idle game built with vanilla HTML/CSS/JS, deployable via GitHub Pages.

---

## Concept

You play as Huck Finn drifting down the Mississippi River on a raft. You fish, trade at towns,
recruit companions, and earn enough to keep moving south. Prestige by completing the full river
journey and starting again with permanent upgrades.

---

## Tech Stack

- **HTML** — single `index.html` shell
- **CSS** — dark/warm river aesthetic, monospace font
- **Vanilla JS** — no framework, split across a few files
- **localStorage** — save/load game state
- **GitHub Pages** — free hosting

### File Structure

```
huckfin-game/
├── index.html
├── style.css
├── js/
│   ├── state.js       # game state singleton
│   ├── engine.js      # tick loop, offline earnings
│   ├── actions.js     # player actions (fish, sell, travel)
│   ├── upgrades.js    # upgrade definitions and logic
│   ├── ui.js          # DOM rendering
│   └── save.js        # localStorage save/load
└── plan.md
```

---

## Core Resources

| Resource   | Description                              |
|------------|------------------------------------------|
| 🐟 Fish     | Primary early currency, caught by Huck  |
| 💰 Dollars  | Main currency, earned by selling fish   |
| 📍 Miles    | Progress down the river (0–1000)        |
| ⭐ Rep      | Prestige currency, earned per journey   |

---

## Game Loop

1. **Tick** fires every second
2. Each active earner adds to its resource
3. Player manually sells fish for dollars (early game) — later automatable
4. Dollars spent on upgrades and companions
5. Miles accumulate passively once raft upgrades are purchased
6. Reach mile 1000 → prestige, spend Rep on permanent bonuses, restart

---

## Companions (Passive Earners)

Unlocked in order as the game progresses.

| Companion     | Unlocks at   | Earns            | Cost       |
|---------------|--------------|------------------|------------|
| Jim           | Start        | +fish/sec        | Free       |
| Tom Sawyer    | Mile 100     | +$/sec           | $50        |
| The King      | Mile 300     | +$/sec (risky)   | $200       |
| The Duke      | Mile 300     | +$/sec (risky)   | $200       |
| Widow Douglas | Mile 500     | Rep multiplier   | $500       |

---

## Upgrades

Upgrades are purchased with dollars and improve rates permanently (for the run).

### Raft Upgrades (increase miles/sec)
- Patched Raft — free (start)
- Sturdy Raft — $25
- Painted Raft — $150
- Steam-Powered Raft — $1,000

### Fishing Upgrades (increase fish/sec)
- Cane Pole — free (start)
- Better Line — $10
- Two Lines — $40
- Net — $200

### Trade Upgrades (increase sell price per fish)
- Sell at Riverbank — free (start)
- Sell at Town Dock — $30
- Haggle Skill — $100
- Known Trader — $400

---

## Towns (Milestone Events)

At certain mile markers, a town event triggers. Towns offer:
- A one-time bonus (cash, fish, upgrade discount)
- A short flavour text scene
- Sometimes a risk: The King/Duke companions can trigger a "con gone wrong" event, losing some dollars

| Mile | Town             | Event                                  |
|------|------------------|----------------------------------------|
| 50   | Cairo            | Sell fish at double price (one time)   |
| 200  | Memphis          | Unlock The King & The Duke             |
| 400  | Vicksburg        | Bonus $500, risk event if King/Duke active |
| 600  | Natchez          | Widow Douglas joins, boosts Rep gain   |
| 800  | Baton Rouge      | All fish prices +50% permanently       |
| 1000 | New Orleans      | Journey complete — prestige trigger    |

---

## Prestige

On completing the journey (mile 1000):

- Earn **Rep** based on dollars earned during the run
- Reset: miles, fish, dollars, companions, upgrades
- Keep: Rep and any purchased **Freedom Upgrades**

### Freedom Upgrades (permanent, bought with Rep)

| Upgrade             | Cost | Effect                        |
|---------------------|------|-------------------------------|
| Head Start          | 1 ⭐  | Start with Jim already hired  |
| Faster Current      | 2 ⭐  | +10% miles/sec base           |
| Good Reputation     | 2 ⭐  | Towns give +25% bonuses       |
| Seasoned Fisherman  | 3 ⭐  | Start with "Net" upgrade      |
| Full Crew           | 5 ⭐  | All companions 2x cheaper     |

---

## Risk Mechanic — Suspicion

The King and The Duke companions add **Suspicion** over time.
- Suspicion displayed as a meter (0–100%)
- At 100%: lose 30% of current dollars, suspicion resets
- Upgrade "Lay Low" reduces suspicion gain rate (costs $300)

---

## UI Layout

```
┌─────────────────────────────────────────────┐
│  🛖 Huck Finn's Raft          Day 4         │
│  📍 Mile 47 ░░░░░░░░░░░░░░░░░░  4.7%        │
├────────────────┬────────────────────────────┤
│  🐟 Fish: 24   │  💰 $3.42                  │
│  +2.0/sec      │  +$0.80/sec                │
├────────────────┴────────────────────────────┤
│  [🎣 Fish]   [💵 Sell Fish]   [🏘 Town]     │
├─────────────────────────────────────────────┤
│  COMPANIONS                                 │
│  Jim — fishing  +1.0 fish/sec   [hired]     │
│  Tom Sawyer — Mile 100          [$50]       │
├─────────────────────────────────────────────┤
│  UPGRADES                                   │
│  Better Line — +1 fish/sec      [$10] ✓     │
│  Two Lines   — +2 fish/sec      [$40]       │
├─────────────────────────────────────────────┤
│  📜 "The river don't care who you are."     │
└─────────────────────────────────────────────┘
```

---

## Offline Earnings

- On save: store `Date.now()` timestamp
- On load: calculate elapsed seconds, cap at 8 hours
- Apply passive income (fish/sec, $/sec, miles/sec) for elapsed time
- Show "Welcome back" message with summary of what was earned

---

## Milestones / Achievements (Nice to Have)

- First fish caught
- First dollar earned
- Hired Jim
- Reached Memphis
- Completed first journey
- Completed journey without King/Duke

---

## Build Order

1. `index.html` + `style.css` — static layout
2. `state.js` — resource variables, tick rates
3. `engine.js` — 1-second tick loop
4. `ui.js` — render state to DOM each tick
5. `actions.js` — fish, sell, buy upgrade buttons
6. `save.js` — save/load with localStorage
7. Add companions
8. Add towns/milestones
9. Add prestige loop
10. Add risk/suspicion mechanic
11. Polish + GitHub Pages deploy
