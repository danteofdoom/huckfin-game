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

  State.stats.totalFish    += State.rates.fishPerSec;
  State.stats.totalDollars += State.rates.dollarsPerSec;

  // Day counter: 1 day = 60 seconds
  State.day = 1 + Math.floor(State.tickSeconds / 60);

  if (State.upgrades.autoSell.owned && State.fish >= 1) {
    Actions.sellFish(true);
  }

  Engine._tickSuspicion();
  Engine._checkTowns();

  Save.save();
  UI.render();
};

// ── Suspicion ──────────────────────────────────────────────────────────────

Engine._tickSuspicion = function () {
  if (State.rates.suspicionPerSec === 0 && State.suspicion === 0) return;

  const cap  = State.freedomUpgrades.layOfTheLand.owned ? 80 : 100;
  const prev = State.suspicion;
  const net  = State.rates.suspicionPerSec - State.rates.suspicionDecayPerSec;
  State.suspicion = Math.max(0, Math.min(State.suspicion + net, cap));

  // Warn once when crossing 75%
  if (prev < 75 && State.suspicion >= 75) {
    UI.log(`🚨 Suspicion is high — the law is watching. Lay low or face the consequences!`);
  }

  if (State.suspicion >= cap) {
    const lost = State.dollars * 0.3;
    State.dollars   = Math.max(0, State.dollars - lost);
    State.suspicion = 0;
    const msgs = [
      `⚠️ The sheriff came knocking — the King's latest con unravelled fast. Lost ${UI.fmtDollars(lost)}.`,
      `⚠️ An angry mob from the last town caught up with the raft. The Duke's handbills were lies. Lost ${UI.fmtDollars(lost)}.`,
      `⚠️ Federal marshals boarded at dawn. Someone talked. Lost ${UI.fmtDollars(lost)}.`,
      `⚠️ Three towns remembered the King's face. You paid to make them forget. Lost ${UI.fmtDollars(lost)}.`,
    ];
    UI.log(msgs[Math.floor(Math.random() * msgs.length)]);
    UI.flashRed();
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
      UI.log(`🏘️ Cairo: The market fishmongers fight over your catch. Sold everything at double price! +${UI.fmtDollars(earned)}`);
      break;
    }

    case 'Memphis': {
      State.companions.king.unlocksAt = 0;
      State.companions.duke.unlocksAt = 0;
      UI.log(`🏘️ Memphis: Two well-dressed strangers step off the levee. They have the look of men with schemes — and the charm to sell them.`);
      break;
    }

    case 'Vicksburg': {
      if (State.companions.king.hired) {
        const lost = State.dollars * 0.2;
        State.dollars -= lost;
        UI.log(`🏘️ Vicksburg: The King's latest scheme collapsed spectacularly. The sheriff is not amused. Lost ${UI.fmtDollars(lost)}.`);
        UI.flashRed();
      } else {
        const earned = 500 * bonus;
        State.dollars += earned;
        UI.log(`🏘️ Vicksburg: Clean hands, honest trade. The merchants here respect that. +${UI.fmtDollars(earned)}`);
      }
      break;
    }

    case 'Natchez': {
      State.companions.widow.unlocksAt = 0;
      UI.log(`🏘️ Natchez: A kind-faced woman waves from the dock — Widow Douglas. She's heard you're an honest sort and would like to join you downriver.`);
      break;
    }

    case 'Baton Rouge': {
      State._batonRougeBonus = (State._batonRougeBonus || 1) * 1.5;
      UI.log(`🏘️ Baton Rouge: Word of your trading has spread ahead of the raft. Merchants are competing for your catch. Fish prices up 50% for the rest of the journey!`);
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
  const repEarned = Math.floor(State.dollars / 200) * State.rates.repMult;
  State.rep += repEarned;

  State.stats.prestiges += 1;

  const wisdomBonus = State.freedomUpgrades.riverWisdom.owned ? 3 : 0;
  State.rep += wisdomBonus;

  const totalRep = repEarned + wisdomBonus;
  const repMsg   = totalRep > 0 ? `You earned ${totalRep.toFixed(0)} ⭐ Rep.` : `No rep earned — spend more next run.`;
  UI.log(`🎉 New Orleans! You made it to the end of the river. ${repMsg} The raft turns north again...`);
  UI.flashPrestige();

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
  // Jim always starts hired — no click required
  State.companions.jim.hired = true;

  if (State.freedomUpgrades.seasonedFisherman.owned) {
    State.upgrades.betterLine.owned = true;
    State.upgrades.twoLines.owned   = true;
    State.upgrades.net.owned        = true;
  }

  if (State.freedomUpgrades.oldFaithful.owned) {
    State.upgrades.sturdyRaft.owned = true;
    State.upgrades.townDock.owned   = true;
  }

  if (State.freedomUpgrades.riversBlessing.owned) {
    State.dollars += 200;
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
