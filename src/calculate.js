function getCalcOpp(mon, spread, item) {
  return {
    "pokemon": {
      "name": mon.name,
      "tera type": mon.teraType,
      "ability": mon.ability,
      "nature": spread.nature,
      "stats": mon.stats,
      "moves": mon.moves,
      "item": item,
      "evs": spread.stats,
      "ivs": mon.ivs,
    },
    "attacking": [],
    "defending": [],
    "matchup": 0
  }
}

function getCalcTable(mon, name = null) {

  // No override
  if (name === null)
    name = mon.species;

  return {
    "pokemon": {
      name: name,
      ability: mon.ability,
      nature: mon.nature,
      stats: mon.stats,
      item: mon.item,
      ivs: mon.ivs,
      evs: mon.evs
    },
    "opponents": {}
  }
}

function getSpread(str) {
  // Default Spread
  let spread = {
    nature: "Quirky",
    stats: statTemplate(31),
  };

  // Split the string on ':'
  const tokens = str.split(":");

  if (tokens.length >= 2) {
    // Nature = first split
    spread.nature = tokens[0];
    spread.stats = parseSimpleStats(spread.stats, tokens[1]);
  } else {
    throw Error(`Invalid number of tokens (${tokens.length}) provided!`);
  }

  // Return the spread
  return spread;
}

function getPredictedWinner(opponent) {
  // 2+ Very Favourable
  // 1 Favourable
  // 0 Neutral
  // -1 Unfavourable
  // -2 Very Unfavourable

  // Number of moves available to both
  const monMoveCount = opponent.attacking.length;
  const oppMoveCount = opponent.defending.length;

  // Both have no moves
  if (monMoveCount == 0 && oppMoveCount == 0) {
    // No winner
    return 0;
  } else if (monMoveCount == 0) {
    // Opponent wins
    return -2;
  } else if (oppMoveCount == 0) {
    // Mon wins
    return 2;
  }

  // Get best move for mon and opponent
  const monBestMove = opponent.attacking[0];
  const oppBestMove = opponent.defending[0];

  // Get the K.O. chance for both moves
  const monKoRating = monBestMove.data.kochance.n;
  const oppKoRating = oppBestMove.data.kochance.n;

  // Both have no moves
  if (monKoRating == 0 && oppKoRating == 0) {
    // No winner
    return 0;
  } else if (monKoRating == 0) {
    // Opponent wins
    return -2;
  } else if (oppKoRating == 0) {
    // Mon wins
    return 2;
  }

  // Compare damage dealt
  return oppKoRating - monKoRating;
}

// Sort moves from most to least effective
function moveSortFunc(a, b) {
  return total(b.data.range) - total(a.data.range);
}

// mon, oppDef, defaultField, playerEffects

function getMonFieldEffects(mon) {
  const fieldEffects = {};
  switch (mon.ability) {
    // *** Weather ***
    // Sun
    case "Drought":
    case "Orichalcum Pulse":
      fieldEffects.weather = "Sun";
      break;
    // Harsh Sunshine
    case "Desolate Land":
      fieldEffects.weather = "Harsh Sunshine";
      break;
    // Rain
    case "Drizzle":
      fieldEffects.weather = "Rain";
      break;
    // Heavy Rain
    case "Primordial Sea":
      fieldEffects.weather = "Heavy Rain";
      break;
    // Sand
    case "Sand Stream":
    case "Sand Spit":
      fieldEffects.weather = "Sand";
      break;
    // Snow
    case "Snow Warning":
      fieldEffects.weather = "Snow";
      break;
    case "Delta Stream":
      fieldEffects.weather = "Strong Winds";
      break;
    // *** Terrain ***
    // Electric
    case "Hadron Engine":
    case "Electric Surge":
      fieldEffects.terrain = "Electric";
      break;
    // Grassy
    case "Grassy Surge":
      fieldEffects.terrain = "Grassy";
      break;
    // Misty
    case "Misty Surge":
      fieldEffects.terrain = "Misty";
      break;
    // Psychic
    case "Psychic Surge":
      fieldEffects.terrain = "Psychic";
      break;
    // *** Other Effects ***
    // Beads of Ruin
    case "Beads of Ruin":
      fieldEffects.isBeadsOfRuin = true;
      break;
    // Beads of Ruin
    case "Sword of Ruin":
      fieldEffects.isSwordOfRuin = true;
      break;
    // Beads of Ruin
    case "Tablets of Ruin":
      fieldEffects.isTabletsOfRuin = true;
      break;
    // Beads of Ruin
    case "Vessel of Ruin":
      fieldEffects.isVesselOfRuin = true;
      break;
    // Aura Break
    case "Aura Break":
      fieldEffects.isAuraBreak = true;
      break;
    // Fairy Aura
    case "Fairy Aura":
      fieldEffects.isFairyAura = true;
      break;
    // Dark Aura
    case "Dark Aura":
      fieldEffects.isDarkAura = true;
      break;
    // TODO: ???
  }
  return fieldEffects;
}

