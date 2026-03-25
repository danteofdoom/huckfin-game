// ui.js — renders game state to the DOM and initialises the game on load

const UI = {};

// ── Log ────────────────────────────────────────────────────────────────────

UI.log = function (message) {
  const log   = document.getElementById('log');
  const entry = document.createElement('p');
  entry.className   = 'log-entry';
  entry.textContent = message;
  log.prepend(entry);

  // Keep log from growing unbounded
  while (log.children.length > 30) {
    log.removeChild(log.lastChild);
  }
};

// ── Number formatting ──────────────────────────────────────────────────────

UI.fmt = function (n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
};

UI.fmtDollars = function (n) {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  if (n >= 10)  return '$' + Math.floor(n);
  return '$' + n.toFixed(2);
};

UI.flashRed = function () {
  const el = document.getElementById('dollars');
  el.classList.remove('flash-red');
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add('flash-red');
  setTimeout(() => el.classList.remove('flash-red'), 700);
};

UI.flashPrestige = function () {
  const el = document.getElementById('app');
  el.classList.remove('prestige-flash');
  void el.offsetWidth;
  el.classList.add('prestige-flash');
  setTimeout(() => el.classList.remove('prestige-flash'), 1500);
};

UI.spawnFishFloat = function (n) {
  const btn  = document.getElementById('btn-fish');
  const rect = btn.getBoundingClientRect();
  const el   = document.createElement('span');
  el.className   = 'fish-float';
  el.textContent = `+${n}`;
  el.style.left  = (rect.left + rect.width / 2) + 'px';
  el.style.top   = rect.top + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
};

// ── Main Render ────────────────────────────────────────────────────────────

UI.render = function () {
  UI._renderHeader();
  UI._renderRiver();
  UI._renderResources();
  UI._renderSuspicion();
  UI._renderCompanions();
  UI._renderUpgrades();
  UI._renderPrestige();
  UI._renderStats();
};

// ── Header ─────────────────────────────────────────────────────────────────

UI._renderHeader = function () {
  document.getElementById('day-counter').textContent = `Day ${State.day}`;
};

// ── River ──────────────────────────────────────────────────────────────────

UI._renderRiver = function () {
  const miles = State.miles;
  const pct   = (miles / 1000) * 100;

  document.getElementById('miles').textContent        = Math.floor(miles);
  document.getElementById('miles-rate').textContent   = `+${State.rates.milesPerSec.toFixed(2)} mi/sec`;
  document.getElementById('progress-bar').style.width = `${pct.toFixed(2)}%`;

  // Town markers
  const barBg   = document.getElementById('progress-bar-bg');
  const existing = barBg.querySelectorAll('.town-marker');
  if (existing.length === 0) {
    // Render once — markers don't move
    for (const town of State.towns) {
      const marker = document.createElement('div');
      marker.className   = 'town-marker';
      marker.style.left  = `${(town.mile / 1000) * 100}%`;
      marker.title       = town.name;
      barBg.appendChild(marker);
    }
  }
  // Update visited state each render
  const markers = barBg.querySelectorAll('.town-marker');
  State.towns.forEach((town, i) => {
    markers[i]?.classList.toggle('visited', town.visited);
  });

  // Next unvisited town
  const next = State.towns.find(t => !t.visited);
  if (next) {
    const remaining = Math.ceil(next.mile - miles);
    document.getElementById('next-town').textContent =
      `Next: ${next.name} — ${remaining} mi`;
  } else {
    document.getElementById('next-town').textContent = '🎉 New Orleans ahead!';
  }
};

// ── Resources ──────────────────────────────────────────────────────────────

UI._renderResources = function () {
  document.getElementById('fish').textContent         = UI.fmt(State.fish);
  document.getElementById('fish-rate').textContent    = `+${State.rates.fishPerSec.toFixed(1)}/sec`;
  document.getElementById('dollars').textContent      = UI.fmtDollars(State.dollars);
  document.getElementById('dollars-rate').textContent = `+${UI.fmtDollars(State.rates.dollarsPerSec)}/sec`;
  document.getElementById('rep').textContent          = UI.fmt(State.rep);

  document.getElementById('btn-sell-half').disabled = State.fish < 2;
  document.getElementById('btn-sell').disabled      = State.fish < 1;
};

// ── Suspicion ──────────────────────────────────────────────────────────────

