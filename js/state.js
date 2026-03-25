// state.js — single source of truth for all game data

const State = {

  // ── Resources ──────────────────────────────────────────────
  fish:    0,
  dollars: 0,
  miles:   0,
  rep:     0,

  // ── Time ───────────────────────────────────────────────────
  day:         1,
  tickSeconds: 0,   // total seconds elapsed this run

  // ── Suspicion (active when King or Duke hired) ─────────────
  suspicion: 0,     // 0–100

  // ── Companions ─────────────────────────────────────────────
  companions: {
    jim: {
      id:              'jim',
      name:            'Jim',
      icon:            '👨',
      desc:            'Fishes while you rest. +1 fish/sec',
      fishPerSec:      1,
      dollarsPerSec:   0,
      suspicionPerSec: 0,
      cost:            0,
      unlocksAt:       0,
      hired:           true,
    },
    tom: {
      id:              'tom',
      name:            'Tom Sawyer',
      icon:            '🎩',
      desc:            'Sells your fish for you. +$0.50/sec',
      fishPerSec:      0,
      dollarsPerSec:   0.5,
      suspicionPerSec: 0,
      cost:            50,
      unlocksAt:       100,
      hired:           false,
    },
    king: {
      id:              'king',
      name:            'The King',
      icon:            '👑',
      desc:            'Runs cons. +$1.50/sec but raises suspicion.',
      fishPerSec:      0,
      dollarsPerSec:   1.5,
      suspicionPerSec: 2,
      cost:            200,
      unlocksAt:       300,
      hired:           false,
    },
    duke: {
      id:              'duke',
      name:            'The Duke',
      icon:            '🎭',
      desc:            'Prints handbills. +$1.00/sec but raises suspicion.',
      fishPerSec:      0,
      dollarsPerSec:   1.0,
      suspicionPerSec: 1.5,
      cost:            200,
      unlocksAt:       300,
      hired:           false,
    },
    widow: {
      id:              'widow',
      name:            'Widow Douglas',
      icon:            '🕯️',
      desc:            'Earns you respect. Rep gains +50%.',
      fishPerSec:      0,
      dollarsPerSec:   0,
      suspicionPerSec: 0,
      cost:            500,
      unlocksAt:       500,
      hired:           false,
    },
  },

  // ── Upgrades ───────────────────────────────────────────────
  upgrades: {
    // Fishing
    betterLine: {
      id:         'betterLine',
      name:       'Better Line',
      icon:       '🪡',
      category:   'fishing',
      desc:       '+1 fish/sec',
      cost:       10,
      unlocksAt:  0,
      owned:      false,
      requires:   null,
      effect:     { fishPerSec: 1 },
    },
    twoLines: {
      id:         'twoLines',
      name:       'Two Lines',
      icon:       '🎣',
      category:   'fishing',
      desc:       '+2 fish/sec',
      cost:       80,
      unlocksAt:  0,
      owned:      false,
      requires:   'betterLine',
      effect:     { fishPerSec: 2 },
    },
    net: {
      id:         'net',
      name:       'Fishing Net',
      icon:       '🕸️',
      category:   'fishing',
      desc:       '+5 fish/sec',
      cost:       600,
      unlocksAt:  0,
      owned:      false,
      requires:   'twoLines',
      effect:     { fishPerSec: 5 },
    },
    trotline: {
      id:         'trotline',
      name:       'Trotline',
      icon:       '🪝',
      category:   'fishing',
      desc:       '+15 fish/sec',
      cost:       4000,
      unlocksAt:  600,
      owned:      false,
      requires:   'net',
      effect:     { fishPerSec: 15 },
    },
    // Raft
    sturdyRaft: {
      id:         'sturdyRaft',
      name:       'Sturdy Raft',
      icon:       '🪵',
      category:   'raft',
      desc:       '+0.1 miles/sec',
      cost:       25,
      unlocksAt:  0,
      owned:      false,
      requires:   null,
      effect:     { milesPerSec: 0.1 },
    },
    paintedRaft: {
      id:         'paintedRaft',
      name:       'Painted Raft',
      icon:       '🎨',
      category:   'raft',
      desc:       '+0.3 miles/sec',
      cost:       250,
      unlocksAt:  0,
      owned:      false,
      requires:   'sturdyRaft',
      effect:     { milesPerSec: 0.3 },
    },
    steamRaft: {
      id:         'steamRaft',
      name:       'Steam-Powered Raft',
      icon:       '🚢',
      category:   'raft',
      desc:       '+1.0 miles/sec',
      cost:       3000,
      unlocksAt:  0,
      owned:      false,
      requires:   'paintedRaft',
      effect:     { milesPerSec: 1.0 },
    },
    riverboat: {
      id:         'riverboat',
      name:       'Paddlewheel Riverboat',
      icon:       '⚓',
      category:   'raft',
      desc:       '+3.0 miles/sec',
      cost:       15000,
      unlocksAt:  700,
      owned:      false,
      requires:   'steamRaft',
      effect:     { milesPerSec: 3.0 },
    },
    // Trade
    townDock: {
      id:         'townDock',
      name:       'Sell at Town Dock',
      icon:       '🏘️',
      category:   'trade',
      desc:       'Fish worth 2x dollars',
      cost:       30,
      unlocksAt:  0,
      owned:      false,
      requires:   null,
      effect:     { fishSellMultiplier: 2 },
    },
    haggle: {
      id:         'haggle',
      name:       'Haggle Skill',
      icon:       '🤝',
      category:   'trade',
      desc:       'Fish worth 3x dollars',
      cost:       200,
      unlocksAt:  0,
      owned:      false,
      requires:   'townDock',
      effect:     { fishSellMultiplier: 3 },
    },
    knownTrader: {
      id:         'knownTrader',
      name:       'Known Trader',
      icon:       '📜',
      category:   'trade',
      desc:       'Fish worth 5x dollars',
      cost:       1500,
      unlocksAt:  0,
      owned:      false,
      requires:   'haggle',
      effect:     { fishSellMultiplier: 5 },
    },
    autoSell: {
      id:         'autoSell',
      name:       'River Merchant',
      icon:       '🤑',
      category:   'trade',
      desc:       'Automatically sell fish each second',
      cost:       3500,
      unlocksAt:  0,
      owned:      false,
      requires:   'knownTrader',
      effect:     {},
    },
    tradingPost: {
      id:         'tradingPost',
      name:       'Trading Post Network',
      icon:       '🏪',
      category:   'trade',
      desc:       'Fish worth 10x dollars',
      cost:       8000,
      unlocksAt:  700,
      owned:      false,
      requires:   'knownTrader',
      effect:     { fishSellMultiplier: 10 },
    },
    // Risk reduction
    layLow: {
      id:         'layLow',
      name:       'Lay Low',
      icon:       '🤫',
      category:   'risk',
      desc:       'Suspicion decays 0.5/sec passively',
      cost:       600,
      unlocksAt:  0,
      owned:      false,
      requires:   null,
      effect:     { suspicionDecayPerSec: 0.5 },
    },
    lookoutBoy: {
      id:         'lookoutBoy',
      name:       'Lookout Boy',
      icon:       '👁️',
      category:   'risk',
      desc:       'Suspicion decays an extra 1/sec',
      cost:       800,
      unlocksAt:  0,
      owned:      false,
      requires:   'layLow',
      effect:     { suspicionDecayPerSec: 1.0 },
    },
  },

  // ── Prestige (Freedom Upgrades, survive resets) ────────────
  freedomUpgrades: {
    headStart: {
      id:    'headStart',
      name:  'Lucky Cast',
      icon:  '🏃',
      desc:  'Each manual fish catch gives 3 fish instead of 1',
      cost:  1,
      owned: false,
    },
    fasterCurrent: {
      id:    'fasterCurrent',
      name:  'Faster Current',
      icon:  '🌊',
      desc:  '+10% miles/sec base',
      cost:  2,
      owned: false,
    },
    goodReputation: {
      id:    'goodReputation',
      name:  'Good Reputation',
      icon:  '🌟',
      desc:  'Towns give +25% bonuses',
      cost:  2,
      owned: false,
    },
    seasonedFisherman: {
      id:    'seasonedFisherman',
      name:  'Seasoned Fisherman',
      icon:  '🎣',
      desc:  'Start with Fishing Net owned',
      cost:  3,
      owned: false,
    },
    fullCrew: {
      id:    'fullCrew',
      name:  'Full Crew',
      icon:  '👥',
      desc:  'All companions cost 50% less',
      cost:  5,
      owned: false,
    },
    riverWisdom: {
      id:    'riverWisdom',
      name:  'River Wisdom',
      icon:  '📖',
      desc:  '+3 bonus Rep on every prestige',
      cost:  4,
      owned: false,
    },
    layOfTheLand: {
      id:    'layOfTheLand',
      name:  'Lay of the Land',
      icon:  '🗺️',
      desc:  'Suspicion is capped at 80% — raids happen less often',
      cost:  3,
      owned: false,
    },
  },

  // ── Towns ──────────────────────────────────────────────────
  towns: [
    { mile: 50,   name: 'Cairo',       visited: false, desc: 'Sell fish at double price (one time).' },
    { mile: 200,  name: 'Memphis',     visited: false, desc: 'The King and Duke appear on the riverbank.' },
    { mile: 400,  name: 'Vicksburg',   visited: false, desc: 'Bonus $500. Watch out if the King is with you.' },
    { mile: 600,  name: 'Natchez',     visited: false, desc: 'Widow Douglas joins. Rep gains increase.' },
    { mile: 800,  name: 'Baton Rouge', visited: false, desc: 'Fish prices permanently +50% this run.' },
    { mile: 1000, name: 'New Orleans', visited: false, desc: 'Journey complete. Time to start again.' },
  ],

  // ── Lifetime Stats (never reset) ───────────────────────────
  stats: {
    totalFish:    0,
    totalDollars: 0,
    prestiges:    0,
  },

  // ── Derived rates (recomputed each tick) ───────────────────
  rates: {
    fishPerSec:           0,
    dollarsPerSec:        0,
    milesPerSec:          0,
    fishSellPrice:        1,
    suspicionPerSec:      0,
    suspicionDecayPerSec: 0,
    repMult:              1,
  },
};