function checkMoveChange(mon, moveName) {

  // Derefernece species
  const species = mon.name;

  // Zacian, Rusted Sword, Iron Head -> Behemoth B;ade
  if (species.startsWith("Zacian") && (mon.item === "Rusted Sword") && moveName == "Iron Head") {
    return "Behemoth Blade";
  }
  // Zamazenta, Rusted Shield, Iron Head -> Behemoth Bash
  if (species.startsWith("Zamazenta") && (mon.item === "Rusted Shield") && moveName == "Iron Head") {
    return "Behemoth Bash";
  }

  // TODO: ???

  // No change
  return moveName;
}

function combineFieldEffects(atkMon, defMon, defaultField, playerEffects, playerAtk = false) {

  // Get mon field effects
  const atkEffects = getMonFieldEffects(atkMon);
  const defEffects = getMonFieldEffects(defMon);

  // Order of priority (Most -> Least)
  // 1: Default (Config Field Effects)
  // 2: Attacker Field Effects
  // 3: Defender Field Effects

  // Create main table
  const fieldEffects = {
    ...defEffects,
    ...atkEffects,
    ...defaultField
  };

  // Add player-specific effects

  // Player is attacking
  if (playerAtk === true) {
    fieldEffects.attackerSide = playerEffects.player;
    fieldEffects.defenderSide = playerEffects.opponent;
  }
  else // Player is defending
  {
    fieldEffects.attackerSide = playerEffects.opponent;
    fieldEffects.defenderSide = playerEffects.player;
  }

  return fieldEffects;
}

