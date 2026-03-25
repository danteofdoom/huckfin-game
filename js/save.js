// save.js — localStorage save/load and offline earnings on startup

const Save = {};

const SAVE_KEY     = 'huckfinn_save';
const SAVE_VERSION = 2;

// ── Save ───────────────────────────────────────────────────────────────────

Save.save = function () {
  const data = {
    version:    SAVE_VERSION,
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

    // Lifetime stats
    stats: { ...State.stats },
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Save failed:', e);
  }
};

// ── Helpers ────────────────────────────────────────────────────────────────

// Safe numeric load — falls back to defaultVal if value is missing, NaN, or non-finite
Save._num = function (val, defaultVal) {
  const n = Number(val);
  return (val != null && isFinite(n)) ? n : defaultVal;
};

// Safe boolean load
Save._bool = function (val, defaultVal) {
  return (typeof val === 'boolean') ? val : defaultVal;
};

// ── Migrations ─────────────────────────────────────────────────────────────

Save._migrate = function (data) {
  const v = data.version ?? 1;

  // v1 → v2: no structural changes needed; new upgrades/companions default to
  // their state.js values when absent from the save, which is already handled
  // by the load loop guards. Version bump only.

  data.version = SAVE_VERSION;
  return data;
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

  // Run any version migrations before applying
  data = Save._migrate(data);

  // Resources
  State.fish      = Save._num(data.fish,      0);
  State.dollars   = Save._num(data.dollars,   0);
  State.miles     = Save._num(data.miles,     0);
  State.rep       = Save._num(data.rep,       0);
  State.suspicion = Save._num(data.suspicion, 0);

  // Time
  State.day         = Save._num(data.day,         1);
  State.tickSeconds = Save._num(data.tickSeconds, 0);

  // Run bonus
  State._batonRougeBonus = Save._num(data.batonRougeBonus, 1);

  // Companions — only restore known IDs; new companions keep state.js defaults
  if (data.companions) {
    for (const [id, saved] of Object.entries(data.companions)) {
      const c = State.companions[id];
      if (!c) continue;
      c.hired     = Save._bool(saved.hired, false);
      c.unlocksAt = Save._num(saved.unlocksAt, c.unlocksAt);
    }
  }

  // Upgrades — only restore known IDs; new upgrades keep owned: false default
  if (data.upgrades) {
    for (const [id, saved] of Object.entries(data.upgrades)) {
      const u = State.upgrades[id];
      if (!u) continue;
      u.owned = Save._bool(saved.owned, false);
    }
  }

  // Freedom upgrades — only restore known IDs
  if (data.freedomUpgrades) {
    for (const [id, saved] of Object.entries(data.freedomUpgrades)) {
      const u = State.freedomUpgrades[id];
      if (!u) continue;
      u.owned = Save._bool(saved.owned, false);
    }
  }

  // Towns — matched by mile marker; new towns keep visited: false default
  if (data.towns) {
    for (const saved of data.towns) {
      const town = State.towns.find(t => t.mile === saved.mile);
      if (!town) continue;
      town.visited = Save._bool(saved.visited, false);
    }
  }

  // Lifetime stats
  if (data.stats) {
    State.stats.totalFish    = Save._num(data.stats.totalFish,    0);
    State.stats.totalDollars = Save._num(data.stats.totalDollars, 0);
    State.stats.prestiges    = Save._num(data.stats.prestiges,    0);
  }

  // Offline earnings
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