// Recompute all derived rates from current state
State.recalcRates = function () {
  let fishPerSec            = 0;
  let dollarsPerSec         = 0;
  let milesPerSec           = 0;
  let fishSellMultiplier    = 1;
  let suspicionPerSec       = 0;
  let suspicionDecayPerSec  = 0;

  for (const c of Object.values(State.companions)) {
    if (!c.hired) continue;
    fishPerSec      += c.fishPerSec;
    dollarsPerSec   += c.dollarsPerSec;
    suspicionPerSec += c.suspicionPerSec;
  }

  for (const u of Object.values(State.upgrades)) {
    if (!u.owned) continue;
    if (u.effect.fishPerSec)           fishPerSec           += u.effect.fishPerSec;
    if (u.effect.milesPerSec)          milesPerSec          += u.effect.milesPerSec;
    if (u.effect.fishSellMultiplier)   fishSellMultiplier    = u.effect.fishSellMultiplier;
    if (u.effect.suspicionDecayPerSec) suspicionDecayPerSec += u.effect.suspicionDecayPerSec;
  }

  if (State.freedomUpgrades.fasterCurrent.owned) {
    milesPerSec *= 1.1;
  }

  State.rates.fishPerSec           = fishPerSec;
  State.rates.dollarsPerSec        = dollarsPerSec;
  State.rates.milesPerSec          = milesPerSec;
  State.rates.fishSellPrice        = fishSellMultiplier * (State._batonRougeBonus || 1);
  State.rates.suspicionPerSec      = suspicionPerSec;
  State.rates.suspicionDecayPerSec = suspicionDecayPerSec;
  State.rates.repMult              = State.companions.widow.hired ? 1.5 : 1.0;
};