function challengeSpecies(mon, usage, options = {}) {

  // Generate the field based on the program config
  const defaultField = getConfigFieldEffects();

  // Get player-specific field effects
  const playerEffects = getPlayerEffects();

  // Dereference generation
  const gen = mon.gen;

  // List of opponents
  const opponents = [];

  // Counter
  let spreadCount = 0;

  // Loop over the spreads for the mon
  for (const usageSpread of usage.spreads) {

    // Spread limit exceeded
    if (spreadCount >= CONFIG.limit.spreads) {
      break;
    }

    // Counter
    let teraCount = 0;

    // Loop over the tera types for the mon
    for (const usageTera of usage["tera types"]) {

      // Tera limit exceeded
      if (teraCount >= CONFIG.limit.teras) {
        break;
      }

      // Get the type name
      const tera = usageTera.option;

      // Counter
      let itemCount = 0;

      // Loop over the items for the mon
      for (const usageItem of usage.items) {
        // Spread limit exceeded
        if (itemCount >= CONFIG.limit.items) {
          break;
        }

        // Get the item name
        const item = usageItem.option;

        // Get species for the usage
        let species = usage.species;

        // Get the most common ability (highest usage)
        let ability = usage.abilities.at(0).option;

        // Get the list of mega stones
        const megaStones = Object.keys(calc.MEGA_STONES);

        // If the item is a mega stone
        if (megaStones.includes(item)) {
          // If the mega stone matches the species
          if (species === calc.MEGA_STONES[item]) {
            // Update the species
            species = stone.forme;

            // Clear the ability
            ability = undefined;
          }
        }

        // Convert string to spread
        const spread = getSpread(usageSpread.option);

        try {
          // Switch on species
          switch (species) {
            case "Aegislash":
              {
                // Use Blade Forme when Attacking
                const oppAtk = new calc.Pokemon(gen, "Aegislash-Blade", {
                  level: mon.level,
                  ability: ability,
                  nature: spread.nature,
                  // teraType: tera, 
                  item: item,
                  evs: spread.stats,
                });

                // Use Shield Forme when Defending
                const oppDef = new calc.Pokemon(gen, "Aegislash-Shield", {
                  level: mon.level,
                  ability: ability,
                  nature: spread.nature,
                  // teraType: tera, 
                  item: item,
                  evs: spread.stats,
                });

                // Create the calc opponent object
                const opponent = getCalcOpp(oppDef, spread, item);
                opponent.pokemon.moves = usage.moves.map((x) => x.option);
                opponent.pokemon["tera type"] = tera;

                // Defend only NOT set
                if (!options.defendOnly) {

                  // Combine player, opponent, default effects
                  const field = new calc.Field(combineFieldEffects(
                    mon, oppDef, defaultField, playerEffects, true
                  ));

                  // Loop over team moves
                  for (let moveName of mon.moves) {
                    // Check if move changes (e.g. Zacian-C and Iron Head)
                    moveName = checkMoveChange(mon, moveName);
                    const move = new calc.Move(gen, moveName);
                    const result = calc.calculate(gen, mon, oppDef, move, field);
                    if (result.damage != 0) {
                      opponent.attacking.push({
                        data: {
                          kochance: result.kochance(),
                          range: result.range(),
                        },
                        fullDesc: result.fullDesc(),
                        moveDesc: result.moveDesc(),
                        desc: result.desc(),
                        move: result.move.name,
                      });
                    }
                  }

                  // Sort the attacks from most to least effective
                  opponent.attacking.sort(moveSortFunc);
                }

                // Attack only NOT set
                if (!options.attackOnly) {
                  // Counter
                  let moveCount = 0;

                  // Combine player, opponent, default effects
                  const field = new calc.Field(combineFieldEffects(
                    oppAtk, mon, defaultField, playerEffects, false
                  ));

                  for (const usageMove of usage.moves) {
                    // Break after limit
                    if (moveCount >= CONFIG.limit.moves)
                      break;

                    // Get the name for the move
                    let moveName = usageMove.option;

                    // Check if move changes (e.g. Zacian-C and Iron Head)
                    moveName = checkMoveChange(oppAtk, moveName);

                    const move = new calc.Move(gen, moveName);
                    const result = calc.calculate(gen, oppAtk, mon, move, field);
                    if (result.damage != 0) {
                      opponent.defending.push({
                        data: {
                          kochance: result.kochance(),
                          range: result.range(),
                        },
                        fullDesc: result.fullDesc(),
                        moveDesc: result.moveDesc(),
                        desc: result.desc(),
                        move: result.move.name,
                      });
                      moveCount++;
                    }
                  }

                  // Sort the attacks from most to least effective
                  opponent.defending.sort(moveSortFunc);
                }

                // Calculate the matchup odds for the opponent
                opponent.matchup = getPredictedWinner(opponent);

                // Add to the opponents
                opponents.push(opponent);
              }
              break;
            default:
              {
                // Generate mon for the spread
                const opp = new calc.Pokemon(gen, species, {
                  level: mon.level,
                  ability: ability,
                  nature: spread.nature,
                  // teraType: tera,
                  item: item,
                  evs: spread.stats,
                });

                // Create the calc opponent object
                const opponent = getCalcOpp(opp, spread, item);
                opponent.pokemon.moves = usage.moves.map((x) => x.option);
                opponent.pokemon["tera type"] = tera;

                // Defend only NOT set
                if (!options.defendOnly) {

                  // Combine player, opponent, default effects
                  const field = new calc.Field(combineFieldEffects(
                    mon, opp, defaultField, playerEffects, true
                  ));

                  // Loop over team moves
                  for (let moveName of mon.moves) {
                    // Check if move changes (e.g. Zacian-C and Iron Head)
                    moveName = checkMoveChange(mon, moveName);
                    const move = new calc.Move(gen, moveName);
                    const result = calc.calculate(gen, mon, opp, move, field);
                    if (result.damage != 0) {
                      opponent.attacking.push({
                        data: {
                          kochance: result.kochance(),
                          range: result.range(),
                        },
                        fullDesc: result.fullDesc(),
                        moveDesc: result.moveDesc(),
                        desc: result.desc(),
                        move: result.move.name,
                      });
                    }
                  }

                  // Sort the attacks from most to least effective
                  opponent.attacking.sort(moveSortFunc);
                }

                // Attack only NOT set
                if (!options.attackOnly) {
                  // Counter
                  let moveCount = 0;

                  // Combine player, opponent, default effects
                  const field = new calc.Field(combineFieldEffects(
                    opp, mon, defaultField, playerEffects, false
                  ));

                  // Loop over mon moves
                  for (const usageMove of usage.moves) {
                    // Break after limit
                    if (moveCount >= CONFIG.limit.moves)
                      break;

                    // Get the name for the move
                    let moveName = usageMove.option;

                    // Check if move changes (e.g. Zacian-C and Iron Head)
                    moveName = checkMoveChange(opp, moveName);

                    const move = new calc.Move(gen, moveName);
                    const result = calc.calculate(gen, opp, mon, move, field);
                    if (result.damage != 0) {
                      opponent.defending.push({
                        data: {
                          kochance: result.kochance(),
                          range: result.range(),
                        },
                        fullDesc: result.fullDesc(),
                        moveDesc: result.moveDesc(),
                        desc: result.desc(),
                        move: result.move.name,
                      });
                      moveCount++;
                    }
                  }

                  // Sort the attacks from most to least effective
                  opponent.defending.sort(moveSortFunc);

                  // Calculate the matchup odds for the opponent
                  opponent.matchup = getPredictedWinner(opponent);
                }

                // Add to the opponents
                opponents.push(opponent);
              }
              break;
          }
        } catch (
        e // Failed for species ...
        ) {
          console.warn(`Failed for species '${species}': ${String(e)} ...`);
        }

        itemCount++;
      }

      // Increment
      teraCount++;
    }

    spreadCount++;
  }

  // Return opponents
  return opponents;
}

