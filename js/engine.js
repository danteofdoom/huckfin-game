// engine.js — tick loop, town events, suspicion raids, offline earnings

const Engine = {
  tickInterval: null,
  TICK_MS:      1000,   // 1 second per tick
  OFFLINE_CAP:  8 * 60 * 60,  // max 8 hours of offline earnings
};

// ── Start / Stop ───────────────────────────────────────────────────────────

Engine.start = function () {
  if (Engine.tickInterval) return;
  Engine.tickInterval = setInterval(Engine.tick, Engine.TICK_MS);
};

Engine.stop = function () {
  clearInterval(Engine.tickInterval);
  Engine.tickInterval = null;
};

// ── Main Tick ──────────────────────────────────────────────────────────────

Engine.tick = function () {
  State.recalcRates();

  State.fish        += State.rates.fishPerSec;
  State.dollars     += State.rates.dollarsPerSec;
  State.miles        = Math.min(State.miles + State.rates.milesPerSec, 1000);
  State.tickSeconds += 1;

  // Day counter: 1 day = 60 seconds
  State.day = 1 + Math.floor(State.tickSeconds / 60);

  Engine._tickSuspicion();
  Engine._checkTowns();

  Save.save();
  UI.render();
};

// ── Suspicion ──────────────────────────────────────────────────────────────

Engine._tickSuspicion = function () {
  if (State.rates.suspicionPerSec === 0) return;

  State.suspicion = Math.min(State.suspicion + State.rates.suspicionPerSec, 100);

  if (State.suspicion >= 100) {
    const lost = State.dollars * 0.3;
    State.dollars  = Math.max(0, State.dollars - lost);
    State.suspicion = 0;
    UI.log(`⚠️ The law caught up with the King's schemes! Lost $${lost.toFixed(2)}.`);
  }
};

// ── Town Events ────────────────────────────────────────────────────────────

Engine._checkTowns = function () {
  for (const town of State.towns) {
    if (town.visited) continue;
    if (State.miles < town.mile) continue;

    town.visited = true;
    Engine._triggerTown(town);
  }
};

Engine._triggerTown = function (town) {
  const bonus = State.freedomUpgrades.goodReputation.owned ? 1.25 : 1.0;

  switch (town.name) {
    case 'Cairo': {
      const earned = State.fish * State.rates.fishSellPrice * 2 * bonus;
      State.dollars += earned;
      State.fish     = 0;
      UI.log(`🏘️ ${town.name}: Sold all fish at double price! +$${earned.toFixed(2)}`);
      break;
    }

    case 'Memphis': {
      // Unlock King and Duke companions (reduce unlocksAt so they appear in UI)
      State.companions.king.unlocksAt = 0;
      State.companions.duke.unlocksAt = 0;
      UI.log(`🏘️ ${town.name}: Two shady characters offer to join your raft...`);
      break;
    }

    case 'Vicksburg': {
      if (State.companions.king.hired) {
        // Con gone wrong — lose 20% dollars
        const lost = State.dollars * 0.2;
        State.dollars -= lost;
        UI.log(`🏘️ ${town.name}: The King's con went wrong! Lost $${lost.toFixed(2)}.`);
      } else {
        const earned = 500 * bonus;
        State.dollars += earned;
        UI.log(`🏘️ ${town.name}: Honest trading pays off! +$${earned.toFixed(2)}`);
      }
      break;
    }

    case 'Natchez': {
      // Widow Douglas unlock
      State.companions.widow.unlocksAt = 0;
      UI.log(`🏘️ ${town.name}: Widow Douglas steps onto the dock. She looks trustworthy.`);
      break;
    }

    case 'Baton Rouge': {
      // Permanent fish sell price boost for this run: multiply current multiplier by 1.5
      // We apply this by bumping a persistent run bonus on state
      State._batonRougeBonus = (State._batonRougeBonus || 1) * 1.5;
      UI.log(`🏘️ ${town.name}: Your reputation precedes you. Fish prices up 50%!`);
      break;
    }

    case 'New Orleans': {
      Engine._prestige();
      break;
    }
  }
};

// ── Prestige ───────────────────────────────────────────────────────────────

Engine._prestige = function () {
  Engine.stop();

  // Award rep based on dollars earned (1 rep per $200, min 1)
  const repEarned = Math.max(1, Math.floor(State.dollars / 200)) * State.rates.repMult;
  State.rep += repEarned;

  UI.log(`🎉 New Orleans! Journey complete. Earned ${repEarned.toFixed(0)} Rep. Starting again...`);

  // Preserve freedom upgrades and rep, reset everything else
  const savedRep              = State.rep;
  const savedFreedomUpgrades  = State.freedomUpgrades;

  // Reset run state
  State.fish        = 0;
  State.dollars     = 0;
  State.miles       = 0;
  State.suspicion   = 0;
  State.day         = 1;
  State.tickSeconds = 0;
  State._batonRougeBonus = 1;

  // Reset towns
  for (const town of State.towns) {
    town.visited = false;
  }

  // Reset companions
  for (const c of Object.values(State.companions)) {
    c.hired = false;
    // Restore original unlock requirements
    if (c.id === 'king' || c.id === 'duke') c.unlocksAt = 300;
    if (c.id === 'widow') c.unlocksAt = 500;
  }

  // Reset upgrades
  for (const u of Object.values(State.upgrades)) {
    u.owned = false;
  }

  // Restore persistent data
  State.rep              = savedRep;
  State.freedomUpgrades  = savedFreedomUpgrades;

  // Apply freedom upgrades
  Engine._applyFreedomUpgrades();

  Save.save();
  UI.render();
  Engine.start();
};

Engine._applyFreedomUpgrades = function () {
  if (State.freedomUpgrades.headStart.owned) {
    State.companions.jim.hired = true;
  }
  if (State.freedomUpgrades.seasonedFisherman.owned) {
    State.upgrades.betterLine.owned = true;
    State.upgrades.twoLines.owned   = true;
    State.upgrades.net.owned        = true;
  }
};

// ── Offline Earnings ───────────────────────────────────────────────────────

Engine.applyOfflineEarnings = function (secondsAway) {
  const elapsed = Math.min(secondsAway, Engine.OFFLINE_CAP);
  if (elapsed <= 0) return;

  State.recalcRates();

  const fishEarned    = State.rates.fishPerSec    * elapsed;
  const dollarsEarned = State.rates.dollarsPerSec * elapsed;
  const milesEarned   = State.rates.milesPerSec   * elapsed;

  State.fish    += fishEarned;
  State.dollars += dollarsEarned;
  State.miles    = Math.min(State.miles + milesEarned, 1000);

  const hours   = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  UI.log(`🌙 Welcome back! Away for ${timeStr}. +${Math.floor(fishEarned)} fish, +$${dollarsEarned.toFixed(2)}, +${milesEarned.toFixed(1)} miles.`);
};
