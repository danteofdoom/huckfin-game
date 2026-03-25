// save.js — localStorage save/load and offline earnings on startup

const Save = {};

const SAVE_KEY = 'huckfinn_save';

// ── Save ───────────────────────────────────────────────────────────────────

Save.save = function () {
  const data = {
    version:    1,
    savedAt:    Date.now(),

    // Resources
    fish:       State.fish,
    dollars:    State.dollars,
    miles:      State.miles,
    rep:        State.rep,
    suspicion:  State.suspicion,

    // Time
    day:         State.day,
    tickSeconds: State.tickSeconds,

    // Run bonus
    batonRougeBonus: State._batonRougeBonus || 1,

    // Companions — save only hired flag
    companions: Object.fromEntries(
      Object.entries(State.companions).map(([id, c]) => [id, {
        hired:      c.hired,
        unlocksAt:  c.unlocksAt,
      }])
    ),

    // Upgrades — save only owned flag
    upgrades: Object.fromEntries(
      Object.entries(State.upgrades).map(([id, u]) => [id, { owned: u.owned }])
    ),

    // Freedom upgrades — save only owned flag
    freedomUpgrades: Object.fromEntries(
      Object.entries(State.freedomUpgrades).map(([id, u]) => [id, { owned: u.owned }])
    ),

    // Towns — save only visited flag
    towns: State.towns.map(t => ({ mile: t.mile, visited: t.visited })),
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Save failed:', e);
  }
};

// ── Load ───────────────────────────────────────────────────────────────────

Save.load = function () {
  let raw;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch (e) {
    console.warn('Load failed:', e);
    return false;
  }

  if (!raw) return false;

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.warn('Save data corrupted:', e);
    return false;
  }

  // Resources
  State.fish       = data.fish       ?? 0;
  State.dollars    = data.dollars    ?? 0;
  State.miles      = data.miles      ?? 0;
  State.rep        = data.rep        ?? 0;
  State.suspicion  = data.suspicion  ?? 0;

  // Time
  State.day         = data.day         ?? 1;
  State.tickSeconds = data.tickSeconds ?? 0;

  // Run bonus
  State._batonRougeBonus = data.batonRougeBonus ?? 1;

  // Companions
  if (data.companions) {
    for (const [id, saved] of Object.entries(data.companions)) {
      if (State.companions[id]) {
        State.companions[id].hired     = saved.hired     ?? false;
        State.companions[id].unlocksAt = saved.unlocksAt ?? State.companions[id].unlocksAt;
      }
    }
  }

  // Upgrades
  if (data.upgrades) {
    for (const [id, saved] of Object.entries(data.upgrades)) {
      if (State.upgrades[id]) {
        State.upgrades[id].owned = saved.owned ?? false;
      }
    }
  }

  // Freedom upgrades
  if (data.freedomUpgrades) {
    for (const [id, saved] of Object.entries(data.freedomUpgrades)) {
      if (State.freedomUpgrades[id]) {
        State.freedomUpgrades[id].owned = saved.owned ?? false;
      }
    }
  }

  // Towns
  if (data.towns) {
    for (const saved of data.towns) {
      const town = State.towns.find(t => t.mile === saved.mile);
      if (town) town.visited = saved.visited ?? false;
    }
  }

  // Calculate and apply offline earnings
  if (data.savedAt) {
    const secondsAway = Math.floor((Date.now() - data.savedAt) / 1000);
    Engine.applyOfflineEarnings(secondsAway);
  }

  State.recalcRates();
  return true;
};

// ── Reset ──────────────────────────────────────────────────────────────────

Save.reset = function () {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.warn('Reset failed:', e);
  }
};