function challengeAegislash(monAtk, monDef, usage) {
  // Attacking calcs
  const opponents = challengeSpecies(monAtk, usage, { attackOnly: true });

  // Defensive calcs
  const defending = challengeSpecies(monDef, usage, { defendOnly: true });

  // Loop over the opponents
  for (let i = 0; i < opponents.length; i++) {
    // Add defender data to the results
    opponents[i].defending = defending[i].defending;
  }

  // Return opponents
  return opponents;
}

function calculateTeam(team, usage, format, level = 50) {

  // Get the 'Generation' object for the format
  const gen = calc.Generations.get(format.gen);

  // Calcs Table
  const totalCalcs = {};

  // Loop over the Pokemon
  for (const set of team) {
    const species = set.species;

    try {
      // Switch on species
      switch (species) {
        case "Aegislash": {
          // Create the calcs mon for the set

          const monAtk = new calc.Pokemon(gen, "Aegislash-Blade", {
            level: level,
            nature: set.nature,
            evs: set.evs,
            ability: set.ability,
            moves: set.moves,
          });

          const monDef = new calc.Pokemon(gen, "Aegislash-Shield", {
            level: level,
            nature: set.nature,
            evs: set.evs,
            ability: set.ability,
            moves: set.moves,
          });

          // Get calcs table (override to 'Aegislash')
          const calcsTable = getCalcTable(monAtk, "Aegislash");

          // Counter
          let monCount = 0;

          // Loop over the species
          for (const speciesUsage of usage) {
            // Break after limit
            if (monCount > CONFIG.limit.mons)
              break;

            // Get the opponent species
            const oppSpecies = speciesUsage.species;

            // Run the calcs for the mon against the target species
            const opponents = challengeAegislash(monAtk, monDef, speciesUsage);
            calcsTable.opponents[oppSpecies] = opponents;
            monCount++;
          }

          totalCalcs[species] = calcsTable;
        }; break;
        default: {
          // Create the calcs mon for the set
          const mon = new calc.Pokemon(gen, species, {
            level: level,
            nature: set.nature,
            evs: set.evs,
            ability: set.ability,
            moves: set.moves,
            item: set.item
          });

          // Get calcs table
          const calcsTable = getCalcTable(mon);

          // Counter
          let monCount = 0;

          // Loop over the species
          for (const speciesUsage of usage) {
            // Break after limit
            if (monCount > CONFIG.limit.mons)
              break;

            // Get the opponent species
            const oppSpecies = speciesUsage.species;

            // Run the calcs for the mon against the target species
            const opponents = challengeSpecies(mon, speciesUsage);
            calcsTable.opponents[oppSpecies] = opponents;
            monCount++;
          }

          totalCalcs[species] = calcsTable;
        }; break;
      }
    }
    catch (e) // Failed for set
    {
      console.error(`Failed for species '${species}'! ${(e)}`)
    }
  }

  // Return all calcs
  return totalCalcs;
}

