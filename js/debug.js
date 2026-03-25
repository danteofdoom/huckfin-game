// debug.js — cheat/test helpers, only loaded in dev

const Debug = {};

Debug.addFish = function () {
  State.fish += 100;
  UI.render();
};

Debug.addDollars = function () {
  State.dollars += 500;
  UI.render();
};

Debug.addMiles = function () {
  State.miles = Math.min(State.miles + 100, 1000);
  UI.render();
};

Debug.addRep = function () {
  State.rep += 5;
  UI.render();
};

Debug.skipToCairo = function () {
  State.miles = 49;
  UI.render();
};

Debug.skipToMemphis = function () {
  State.miles = 199;
  UI.render();
};

Debug.skipToVicksburg = function () {
  State.miles = 399;
  UI.render();
};

Debug.triggerRaid = function () {
  State.suspicion = 100;
  UI.render();
};

Debug.skipToPrestige = function () {
  State.miles   = 999;
  State.dollars = 2000;
  UI.render();
};
