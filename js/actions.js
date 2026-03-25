// actions.js — all player-triggered actions

const Actions = {};

// ── Fishing ────────────────────────────────────────────────────────────────

Actions.fish = function () {
  const caught = State.freedomUpgrades.headStart.owned ? 3 : 1;
  State.fish += caught;
  State.stats.totalFish += caught;
  UI.render();
};

// ── Sell Fish ──────────────────────────────────────────────────────────────

Actions.sellFish = function (silent) {
  if (State.fish <= 0) return;

  const earned   = Math.floor(State.fish) * State.rates.fishSellPrice;
  State.dollars += earned;
  State.stats.totalDollars += earned;
  State.fish     = 0;

  if (!silent) UI.log(`💵 Sold fish for $${earned.toFixed(2)}.`);
  UI.render();
};

// ── Sell Half Fish ─────────────────────────────────────────────────────────

Actions.sellHalf = function () {
  const amount = Math.floor(State.fish / 2);
  if (amount <= 0) return;

  const earned   = amount * State.rates.fishSellPrice;
  State.dollars += earned;
  State.stats.totalDollars += earned;
  State.fish    -= amount;

  UI.log(`💵 Sold half your fish for $${earned.toFixed(2)}.`);
  UI.render();
};

// ── Buy Companion ──────────────────────────────────────────────────────────

Actions.buyCompanion = function (id) {
  const companion = State.companions[id];
  if (!companion || companion.hired) return;
  if (State.miles < companion.unlocksAt) return;

  const cost = Actions._companionCost(companion);
  if (State.dollars < cost) {
    UI.log(`💸 Not enough dollars to hire ${companion.name}. Need $${cost.toFixed(2)}.`);
    return;
  }

  State.dollars     -= cost;
  companion.hired    = true;

  State.recalcRates();
  UI.log(`✅ ${companion.icon} ${companion.name} joined your raft!`);
  UI.render();
};

// ── Buy Upgrade ───────────────────────────────────────────────────────────

Actions.buyUpgrade = function (id) {
  const upgrade = State.upgrades[id];
  if (!upgrade || upgrade.owned) return;

  // Check prerequisite
  if (upgrade.requires && !State.upgrades[upgrade.requires].owned) {
    UI.log(`🔒 Requires ${State.upgrades[upgrade.requires].name} first.`);
    return;
  }

  // Check mile requirement
  if (upgrade.unlocksAt > 0 && State.miles < upgrade.unlocksAt) return;

  if (State.dollars < upgrade.cost) {
    UI.log(`💸 Not enough dollars for ${upgrade.name}. Need $${upgrade.cost}.`);
    return;
  }

  State.dollars  -= upgrade.cost;
  upgrade.owned   = true;

  State.recalcRates();
  UI.log(`✅ ${upgrade.icon} ${upgrade.name} purchased!`);
  UI.render();
};

// ── Buy Freedom Upgrade (prestige) ────────────────────────────────────────

Actions.buyFreedomUpgrade = function (id) {
  const upgrade = State.freedomUpgrades[id];
  if (!upgrade || upgrade.owned) return;

  if (State.rep < upgrade.cost) {
    UI.log(`⭐ Not enough Rep for ${upgrade.name}. Need ${upgrade.cost} Rep.`);
    return;
  }

  State.rep      -= upgrade.cost;
  upgrade.owned   = true;

  UI.log(`🌟 Freedom Upgrade unlocked: ${upgrade.name}!`);
  UI.render();
};

// ── Helpers ────────────────────────────────────────────────────────────────

// Apply Full Crew freedom upgrade discount
Actions._companionCost = function (companion) {
  const discount = State.freedomUpgrades.fullCrew.owned ? 0.5 : 1.0;
  return companion.cost * discount;
};

// ── Wire up DOM buttons ────────────────────────────────────────────────────

Actions.init = function () {
  document.getElementById('btn-fish').addEventListener('click', Actions.fish);
  document.getElementById('btn-sell-half').addEventListener('click', Actions.sellHalf);
  document.getElementById('btn-sell').addEventListener('click', Actions.sellFish);

  document.getElementById('btn-debug').addEventListener('click', () => {
    document.getElementById('debug-section').classList.toggle('hidden');
  });

  document.getElementById('btn-stats').addEventListener('click', () => {
    document.getElementById('stats-section').classList.toggle('hidden');
    UI._renderStats();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      Engine.stop();
      Save.reset();
      location.reload();
    }
  });

  document.addEventListener('keydown', (e) => {
    // Ignore shortcuts when typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      Actions.fish();
    } else if (e.key === 's' || e.key === 'S') {
      Actions.sellFish();
    }
  });
};