function getSpeedStr(tier) {

  // Get the nature data for the spread
  nature = calc.NATURES[tier.nature];

  // Empty suffix
  let suffix = '';

  // Non-neutral nature
  if (nature[0] !== nature[1]) {
    if (nature[0] === 'spe')
      suffix = '+'; // Positive
    else if (nature[1] === 'spe')
      suffix = '-'; // Negative
  }

  // Empty iv string
  let ivStr = '';
  if (tier.iv !== 31)
    ivStr = `${tier.iv}/`;

  // Return the spread string
  return `${ivStr}${tier.ev}${suffix}`;
}

function getUsageSpreadIVs(evs) {
  // Get the nature data for the spread
  const nature = calc.NATURES[evs.nature];

  // Assume 31 ivs by default
  const ivs = statTemplate(31);

  // Reduced nature
  if (nature[1] == 'spe') {
    // Use 0spe
    ivs.spe = 0;
  }

  return ivs;
}

function applyStageMultiplier(stat, stage) {
  // Lowered
  if (stage < 0)
    stat = stat * (2 / (2 + stage));

  // Raised
  if (stage > 0)
    stat = stat * ((2 + stage) / 2);

  // Return w/o decimals
  return Math.floor(stat);
}

function checkProtoSpeedBoost(rawStats) {
  return (rawStats.spe > rawStats.atk) && (rawStats.spe > rawStats.def) && (rawStats.spe > rawStats.spa) && (rawStats.spe > rawStats.spd);
}

