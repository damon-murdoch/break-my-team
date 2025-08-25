function setTableSpeedTiers() {
  document.active = 0;

  // Selected
  document.getElementById('table-speed-options').hidden = '';
  document.getElementById("option-speed").className = "bg-dark";

  // Unselected
  document.getElementById('table-damage-options').hidden = 'hidden';
  document.getElementById('table-usage-options').hidden = 'hidden';

  document.getElementById("option-damage").className = "bg-secondary";
  document.getElementById("option-usage").className = "bg-secondary";

  update();
}

function getSpeedTierConfig() {

  // Sorting Method
  const sortBy = document.getElementById('sort-speed').value;

  // Items
  const item = document.getElementById('ie-select').value;
  const ability = document.getElementById('ae-select').value;

  return {
    sort: sortBy,
    player: {
      ability: (ability == 'Player' || ability == 'Both'),
      item: (item == 'Player' || item == 'Both')
    },
    other: {
      ability: (ability == 'Opponent' || ability == 'Both'),
      item: (item == 'Opponent' || item == 'Both')
    }
  }
}

function setSpeedTierConfig(config) {
  // Sorting Method
  document.getElementById('sort-speed').value = config.sort;

  // Ability select
  const aeSelect = getPlayerOppChoice(
    config.player.ability,
    config.other.ability
  );

  // Update the drop-down menu
  document.getElementById('ae-select').value = aeSelect;

  // Ability select
  const ieSelect = getPlayerOppChoice(
    config.player.item,
    config.other.item
  );

  // Update the drop-down menu
  document.getElementById('ie-select').value = ieSelect;
}

function checkSpeedTierItem(template) {
  // Default
  const copies = [];

  // Loop over the items
  for (const item of template.item) {
    // Boost stage
    let stage = 0;

    // Switch on the item
    switch (item) {
      case 'Booster Energy': {
        // Proto speed boost
        if (template.proto)
          stage += 1;
      }; break;
      case 'Choice Scarf': {
        if (template.ev > CONFIG.scarf)
          stage += 1;
      }; break;
      default: {
        // Do nothing
      }; break;
    }

    // Stage modified
    if (stage != 0) {
      // Create a deep copy of the template
      copy = JSON.parse(JSON.stringify(template));

      // Apply the stat change
      copy.stat = applyStageMultiplier(copy.stat, stage);

      // Update other fields
      copy.mod = item;
      copy.stage = stage;

      // Add to the copies
      copies.push(copy);
    }
  }

  // Return copies
  return copies;
}

function checkSpeedTierAbility(template) {
  // Default
  const copies = [];

  // Loop over the abilities
  for (const ability of template.ability) {

    // Boost stage
    let stage = 0;

    switch (ability) {
      case 'Protosynthesis':
      case 'Quark Drive': {
        // Check to see if the Pokemon is holding booster energy or not
        const hasBoosterEnergy = template.item.includes('Booster Energy');
        // Proto speed boost
        if (template.proto && !hasBoosterEnergy)
          stage += 1;
      }; break;
      // Weather Boost
      case 'Swift Swim':
      case 'Chlorophyll':
      case 'Sand Rush':
      case 'Slush Rush':
      // Other Boost
      case 'Unburden': {
        // 2 more stages 
        stage += 2;
      }; break;
    }

    // Stage modified
    if (stage != 0) {
      // Create a deep copy of the template
      copy = JSON.parse(JSON.stringify(template));

      // Apply the stat change
      copy.stat = applyStageMultiplier(copy.stat, stage);

      // Update other fields
      copy.mod = ability;
      copy.stage = stage;

      // Add to the copies
      copies.push(copy);
    }
  }

  // Return copies
  return copies;
}

function applySpeedTierModifiers(tiers, config) {
  let tierCount = tiers.length;
  for (let i = 0; i < tierCount; i++) {
    const template = tiers[i];

    // Ability effects enabled
    if (config.ability) {
      const copies = checkSpeedTierAbility(template);
      tiers = tiers.concat(copies);
    }

    // Item effects enabled
    if (config.item) {
      const copies = checkSpeedTierItem(template);
      tiers = tiers.concat(copies);
    }
  }
  return tiers;
}

function getPlayerMonSpeedTiers(mon) {

  // Speed tier data
  return [{
    level: mon.level,
    species: mon.species.name,
    stat: mon.rawStats.spe,
    base: mon.species.baseStats.spe,
    iv: mon.ivs.spe,
    ev: mon.evs.spe,
    stage: 0, // Neutral
    nature: mon.nature,
    ability: [mon.ability],
    proto: checkProtoSpeedBoost(mon.rawStats),
    usage: null,
    item: [mon.item],
    mod: null,
  }];
}