UI._renderSuspicion = function () {
  const active = State.rates.suspicionPerSec > 0 || State.suspicion > 0;
  const section = document.getElementById('suspicion-section');

  if (!active) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  document.getElementById('suspicion-value').textContent = `${Math.floor(State.suspicion)}%`;

  const bar = document.getElementById('suspicion-bar');
  bar.style.width = `${State.suspicion}%`;
  bar.classList.toggle('suspicion-high', State.suspicion >= 75);

  const bribeCost = Actions.bribeCost();
  document.getElementById('bribe-cost').textContent = UI.fmtDollars(bribeCost);
  document.getElementById('btn-bribe').disabled = State.dollars < bribeCost || State.suspicion <= 0;
};

// ── Companions ─────────────────────────────────────────────────────────────

UI._renderCompanions = function () {
  const list = document.getElementById('companions-list');
  list.innerHTML = '';

  for (const c of Object.values(State.companions)) {
    // Hide companions not yet unlocked by miles
    if (State.miles < c.unlocksAt) continue;

    const cost    = Actions._companionCost(c);
    const canAfford = State.dollars >= cost;

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-info">
        <span class="card-name">${c.icon} ${c.name}</span>
        <span class="card-desc">${c.desc}</span>
      </div>
      <div class="card-action">
        ${c.hired
          ? `<span class="badge-hired">✓ On board</span>`
          : c.cost === 0
            ? `<button onclick="Actions.buyCompanion('${c.id}')">Hire (free)</button>`
            : `<button
                onclick="Actions.buyCompanion('${c.id}')"
                ${canAfford ? '' : 'disabled'}
               >${UI.fmtDollars(cost)}</button>`
        }
      </div>
    `;

    list.appendChild(card);
  }
};

// ── Upgrades ───────────────────────────────────────────────────────────────

UI._renderUpgrades = function () {
  const list = document.getElementById('upgrades-list');
  list.innerHTML = '';

  for (const u of Object.values(State.upgrades)) {
    // Hide if prerequisite not yet owned
    if (u.requires && !State.upgrades[u.requires].owned) continue;

    const mileLocked = u.unlocksAt > 0 && State.miles < u.unlocksAt;
    const canAfford  = !mileLocked && State.dollars >= u.cost;

    const card = document.createElement('div');
    card.className = mileLocked ? 'card card-locked' : 'card';

    card.innerHTML = `
      <div class="card-info">
        <span class="card-name">${u.icon} ${u.name}</span>
        <span class="card-desc">${u.desc}</span>
      </div>
      <div class="card-action">
        ${u.owned
          ? `<span class="badge-owned">✓ Owned</span>`
          : mileLocked
            ? `<span class="badge-locked">Mile ${u.unlocksAt}</span>`
            : `<button
                onclick="Actions.buyUpgrade('${u.id}')"
                ${canAfford ? '' : 'disabled'}
               >${UI.fmtDollars(u.cost)}</button>`
        }
      </div>
    `;

    list.appendChild(card);
  }
};

// ── Prestige Shop ──────────────────────────────────────────────────────────

UI._renderPrestige = function () {
  const section = document.getElementById('prestige-section');

  // Only show after first prestige
  if (State.rep <= 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  document.getElementById('rep-available').textContent = `— ${UI.fmt(State.rep)} ⭐ available`;

  const list = document.getElementById('prestige-list');
  list.innerHTML = '';

  for (const u of Object.values(State.freedomUpgrades)) {
    const canAfford = State.rep >= u.cost;

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-info">
        <span class="card-name">${u.icon} ${u.name}</span>
        <span class="card-desc">${u.desc}</span>
      </div>
      <div class="card-action">
        ${u.owned
          ? `<span class="badge-owned">✓ Owned</span>`
          : `<button
              onclick="Actions.buyFreedomUpgrade('${u.id}')"
              ${canAfford ? '' : 'disabled'}
             >${u.cost} ⭐</button>`
        }
      </div>
    `;

    list.appendChild(card);
  }
};

// ── Stats ───────────────────────────────────────────────────────────────────

UI._renderStats = function () {
  const section = document.getElementById('stats-section');
  if (section.classList.contains('hidden')) return;

  const rows = [
    ['Fish caught',    UI.fmt(State.stats.totalFish)],
    ['Dollars earned', UI.fmtDollars(State.stats.totalDollars)],
    ['Journeys made',  State.stats.prestiges],
    ['Day',            State.day],
  ];

  document.getElementById('stats-list').innerHTML = rows
    .map(([label, value]) => `<div class="stat-row"><span>${label}</span><span>${value}</span></div>`)
    .join('');
};

// ── Init ───────────────────────────────────────────────────────────────────

UI.init = function () {
  const loaded = Save.load();

  if (!loaded) {
    UI.log(`🌊 The Mississippi stretches out before you. Time to find your fortune.`);
  }

  Actions.init();
  State.recalcRates();
  UI.render();
  Engine.start();
};

// Start everything when the DOM is ready
document.addEventListener('DOMContentLoaded', UI.init);