function checkSpeedTierItem(mon, template) {
  // Default
  let copy = null;

  // Boost stage
  let stage = 0;

  switch (mon.item) {
    case 'Booster Energy': {
      // Proto already used, or proto boost not speed
      if (mon.rawStats && checkProtoSpeedBoost(mon.rawStats))
        stage += 1;
    }; break;
    case 'Choice Scarf': {
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
    copy.mod = mon.item;
    copy.stage = stage;
  }

  return copy;
}

function checkSpeedTierAbility(mon, template) {
  // Default
  let copy = null;

  // Boost stage
  let stage = 0;
  
  switch (mon.ability) {
    case 'Protosynthesis':
    case 'Quark Drive': {
      if (mon.rawStats && checkProtoSpeedBoost(mon.rawStats))
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
    copy.mod = mon.ability;
    copy.stage = stage;
  }

  // Return copy set
  return copy;
}

function getPlayerMonSpeedTiers(mon, config) {

  // List of mons
  // Usually just 1, but adds 2 for 
  // booster energy / tailwind / etc.
  const tiers = [];

  // Speed tier data
  const template = {
    level: mon.level,
    species: mon.species.name,
    stat: mon.rawStats.spe,
    base: mon.species.baseStats.spe,
    iv: mon.ivs.spe,
    ev: mon.evs.spe,
    stage: 0, // Neutral
    nature: mon.nature,
    ability: mon.ability,
    usage: null,
    item: mon.item,
    mod: null,
  }

  // Booster not used
  let booster = true;

  // Ability effects enabled
  if (config.abilityEffects) {
    const copy = checkSpeedTierAbility(mon, template);
    if (copy) {
      if (copy.ability === 'Quark Drive' || copy.ability === 'Protosynthesis')
        booster = false;
      tiers.push(copy);
    }
  }

  // Item effects enabled
  if (config.itemEffects) {
    const copy = checkSpeedTierItem(mon, template);
    if (copy) {
      // Skip if proto/quark, and booster already used
      if (!((!booster) && copy.item === 'Booster Energy'))
        tiers.push(copy);
    }
  }

  // Add base to list
  tiers.push(template);

  // Return list
  return tiers;
}

function getUsageMonSpeedTiers(gen, usage, level, config) {

  // Indexed on stat
  const indexes = {};

  // Dereference species data
  const species = usage.species;

  // Loop over the spreads
  for (const spread of usage.spreads) {
    if (spread.option != 'Other') {

      // Get the stats for the spread
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
      if (Object.keys(indexes).includes(speedStr)) {
        // Update speed usage
        indexes[speed].usage += spread.usage;
      }
      else // Speed stat not in list
      {
        indexes[speed] = {
          level: level,
          species: species,
          stat: speed,
          base: mon.species.baseStats.spe,
          iv: ivs['spe'],
          ev: evs.stats['spe'],
          nature: evs.nature,
          ability: mon.ability,
          usage: spread.usage,
          item: mon.item,
          mod: null,
        }
      }
    }
  }

  // Get tiers (values only)
  const tiers = Object.values(indexes);
  const tierCount = tiers.length;

  for(let i=0; i<tierCount; i++) {

    // Dereference index
    const template = tiers[i];

    // Booster not used
    let booster = true;

    // Ability effects enabled
    if (config.abilityEffects) {
      const copy = checkSpeedTierAbility(template, template);
      if (copy) {
        const newSpeedStr = `${copy.stat}`;
        if (Object.keys(indexes).includes(newSpeedStr)) {
          if (copy.ability === 'Quark Drive' || copy.ability === 'Protosynthesis')
            booster = false;
          indexes.push(copy);
        }
      }
    }

    // Item effects enabled
    if (config.itemEffects) {
      const copy = checkSpeedTierItem(template, template);
      if (copy) {
        // Skip if proto/quark, and booster already used
        if (!((!booster) && copy.item === 'Booster Energy'))
          indexes.push(copy);
      }
    }
  }

  return tiers;
}

function calculateSpeedTiers(team, usage, format, level = 50) {

  // Get speed tier display config
  const config = getSpeedTierConfig();

  // Get the 'Generation' object for the format
  const gen = calc.Generations.get(format.gen);

  // Total speed calcs
  const speedTiers = [];

  // Loop over the Pokemon
  for (const set of team) {
    // Dereference species
    const species = set.species;

    // Create the Pokemon object for the set
    const mon = new calc.Pokemon(gen, species, {
      level: level,
      nature: set.nature,
      evs: set.evs,
      ability: set.ability,
      moves: set.moves,
      item: set.item
    });

    // Get the speed tier object
    const tiers = getPlayerMonSpeedTiers(mon, config.player);

    // Add to the speeds
    for (const tier of tiers) {
      speedTiers.push(tier);
    }
  }

  // Loop over usage mons
  for (const set of usage) {
    const tiers = getUsageMonSpeedTiers(gen, set, level, config.other);

    // Add to the speeds
    for (const tier of tiers) {
      speedTiers.push(tier);
    }
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