function getUsageMonSpeedTiers(gen, usage, level) {

  // Indexed on stat
  const tiers = {};

  // Dereference species data
  let species = checkFormeChangeStrict(usage.species);

  // Failsafe (Speed Tiers only)
  if (species === "Aegislash") {
    species = "Aegislash-Shield";
  }

  // Filter the available items & abilities for the Pokemon
  const ability = usage.abilities.filter(x => x.usage > CONFIG.usage.ability).map(x => x.option);
  const item = usage.items.filter(x => x.usage > CONFIG.usage.item).map(x => x.option);

  // Loop over the spreads
  for (const spread of usage.spreads) {
    if (spread.option != 'Other') {

      // Dereference ivs/evs
      const evs = getSpread(spread.option);
      const ivs = getUsageSpreadIVs(evs);

      // Generate mon for the spread
      const mon = new calc.Pokemon(gen, species, {
        level: level,
        nature: evs.nature,
        evs: evs.stats,
        ivs: ivs
      });

      // Convert speed stat to raw string
      const speed = mon.rawStats.spe;
      const speedStr = `${speed}`;

      // List already contains speed stat
      if (Object.keys(tiers).includes(speedStr)) {
        // Update speed usage
        tiers[speed].usage += spread.usage;

        // If at least one set gets the proto boost, set proto to true
        if (tiers[speed].proto === false && checkProtoSpeedBoost(mon.rawStats))
          tiers[speed].proto = true;
      }
      else // Speed stat not in list
      {
        tiers[speed] = {
          level: level,
          species: species,
          stat: speed,
          base: mon.species.baseStats.spe,
          iv: ivs['spe'],
          ev: evs.stats['spe'],
          nature: evs.nature,
          ability: ability,
          proto: checkProtoSpeedBoost(mon.rawStats),
          usage: spread.usage,
          item: item,
          mod: null,
        }
      }
    }
  }

  // Return tiers without keys
  return Object.values(tiers);
}

function calculateSpeedTiers(team, usage, format, level = 50) {

  // Get speed tier display config
  const config = getSpeedTierConfig();

  // Get the max. number of threats
  const threatLimit = getThreatLimit();

  // Get the 'Generation' object for the format
  const gen = calc.Generations.get(format.gen);

  // Total speed calcs
  const speedTiers = [];

  // Loop over the Pokemon
  for (const set of team) {

    // Dereference species
    let species = checkFormeChangeStrict(set.species);

    // Failsafe (Speed Tiers only)
    if (species === "Aegislash") {
      species = "Aegislash-Shield";
    }

    // Create the Pokemon object for the set
    const mon = new calc.Pokemon(gen, species, {
      level: level,
      nature: set.nature,
      evs: set.evs,
      ivs: set.ivs,
      ability: set.ability,
      moves: set.moves,
      item: set.item
    });

    // Get the speed tier object
    let tiers = applySpeedTierModifiers(
      getPlayerMonSpeedTiers(mon),
      config.player
    );

    // Check for forme changes for the species
    const forme = checkFormeChange(species, {
      ability: set.ability,
      item: set.item
    });

    // Forme change is different
    if (forme.species !== species) {
      // Create a new Pokemon for the set
      const formeMon = new calc.Pokemon(gen, forme.species, {
        level: level,
        nature: set.nature,
        evs: set.evs,
        ability: forme.ability,
        moves: set.moves,
        item: set.item
      });

      // Add new forme to the tiers list
      tiers = tiers.concat(applySpeedTierModifiers(
        getPlayerMonSpeedTiers(formeMon),
        config.player
      ));
    }

    // Add to the speeds
    for (const tier of tiers) {
      speedTiers.push(tier);
    }
  }

  let monCount = 0;
  // Loop over usage mons
  for (const set of usage) {

    // Break after limit
    if (monCount >= threatLimit)
      break;

    const tiers = applySpeedTierModifiers(
      getUsageMonSpeedTiers(gen, set, level),
      config.other
    );

    // Add to the speeds
    for (const tier of tiers) {
      speedTiers.push(tier);
    }

    monCount++;
  }

  // Sort table via speed stat
  speedTiers.sort((a, b) => {
    switch (config.sort) {
      default: // Fallback
      case 'fast': // Fast first
        return b.stat - a.stat;
      case 'slow': // Slow first
        return a.stat - b.stat;
    }
  });

  return speedTiers;
}

function populateSpeedTiers(tiers, sets) {
  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  // Create table header
  const trhead = document.createElement('tr');

  // Create table contents
  trhead.innerHTML = `
  <th class='align-middle'>Species</th>
  <th class='align-middle'>Stat</th>
  <th class='align-middle'>Modifier</th>
  <th class='align-middle'>Base</th>
  <th class='align-middle'>Spread</th>
  <th class='align-middle'>Usage</th>
  `;

  // Add row to table
  tbody.appendChild(trhead);

  // Loop over all of the tiers
  for (const tier of tiers) {
    // Create the threat table rows
    const tr = document.createElement('tr');

    let usageStr = '-';
    let youStr = '';
    let modStr = '';

    // Usage provided
    if (tier.usage) {
      // Generate usage string (rounded)
      usageStr = `${Math.floor(tier.usage)}%`;
    } else {
      youStr = " (Your Set)";
    }

    // Ability provided
    if (tier.mod) {
      modStr = `${tier.mod}`;
    }

    // Get item sprite
    let item = null;
    if (tier.item.includes(tier.mod)) {
      item = itemString(tier.mod);
    }

    // Sanitise the pokemon name
    const species = sanitiseString(tier.species);

    // Get the sprite string for the species, item
    const sprite = getSpriteString(species, item);

    // Create table contents
    tr.innerHTML = `
    ${sprite}
    <td class='align-middle' width='16.6%'>${tier.stat}</td>
    <td class='align-middle' width='33.2%'>${modStr}${youStr}</td>
    <td class='align-middle' width='16.6%'>${tier.base}</td>
    <td class='align-middle' width='16.6%'>${getSpeedStr(tier)}</td>
    <td class='align-middle' width='16.6%'>${usageStr}</td>
    `;

    // No usage stats (player mon)
    if (tier.usage === null) {
      // Green bg for player mons
      tr.classList.add('verygood');
    }

    // Add row to table
    tbody.appendChild(tr);
  }
}
